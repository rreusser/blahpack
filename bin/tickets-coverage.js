'use strict';

// Ticket coverage: every known gap must be tracked by a ticket (CONVENTIONS P1).
//
// A gap is anything the repo or a PR admits is unenforced, failing or deferred.
// The ticket format check (`bin/tickets.js check`) only validates tickets that
// exist; this module checks that the gaps have one. It looks in three places:
//
//   1. Checks (`bin/checks.json`). Every entry point that could be a check — each
//      top-level file in `bin/`, each `lint/*.cjs`, each npm script — is
//      classified, and the classification is verified:
//        gate    CI runs it (directly, or through a gated npm script).
//        ticket  CI does not run it, because it fails; an open ticket names it.
//        part    a module of a gated check; that check's source references it.
//        alias   a shortcut for gated scripts (`of`: each must be gated).
//        tool    not a check (`why`); a generator, codemod, fixer or launcher.
//      A check that passes but is not gated is not a legal state: that is how
//      `bin/bench-smoke.sh` rotted from 0 to 90 failures (ticket 0027).
//
//   2. Docs. A CONVENTIONS.md rule whose enforcer is marked (warn), (unbuilt),
//      (dup), dead, "not gated" or "not in CI" cites an open ticket that names
//      the rule ID. Any line in CONVENTIONS.md, CLAUDE.md, docs/ or the skills
//      that says something is "not gated" or "not in CI" cites a ticket.
//
//   3. PR descriptions (`prBody`). A line that defers work ("not in this PR",
//      "known gaps", "follow-up", ...) or a list item under such a heading
//      cites a ticket.
//
// A citation is `ticket NNNN` or `tickets/NNNN-...`.

const fs = require( 'fs' );
const path = require( 'path' );

const ROOT = path.join( __dirname, '..' );
const KINDS = [ 'gate', 'ticket', 'part', 'alias', 'tool' ];
const CITE = /\btickets?[ /](\d{4})\b/g;

// Names that are checks by construction (`check-*`, `verify-*`, `*-smoke`, ...);
// they may not be classified `tool`.
const CHECK_LEAD = /^(check|verify|audit|typecheck|coverage|smoke)$/i;

function looksLikeCheck( name ) {
	const segs = path.basename( name ).split( /[-_:.]/ );
	return CHECK_LEAD.test( segs[ 0 ] ) || segs.indexOf( 'smoke' ) >= 0;
}

// Enforcer marks in CONVENTIONS.md that admit the rule is not (fully) enforced.
const GAP_MARK = /\((warn|unbuilt|dup|dead)\b|\bunbuilt\b|\bdead\b|not (yet )?gated|not in CI/i;

// Prose that admits something is not enforced.
const DOC_GAP = /\bnot (yet )?gated\b|\bnot in CI\b/i;

// Prose that defers work.
const DEFER = /\b(not in this pr|out of scope|known gaps?|follow-?ups?|deferred|left for|separate (pass|pr|change)|todo|not (yet )?(gated|done|fixed|enforced|checked|verified|handled|covered|addressed))\b/i;

function read( rel ) {
	return fs.readFileSync( path.join( ROOT, rel ), 'utf8' );
}

function citations( text ) {
	const out = [];
	let m;
	CITE.lastIndex = 0;
	while ( ( m = CITE.exec( text ) ) !== null ) {
		out.push( m[ 1 ] );
	}
	return out;
}

/**
* Checks that a line cites at least one existing ticket, and (when `open` is set)
* that it is open and (when `mention` is set) that its text names `mention`.
*/
function citeProblems( where, text, tickets, opts ) {
	const ids = citations( text );
	const errs = [];
	if ( ids.length === 0 ) {
		return [ where + ': ' + opts.what + ' without a ticket (cite `ticket NNNN`): ' + text.trim().slice( 0, 160 ) ];
	}
	const good = ids.filter( function ok( id ) {
		const t = tickets[ id ];
		if ( !t ) {
			errs.push( where + ': cites ticket ' + id + ', which does not exist' );
			return false;
		}
		if ( opts.open && t.meta.status !== 'open' ) {
			errs.push( where + ': cites ticket ' + id + ', which is ' + t.meta.status + '; the gap is closed, so update the text' );
			return false;
		}
		return true;
	});
	if ( opts.mention && good.length && !good.some( function names( id ) {
		return new RegExp( '(^|[^\\w])' + opts.mention.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) + '([^\\w]|$)' ).test( tickets[ id ].src );
	}) ) {
		errs.push( where + ': cites ticket ' + good.join( ', ' ) + ', but no cited ticket mentions `' + opts.mention + '`' );
	}
	return errs;
}

// CHECKS //

function universe() {
	const out = [];
	fs.readdirSync( path.join( ROOT, 'bin' ) ).sort().forEach( function each( n ) {
		if ( fs.statSync( path.join( ROOT, 'bin', n ) ).isFile() ) {
			out.push( 'bin/' + n );
		}
	});
	fs.readdirSync( path.join( ROOT, 'lint' ) ).sort().forEach( function each( n ) {
		if ( /\.cjs$/.test( n ) ) {
			out.push( 'lint/' + n );
		}
	});
	Object.keys( JSON.parse( read( 'package.json' ) ).scripts ).forEach( function each( s ) {
		out.push( 'npm:' + s );
	});
	return out;
}

// The set of keys CI runs: npm scripts it calls, and files named by CI or by
// those scripts, to a fixpoint through `npm run` chains.
function gatedSet() {
	const scripts = JSON.parse( read( 'package.json' ) ).scripts;
	const wf = path.join( ROOT, '.github', 'workflows' );
	const sources = fs.readdirSync( wf ).filter( function f( n ) {
		return /\.ya?ml$/.test( n );
	}).map( function m( n ) {
		// Full-line comments name things without running them.
		return fs.readFileSync( path.join( wf, n ), 'utf8' ).replace( /^\s*#.*$/gm, '' );
	});
	const gated = {};
	const files = universe().filter( function f( k ) {
		return k.indexOf( 'npm:' ) !== 0;
	});
	let frontier = sources.slice();
	while ( frontier.length ) {
		const next = [];
		frontier.forEach( function scan( text ) {
			let m;
			const re = /\bnpm run(?: -s)? ([\w:.-]+)/g;
			while ( ( m = re.exec( text ) ) !== null ) {
				const k = 'npm:' + m[ 1 ];
				if ( scripts[ m[ 1 ] ] !== void 0 && !gated[ k ] ) {
					gated[ k ] = true;
					next.push( scripts[ m[ 1 ] ] );
				}
			}
			const re2 = /\b((?:bin|lint)\/[\w.*-]+)/g;
			while ( ( m = re2.exec( text ) ) !== null ) {
				if ( m[ 1 ].indexOf( '*' ) < 0 ) {
					gated[ m[ 1 ] ] = true;
					continue;
				}
				// A glob (`lint/*.test.cjs`) gates every file it matches.
				const glob = new RegExp( '^' + m[ 1 ].replace( /[.]/g, '\\.' ).replace( /\*/g, '[^/]*' ) + '$' );
				files.forEach( function f( k ) {
					if ( glob.test( k ) ) {
						gated[ k ] = true;
					}
				});
			}
		});
		frontier = next;
	}
	return gated;
}

function checkRegistry( tickets ) {
	const errs = [];
	const reg = JSON.parse( read( 'bin/checks.json' ) ).scripts;
	const keys = universe();
	const gated = gatedSet();
	const scripts = JSON.parse( read( 'package.json' ) ).scripts;
	const where = 'bin/checks.json';

	keys.forEach( function each( k ) {
		if ( !reg[ k ] ) {
			errs.push( where + ': `' + k + '` is not classified (gate | ticket | part | alias | tool)' );
		}
	});
	Object.keys( reg ).forEach( function each( k ) {
		const e = reg[ k ];
		const at = where + ' `' + k + '`';
		const name = k.replace( /^npm:/, '' );
		if ( keys.indexOf( k ) < 0 ) {
			errs.push( at + ': no such file or npm script' );
			return;
		}
		if ( KINDS.indexOf( e.kind ) < 0 ) {
			errs.push( at + ': kind must be one of ' + KINDS.join( '|' ) );
			return;
		}
		if ( gated[ k ] && e.kind !== 'gate' ) {
			errs.push( at + ': CI runs it, so its kind is `gate`' );
		}
		if ( e.kind === 'gate' && !gated[ k ] ) {
			errs.push( at + ': marked `gate`, but no CI workflow runs it' );
		}
		if ( e.kind === 'ticket' ) {
			errs.push.apply( errs, citeProblems( at, 'ticket ' + ( e.ticket || '' ), tickets, {
				'what': 'ungated check',
				'open': true,
				'mention': ( k.indexOf( 'npm:' ) === 0 ) ? name : k
			}) );
		}
		if ( e.kind === 'part' || e.kind === 'alias' ) {
			const of = [].concat( e.of || [] );
			if ( of.length === 0 ) {
				errs.push( at + ': `' + e.kind + '` needs `of`' );
			}
			of.forEach( function chk( o ) {
				if ( !gated[ o ] && !( reg[ o ] && reg[ o ].kind === 'alias' ) ) {
					errs.push( at + ': `of` entry `' + o + '` is neither gated nor an alias' );
					return;
				}
				const src = ( o.indexOf( 'npm:' ) === 0 ) ? scripts[ o.slice( 4 ) ] : read( o );
				const ref = ( e.kind === 'part' ) ? path.basename( k ) : ( ( o.indexOf( 'npm:' ) === 0 ) ? o.slice( 4 ) : o );
				const via = ( e.kind === 'part' ) ? src : ( ( k.indexOf( 'npm:' ) === 0 ) ? scripts[ name ] : read( k ) );
				if ( via.indexOf( ref ) < 0 ) {
					errs.push( at + ': ' + ( ( e.kind === 'part' ) ? '`' + o + '` does not reference ' + ref : 'does not invoke `' + ref + '`' ) );
				}
			});
		}
		if ( e.kind === 'tool' ) {
			if ( !e.why ) {
				errs.push( at + ': `tool` needs a `why`' );
			}
			if ( looksLikeCheck( name ) ) {
				errs.push( at + ': its name says it is a check, so it is a `gate` or a `ticket`, not a `tool`' );
			}
		}
	});
	return errs;
}

// ARTIFACTS //

// The kind of a file in a module directory: its path relative to the module,
// with the routine name as `<r>` and per-instance names folded to a glob.
function artifactKind( rel, routine ) {
	const p = rel.split( '/' ).map( function m( seg ) {
		return seg.split( routine ).join( '<r>' );
	}).join( '/' );
	if ( /^test\/fixtures\//.test( p ) ) {
		return 'test/fixtures/**';
	}
	if ( /^test\/test\.[^/]+\.js$/.test( p ) ) {
		return 'test/test.*.js';
	}
	if ( /^benchmark\/[^/]+\.js$/.test( p ) ) {
		return 'benchmark/*.js';
	}
	return p;
}

function moduleArtifacts() {
	const out = {};
	[ 'arpack', 'blas', 'lapack' ].forEach( function each( pkg ) {
		const base = path.join( ROOT, 'lib', pkg, 'base' );
		if ( !fs.existsSync( base ) ) {
			return;
		}
		fs.readdirSync( base ).forEach( function mod( r ) {
			const walk = function walk( rel ) {
				fs.readdirSync( path.join( base, r, rel ) ).forEach( function f( n ) {
					const sub = rel ? rel + '/' + n : n;
					if ( fs.statSync( path.join( base, r, sub ) ).isDirectory() ) {
						walk( sub );
					} else {
						const k = artifactKind( sub, r );
						out[ k ] = out[ k ] || ( 'lib/' + pkg + '/base/' + r + '/' + sub );
					}
				});
			};
			walk( '' );
		});
	});
	return out;
}

// Every kind of file in a module is covered by gated checks (`by`), tracked by
// an open ticket, or declared `unchecked` with a reason. A benchmark or example
// that nothing runs is how 90 benchmarks and 335 examples broke unnoticed.
function checkArtifacts( tickets ) {
	const errs = [];
	const reg = JSON.parse( read( 'bin/checks.json' ) ).artifacts || {};
	const gated = gatedSet();
	const found = moduleArtifacts();
	const where = 'bin/checks.json artifacts';
	Object.keys( found ).sort().forEach( function each( k ) {
		if ( !reg[ k ] ) {
			errs.push( where + ': module file kind `' + k + '` (e.g. ' + found[ k ] + ') is not classified (gate | ticket | unchecked)' );
		}
	});
	Object.keys( reg ).forEach( function each( k ) {
		const e = reg[ k ];
		const at = where + ' `' + k + '`';
		if ( !found[ k ] ) {
			errs.push( at + ': no module has a file of this kind' );
			return;
		}
		if ( e.kind === 'gate' ) {
			const by = [].concat( e.by || [] );
			if ( by.length === 0 ) {
				errs.push( at + ': `gate` needs `by` (the gated checks that cover it)' );
			}
			by.forEach( function b( g ) {
				if ( !gated[ g ] ) {
					errs.push( at + ': `by` entry `' + g + '` is not run by CI' );
				}
			});
		} else if ( e.kind === 'ticket' ) {
			const parts = k.split( '/' );
			const mention = ( k.indexOf( '*' ) < 0 && k.indexOf( '<r>' ) < 0 ) ? parts[ parts.length - 1 ] : parts[ 0 ];
			errs.push.apply( errs, citeProblems( at, 'ticket ' + ( e.ticket || '' ), tickets, {
				'what': 'unchecked module file kind',
				'open': true,
				'mention': mention
			}) );
		} else if ( e.kind === 'unchecked' ) {
			if ( !e.why ) {
				errs.push( at + ': `unchecked` needs a `why`' );
			}
		} else {
			errs.push( at + ': kind must be gate | ticket | unchecked' );
		}
	});
	return errs;
}

// DOCS //

function docFiles() {
	const out = [ 'CONVENTIONS.md', 'CLAUDE.md' ];
	const walk = function walk( dir ) {
		const abs = path.join( ROOT, dir );
		if ( !fs.existsSync( abs ) ) {
			return;
		}
		fs.readdirSync( abs ).sort().forEach( function each( n ) {
			const rel = dir + '/' + n;
			if ( fs.statSync( path.join( ROOT, rel ) ).isDirectory() ) {
				walk( rel );
			} else if ( /\.md$/.test( n ) ) {
				out.push( rel );
			}
		});
	};
	walk( 'docs' );
	walk( '.claude/skills' );
	return out;
}

function checkDocs( tickets ) {
	const errs = [];
	docFiles().forEach( function each( f ) {
		read( f ).split( '\n' ).forEach( function line( l, i ) {
			const where = f + ':' + ( i + 1 );
			const row = ( f === 'CONVENTIONS.md' ) ? l.match( /^\| ([A-Z]\d+[a-z]?) \|/ ) : null;
			if ( row ) {
				const cells = l.split( '|' );
				const enforcer = cells[ cells.length - 2 ] || '';
				if ( GAP_MARK.test( enforcer ) ) {
					errs.push.apply( errs, citeProblems( where, enforcer, tickets, {
						'what': 'rule ' + row[ 1 ] + ' has an unenforced part',
						'open': true,
						'mention': row[ 1 ]
					}) );
				}
				return;
			}
			if ( DOC_GAP.test( l ) ) {
				errs.push.apply( errs, citeProblems( where, l, tickets, {
					'what': 'unenforced-work statement',
					'open': true
				}) );
			}
		});
	});
	return errs;
}

// PR BODY //

/**
* Checks a PR description: every deferral line, and every list item under a
* deferral heading, cites an existing ticket.
*/
function prBody( body, tickets ) {
	const errs = [];
	// Deferral scope. After a deferral heading ("## Not in this PR"), every list
	// item until the next paragraph or heading. After a list item that defers and
	// ends with ':' ("- Not covered yet:"), its deeper-indented children.
	let headingScope = false;
	let itemScope = -1;
	body.replace( /\r/g, '' ).split( '\n' ).forEach( function line( l, i ) {
		const where = 'PR description line ' + ( i + 1 );
		const item = /^(\s*)([-*+]|\d+\.)\s/.exec( l );
		const indent = item ? item[ 1 ].length : 0;
		const cites = citations( l ).length > 0;
		const defers = DEFER.test( l );
		if ( l.trim() === '' ) {
			return;
		}
		if ( !item ) {
			itemScope = -1;
			const heading = /^\s*(#{1,6}\s|\*\*[^*]+\*\*:?\s*$)/.test( l ) || /:\s*$/.test( l );
			headingScope = heading && defers && !cites;
			// A heading needs no citation of its own when its items carry them.
			if ( cites || ( defers && !heading ) ) {
				errs.push.apply( errs, citeProblems( where, l, tickets, { 'what': 'deferred work' } ) );
			}
			return;
		}
		if ( itemScope >= 0 && indent <= itemScope ) {
			itemScope = -1;
		}
		if ( headingScope || itemScope >= 0 || defers || cites ) {
			errs.push.apply( errs, citeProblems( where, l, tickets, { 'what': 'deferred work' } ) );
		}
		if ( defers && !cites && /:\**\s*$/.test( l ) && itemScope < 0 ) {
			itemScope = indent;
		}
	});
	return errs;
}

module.exports = {
	'checkRegistry': checkRegistry,
	'checkArtifacts': checkArtifacts,
	'checkDocs': checkDocs,
	'prBody': prBody
};
