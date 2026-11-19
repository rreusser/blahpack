#!/usr/bin/env node

/**
* Mutation test for early loop exits: can the tests tell whether code after a
* loop should run when the loop is left by `break`?
*
* A Fortran `GO TO` out of a loop either skips the statements between the loop
* end and its label, or (when there are none) behaves like a plain `break`.
* Translating it means deciding, at every exit, whether the post-loop code runs.
* Getting that wrong is invisible to line coverage: the `*latrs`/`*latps`/
* `*latbs` growth-bound bug (tickets/0027) was fully covered and passed every
* test for months, because no input made the two choices disagree.
*
* For each loop in `lib/<pkg>/base/<routine>/lib/*.js` that is left by an
* unlabeled `break`, let S be the statement that runs next after the loop: its
* next sibling, or, if the loop ends an `if` branch or block, the statement after
* that (climbing out, but never past an enclosing loop or function). This builds:
*
*   skip-after-break   S runs only if the loop finished without breaking
*   drop-guard         S is `if ( G ) B` with no else: replaced by B, so B
*                      runs on every exit (the old *latrs bug)
*
* and runs the routine's own tests against each mutant. Mutants are served in
* memory by bin/break-mutants-loader.mjs; the working tree is never modified, so
* concurrent runs are safe.
*
* A SURVIVING mutant means
* the tests cannot distinguish the two exit semantics at that site. Equivalent
* mutants (both semantics give identical results by construction) are recorded
* in `test/break-mutants.equivalent.json` with a reason. An entry whose reason
* starts with `UNREACHABLE` is a mutant that is NOT equivalent but whose path no
* known input reaches; it is reported as `unreach`, separately from `equiv`.
*
* Usage:
*   node bin/break-mutants.mjs <routine> [<routine> ...]
*   node bin/break-mutants.mjs --json <routine> ...
*   node bin/break-mutants.mjs --check <routine> ...  exit 1 on unexplained survivors
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as espree from 'espree';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const EQUIV_PATH = path.join( ROOT, 'test', 'break-mutants.equivalent.json' );
const TIMEOUT_MS = 120000;
const LOOP = /^(For|While|DoWhile|ForOf|ForIn)Statement$/;
const FLAG = '__breakMutantExited';
const LOADER = path.join( ROOT, 'bin', 'break-mutants-loader.mjs' );

function children( n ) {
	const out = [];
	for ( const k of Object.keys( n ) ) {
		const v = n[ k ];
		if ( Array.isArray( v ) ) {
			v.forEach( ( c ) => c && typeof c.type === 'string' && out.push( c ) );
		} else if ( v && typeof v.type === 'string' ) {
			out.push( v );
		}
	}
	return out;
}

// Unlabeled `break`s whose target is `loop` (not a nested loop or switch).
function ownBreaks( loop ) {
	const found = [];
	( function rec( n ) {
		if ( n !== loop.body && ( LOOP.test( n.type ) || n.type === 'SwitchStatement' || /Function/.test( n.type ) ) ) {
			return;
		}
		if ( n.type === 'BreakStatement' && !n.label ) {
			found.push( n );
			return;
		}
		children( n ).forEach( rec );
	})( loop.body );
	return found;
}

function sites( src ) {
	const ast = espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'loc': true, 'range': true } );
	const out = [];
	( function rec( n, ancestors ) {
		const body = ( n.type === 'BlockStatement' || n.type === 'Program' ) ? n.body : null;
		if ( body ) {
			body.forEach( ( st, i ) => {
				if ( !LOOP.test( st.type ) ) {
					return;
				}
				const brks = ownBreaks( st );
				const next = body[ i + 1 ] || nextAfter( n, ancestors );
				if ( !brks.length || !next ) {
					return;
				}
				out.push( { 'loop': st, 'breaks': brks, 'next': next } );
			});
		}
		children( n ).forEach( ( c ) => rec( c, ancestors.concat( n ) ) );
	})( ast, [] );
	return out;
}

// The statement that runs after `block` finishes, climbing out through `if`
// branches and plain blocks. Stops (returns null) at a loop, function, switch
// or try boundary: past those, "after the loop" no longer means "after exit".
function nextAfter( block, ancestors ) {
	let child = block;
	for ( let k = ancestors.length - 1; k >= 0; k-- ) {
		const a = ancestors[ k ];
		if ( a.type === 'IfStatement' ) {
			child = a;
			continue;
		}
		if ( a.type === 'BlockStatement' ) {
			const idx = a.body.indexOf( child );
			if ( idx >= 0 && idx + 1 < a.body.length ) {
				return a.body[ idx + 1 ];
			}
			child = a;
			continue;
		}
		return null;
	}
	return null;
}

function snippet( src, node ) {
	return src.slice( node.range[ 0 ], node.range[ 1 ] ).split( '\n' )[ 0 ].trim().slice( 0, 80 );
}

// Apply [start, end, text] edits right-to-left.
function apply( src, edits ) {
	let s = src;
	edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] ).forEach( ( e ) => {
		s = s.slice( 0, e[ 0 ] ) + e[ 2 ] + s.slice( e[ 1 ] );
	});
	return s;
}

function mutants( src, site ) {
	const out = [];
	const { loop, breaks, next } = site;
	const nextSrc = src.slice( next.range[ 0 ], next.range[ 1 ] );

	// skip-after-break: flag each own break, guard S on the flag. Skipped when
	// S is already guarded by the negation of the loop's own test (`for ( ;
	// j !== jlast; )` then `if ( j === jlast )`): that mutant is the code itself.
	if ( completionGuard( src, loop, next ) ) {
		return out.concat( dropGuard( src, next ) );
	}
	const edits = breaks.map( ( b ) => [ b.range[ 0 ], b.range[ 1 ], '{ ' + FLAG + ' = true; break; }' ] );
	edits.push( [ loop.range[ 0 ], loop.range[ 0 ], 'var ' + FLAG + ' = false; ' ] );
	edits.push( [ next.range[ 0 ], next.range[ 1 ], 'if ( !' + FLAG + ' ) { ' + nextSrc + ' }' ] );
	out.push( { 'kind': 'skip-after-break', 'src': apply( src, edits ) } );

	return out.concat( dropGuard( src, next ) );
}

// drop-guard: `if ( G ) B` (no else) -> `B`.
function dropGuard( src, next ) {
	if ( next.type !== 'IfStatement' || next.alternate ) {
		return [];
	}
	const cons = src.slice( next.consequent.range[ 0 ], next.consequent.range[ 1 ] );
	return [ { 'kind': 'drop-guard', 'src': apply( src, [ [ next.range[ 0 ], next.range[ 1 ], cons ] ] ) } ];
}

// Is `next` an `if ( a === b )` guard on a loop whose test is `a !== b`?
function completionGuard( src, loop, next ) {
	const t = loop.test;
	const g = ( next.type === 'IfStatement' ) ? next.test : null;
	if ( !t || !g || t.type !== 'BinaryExpression' || g.type !== 'BinaryExpression' ) {
		return false;
	}
	if ( t.operator !== '!==' || g.operator !== '===' ) {
		return false;
	}
	const txt = ( n ) => src.slice( n.range[ 0 ], n.range[ 1 ] ).replace( /\s+/g, '' );
	return txt( t.left ) === txt( g.left ) && txt( t.right ) === txt( g.right );
}

function moduleDir( routine ) {
	for ( const pkg of [ 'lapack', 'blas', 'arpack' ] ) {
		const d = path.join( ROOT, 'lib', pkg, 'base', routine );
		if ( fs.existsSync( d ) ) {
			return d;
		}
	}
	return null;
}

// Run the module's tests, optionally with `file` replaced in memory by `mutant`.
function runTests( dir, file, mutant ) {
	const tdir = path.join( dir, 'test' );
	const files = fs.readdirSync( tdir ).filter( ( f ) => /^test.*\.js$/.test( f ) ).map( ( f ) => path.join( tdir, f ) );
	const env = Object.assign( {}, process.env );
	let tmp = null;
	if ( file ) {
		tmp = path.join( fs.mkdtempSync( path.join( os.tmpdir(), 'break-mutant-' ) ), 'mutant.js' );
		fs.writeFileSync( tmp, mutant );
		env.NODE_OPTIONS = ( ( env.NODE_OPTIONS || '' ) + ' --import=' + pathToFileURL( LOADER ).href ).trim();
		env.BREAK_MUTANT_TARGET = pathToFileURL( file ).href;
		env.BREAK_MUTANT_SOURCE = tmp;
	}
	const r = spawnSync( process.execPath, [ '--test', '--test-reporter=dot', ...files ], { 'cwd': ROOT, 'timeout': TIMEOUT_MS, 'encoding': 'utf8', 'env': env } );
	if ( tmp ) {
		fs.rmSync( path.dirname( tmp ), { 'recursive': true, 'force': true } );
	}
	if ( r.error && r.error.code === 'ETIMEDOUT' ) {
		return 'timeout';
	}
	return ( r.status === 0 ) ? 'pass' : 'fail';
}

function loadEquivalent() {
	return fs.existsSync( EQUIV_PATH ) ? JSON.parse( fs.readFileSync( EQUIV_PATH, 'utf8' ) ) : {};
}

function key( file, line, kind ) {
	return path.relative( ROOT, file ) + ':' + line + ':' + kind;
}

function analyze( routine, equivalent ) {
	const dir = moduleDir( routine );
	if ( !dir ) {
		return { 'routine': routine, 'error': 'no module' };
	}
	const libDir = path.join( dir, 'lib' );
	const results = [];
	const work = [];
	for ( const f of fs.readdirSync( libDir ).filter( ( x ) => x.endsWith( '.js' ) ) ) {
		const file = path.join( libDir, f );
		const orig = fs.readFileSync( file, 'utf8' );
		try {
			work.push( { 'file': file, 'orig': orig, 'found': sites( orig ) } );
		} catch ( e ) {
			// Unparseable file: nothing to mutate.
		}
	}
	if ( !work.some( ( w ) => w.found.length ) ) {
		return { 'routine': routine, 'results': results };
	}
	if ( runTests( dir ) !== 'pass' ) {
		return { 'routine': routine, 'error': 'tests fail before mutation' };
	}
	for ( const { file, orig, found } of work ) {
		for ( const site of found ) {
			for ( const m of mutants( orig, site ) ) {
				// A mutant that does not parse would "fail" its tests and look killed.
				let outcome;
				try {
					espree.parse( m.src, { 'ecmaVersion': 2022, 'sourceType': 'module' } );
					outcome = runTests( dir, file, m.src );
				} catch ( e ) {
					outcome = 'invalid';
				}
				const line = site.breaks[ 0 ].loc.start.line;
				const k = key( file, line, m.kind );
				results.push({
					'site': path.relative( ROOT, file ) + ':' + line,
					'kind': m.kind,
					'next': snippet( orig, site.next ),
					'killed': outcome === 'fail' || outcome === 'timeout',
					'outcome': outcome,
					'equivalent': equivalent[ k ] || null
				});
			}
		}
	}
	return { 'routine': routine, 'results': results };
}

function main( argv ) {
	const asJson = argv.includes( '--json' );
	const check = argv.includes( '--check' );
	const routines = argv.filter( ( a ) => !a.startsWith( '--' ) );
	const equivalent = loadEquivalent();
	const all = routines.map( ( r ) => {
		const res = analyze( r, equivalent );
		if ( !asJson ) {
			if ( res.error ) {
				console.log( r + ': ' + res.error );
			} else {
				res.results.forEach( ( x ) => {
					const tag = ( x.outcome === 'invalid' ) ? 'INVALID ' : x.killed ? 'killed  ' : ( x.equivalent ? ( /^UNREACHABLE/.test( x.equivalent ) ? 'unreach ' : 'equiv   ' ) : 'SURVIVED' );
					console.log( tag + '  ' + x.site + '  ' + x.kind + '  next: ' + x.next );
				});
			}
		}
		return res;
	});
	if ( asJson ) {
		console.log( JSON.stringify( all, null, 1 ) );
	}
	const bad = all.flatMap( ( r ) => ( r.results || [] ).filter( ( x ) => !x.killed && ( !x.equivalent || x.outcome === 'invalid' ) ) );
	if ( !asJson ) {
		const total = all.reduce( ( n, r ) => n + ( r.results || [] ).length, 0 );
		const unreach = all.flatMap( ( r ) => ( r.results || [] ).filter( ( x ) => !x.killed && /^UNREACHABLE/.test( x.equivalent || '' ) ) );
		console.log( '\n' + total + ' mutants, ' + bad.length + ' unexplained survivors, ' + unreach.length + ' unreachable (not equivalent)' );
	}
	if ( check && bad.length ) {
		process.exitCode = 1;
	}
}

main( process.argv.slice( 2 ) );
