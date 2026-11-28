#!/usr/bin/env node

/**
* Mutation test for computed values: does any test check what a line of
* `base.js` computes, or only that it ran? (CONVENTIONS T4a; ticket 0093)
*
* Line coverage counts a line once a test executes it. A branch whose tests
* assert only `info`, self-consistency, or a residual that many answers pass
* is "covered" whatever it computes. zlahef's upper row-max searched one
* element short (`izamax( k - imax - 1, … )` for the reference's `K-IMAX`) and
* passed every test and the coverage floor (ticket 0108); so did dgges's
* unscaled S (ticket 0022). `bin/break-mutants.mjs` covers `break` only. This
* tool makes small semantic changes to `lib/base.js` and runs the module's
* own tests against each one; a mutant the tests still pass marks code whose
* result no test checks.
*
* Operators, each aimed at a bug class translations have actually had:
*
*   minus-one-dropped  `e - 1` -> `e`. Fortran's 1-based extents and offsets
*                      (`K-1`, `N-I+1`) become 0-based ones; dropping or
*                      keeping a `- 1` is the commonest translation slip.
*   plus-one-dropped   `e + 1` -> `e`. The same slip the other way
*                      (`imax + 1` row starts, `k + 1` counts of a 0-based k).
*   count-short        `e` -> `( e ) - 1` for a count argument (`role: dim`
*                      in the callee's spec) of a BLAS/LAPACK call. The
*                      zlahef bug: a count one short, which skips the last
*                      element and can still give a valid answer.
*   boundary           `<` <-> `<=`, `>` <-> `>=` in an `if`/loop/conditional
*                      test. Fortran `.LT.`/`.LE.` against shifted 0-based
*                      indices; loop bounds one iteration short or long.
*   delete-stmt        an assignment or call statement directly inside an
*                      `if`/`else` branch is removed. Branches whose effect no
*                      test observes (dgges's scaling call; tests asserting
*                      only `info`). Statements outside a branch are left
*                      alone: they run on every path, so any test that checks
*                      an output at all almost always kills their deletion,
*                      and they would double the mutant count for little.
*
* Integer literals only: a `1` term, never `1.0` (the codebase writes
* floating constants with a decimal point). In complex modules (`z*`/`c*`) the
* `+ 1` that is the whole tail of an array subscript (`v[ i + 1 ]`) is the
* imaginary half of interleaved storage, not index arithmetic, and is not
* mutated.
*
* Mutants are served in memory by bin/break-mutants-loader.mjs; the working
* tree is never modified. Each mutant runs the module's own tests one file at
* a time, through bin/value-mutants-reporter.mjs, and the run's process group
* is killed at the first failing test (fail fast). A mutant that runs past its
* timeout (10 s + 3x the unmutated run) is killed and reported `timeout`.
*
* A SURVIVING mutant means the tests cannot tell the mutated code from the
* original. Equivalent mutants are recorded in
* `test/value-mutants.equivalent.json` with a reason, keyed by
* `<file>#<fingerprint>:<operator>[@<n>]` (see `fingerprint`). Only proven
* equivalence counts: a survivor on a path no known input reaches is a gap,
* not an exemption (CONVENTIONS T5).
*
* Usage:
*   node bin/value-mutants.mjs <routine> [<routine> ...]     whole base.js
*   node bin/value-mutants.mjs --changed [--base <ref>] --check
*                    CI: in modules changed since the merge-base with <ref>
*                    (default origin/main), only base.js lines changed since it
*   node bin/value-mutants.mjs --all
*   node bin/value-mutants.mjs --json | --summary  ...
*   node bin/value-mutants.mjs --check <routine> ...  exit 1 on unexplained
*                    survivors, stale equivalence entries or errors
*
* Results are cached per module (and per diff scope) and computed in a worker
* pool (bin/lib/corpus.mjs; `--no-cache`, `--jobs <n>`).
*/

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as espree from 'espree';
import { moduleDir, selectRoutines, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const EQUIV_PATH = path.join( ROOT, 'test', 'value-mutants.equivalent.json' );
const LOADER = path.join( ROOT, 'bin', 'break-mutants-loader.mjs' );
const REPORTER = path.join( ROOT, 'bin', 'value-mutants-reporter.mjs' );
const ENTRY = fileURLToPath( import.meta.url );
const PARSE = { 'ecmaVersion': 2022, 'sourceType': 'module', 'loc': true, 'range': true };
const RELATIONAL = { '<': '<=', '<=': '<', '>': '>=', '>=': '>' };
const TESTED = /^(If|For|While|DoWhile)Statement$|^ConditionalExpression$/;
const FUNC = /Function/;

function children( n ) {
	const out = [];
	for ( const k of Object.keys( n ) ) {
		if ( k === 'parent' ) {
			continue;
		}
		const v = n[ k ];
		if ( Array.isArray( v ) ) {
			v.forEach( ( c ) => c && typeof c.type === 'string' && out.push( c ) );
		} else if ( v && typeof v.type === 'string' ) {
			out.push( v );
		}
	}
	return out;
}

function text( src, n ) {
	return src.slice( n.range[ 0 ], n.range[ 1 ] );
}

function toks( s ) {
	return espree.tokenize( s, { 'ecmaVersion': 2022, 'sourceType': 'module' } ).map( ( t ) => t.value ).join( ' ' );
}

function isOne( n ) {
	return n && n.type === 'Literal' && n.raw === '1';
}

// --- count arguments ---------------------------------------------------------

const countMemo = new Map();

// Positions of the `role: dim` parameters of the module whose base.js is
// `file`: its function's parameter names, matched to its spec by name.
function countPositions( file ) {
	if ( countMemo.has( file ) ) {
		return countMemo.get( file );
	}
	let out = [];
	const mod = path.basename( path.dirname( path.dirname( file ) ) );
	const spec = path.join( ROOT, 'spec', mod + '.json' );
	try {
		const dims = new Set( JSON.parse( fs.readFileSync( spec, 'utf8' ) ).params.filter( ( p ) => p.role === 'dim' ).map( ( p ) => p.name.toLowerCase() ) );
		const ast = espree.parse( fs.readFileSync( file, 'utf8' ), PARSE );
		const fn = ast.body.find( ( s ) => s.type === 'FunctionDeclaration' && s.id && s.id.name === mod );
		if ( fn ) {
			out = fn.params.map( ( p, i ) => ( p.type === 'Identifier' && dims.has( p.name.toLowerCase() ) ) ? i : -1 ).filter( ( i ) => i >= 0 );
		}
	} catch ( e ) {
		// No spec or unparseable callee: no count arguments known.
	}
	countMemo.set( file, out );
	return out;
}

// local name -> count positions, for each default import of another module's base.js.
function importedCounts( ast, file ) {
	const out = new Map();
	ast.body.filter( ( s ) => s.type === 'ImportDeclaration' && /\/lib\/base\.js$/.test( s.source.value ) && s.source.value.startsWith( '.' ) ).forEach( ( s ) => {
		const def = s.specifiers.find( ( sp ) => sp.type === 'ImportDefaultSpecifier' );
		if ( def ) {
			out.set( def.local.name, countPositions( path.resolve( path.dirname( file ), s.source.value ) ) );
		}
	});
	return out;
}

// --- mutant enumeration --------------------------------------------------------

// The code a mutant's key is about: the head of the `if`/loop whose test holds
// it, or else the smallest statement that holds it. Bodies are left out, so
// an edit inside a branch does not re-key the mutants of its condition.
function anchorText( src, node, ancestors ) {
	for ( let k = ancestors.length - 1; k >= 0; k-- ) {
		const a = ancestors[ k ];
		if ( /^(If|While|DoWhile)Statement$/.test( a.type ) ) {
			return text( src, a.test );
		}
		if ( a.type === 'ForStatement' ) {
			return [ a.init, a.test, a.update ].map( ( x ) => ( x ? text( src, x ) : '' ) ).join( ';' );
		}
		if ( /Statement$|Declaration$/.test( a.type ) ) {
			return text( src, a );
		}
	}
	return text( src, node );
}

// Is `node` inside the test of an if/loop/conditional (and not in a nested function)?
function inTest( node, ancestors ) {
	let child = node;
	for ( let k = ancestors.length - 1; k >= 0; k-- ) {
		const a = ancestors[ k ];
		if ( FUNC.test( a.type ) ) {
			return false;
		}
		if ( TESTED.test( a.type ) ) {
			return a.test === child;
		}
		if ( /Statement$|Declaration$/.test( a.type ) ) {
			return false;
		}
		child = a;
	}
	return false;
}

function inBranch( stmt, ancestors ) {
	const p = ancestors[ ancestors.length - 1 ];
	if ( p && p.type === 'IfStatement' ) {
		return p.consequent === stmt || p.alternate === stmt;
	}
	const g = ancestors[ ancestors.length - 2 ];
	return Boolean( p && p.type === 'BlockStatement' && g && g.type === 'IfStatement' );
}

function enclosingIf( ancestors ) {
	for ( let k = ancestors.length - 1; k >= 0; k-- ) {
		if ( ancestors[ k ].type === 'IfStatement' ) {
			return ancestors[ k ];
		}
	}
	return null;
}

/**
* Every mutant of `src` (the source of `file`), as
* `{ key, op, line, lines: [ first, last ], before, after, src }` in source order.
*/
function enumerate( src, file ) {
	const ast = espree.parse( src, PARSE );
	const counts = importedCounts( ast, file );
	const complex = /^[zc]/.test( path.basename( path.dirname( path.dirname( file ) ) ) );
	const rel = path.relative( ROOT, file );
	const raw = [];
	const add = ( op, node, ancestors, start, end, repl, anchor ) => {
		raw.push( { 'op': op, 'node': node, 'anchor': anchor || anchorText( src, node, ancestors ), 'start': start, 'end': end, 'repl': repl } );
	};
	( function rec( n, ancestors, inFn ) {
		if ( inFn ) {
			visit( n, ancestors );
		}
		const fn = inFn || FUNC.test( n.type );
		children( n ).forEach( ( c ) => rec( c, ancestors.concat( n ), fn ) );
	})( ast, [], false );

	function visit( n, ancestors ) {
		const parent = ancestors[ ancestors.length - 1 ];
		if ( n.type === 'BinaryExpression' && ( n.operator === '+' || n.operator === '-' ) && isOne( n.right ) ) {
			const imag = complex && n.operator === '+' && parent && parent.type === 'MemberExpression' && parent.computed && parent.property === n;
			if ( !imag ) {
				add( ( n.operator === '-' ) ? 'minus-one-dropped' : 'plus-one-dropped', n, ancestors, n.range[ 0 ], n.range[ 1 ], text( src, n.left ) );
			}
		} else if ( n.type === 'BinaryExpression' && n.operator === '+' && isOne( n.left ) ) {
			add( 'plus-one-dropped', n, ancestors, n.range[ 0 ], n.range[ 1 ], text( src, n.right ) );
		}
		if ( n.type === 'BinaryExpression' && RELATIONAL[ n.operator ] && inTest( n, ancestors ) ) {
			// Replace the operator token itself, between the operands.
			const gap = src.slice( n.left.range[ 1 ], n.right.range[ 0 ] );
			const at = n.left.range[ 1 ] + gap.indexOf( n.operator, gap.lastIndexOf( ')' ) + 1 );
			add( 'boundary', n, ancestors, at, at + n.operator.length, RELATIONAL[ n.operator ] );
		}
		if ( n.type === 'CallExpression' && n.callee.type === 'Identifier' && counts.has( n.callee.name ) ) {
			counts.get( n.callee.name ).forEach( ( i ) => {
				const a = n.arguments[ i ];
				if ( a && a.type !== 'Literal' && a.type !== 'SpreadElement' ) {
					add( 'count-short', a, ancestors.concat( n ), a.range[ 0 ], a.range[ 1 ], '( ' + text( src, a ) + ' ) - 1' );
				}
			});
		}
		if ( n.type === 'ExpressionStatement' && /^(Assignment|Call|Update)Expression$/.test( n.expression.type ) && inBranch( n, ancestors ) ) {
			const ifs = enclosingIf( ancestors );
			add( 'delete-stmt', n, ancestors, n.range[ 0 ], n.range[ 1 ], ';', text( src, ifs.test ) + '\n' + text( src, n ) );
		}
	}

	raw.sort( ( a, b ) => ( a.start - b.start ) || ( a.end - b.end ) );
	const seen = new Map();
	return raw.map( ( m ) => {
		const id = fingerprint( m.op, m.anchor, text( src, m.node ) );
		const n = seen.get( id ) || 0;
		seen.set( id, n + 1 );
		const mutated = src.slice( 0, m.start ) + m.repl + src.slice( m.end );
		return {
			'key': rel + '#' + id + ':' + m.op + ( n ? '@' + n : '' ),
			'op': m.op,
			'line': m.node.loc.start.line,
			'lines': [ m.node.loc.start.line, m.node.loc.end.line ],
			'before': snippet( src.slice( m.start, m.end ) ),
			'after': snippet( m.repl ),
			'context': snippet( text( src, m.node ) ),
			'src': mutated
		};
	});
}

// Keys are by CONTENT, not line: a hash of the operator, the anchor (the
// condition or statement holding the mutant) and the mutated expression,
// tokens only (comments and whitespace do not count), plus an index among
// identical ones in the file. A key survives line moves and unrelated edits,
// and changes when the code a proof is about changes.
function fingerprint( op, anchor, node ) {
	return createHash( 'sha1' ).update( op + '\n' + toks( anchor ) + '\n' + toks( node ) ).digest( 'hex' ).slice( 0, 12 );
}

function snippet( s ) {
	return s.replace( /\s+/g, ' ' ).trim().slice( 0, 90 );
}

// --- running tests -----------------------------------------------------------

/**
* Runs `tests` (one file at a time) with `file` served as `mutantSrc` (or as
* is, when mutantSrc is null). Resolves to `{ outcome: 'pass'|'fail'|'timeout',
* by, ms }`, where `by` is the first test file that failed.
*/
function runTests( tests, file, mutantSrc, timeoutMs ) {
	return new Promise( ( resolve ) => {
		const env = Object.assign( {}, process.env );
		delete env.NODE_TEST_CONTEXT;
		let tmp = null;
		if ( mutantSrc !== null ) {
			tmp = fs.mkdtempSync( path.join( os.tmpdir(), 'value-mutant-' ) );
			fs.writeFileSync( path.join( tmp, 'mutant.js' ), mutantSrc );
			env.NODE_OPTIONS = ( ( env.NODE_OPTIONS || '' ) + ' --import=' + pathToFileURL( LOADER ).href ).trim();
			env.BREAK_MUTANT_TARGET = pathToFileURL( file ).href;
			env.BREAK_MUTANT_SOURCE = path.join( tmp, 'mutant.js' );
		}
		const t0 = Date.now();
		const child = spawn( process.execPath, [ '--test', '--test-concurrency=1', '--test-reporter=' + pathToFileURL( REPORTER ).href, ...tests ], { 'cwd': ROOT, 'env': env, 'detached': true, 'stdio': [ 'ignore', 'pipe', 'ignore' ] } );
		let state = null;
		let by = null;
		let out = '';
		const killGroup = () => {
			try {
				process.kill( -child.pid, 'SIGKILL' );
			} catch ( e ) {
				// Already gone.
			}
		};
		const timer = setTimeout( () => {
			state = state || 'timeout';
			killGroup();
		}, timeoutMs );
		child.stdout.on( 'data', ( b ) => {
			out += b.toString( 'utf8' );
			const m = /FAIL (.*)\n/.exec( out );
			if ( m && !state ) {
				state = 'fail';
				by = m[ 1 ] ? path.basename( m[ 1 ].replace( /^file:\/\//, '' ) ) : null;
				killGroup();
			}
		});
		child.on( 'close', ( code ) => {
			clearTimeout( timer );
			if ( tmp ) {
				fs.rmSync( tmp, { 'recursive': true, 'force': true } );
			}
			resolve( { 'outcome': state || ( ( code === 0 ) ? 'pass' : 'fail' ), 'by': by, 'ms': Date.now() - t0 } );
		});
	});
}

/**
* Runs every mutant in `o.mutants` (from `enumerate`) against `o.tests`, with
* `o.file` served as each mutant, `o.concurrency` at a time. The test file
* that has killed the most mutants so far runs first. The unmutated run serves
* `o.baseSrc` when given (else the file on disk); returns null when it fails.
*/
async function runMutants( o ) {
	const tests = o.tests.slice();
	const base = await runTests( tests, o.file, ( o.baseSrc === void 0 ) ? null : o.baseSrc, 30 * 60 * 1000 );
	if ( base.outcome !== 'pass' ) {
		return null;
	}
	const timeoutMs = o.timeoutMs || ( 10000 + ( 3 * base.ms ) );
	const kills = new Map( tests.map( ( t ) => [ path.basename( t ), 0 ] ) );
	const ordered = () => tests.slice().sort( ( a, b ) => kills.get( path.basename( b ) ) - kills.get( path.basename( a ) ) );
	const results = new Array( o.mutants.length );
	let next = 0;
	const slot = async () => {
		while ( next < o.mutants.length ) {
			const i = next;
			next += 1;
			const m = o.mutants[ i ];
			let r;
			try {
				espree.parse( m.src, PARSE );
				r = await runTests( ordered(), o.file, m.src, timeoutMs );
			} catch ( e ) {
				r = { 'outcome': 'invalid', 'by': null };
			}
			if ( r.by && kills.has( r.by ) ) {
				kills.set( r.by, kills.get( r.by ) + 1 );
			}
			results[ i ] = {
				'key': m.key,
				'site': path.relative( ROOT, o.file ) + ':' + m.line,
				'op': m.op,
				'before': m.before,
				'after': m.after,
				'context': m.context,
				'killed': r.outcome === 'fail' || r.outcome === 'timeout',
				'outcome': r.outcome,
				'by': r.by
			};
		}
	};
	await Promise.all( Array.from( { 'length': Math.max( 1, Math.min( o.concurrency || 1, o.mutants.length ) ) }, slot ) );
	return { 'results': results, 'baseMs': base.ms, 'timeoutMs': timeoutMs };
}

function overlaps( m, ranges ) {
	return ranges.some( ( r ) => m.lines[ 0 ] <= r[ 1 ] && m.lines[ 1 ] >= r[ 0 ] );
}

/**
* The module's mutants within `scope` (JSON line ranges of base.js; '' for all
* of it), run against the module's own tests. The result does not depend on
* test/value-mutants.equivalent.json (main applies it), so a cached result
* stays valid when that file changes.
*/
async function analyze( routine, scope ) {
	const dir = moduleDir( routine );
	if ( !dir ) {
		return { 'routine': routine, 'error': 'no module' };
	}
	const file = path.join( dir, 'lib', 'base.js' );
	if ( !fs.existsSync( file ) ) {
		return { 'routine': routine, 'keys': [], 'results': [] };
	}
	const src = fs.readFileSync( file, 'utf8' );
	let all;
	try {
		all = enumerate( src, file );
	} catch ( e ) {
		return { 'routine': routine, 'error': 'cannot parse base.js: ' + e.message };
	}
	const ranges = scope ? JSON.parse( scope ) : null;
	const chosen = ranges ? all.filter( ( m ) => overlaps( m, ranges ) ) : all;
	const keys = all.map( ( m ) => m.key );
	if ( !chosen.length ) {
		return { 'routine': routine, 'keys': keys, 'results': [] };
	}
	const tdir = path.join( dir, 'test' );
	const tests = fs.readdirSync( tdir ).filter( ( f ) => /^test.*\.js$/.test( f ) ).sort().map( ( f ) => path.join( tdir, f ) );
	const n = Number( process.env.CORPUS_TEST_CONCURRENCY ) || os.availableParallelism();
	const res = await runMutants( { 'file': file, 'tests': tests, 'mutants': chosen, 'concurrency': n } );
	if ( !res ) {
		return { 'routine': routine, 'error': 'tests fail before mutation' };
	}
	return { 'routine': routine, 'keys': keys, 'results': res.results, 'baseMs': res.baseMs };
}

// --- diff scope ----------------------------------------------------------------

function git( args, cwd ) {
	return spawnSync( 'git', args, { 'cwd': cwd || ROOT, 'encoding': 'utf8', 'maxBuffer': 1 << 28 } );
}

// Paths renamed since commit `mb`, new path -> old path (git's rename
// detection), cached per repository and commit.
const RENAMES = new Map();
function renamesSince( mb, cwd ) {
	const key = ( cwd || ROOT ) + '\0' + mb;
	if ( !RENAMES.has( key ) ) {
		const map = new Map();
		for ( const line of git( [ 'diff', '-M', '-l100000', '--name-status', '--diff-filter=R', mb ], cwd ).stdout.split( '\n' ) ) {
			const f = line.split( '\t' );
			if ( f.length === 3 && /^R/.test( f[ 0 ] ) ) {
				map.set( f[ 2 ], f[ 1 ] );
			}
		}
		RENAMES.set( key, map );
	}
	return RENAMES.get( key );
}

// Lines of `rel` (new side) changed since commit `mb`, as [ first, last ]
// ranges; null when the file is new since `mb` (all of it is changed). A file
// that was renamed since `mb` is compared with its old path, so a move (the
// layout flatten, ticket 0125) changes only the lines it edited. A
// pure deletion marks the lines on both sides of the gap.
function changedLines( mb, rel, cwd ) {
	let paths = [ rel ];
	if ( git( [ 'cat-file', '-e', mb + ':' + rel ], cwd ).status !== 0 ) {
		const old = renamesSince( mb, cwd ).get( rel );
		if ( !old ) {
			return null;
		}
		paths = [ old, rel ];
	}
	const out = [];
	for ( const m of git( [ 'diff', '-M', '-l100000', '-U0', mb, '--', ...paths ], cwd ).stdout.matchAll( /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm ) ) {
		const start = Number( m[ 1 ] );
		const count = ( m[ 2 ] === void 0 ) ? 1 : Number( m[ 2 ] );
		out.push( ( count === 0 ) ? [ start, start + 1 ] : [ start, start + count - 1 ] );
	}
	return out;
}

function diffScope( argv ) {
	const i = argv.indexOf( '--base' );
	const base = ( i >= 0 ) ? argv[ i + 1 ] : 'origin/main';
	const mb = git( [ 'merge-base', 'HEAD', base ] ).stdout.trim();
	return ( r ) => {
		const rel = path.relative( ROOT, path.join( moduleDir( r ), 'lib', 'base.js' ) );
		const lines = changedLines( mb, rel );
		return ( lines === null ) ? '' : JSON.stringify( lines );
	};
}

// --- main ----------------------------------------------------------------------

function loadEquivalent() {
	return fs.existsSync( EQUIV_PATH ) ? JSON.parse( fs.readFileSync( EQUIV_PATH, 'utf8' ) ) : {};
}

async function main( argv ) {
	const asJson = argv.includes( '--json' );
	const summary = argv.includes( '--summary' );
	const check = argv.includes( '--check' );
	const changed = argv.includes( '--changed' );
	const routines = selectRoutines( argv, 'value-mutants' );
	if ( routines === null ) {
		process.exitCode = 2;
		return;
	}
	if ( !asJson && changed ) {
		console.log( 'Changed modules: ' + ( routines.length ? routines.join( ' ' ) : '(none)' ) );
	}
	const equivalent = loadEquivalent();
	const all = await runCorpus( { 'tool': 'value-mutants', 'entry': ENTRY, 'extraFiles': [ LOADER, REPORTER ], 'routines': routines, 'argv': argv, 'scope': changed ? diffScope( argv ) : null } );
	all.forEach( ( res ) => {
		( res.results || [] ).forEach( ( x ) => {
			x.equivalent = equivalent[ x.key ] || null;
		});
	});
	if ( asJson ) {
		console.log( JSON.stringify( all, null, 1 ) );
	} else {
		all.forEach( ( res ) => {
			if ( res.error ) {
				console.log( res.routine + ': ' + res.error );
				return;
			}
			if ( summary ) {
				const k = res.results.filter( ( x ) => x.killed ).length;
				const s = res.results.filter( ( x ) => !x.killed );
				console.log( res.routine.padEnd( 16 ) + String( res.results.length ).padStart( 5 ) + ' mutants ' + String( k ).padStart( 5 ) + ' killed ' + String( s.length ).padStart( 4 ) + ' survived' + ( s.length ? '  [' + [ ...new Set( s.map( ( x ) => x.op ) ) ].map( ( op ) => op + ' ' + s.filter( ( x ) => x.op === op ).length ).join( ', ' ) + ']' : '' ) );
				return;
			}
			res.results.forEach( ( x ) => {
				if ( x.killed && !argv.includes( '--verbose' ) ) {
					return;
				}
				const tag = ( x.outcome === 'invalid' ) ? 'INVALID ' : x.killed ? ( ( x.outcome === 'timeout' ) ? 'timeout ' : 'killed  ' ) : x.equivalent ? 'equiv   ' : 'SURVIVED';
				console.log( tag + '  ' + x.site + '  ' + x.op + '  `' + x.before + '` -> `' + x.after + '`  in `' + x.context + '`' );
			});
		});
	}

	// An equivalence entry for a checked module is stale when its mutant no
	// longer exists (its code changed) or was run and killed. Entries for
	// mutants outside a diff scope are not judged.
	const present = new Set( all.flatMap( ( r ) => r.keys || [] ) );
	const killed = new Set( all.flatMap( ( r ) => ( r.results || [] ).filter( ( x ) => x.killed ).map( ( x ) => x.key ) ) );
	const dirs = all.filter( ( r ) => r.keys ).map( ( r ) => path.relative( ROOT, moduleDir( r.routine ) ) + '/' );
	const inScope = ( k ) => dirs.some( ( d ) => k.startsWith( d ) );
	const stale = Object.keys( equivalent ).filter( ( k ) => !k.startsWith( '_' ) && inScope( k ) && ( !present.has( k ) || killed.has( k ) ) ).map( ( k ) => 'stale equivalence entry (re-check the proof against the current code, then re-key or remove it): ' + k );
	const errors = all.filter( ( r ) => r.error ).map( ( r ) => r.routine + ': ' + r.error );
	const bad = all.flatMap( ( r ) => ( r.results || [] ).filter( ( x ) => !x.killed && ( !x.equivalent || x.outcome === 'invalid' ) ) );
	if ( !asJson ) {
		const total = all.reduce( ( n, r ) => n + ( r.results || [] ).length, 0 );
		const nk = all.reduce( ( n, r ) => n + ( r.results || [] ).filter( ( x ) => x.killed ).length, 0 );
		const nt = all.reduce( ( n, r ) => n + ( r.results || [] ).filter( ( x ) => x.outcome === 'timeout' ).length, 0 );
		stale.forEach( ( m ) => console.log( m ) );
		console.log( '\n' + total + ' mutants, ' + nk + ' killed (' + nt + ' by timeout), ' + bad.length + ' unexplained survivors, ' + stale.length + ' stale entries' + ( errors.length ? ', ' + errors.length + ' errors' : '' ) );
		if ( check && bad.length ) {
			console.log( 'Each SURVIVED mutant marks base.js code whose result no test of the module checks. Add a test that the mutant fails (compare with a reference fixture, not with itself), or record a proven equivalence in test/value-mutants.equivalent.json.' );
		}
	}
	if ( check && ( bad.length || stale.length || errors.length ) ) {
		process.exitCode = 1;
	}
}

if ( process.argv[ 1 ] && import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	if ( isWorker() ) {
		workerMain( analyze );
	} else {
		main( process.argv.slice( 2 ) );
	}
}

export { enumerate, runMutants, changedLines };
