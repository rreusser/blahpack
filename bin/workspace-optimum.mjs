#!/usr/bin/env node

/**
* Workspace optimum check (CONVENTIONS W6; ticket 0103).
*
* A wrapper's `null` workspace allocation must reach the reference's optimum,
* the LWKOPT its workspace query (LWORK = -1) returns: given less, a blocked
* routine shrinks NB or runs unblocked, and a driver that picks its algorithm
* from LWORK (dgelss, dgesvd) takes a different path from the reference.
* bin/workspace-guard.mjs checks only that the allocation is not too small to
* be written safely.
*
* For each row of the committed cache data/fortran-lwkopt.json (written by
* bin/gen-lwkopt.mjs from the reference), this calls the module's wrapper
* `<routine>.js` with every workspace argument `null`: column-major, the
* row's leading dimensions, unit strides, zero-filled arrays of the sizes the
* spec gives, options translated from the Fortran letters to the JS strings.
* The wrapper is rewritten in memory (bin/workspace-optimum-loader.mjs) so
* each allocation records its size and the call stops before base.js runs.
* A row fails when an allocation is below the reference's optimum for that
* workspace. Allocating more is fine. Rows the checker cannot call (the
* wrapper throws for arguments the reference accepted, or reaches base.js
* without allocating a queried workspace) are reported, not failed.
*
* Usage:
*   node bin/workspace-optimum.mjs <routine> [...]
*   node bin/workspace-optimum.mjs --all [--check] [--json] [--rows]
*   node bin/workspace-optimum.mjs --changed [--base <ref>] [--check]
*
* `--rows` lists every failing row instead of one example per workspace.
* Results are cached per module and computed in a worker pool
* (bin/lib/corpus.mjs; `--no-cache`, `--jobs <n>`).
*/

import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, moduleDir, selectRoutines, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';
import { CACHE_FILE, specLib, plan, jsScope, evalJs, maxDim } from './lib/lwkopt.mjs';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';

const ENTRY = fileURLToPath( import.meta.url );
const LOADER = path.join( ROOT, 'bin', 'workspace-optimum-loader.mjs' );
const GUARD_LOADER = path.join( ROOT, 'bin', 'workspace-guard-loader.mjs' );
const STOP = { 'wsOptStop': true };

const CTOR = {
	'float64': Float64Array,
	'complex128': Complex128Array,
	'int32': Int32Array,
	'bool': Uint8Array
};

function readCache() {
	return JSON.parse( fs.readFileSync( CACHE_FILE, 'utf8' ) );
}

function describe( entry, row ) {
	return entry.args.map( ( a, i ) => a + '=' + row[ i ] ).join( ' ' );
}

/**
* The wrapper's argument list for one cache row (the spec's `strided`
* projection, lint/lib/spec.cjs), every workspace `null`.
*/
function wrapperArgs( spec, pl, vals ) {
	const scope = jsScope( spec, pl, vals );
	const big = maxDim( pl, vals );
	const kinds = new Map( pl.params.map( ( e ) => [ e.p.fortran, e ] ) );
	const size = ( expr, fallback ) => {
		const n = evalJs( expr, scope );
		return Math.max( 1, Number.isNaN( n ) ? fallback : n );
	};
	const array = ( p, n ) => {
		const C = CTOR[ p.dtype ];
		if ( !C ) {
			throw new Error( 'no JS array type for ' + p.fortran + ' (' + p.dtype + ')' );
		}
		return new C( n );
	};
	const out = specLib.takesOrder( spec ) ? [ 'column-major' ] : [];
	specLib.baseGroups( spec ).forEach( ( g ) => {
		const p = g.param;
		const e = kinds.get( p.fortran );
		if ( g.names.length === 4 ) {
			const ld = ( p.ld && vals[ p.ld ] !== void 0 ) ? vals[ p.ld ] : Math.max( 1, big );
			if ( p.role === 'workspace' ) {
				out.push( null, ld );
			} else {
				out.push( array( p, ld * size( p.cols && p.cols.js, big ) ), ld );
			}
		} else if ( g.names.length === 3 ) {
			if ( p.role === 'workspace' ) {
				out.push( null );
				return;
			}
			const a = array( p, size( p.length && p.length.js, 2 * big + 10 ) );
			if ( e.kind === 'select' ) {
				a.fill( 1, 0, Math.min( a.length, vals[ p.fortran ] ) );
			}
			if ( p.role === 'packed' && p.format === 'packed' ) {
				out.push( a );
			} else {
				out.push( a, 1 );
			}
		} else if ( g.names.length === 2 ) {
			out.push( array( p, 1 ) );
		} else if ( g.names.length === 1 ) {
			switch ( e.kind ) {
			case 'flag':
				out.push( scope[ p.name ] );
				break;
			case 'dim':
			case 'derived':
			case 'scalar': {
				// A scalar index the JS takes 0-based is marked `base: 0` (S10).
				const x = vals[ p.fortran ] - ( ( p.base === 0 ) ? 1 : 0 );
				out.push( ( p.intent === 'in' ) ? x : array( p, 1 ).fill( x ) );
				break;
			}
			case 'out':
				out.push( array( p, 1 ) );
				break;
			case 'function':
				out.push( () => false );
				break;
			case 'info':
				out.push( 0 );
				break;
			default:
				throw new Error( 'no wrapper argument for ' + p.fortran + ' (' + e.kind + ')' );
			}
		}
	});
	return out;
}

async function analyze( r ) {
	const cache = readCache();
	const entry = cache.routines[ r ];
	const dir = moduleDir( r );
	if ( !entry || !dir ) {
		return null;
	}
	const spec = specLib.load( r );
	const pl = plan( spec );
	const res = { 'routine': r, 'rows': entry.rows.length, 'checked': 0, 'early': 0, 'short': [], 'unrun': [] };
	if ( pl.error ) {
		res.unrun.push( { 'why': 'spec: ' + pl.error, 'args': '' } );
		return res;
	}
	const wrapper = path.join( dir, 'lib', r + '.js' );
	register( pathToFileURL( LOADER ).href, { 'parentURL': import.meta.url, 'data': { 'target': pathToFileURL( wrapper ).href } } );
	let allocs = {};
	globalThis.__wsGuard = function record( Ctor, n, tag ) {
		// Keyed case-insensitively: a wrapper may name WORK `work`.
		const k = String( tag ).replace( /^.*:/, '' ).toLowerCase();
		const m = Math.max( 0, Math.floor( Number( n ) ) );
		allocs[ k ] = Math.max( allocs[ k ] || 0, m );
		return new Ctor( m );
	};
	globalThis.__wsOptStop = function stop() {
		throw STOP;
	};
	let fn;
	try {
		fn = ( await import( pathToFileURL( wrapper ).href ) ).default;
	} catch ( err ) {
		res.unrun.push( { 'why': 'import: ' + err.message, 'args': '' } );
		return res;
	}
	const nargs = entry.args.length;
	for ( const row of entry.rows ) {
		const vals = {};
		entry.args.forEach( ( a, i ) => {
			vals[ a ] = row[ i ];
		});
		const where = describe( entry, row );
		let args;
		try {
			args = wrapperArgs( spec, pl, vals );
		} catch ( err ) {
			res.unrun.push( { 'why': 'translate: ' + err.message, 'args': where } );
			continue;
		}
		allocs = {};
		let stopped = false;
		try {
			fn( ...args );
		} catch ( err ) {
			if ( err === STOP ) {
				stopped = true;
			} else {
				res.unrun.push( { 'why': 'wrapper throws: ' + String( err && err.message || err ).slice( 0, 200 ), 'args': where } );
				continue;
			}
		}
		if ( !stopped ) {
			// Returned before base.js (a quick return in the wrapper): no path
			// runs, so no workspace is needed.
			res.early += 1;
			continue;
		}
		res.checked += 1;
		entry.queries.forEach( ( W, j ) => {
			const opt = row[ nargs + j ];
			const w = W.toLowerCase();
			if ( !( w in allocs ) ) {
				res.unrun.push( { 'why': W + ': reached base.js with no null allocation seen', 'args': where } );
				return;
			}
			if ( allocs[ w ] < opt ) {
				res.short.push( { 'ws': W, 'alloc': allocs[ w ], 'opt': opt, 'args': where } );
			}
		});
	}
	return res;
}

function groupBy( xs, key ) {
	const m = new Map();
	xs.forEach( ( x ) => {
		const k = key( x );
		if ( !m.has( k ) ) {
			m.set( k, [] );
		}
		m.get( k ).push( x );
	});
	return m;
}

async function main( argv ) {
	const check = argv.includes( '--check' );
	const asJson = argv.includes( '--json' );
	const allRows = argv.includes( '--rows' );
	let routines = selectRoutines( argv, 'workspace-optimum' );
	if ( routines === null ) {
		process.exitCode = 2;
		return;
	}
	const cache = readCache();
	routines = routines.filter( ( r ) => cache.routines[ r ] );
	const all = ( await runCorpus( { 'tool': 'workspace-optimum', 'entry': ENTRY, 'extraFiles': [ LOADER, GUARD_LOADER, CACHE_FILE ], 'routines': routines, 'argv': argv } ) ).filter( Boolean );
	const errors = all.filter( ( x ) => x.error );
	const res = all.filter( ( x ) => !x.error );
	if ( asJson ) {
		console.log( JSON.stringify( res, null, 1 ) );
	} else {
		errors.forEach( ( x ) => console.log( 'ERROR      ' + x.routine + ': ' + x.error ) );
		res.forEach( ( x ) => {
			groupBy( x.short, ( s ) => s.ws ).forEach( ( list, ws ) => {
				// The example: the row with the largest shortfall.
				const worst = list.reduce( ( a, b ) => ( ( b.opt - b.alloc ) > ( a.opt - a.alloc ) ? b : a ) );
				console.log( 'BELOW-OPT  ' + x.routine + ' ' + ws + ': ' + list.length + '/' + x.checked + ' rows; e.g. ' + worst.args + ': allocated ' + worst.alloc + ', reference optimum ' + worst.opt );
				if ( allRows ) {
					list.forEach( ( s ) => console.log( '             ' + s.args + ': ' + s.alloc + ' < ' + s.opt ) );
				}
			});
		});
		res.forEach( ( x ) => {
			groupBy( x.unrun, ( u ) => u.why ).forEach( ( list, why ) => {
				console.log( 'unrun      ' + x.routine + ': ' + list.length + ' row(s): ' + why + ( list[ 0 ].args ? ' (e.g. ' + list[ 0 ].args + ')' : '' ) );
			});
		});
		const bad = res.filter( ( x ) => x.short.length );
		const rows = res.reduce( ( a, x ) => a + x.checked, 0 );
		console.log( '\n' + res.length + ' wrappers, ' + rows + ' rows checked; ' + bad.length + ' below the reference optimum (' + res.reduce( ( a, x ) => a + x.short.length, 0 ) + ' row-workspaces); ' + res.filter( ( x ) => x.unrun.length ).length + ' with rows not run' );
	}
	if ( check && ( errors.length || res.some( ( x ) => x.short.length ) ) ) {
		process.exitCode = 1;
	}
}

if ( isWorker() ) {
	workerMain( analyze );
} else {
	main( process.argv.slice( 2 ) );
}
