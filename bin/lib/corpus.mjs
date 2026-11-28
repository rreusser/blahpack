/**
* Shared driver for the per-module corpus checks (ticket 0070):
* `bin/coverage.mjs`, `bin/workspace-guard.mjs`, `bin/wrapper-replay.mjs`,
* `bin/break-mutants.mjs` and `bin/value-mutants.mjs`.
*
* - Module selection (`<routine>...`, `--all`, `--changed [--base <ref>]`),
*   so the four tools cannot drift apart in what they check.
* - A result cache in `.cache/checks/<tool>/<routine>.json`, keyed on a hash
*   of everything the result can depend on: every file in the module's
*   directory, its spec, the transitive closure of local files those files
*   import or name (other modules' `lib/`, `test/harness/`, fixtures), the
*   tool's own closure, `package-lock.json`, the node version and the
*   tool's environment variables. A rerun recomputes only modules whose
*   inputs changed. `--no-cache` ignores and does not write the cache. A
*   result that is an error (timeout, crash) is never cached.
* - One worker pool sized to the CPU count (`--jobs <n>` overrides). Each
*   worker is a child `node <tool> --corpus-worker <routine>`; the `node
*   --test` runs it starts get `--test-concurrency` from
*   `testConcurrency()`, so the pool does not oversubscribe the CPUs.
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..', '..' );
const PKGS = [ 'blas', 'lapack', 'arpack' ];
const CACHE = path.join( ROOT, '.cache', 'checks' );
const FIXTURES = path.join( ROOT, 'test', 'fixtures' );
const WORKER_FLAG = '--corpus-worker';
const WORKER_TIMEOUT = 30 * 60 * 1000;

// --- module selection ------------------------------------------------------

function moduleDir( r ) {
	for ( const pkg of PKGS ) {
		const d = path.join( ROOT, 'lib', pkg, r );
		if ( fs.existsSync( d ) ) {
			return d;
		}
	}
	return null;
}

function allRoutines() {
	const out = [];
	for ( const pkg of PKGS ) {
		const d = path.join( ROOT, 'lib', pkg );
		if ( fs.existsSync( d ) ) {
			fs.readdirSync( d ).forEach( ( r ) => out.push( r ) );
		}
	}
	return out.sort();
}

// Modules with a file changed since the merge-base with `base`, tracked or
// untracked; null when the merge-base cannot be found.
function changedRoutines( base ) {
	const run = ( args ) => spawnSync( 'git', args, { 'cwd': ROOT, 'encoding': 'utf8' } );
	const mb = run( [ 'merge-base', 'HEAD', base ] );
	if ( mb.status !== 0 ) {
		return null;
	}
	const files = run( [ 'diff', '--name-only', mb.stdout.trim() ] ).stdout.split( '\n' )
		.concat( run( [ 'ls-files', '--others', '--exclude-standard', 'lib/' ] ).stdout.split( '\n' ) );
	const out = new Set();
	files.forEach( ( f ) => {
		const m = /^lib\/(?:blas|lapack|arpack)\/([^/]+)\//.exec( f );
		if ( m && moduleDir( m[ 1 ] ) ) {
			out.add( m[ 1 ] );
		}
	});
	return [ ...out ].sort();
}

/**
* The routines named by `argv`: `--all`, `--changed [--base <ref>]`, or the
* positional arguments. Returns null (after printing why) when `--changed`
* cannot find the merge-base.
*/
function selectRoutines( argv, tool ) {
	if ( argv.includes( '--all' ) ) {
		return allRoutines();
	}
	if ( argv.includes( '--changed' ) ) {
		const i = argv.indexOf( '--base' );
		const base = ( i >= 0 ) ? argv[ i + 1 ] : 'origin/main';
		const out = changedRoutines( base );
		if ( out === null ) {
			console.error( tool + ': cannot find the merge-base with `' + base + '`; fetch it (CI needs full history) or pass --base <ref>' );
		}
		return out;
	}
	const valued = [ '--base', '--jobs', '--slowest' ];
	return argv.filter( ( a, i ) => !a.startsWith( '--' ) && !valued.includes( argv[ i - 1 ] ) );
}

// --- input hashing ---------------------------------------------------------

const depsMemo = new Map();
const hashMemo = new Map();

// Memo keys include size and mtime, so a file edited between two runs in
// one process (a test, a watch loop) is re-read.
function stamp( f ) {
	const st = fs.statSync( f );
	return f + '\0' + st.size + '\0' + st.mtimeMs;
}

function fileHash( f ) {
	const k = stamp( f );
	if ( !hashMemo.has( k ) ) {
		hashMemo.set( k, createHash( 'sha256' ).update( fs.readFileSync( f ) ).digest( 'hex' ) );
	}
	return hashMemo.get( k );
}

function isFile( f ) {
	try {
		return fs.statSync( f ).isFile();
	} catch ( e ) {
		return false;
	}
}

// Local files that `file` imports, requires, or names in a string literal
// (fixtures are read by name: `path.join( fixtureDir, 'dgeqrf.jsonl' )`).
// Over-inclusion only costs a cache miss; omission would serve a stale result.
function localDeps( file ) {
	const k = stamp( file );
	if ( depsMemo.has( k ) ) {
		return depsMemo.get( k );
	}
	const out = new Set();
	depsMemo.set( k, out );
	if ( !/\.(?:m|c)?js$/.test( file ) ) {
		return out;
	}
	const src = fs.readFileSync( file, 'utf8' );
	const dir = path.dirname( file );
	const add = ( f ) => {
		if ( f.startsWith( ROOT + path.sep ) && !f.includes( path.sep + 'node_modules' + path.sep ) && isFile( f ) ) {
			out.add( f );
		}
	};
	// Only path-shaped literals match, so an apostrophe in a comment cannot
	// shift the scan out of step with the quotes.
	for ( const m of src.matchAll( /['"`]((?:\.{1,2}\/)[^'"`\s]+|[\w.-]+\.(?:jsonl?|m?js|cjs))['"`]/g ) ) {
		const s = m[ 1 ];
		if ( s.startsWith( './' ) || s.startsWith( '../' ) ) {
			add( path.resolve( dir, s ) );
		} else if ( /^[\w.-]+\.(?:jsonl?|m?js|cjs)$/.test( s ) ) {
			add( path.join( dir, s ) );
			add( path.join( FIXTURES, s ) );
			add( path.join( dir, 'fixtures', s ) );
		}
	}
	return out;
}

function closure( files ) {
	const seen = new Set();
	const stack = files.slice();
	while ( stack.length ) {
		const f = stack.pop();
		if ( seen.has( f ) ) {
			continue;
		}
		seen.add( f );
		localDeps( f ).forEach( ( d ) => stack.push( d ) );
	}
	return seen;
}

function walk( d, out ) {
	fs.readdirSync( d, { 'withFileTypes': true } ).forEach( ( e ) => {
		const f = path.join( d, e.name );
		if ( e.isDirectory() ) {
			walk( f, out );
		} else if ( e.isFile() ) {
			out.push( f );
		}
	});
	return out;
}

/**
* Every file a check's result for routine `r` can depend on: the module's
* directory, its spec, and the local files they reach (imports, requires,
* named fixtures), transitively.
*/
function moduleInputs( r ) {
	const own = walk( moduleDir( r ), [] );
	const spec = path.join( ROOT, 'spec', r + '.json' );
	if ( isFile( spec ) ) {
		own.push( spec );
	}
	return closure( own );
}

function digest( files, extra ) {
	const h = createHash( 'sha256' );
	h.update( extra );
	[ ...files ].sort().forEach( ( f ) => {
		h.update( path.relative( ROOT, f ) + '\0' + fileHash( f ) + '\n' );
	});
	return h.digest( 'hex' );
}

// --- worker pool -----------------------------------------------------------

/**
* `--test-concurrency` for a `node --test` a check starts: the share of the
* CPUs its pool slot owns (all of them outside a pool).
*/
function testConcurrency() {
	const n = Number( process.env.CORPUS_TEST_CONCURRENCY );
	return ( n > 0 ) ? [ '--test-concurrency=' + n ] : [];
}

function runWorker( entry, r, concurrency, scope ) {
	return new Promise( ( resolve ) => {
		const env = Object.assign( {}, process.env, { 'CORPUS_TEST_CONCURRENCY': String( concurrency ), 'CORPUS_SCOPE': scope } );
		delete env.NODE_TEST_CONTEXT;
		const child = spawn( process.execPath, [ entry, WORKER_FLAG, r ], { 'cwd': ROOT, 'env': env, 'stdio': [ 'ignore', 'pipe', 'pipe' ] } );
		const out = [];
		const err = [];
		child.stdout.on( 'data', ( b ) => out.push( b ) );
		child.stderr.on( 'data', ( b ) => err.push( b ) );
		const timer = setTimeout( () => child.kill( 'SIGKILL' ), WORKER_TIMEOUT );
		child.on( 'close', ( code ) => {
			clearTimeout( timer );
			try {
				resolve( { 'ok': code === 0, 'result': JSON.parse( Buffer.concat( out ).toString( 'utf8' ) ) } );
			} catch ( e ) {
				resolve( { 'ok': false, 'result': { 'routine': r, 'error': 'worker exit ' + code + ': ' + Buffer.concat( err ).toString( 'utf8' ).slice( -300 ) } } );
			}
		});
	});
}

/**
* True when this process is a pool worker. The tool then calls
* `workerMain( compute )` instead of its own main.
*/
function isWorker() {
	return process.argv.includes( WORKER_FLAG );
}

async function workerMain( compute ) {
	const r = process.argv[ process.argv.indexOf( WORKER_FLAG ) + 1 ];
	const res = await compute( r, process.env.CORPUS_SCOPE || '' );
	process.stdout.write( JSON.stringify( res === void 0 ? null : res ) );
}

/**
* Computes `compute( routine )` for every routine, from the cache where its
* inputs are unchanged and otherwise in the worker pool.
*
* @param {Object} o
* @param {string} o.tool - cache namespace, e.g. 'coverage'
* @param {string} o.entry - the tool's own file (re-run as each worker)
* @param {Array<string>} [o.extraFiles] - files the tool loads by path rather than by import (loaders, preloads)
* @param {Array<string>} [o.env] - environment variables the result depends on
* @param {Array<string>} o.routines
* @param {Array<string>} o.argv - for `--no-cache`, `--jobs <n>` and `--slowest <n>`
* @param {Function} [o.isError] - results for which this returns true are not cached
* @param {Function} [o.scope] - `( routine ) => string`: what part of the module to check (e.g. changed lines). It is part of that module's cache key and reaches the worker's `compute( routine, scope )`
* @returns {Promise<Array>} results, in the order of `routines` (a result may be null)
*/
async function runCorpus( o ) {
	const argv = o.argv;
	const useCache = !argv.includes( '--no-cache' );
	const ji = argv.indexOf( '--jobs' );
	const cpus = ( ji >= 0 ) ? Math.max( 1, Number( argv[ ji + 1 ] ) ) : Math.max( 1, os.availableParallelism() );
	const isError = o.isError || ( ( x ) => Boolean( x && x.error ) );
	const toolFiles = closure( [ o.entry ].concat( o.extraFiles || [] ) );
	const lock = path.join( ROOT, 'package-lock.json' );
	if ( isFile( lock ) ) {
		toolFiles.add( lock );
	}
	const envPart = ( o.env || [] ).map( ( k ) => k + '=' + ( process.env[ k ] || '' ) ).join( '\n' );
	const toolKey = digest( toolFiles, process.version + '\n' + envPart );
	const dir = path.join( CACHE, o.tool );
	const results = new Array( o.routines.length );
	const todo = [];
	o.routines.forEach( ( r, i ) => {
		const md = moduleDir( r );
		if ( !md ) {
			results[ i ] = { 'routine': r, 'error': 'no module' };
			return;
		}
		const scope = o.scope ? String( o.scope( r ) ) : '';
		const key = digest( moduleInputs( r ), ( scope ) ? toolKey + '\n' + scope : toolKey );
		const file = path.join( dir, r + '.json' );
		if ( useCache && isFile( file ) ) {
			try {
				const hit = JSON.parse( fs.readFileSync( file, 'utf8' ) );
				if ( hit.key === key ) {
					results[ i ] = hit.result;
					return;
				}
			} catch ( e ) {
				// Corrupt entry: recompute.
			}
		}
		todo.push( { 'i': i, 'r': r, 'key': key, 'file': file, 'scope': scope } );
	});
	const jobs = Math.min( cpus, todo.length ) || 1;
	const concurrency = Math.max( 1, Math.floor( cpus / jobs ) );
	const progress = process.stderr.isTTY && todo.length > 1;
	const times = [];
	let done = 0;
	let next = 0;
	if ( useCache && todo.length ) {
		fs.mkdirSync( dir, { 'recursive': true } );
	}
	const slot = async () => {
		while ( next < todo.length ) {
			const t = todo[ next ];
			next += 1;
			const t0 = Date.now();
			const w = await runWorker( o.entry, t.r, concurrency, t.scope );
			const ms = Date.now() - t0;
			results[ t.i ] = w.result;
			times.push( { 'routine': t.r, 'ms': ms } );
			if ( useCache && w.ok && !isError( w.result ) ) {
				// Write then rename: concurrent runs (conformance per module)
				// never read a partly written entry.
				const tmp = t.file + '.' + process.pid + '.tmp';
				fs.writeFileSync( tmp, JSON.stringify( { 'key': t.key, 'ms': ms, 'result': w.result } ) );
				fs.renameSync( tmp, t.file );
			}
			done += 1;
			if ( progress ) {
				process.stderr.write( '\r' + o.tool + ': ' + done + '/' + todo.length + ' computed (' + ( o.routines.length - todo.length ) + ' cached)   ' );
			}
		}
	};
	await Promise.all( Array.from( { 'length': jobs }, slot ) );
	if ( progress ) {
		process.stderr.write( '\n' );
	}
	// `--slowest <n>`: the n slowest modules computed in this run, to find
	// where a corpus run spends its time.
	const si = argv.indexOf( '--slowest' );
	if ( si >= 0 ) {
		times.sort( ( a, b ) => b.ms - a.ms ).slice( 0, Number( argv[ si + 1 ] ) || 10 ).forEach( ( t ) => {
			process.stderr.write( o.tool + ' slowest: ' + t.routine + ' ' + ( t.ms / 1000 ).toFixed( 1 ) + ' s\n' );
		});
		const total = times.reduce( ( a, t ) => a + t.ms, 0 );
		process.stderr.write( o.tool + ': ' + times.length + ' computed, ' + ( total / 1000 ).toFixed( 0 ) + ' s of worker time\n' );
	}
	return results;
}

export { ROOT, PKGS, CACHE, moduleDir, moduleInputs, allRoutines, changedRoutines, selectRoutines, testConcurrency, isWorker, workerMain, runCorpus };
