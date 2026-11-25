#!/usr/bin/env node

/**
* Mutation test for early loop exits: can the tests tell whether code after a
* loop should run when the loop is left by `break`?
*
* A Fortran `GO TO` out of a loop either skips the statements between the loop
* end and its label, or (when there are none) behaves like a plain `break`.
* Translating it means deciding, at every exit, whether the post-loop code runs.
* Getting that wrong is invisible to line coverage: the `*latrs`/`*latps`/
* `*latbs` growth-bound bug (tickets/0045) was fully covered and passed every
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
*   skip-after-this-break  (loops with several breaks) S skipped after one
*                      particular break only (the old *pocon bug); keyed by
*                      that break's line
*
* and runs the routine's own tests against each mutant. Mutants are served in
* memory by bin/break-mutants-loader.mjs; the working tree is never modified, so
* concurrent runs are safe.
*
* A SURVIVING mutant means
* the tests cannot distinguish the two exit semantics at that site. Equivalent
* mutants (both semantics give identical results by construction) are recorded
* in `test/break-mutants.equivalent.json` with a reason, keyed by
* `<file>#<fingerprint>:<kind>[@<break index>]` (see `fingerprint`). Only proven
* equivalence counts: a survivor on a path no known input reaches is a gap
* (ticket 0051), not an exemption (CONVENTIONS T5).
*
* Usage:
*   node bin/break-mutants.mjs <routine> [<routine> ...]
*   node bin/break-mutants.mjs --changed [--base <ref>] --check   CI: modules
*                    changed since the merge-base with <ref> (default origin/main)
*   node bin/break-mutants.mjs --all
*   node bin/break-mutants.mjs --json <routine> ...
*   node bin/break-mutants.mjs --check <routine> ...  exit 1 on unexplained survivors
*
* Results are cached per module and computed in a worker pool
* (bin/lib/corpus.mjs; `--no-cache`, `--jobs <n>`).
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as espree from 'espree';
import { moduleDir, selectRoutines, testConcurrency, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const EQUIV_PATH = path.join( ROOT, 'test', 'break-mutants.equivalent.json' );
const TIMEOUT_MS = 120000;
const LOOP = /^(For|While|DoWhile|ForOf|ForIn)Statement$/;
const FLAG = '__breakMutantExited';
const LOADER = path.join( ROOT, 'bin', 'break-mutants-loader.mjs' );
const ENTRY = fileURLToPath( import.meta.url );

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
				const after = ( body[ i + 1 ] ) ? { 'next': body[ i + 1 ], 'anchor': st } : nextAfter( n, ancestors );
				if ( !brks.length || !after ) {
					return;
				}
				const target = pastDeclarations( after.next, ( body[ i + 1 ] ) ? body : null, n, ancestors );
				if ( !target ) {
					return;
				}
				out.push( { 'loop': st, 'breaks': brks, 'next': target, 'anchor': after.anchor } );
			});
		}
		children( n ).forEach( ( c ) => rec( c, ancestors.concat( n ) ) );
	})( ast, [] );
	return out;
}

// Wrapping a `const`/`let` declaration in `if ( !flag ) { … }` moves it into a
// block, so later uses throw a ReferenceError and the mutant looks killed. When
// S is a declaration, keep it (it only names a value) and mutate the first
// non-declaration statement after it in the same block instead.
function pastDeclarations( next, siblings, block, ancestors ) {
	if ( next.type !== 'VariableDeclaration' ) {
		return next;
	}
	const owner = siblings || containingBody( next, block, ancestors );
	if ( !owner ) {
		return null;
	}
	for ( let k = owner.indexOf( next ); k < owner.length; k++ ) {
		if ( owner[ k ].type !== 'VariableDeclaration' ) {
			return owner[ k ];
		}
	}
	return null;
}

function containingBody( node, block, ancestors ) {
	const all = ancestors.concat( block );
	for ( let k = all.length - 1; k >= 0; k-- ) {
		const b = all[ k ].body;
		if ( Array.isArray( b ) && b.indexOf( node ) >= 0 ) {
			return b;
		}
	}
	return null;
}

// The statement that runs after `block` finishes, climbing out through `if`
// branches and plain blocks, as { next, anchor }. Stops (returns null) at a loop, function, switch
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
				// `anchor` precedes `next` in the same block, so a flag reset
				// before it runs on every path that reaches `next`.
				return { 'next': a.body[ idx + 1 ], 'anchor': child };
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
	out.push( { 'kind': 'skip-after-break', 'src': skipOn( src, site, breaks, nextSrc ) } );

	// skip-after-this-break: with several exits, each may need different
	// handling (e.g. dpocon: the KASE exit runs S, the overflow bail must not).
	if ( breaks.length > 1 ) {
		breaks.forEach( ( b ) => {
			out.push( { 'kind': 'skip-after-this-break', 'line': b.loc.start.line, 'bi': site.breaks.indexOf( b ), 'src': skipOn( src, site, [ b ], nextSrc ) } );
		});
	}

	return out.concat( dropGuard( src, next ) );
}

// Source with S skipped whenever one of `brks` was taken. The flag is reset
// before the anchor, so it cannot carry over from an earlier pass.
function skipOn( src, site, brks, nextSrc ) {
	const edits = brks.map( ( b ) => [ b.range[ 0 ], b.range[ 1 ], '{ ' + FLAG + ' = true; break; }' ] );
	edits.push( [ site.anchor.range[ 0 ], site.anchor.range[ 0 ], 'var ' + FLAG + ' = false; ' ] );
	edits.push( [ site.next.range[ 0 ], site.next.range[ 1 ], 'if ( !' + FLAG + ' ) { ' + nextSrc + ' }' ] );
	return apply( src, edits );
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
	const r = spawnSync( process.execPath, [ '--test', ...testConcurrency(), '--test-reporter=dot', ...files ], { 'cwd': ROOT, 'timeout': TIMEOUT_MS, 'encoding': 'utf8', 'env': env } );
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

// Entries are keyed by CONTENT, not line: a fingerprint of the loop and the
// statement after it (tokens only, so comments and whitespace do not count),
// plus the mutant kind and, for a per-break mutant, the break's index. A key
// survives unrelated edits (a codemod elsewhere in the file) and changes exactly
// when the code a proof is about changes, which is when it must be re-checked.
function fingerprint( src, site ) {
	const toks = ( n ) => espree.tokenize( src.slice( n.range[ 0 ], n.range[ 1 ] ), { 'ecmaVersion': 2022, 'sourceType': 'module' } ).map( ( t ) => t.value ).join( ' ' );
	return createHash( 'sha1' ).update( toks( site.loop ) + '\n' + toks( site.next ) ).digest( 'hex' ).slice( 0, 12 );
}

function siteKey( file, src, site, m ) {
	return path.relative( ROOT, file ) + '#' + fingerprint( src, site ) + ':' + m.kind + ( ( m.bi === void 0 ) ? '' : '@' + m.bi );
}

// The result does not depend on test/break-mutants.equivalent.json (main
// applies it), so a cached result stays valid when that file changes.
function analyze( routine ) {
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
				const line = m.line || site.breaks[ 0 ].loc.start.line;
				const k = siteKey( file, orig, site, m );
				results.push({
					'key': k,
					'site': path.relative( ROOT, file ) + ':' + line,
					'kind': m.kind,
					'next': snippet( orig, site.next ),
					'killed': outcome === 'fail' || outcome === 'timeout',
					'outcome': outcome
				});
			}
		}
	}
	return { 'routine': routine, 'results': results };
}

async function main( argv ) {
	const asJson = argv.includes( '--json' );
	const check = argv.includes( '--check' );
	const routines = selectRoutines( argv, 'break-mutants' );
	if ( routines === null ) {
		process.exitCode = 2;
		return;
	}
	if ( !asJson && argv.includes( '--changed' ) ) {
		console.log( 'Changed modules: ' + ( routines.length ? routines.join( ' ' ) : '(none)' ) );
	}
	const equivalent = loadEquivalent();
	const all = await runCorpus( { 'tool': 'break-mutants', 'entry': ENTRY, 'extraFiles': [ LOADER ], 'routines': routines, 'argv': argv } );
	all.forEach( ( res ) => {
		( res.results || [] ).forEach( ( x ) => {
			x.equivalent = equivalent[ x.key ] || null;
		});
		if ( !asJson ) {
			if ( res.error ) {
				console.log( res.routine + ': ' + res.error );
			} else {
				res.results.forEach( ( x ) => {
					const tag = ( x.outcome === 'invalid' ) ? 'INVALID ' : x.killed ? 'killed  ' : x.equivalent ? 'equiv   ' : 'SURVIVED';
					console.log( tag + '  ' + x.site + '  ' + x.kind + '  next: ' + x.next );
				});
			}
		}
	});

	// Equivalence entries for checked modules that no longer describe a
	// surviving mutant (killed, or its code changed) are stale: each one is a
	// proof about specific code, and must be re-checked when that code changes.
	const surviving = new Set( all.flatMap( ( r ) => ( r.results || [] ).filter( ( x ) => !x.killed ).map( ( x ) => x.key ) ) );
	const dirs = routines.map( ( r ) => moduleDir( r ) ).filter( Boolean ).map( ( d ) => path.relative( ROOT, d ) + '/' );
	const inScope = ( k ) => dirs.some( ( d ) => k.startsWith( d ) );
	const stale = Object.keys( equivalent ).filter( ( k ) => !k.startsWith( '_' ) && inScope( k ) && !surviving.has( k ) ).map( ( k ) => 'stale equivalence entry (re-check the proof against the current code, then re-key or remove it): ' + k );

	if ( asJson ) {
		console.log( JSON.stringify( all, null, 1 ) );
	}
	const errors = all.filter( ( r ) => r.error ).map( ( r ) => r.routine + ': ' + r.error );
	const bad = all.flatMap( ( r ) => ( r.results || [] ).filter( ( x ) => !x.killed && ( !x.equivalent || x.outcome === 'invalid' ) ) );
	if ( !asJson ) {
		const total = all.reduce( ( n, r ) => n + ( r.results || [] ).length, 0 );
		stale.forEach( ( m ) => console.log( m ) );
		console.log( '\n' + total + ' mutants, ' + bad.length + ' unexplained survivors, ' + stale.length + ' stale entries' );
		if ( check && bad.length ) {
			console.log( 'Each SURVIVED mutant marks a `break` whose post-loop code no test checks. Add a test that makes the two choices differ, or record a proven equivalence in test/break-mutants.equivalent.json (see .claude/skills/blahpack-translate, Step 4).' );
		}
	}
	if ( check && ( bad.length || stale.length || errors.length ) ) {
		process.exitCode = 1;
	}
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	if ( isWorker() ) {
		workerMain( analyze );
	} else {
		main( process.argv.slice( 2 ) );
	}
}

export { sites, mutants, siteKey };
