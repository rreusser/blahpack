// Read-only parsers for the project's own sources of truth. Nothing here
// writes to the repository; everything is re-read on each request so the page
// always reflects the working tree.
//
//   gates()        .github/workflows/ci.yml jobs/steps  +  bin/checks.json
//                  checks tracked by tickets (known-failing, not in CI)
//   lintRules()    lint/rules/<name>/README.md (+ fixtures, + conventions)
//   tickets()      tickets/NNNN-*.md
//   conventions()  CONVENTIONS.md rule tables
//   git()          branch, HEAD, dirty count

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const ROOT = path.resolve( path.dirname( new URL( import.meta.url ).pathname ), '..', '..' );

function read( rel ) {
	return fs.readFileSync( path.join( ROOT, rel ), 'utf8' );
}

function exists( rel ) {
	return fs.existsSync( path.join( ROOT, rel ) );
}

// "ticket 0027", "tickets 0033, 0064", "tickets 0065/0068" → ['0027', ...]
export function ticketRefs( text ) {
	const out = new Set();
	const re = /\btickets?\s+((?:\d{4}(?:\s*(?:,|\/|and|&)\s*)?)+)/gi;
	let m;
	while ( ( m = re.exec( text ) ) ) {
		for ( const id of m[ 1 ].match( /\d{4}/g ) ) {
			out.add( id );
		}
	}
	return [ ...out ];
}

// ---------------------------------------------------------------------------
// Gates

// Commands the dashboard refuses to run: they write tracked files or install
// things. They are still listed, so the page mirrors CI exactly.
const UNSAFE = [
	[ /\bnpm\s+(ci|install|i|pack|publish)\b/, 'installs or packs (writes outside caches)' ],
	[ /gen-exports\.js/, 'regenerates package.json / index.js (tracked files)' ],
	[ /\bgit\s+(commit|push|checkout|reset|stash|merge|rebase|clean)\b/, 'changes git state' ],
	[ /--fix\b/, 'auto-fixes source files' ]
];

function safety( cmd ) {
	for ( const [ re, why ] of UNSAFE ) {
		if ( re.test( cmd ) ) {
			return why;
		}
	}
	return null;
}

// A deliberately small YAML reader for the shape of ci.yml: jobs → name,
// leading comment, steps[] → name/run/uses (run may be a `|` block).
function parseWorkflow( src ) {
	const lines = src.split( '\n' );
	const jobs = [];
	let inJobs = false;
	let comment = [];
	let job = null;
	let step = null;
	for ( let i = 0; i < lines.length; i++ ) {
		const line = lines[ i ];
		if ( /^jobs:\s*$/.test( line ) ) {
			inJobs = true;
			continue;
		}
		if ( !inJobs ) {
			continue;
		}
		let m;
		if ( ( m = line.match( /^ {2}# ?(.*)$/ ) ) ) {
			comment.push( m[ 1 ] );
			continue;
		}
		if ( ( m = line.match( /^ {2}([\w-]+):\s*$/ ) ) ) {
			job = { 'key': m[ 1 ], 'name': m[ 1 ], 'comment': comment.join( '\n' ), 'steps': [] };
			jobs.push( job );
			comment = [];
			step = null;
			continue;
		}
		if ( !job ) {
			continue;
		}
		if ( ( m = line.match( /^ {4}name:\s*(.+)$/ ) ) ) {
			job.name = m[ 1 ].trim();
			continue;
		}
		if ( ( m = line.match( /^ {6}#\s?(.*)$/ ) ) ) {
			job.comment += ( job.comment ? '\n' : '' ) + m[ 1 ];
			continue;
		}
		if ( ( m = line.match( /^ {6}- (\w+):\s*(.*)$/ ) ) ) {
			step = {};
			job.steps.push( step );
			i = stepProp( step, m[ 1 ], m[ 2 ], lines, i, 10 );
			continue;
		}
		if ( step && ( m = line.match( /^ {8}(\w+):\s*(.*)$/ ) ) ) {
			i = stepProp( step, m[ 1 ], m[ 2 ], lines, i, 10 );
		}
	}
	return jobs;
}

function stepProp( step, key, val, lines, i, indent ) {
	if ( val.trim() === '|' ) {
		const body = [];
		const pad = ' '.repeat( indent );
		while ( i + 1 < lines.length && ( lines[ i + 1 ].startsWith( pad ) || lines[ i + 1 ].trim() === '' ) ) {
			i += 1;
			body.push( lines[ i ].slice( indent ) );
		}
		step[ key ] = body.join( '\n' ).replace( /\s+$/, '' );
	} else {
		step[ key ] = val.trim();
	}
	return i;
}

function commandFor( key ) {
	if ( key.startsWith( 'npm:' ) ) {
		return 'npm run ' + key.slice( 4 );
	}
	if ( /\.sh$/.test( key ) ) {
		return 'bash ' + key;
	}
	if ( /\.py$/.test( key ) ) {
		return 'python ' + key;
	}
	if ( /\.(c|m)?js$/.test( key ) || fs.statSync( path.join( ROOT, key ) ).isDirectory() ) {
		return 'node ' + key;
	}
	return null;
}

export function gates() {
	const jobs = parseWorkflow( read( '.github/workflows/ci.yml' ) );
	const groups = jobs.map( ( job ) => ( {
		'id': 'ci:' + job.key,
		'title': job.name,
		'source': '.github/workflows/ci.yml',
		'description': job.comment,
		'tickets': ticketRefs( job.comment ),
		'gates': job.steps.filter( ( s ) => s.run ).map( ( s, k ) => {
			const unsafe = safety( s.run );
			return {
				'id': 'ci:' + job.key + ':' + k,
				'title': s.name || s.run.split( '\n' )[ 0 ],
				'cmd': s.run,
				'setup': /^npm (ci|install)\b/.test( s.run ),
				'runnable': !unsafe,
				'why': unsafe
			};
		}).filter( ( g ) => !g.setup )
	}) );

	// Checks CONVENTIONS P2 says are failing and tracked by a ticket instead
	// of being gated in CI.
	const reg = JSON.parse( read( 'bin/checks.json' ) ).scripts || {};
	const tracked = [];
	for ( const [ key, v ] of Object.entries( reg ) ) {
		if ( v.kind !== 'ticket' ) {
			continue;
		}
		const cmd = key.startsWith( 'npm:' ) || exists( key ) ? commandFor( key ) : null;
		const unsafe = cmd ? safety( cmd ) : 'no command';
		tracked.push({
			'id': 'tracked:' + key,
			'title': key,
			'cmd': cmd || '',
			'runnable': !!cmd && !unsafe,
			'why': unsafe,
			'tickets': [ v.ticket ]
		});
	}
	groups.push({
		'id': 'tracked',
		'title': 'Known-failing checks (ticket-tracked, not in CI)',
		'source': 'bin/checks.json',
		'description': 'Checks classified `kind: "ticket"` in bin/checks.json: they exist but fail, so CI does not run them yet (CONVENTIONS P2).',
		'tickets': [ ...new Set( tracked.flatMap( ( t ) => t.tickets ) ) ],
		'gates': tracked
	});
	return groups;
}

// ---------------------------------------------------------------------------
// Lint rules

export function lintRules() {
	const conv = conventions();
	const dir = path.join( ROOT, 'lint', 'rules' );
	return fs.readdirSync( dir ).filter( ( n ) => fs.statSync( path.join( dir, n ) ).isDirectory() ).sort().map( ( name ) => {
		const rel = 'lint/rules/' + name;
		const readme = exists( rel + '/README.md' ) ? read( rel + '/README.md' ) : '';
		const paras = readme.replace( /^#.*\n/, '' ).trim().split( /\n\s*\n/ );
		const summary = ( paras[ 0 ] || '' ).replace( /\n/g, ' ' );
		const files = ( readme.match( /\*\*Files:\*\*\s*(.+)/ ) || [] )[ 1 ] || '';
		const autofix = /\*\*Autofix:\*\*/.test( readme );
		const fixtures = { 'pass': 0, 'fail': 0 };
		for ( const kind of [ 'pass', 'fail' ] ) {
			const fdir = path.join( ROOT, rel, 'fixtures', kind );
			if ( fs.existsSync( fdir ) ) {
				fixtures[ kind ] = countFiles( fdir );
			}
		}
		const enforces = conv.filter( ( c ) => new RegExp( 'lint:' + name + '\\b' ).test( c.enforcer ) ).map( ( c ) => c.id );
		return {
			'name': name,
			'summary': summary,
			'files': files,
			'autofix': autofix,
			'fixtures': fixtures,
			'enforces': enforces,
			'readme': readme,
			'tickets': ticketRefs( readme ),
			'runs': [
				{ 'id': 'lint:' + name + ':fixtures', 'title': 'Fixture tests', 'cmd': 'node --test ' + rel + '/test.cjs', 'runnable': exists( rel + '/test.cjs' ) },
				{ 'id': 'lint:' + name + ':corpus', 'title': 'Whole corpus', 'cmd': 'node lint/verify-corpus.cjs --rule ' + name, 'runnable': true }
			]
		};
	});
}

function countFiles( dir ) {
	let n = 0;
	for ( const e of fs.readdirSync( dir, { 'withFileTypes': true } ) ) {
		n += e.isDirectory() ? countFiles( path.join( dir, e.name ) ) : 1;
	}
	return n;
}

// ---------------------------------------------------------------------------
// Tickets

export function tickets() {
	const dir = path.join( ROOT, 'tickets' );
	return fs.readdirSync( dir ).filter( ( f ) => /^\d{4}-.*\.md$/.test( f ) ).sort().map( ( file ) => {
		const src = fs.readFileSync( path.join( dir, file ), 'utf8' );
		const m = src.match( /^---\n([\s\S]*?)\n---\n([\s\S]*)$/ );
		const meta = {};
		if ( m ) {
			for ( const line of m[ 1 ].split( '\n' ) ) {
				const kv = line.match( /^(\w+):\s*(.*)$/ );
				if ( kv ) {
					meta[ kv[ 1 ] ] = kv[ 2 ].trim();
				}
			}
		}
		const body = m ? m[ 2 ] : src;
		const id = meta.id || file.slice( 0, 4 );
		return {
			'id': id,
			'file': 'tickets/' + file,
			'title': meta.title || file,
			'status': meta.status || 'unknown',
			'area': meta.area || '',
			'opened': meta.opened || '',
			'resolved': meta.resolved || '',
			'body': body.trim(),
			'refs': ticketRefs( body ).filter( ( r ) => r !== id )
		};
	});
}

// ---------------------------------------------------------------------------
// Conventions

export function conventions() {
	const src = read( 'CONVENTIONS.md' );
	const out = [];
	let section = '';
	for ( const line of src.split( '\n' ) ) {
		let m;
		if ( ( m = line.match( /^## (.+)$/ ) ) ) {
			section = m[ 1 ].trim();
			continue;
		}
		if ( ( m = line.match( /^\| ([A-Z]\d+[a-z]?) \|(.*)\|\s*$/ ) ) ) {
			const cells = splitRow( m[ 2 ] );
			out.push({
				'id': m[ 1 ],
				'section': section,
				'rule': cells[ 0 ] || '',
				'why': cells[ 1 ] || '',
				'enforcer': cells[ 2 ] || ''
			});
		}
	}
	return out;
}

// Split a markdown table row on `|` outside backticks.
function splitRow( s ) {
	const cells = [];
	let cur = '';
	let tick = false;
	for ( const ch of s ) {
		if ( ch === '`' ) {
			tick = !tick;
		}
		if ( ch === '|' && !tick ) {
			cells.push( cur.trim() );
			cur = '';
		} else {
			cur += ch;
		}
	}
	cells.push( cur.trim() );
	return cells;
}

// ---------------------------------------------------------------------------
// Git (read-only)

export function git() {
	const run = ( ...args ) => {
		try {
			return execFileSync( 'git', args, { 'cwd': ROOT, 'encoding': 'utf8', 'stdio': [ 'ignore', 'pipe', 'ignore' ] } ).trim();
		} catch {
			return '';
		}
	};
	const porcelain = run( 'status', '--porcelain' );
	return {
		'branch': run( 'rev-parse', '--abbrev-ref', 'HEAD' ),
		'head': run( 'log', '-1', '--format=%h %s' ),
		'headDate': run( 'log', '-1', '--format=%cI' ),
		'dirty': porcelain ? porcelain.split( '\n' ).length : 0,
		'aheadBehind': run( 'rev-list', '--left-right', '--count', 'origin/main...HEAD' )
	};
}
