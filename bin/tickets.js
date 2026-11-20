#!/usr/bin/env node
'use strict';

// Problem tickets: tickets/NNNN-<slug>.md, one known problem each.
//
//   node bin/tickets.js [list] [open|resolved|all]   index (default: open)
//   node bin/tickets.js show <id>
//   node bin/tickets.js new "<problem statement>" [--area <area>]
//   node bin/tickets.js resolve <id> "<how it was resolved>"
//   node bin/tickets.js reopen <id> "<why>"
//   node bin/tickets.js check                         validate every ticket, and that every
//                                                     check and documented gap has one (CI)
//   PR_BODY=... node bin/tickets.js pr-body           every deferral in a PR description
//                                                     cites a ticket (CI)
//
// A ticket names a PROBLEM — a false or unenforced property of the library —
// not a task. "Argument counts are inconsistent" is a ticket; "Enforce argument
// counts" is not. `check` rejects titles that open with an imperative verb.
// See tickets/README.md.

var fs = require( 'fs' );
var path = require( 'path' );
var coverage = require( './tickets-coverage.js' );

var ROOT = path.join( __dirname, '..' );
var DIR = path.join( ROOT, 'tickets' );
var STATUSES = [ 'open', 'resolved' ];
var REQUIRED_SECTIONS = [ 'Problem', 'Evidence', 'Reproduce' ];

// Titles that start like a to-do item rather than a statement of a problem.
var IMPERATIVE = /^(add|adopt|audit|automate|build|clean|convert|create|enable|enforce|ensure|extend|fix|generate|implement|improve|investigate|make|migrate|move|refactor|remove|rename|replace|rewrite|switch|tighten|translate|turn|update|validate|verify|wire|write)\b/i;

function today() {
	return new Date().toISOString().slice( 0, 10 );
}

function slug( s ) {
	return s.toLowerCase().replace( /`/g, '' ).replace( /[^a-z0-9]+/g, '-' ).replace( /^-|-$/g, '' ).slice( 0, 60 ).replace( /-$/, '' );
}

function parse( file ) {
	var src = fs.readFileSync( path.join( DIR, file ), 'utf8' );
	var m = src.match( /^---\n([\s\S]*?)\n---\n([\s\S]*)$/ );
	var meta = {};
	if ( !m ) {
		return { 'file': file, 'meta': null, 'body': src, 'src': src };
	}
	m[ 1 ].split( '\n' ).forEach( function each( line ) {
		var kv = line.match( /^(\w+):\s*(.*)$/ );
		if ( kv ) {
			meta[ kv[ 1 ] ] = kv[ 2 ].trim();
		}
	});
	return { 'file': file, 'meta': meta, 'body': m[ 2 ], 'src': src };
}

function serialize( t ) {
	var keys = [ 'id', 'title', 'status', 'area', 'opened', 'resolved' ];
	var head = keys.filter( function f( k ) {
		return t.meta[ k ] !== void 0;
	}).map( function m( k ) {
		return k + ': ' + t.meta[ k ];
	});
	return '---\n' + head.join( '\n' ) + '\n---\n' + t.body;
}

function all() {
	if ( !fs.existsSync( DIR ) ) {
		return [];
	}
	return fs.readdirSync( DIR ).filter( function f( n ) {
		return /^\d{4}-.*\.md$/.test( n );
	}).sort().map( parse );
}

function find( id ) {
	var want = String( id ).padStart( 4, '0' );
	var t = all().filter( function f( x ) {
		return x.meta && x.meta.id === want;
	})[ 0 ];
	if ( !t ) {
		die( 'no ticket ' + want );
	}
	return t;
}

function die( msg ) {
	process.stderr.write( msg + '\n' );
	process.exit( 1 );
}

function write( t ) {
	fs.writeFileSync( path.join( DIR, t.file ), serialize( t ) );
}

// COMMANDS //

function list( which ) {
	var ts = all().filter( function f( t ) {
		return which === 'all' || ( t.meta && t.meta.status === which );
	});
	ts.forEach( function each( t ) {
		console.log( t.meta.id + '  ' + t.meta.status.padEnd( 8 ) + ' ' + ( t.meta.area || '' ).padEnd( 12 ) + ' ' + t.meta.title );
	});
	var counts = {};
	all().forEach( function c( t ) {
		var s = t.meta ? t.meta.status : 'invalid';
		counts[ s ] = ( counts[ s ] || 0 ) + 1;
	});
	console.log( '\n' + STATUSES.concat( [ 'invalid' ] ).filter( function f( s ) {
		return counts[ s ];
	}).map( function m( s ) {
		return counts[ s ] + ' ' + s;
	}).join( ', ' ) );
}

function create( title, area ) {
	var problems = titleProblems( title );
	var ids = all().map( function m( t ) {
		return t.meta ? Number( t.meta.id ) : 0;
	});
	var id = String( ( ids.length ? Math.max.apply( null, ids ) : 0 ) + 1 ).padStart( 4, '0' );
	var t;
	if ( problems.length ) {
		die( problems.join( '\n' ) );
	}
	t = {
		'file': id + '-' + slug( title ) + '.md',
		'meta': { 'id': id, 'title': title, 'status': 'open', 'area': area || 'general', 'opened': today() },
		'body': '\n## Problem\n\nTODO: what is false or unenforced, and why it matters.\n\n## Evidence\n\nTODO: concrete instances (file:line, seeds, counts).\n\n## Reproduce\n\n```bash\nTODO: a command that shows the problem\n```\n'
	};
	write( t );
	console.log( path.relative( ROOT, path.join( DIR, t.file ) ) );
}

function resolve( id, note ) {
	var t = find( id );
	if ( !note ) {
		die( 'resolve needs a note saying how the problem was resolved (commit, check that now prevents it)' );
	}
	t.meta.status = 'resolved';
	t.meta.resolved = today();
	t.body = t.body.replace( /\n## Resolution\n[\s\S]*$/, '\n' ).replace( /\n*$/, '\n' ) + '\n## Resolution\n\n' + note + '\n';
	write( t );
	console.log( 'resolved ' + t.meta.id + ': ' + t.meta.title );
}

function reopen( id, why ) {
	var t = find( id );
	if ( !why ) {
		die( 'reopen needs a reason' );
	}
	t.meta.status = 'open';
	delete t.meta.resolved;
	t.body = t.body.replace( /\n*$/, '\n' ) + '\n## Reopened ' + today() + '\n\n' + why + '\n';
	write( t );
	console.log( 'reopened ' + t.meta.id + ': ' + t.meta.title );
}

function titleProblems( title ) {
	var out = [];
	if ( IMPERATIVE.test( title.trim() ) ) {
		out.push( 'title reads as a to-do ("' + title.split( ' ' )[ 0 ] + ' ..."); state the problem instead, e.g. "X is inconsistent" or "Nothing prevents X"' );
	}
	if ( title.length > 120 ) {
		out.push( 'title is longer than 120 characters' );
	}
	return out;
}

function check() {
	var errs = [];
	var seen = {};
	all().forEach( function each( t ) {
		var where = 'tickets/' + t.file;
		var m = t.meta;
		if ( !m ) {
			errs.push( where + ': missing --- front matter ---' );
			return;
		}
		[ 'id', 'title', 'status', 'area', 'opened' ].forEach( function req( k ) {
			if ( !m[ k ] ) {
				errs.push( where + ': missing `' + k + '`' );
			}
		});
		if ( m.id && t.file.indexOf( m.id + '-' ) !== 0 ) {
			errs.push( where + ': id ' + m.id + ' does not match the file name' );
		}
		if ( seen[ m.id ] ) {
			errs.push( where + ': duplicate id ' + m.id + ' (also ' + seen[ m.id ] + ')' );
		}
		seen[ m.id ] = t.file;
		if ( STATUSES.indexOf( m.status ) < 0 ) {
			errs.push( where + ': status must be one of ' + STATUSES.join( '|' ) );
		}
		titleProblems( m.title || '' ).forEach( function tp( p ) {
			errs.push( where + ': ' + p );
		});
		REQUIRED_SECTIONS.forEach( function sec( s ) {
			if ( !new RegExp( '^## ' + s + '\\s*$', 'm' ).test( t.body ) ) {
				errs.push( where + ': missing `## ' + s + '` section' );
			}
		});
		if ( /\bTODO:/.test( t.body ) ) {
			errs.push( where + ': unfilled TODO in body' );
		}
		if ( m.status === 'resolved' ) {
			if ( !m.resolved ) {
				errs.push( where + ': resolved ticket needs a `resolved` date' );
			}
			if ( !/^## Resolution\s*$/m.test( t.body ) ) {
				errs.push( where + ': resolved ticket needs a `## Resolution` section' );
			}
		}
	});
	// Coverage: every known gap has a ticket (CONVENTIONS P1).
	errs = errs.concat( coverage.checkRegistry( byId() ), coverage.checkArtifacts( byId() ), coverage.checkDocs( byId() ) );
	if ( errs.length ) {
		die( errs.join( '\n' ) + '\n\n' + errs.length + ' ticket problem(s)' );
	}
	console.log( 'tickets ok (' + all().length + '); every check is gated or ticketed, and every documented gap cites a ticket' );
}

function byId() {
	var out = {};
	all().forEach( function each( t ) {
		if ( t.meta ) {
			out[ t.meta.id ] = t;
		}
	});
	return out;
}

function prBody() {
	var body = ( process.env.PR_BODY !== void 0 ) ? process.env.PR_BODY : fs.readFileSync( 0, 'utf8' );
	var errs = coverage.prBody( body, byId() );
	if ( errs.length ) {
		die( errs.join( '\n' ) + '\n\nThe PR description defers work without a ticket. Open one (node bin/tickets.js new "<problem>") and cite it as `ticket NNNN` (CONVENTIONS P1).' );
	}
	console.log( 'PR description: every deferral cites a ticket' );
}

// MAIN //

var argv = process.argv.slice( 2 );
var cmd = argv[ 0 ] || 'list';
var areaIdx = argv.indexOf( '--area' );
var area = ( areaIdx >= 0 ) ? argv.splice( areaIdx, 2 )[ 1 ] : null;

switch ( cmd ) {
case 'list':
	list( argv[ 1 ] || 'open' );
	break;
case 'open':
case 'resolved':
case 'all':
	list( cmd );
	break;
case 'show':
	process.stdout.write( find( argv[ 1 ] ).src );
	break;
case 'new':
	create( argv[ 1 ] || die( 'usage: new "<problem statement>"' ), area );
	break;
case 'resolve':
	resolve( argv[ 1 ], argv.slice( 2 ).join( ' ' ) );
	break;
case 'reopen':
	reopen( argv[ 1 ], argv.slice( 2 ).join( ' ' ) );
	break;
case 'check':
	check();
	break;
case 'pr-body':
	prBody();
	break;
default:
	die( 'unknown command ' + cmd + ' (list|open|resolved|all|show|new|resolve|reopen|check|pr-body)' );
}
