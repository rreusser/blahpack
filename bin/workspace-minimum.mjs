#!/usr/bin/env node

/**
* Workspace minimum check (CONVENTIONS W3, W5; ticket 0016).
*
* `ndarray.js` must throw `RangeError` for a workspace shorter than the
* reference's minimum and accept one of exactly that length (W3). A minimum
* above the reference's rejects valid calls; one below lets base.js read or
* write past the end, which a typed array turns into NaN or lost writes.
* This checks the size `ndarray.js` enforces, not the JSDoc text (W5).
*
* For each row of the committed cache data/fortran-lwmin.json (written by
* bin/gen-lwmin.mjs from the reference: per row, each workspace's minimum,
* the smallest length whose call the reference does not reject with
* INFO = -k, or the extent it declares), this calls the module's
* `ndarray.js` (the spec's ndarray projection, lint/lib/spec.cjs:
* column-major, unit strides, offsets 0, zero-filled arrays, options
* translated to the JS strings). Its import of `base.js` is replaced by a
* sentinel thrower (bin/workspace-optimum-loader.mjs with `guard: false`), so
* no algorithm runs: the sentinel means "accepted", a RangeError
* "rejected". By W1 a length-L array is LWORK = L.
*
* For each workspace in turn, the others ample:
*
* - at the reference's minimum: a RangeError fails the row (`too high`),
*   unless the reference's own check is weaker than its callees' and
*   ndarray.js accepts the effective minimum (the smallest length no callee
*   of the reference rejects; dggsvd3 checks LWORK >= 1, its DGGSVP3 needs
*   more): then it is reported (`callee gap`), not failed;
* - at minimum - 1 (when the minimum is > 0): reaching base.js fails the row
*   (`too low`: base.js may overrun). Each failure reports the JS boundary
*   (bisected over the same call) next to the reference's. For a `declared`
*   minimum (the extent the reference declares, which it cannot check),
*   accepting less is reported (`below declared`), not failed: a path that
*   never references the workspace needs none of it.
* - Returning before base.js at minimum - 1 (a quick return in ndarray.js
*   that accepts a short workspace where the reference rejects it) is a
*   W3/V10 question: reported, counted, not failed (`zero-dim` when a
*   dimension of the row is 0, else `quick`).
* - A row whose call throws for another reason on arguments the reference
*   accepted is reported (`not run`), not failed.
*
* Usage:
*   node bin/workspace-minimum.mjs <routine> [...]
*   node bin/workspace-minimum.mjs --all [--check] [--json] [--rows]
*   node bin/workspace-minimum.mjs --changed [--base <ref>] [--check]
*
* `--check` exits 1 on a `too high` or `too low` row. `--rows` lists every
* failing row instead of one example per workspace and direction. Results
* are cached per module and computed in a worker pool (bin/lib/corpus.mjs;
* `--no-cache`, `--jobs <n>`).
*/

import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, moduleDir, selectRoutines, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';
import { specLib, plan, callArgs, jsArray, maxDim } from './lib/lwkopt.mjs';
import { CACHE_FILE } from './lib/lwmin.mjs';

const ENTRY = fileURLToPath( import.meta.url );
const LOADER = path.join( ROOT, 'bin', 'workspace-optimum-loader.mjs' );
const STOP = { 'wsMinStop': true };

function readCache() {
	return JSON.parse( fs.readFileSync( CACHE_FILE, 'utf8' ) );
}

function describe( entry, row ) {
	return entry.args.map( ( a, i ) => a + '=' + row[ i ] ).join( ' ' );
}

// One call: 'accept' (reached base.js), 'early' (returned before it),
// 'range' (RangeError), or 'other' (anything else thrown).
function outcome( fn, args ) {
	try {
		fn( ...args );
	} catch ( err ) {
		if ( err === STOP ) {
			return { 'kind': 'accept' };
		}
		if ( err instanceof RangeError ) {
			return { 'kind': 'range', 'msg': err.message };
		}
		return { 'kind': 'other', 'msg': String( err && err.message || err ) };
	}
	return { 'kind': 'early' };
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
	const res = { 'routine': r, 'rows': entry.rows.length, 'checked': 0, 'fail': [], 'calleeGap': [], 'belowDeclared': [], 'quick': [], 'unrun': [] };
	if ( pl.error ) {
		res.error = 'spec: ' + pl.error;
		return res;
	}
	const nd = path.join( dir, 'lib', 'ndarray.js' );
	if ( !/^import\s+\w+\s*(,\s*\{[^}]*\}\s*)?\s+from\s+'\.\/base\.js';/m.test( fs.readFileSync( nd, 'utf8' ) ) ) {
		res.error = 'ndarray.js has no default import of ./base.js to stop';
		return res;
	}
	register( pathToFileURL( LOADER ).href, { 'parentURL': import.meta.url, 'data': { 'target': pathToFileURL( nd ).href, 'guard': false } } );
	globalThis.__wsOptStop = function stop() {
		throw STOP;
	};
	let fn;
	try {
		fn = ( await import( pathToFileURL( nd ).href ) ).default;
	} catch ( err ) {
		res.error = 'import: ' + err.message;
		return res;
	}
	const nargs = entry.args.length;
	const nw = entry.workspaces.length;
	const wsParams = spec.params.filter( ( p ) => p.role === 'workspace' );
	// One ample buffer per workspace, reused by every row (no algorithm runs,
	// so nothing writes it): twice the largest length any row gives it, plus
	// room for a JS blocked size (NB = 32 columns of the largest dimension).
	let ample = 4096;
	entry.rows.forEach( ( row ) => {
		const vals = {};
		entry.args.forEach( ( a, i ) => {
			vals[ a ] = row[ i ];
		});
		const big = maxDim( pl, vals ) + 2;
		const most = Math.max( 0, ...row.slice( nargs + 2 * nw ) );
		ample = Math.max( ample, 2 * most + 32 * big * big + 4096 );
	});
	const ampleOf = new Map( wsParams.map( ( p ) => [ p.fortran, jsArray( p, ample ) ] ) );
	for ( const row of entry.rows ) {
		const vals = {};
		entry.args.forEach( ( a, i ) => {
			vals[ a ] = row[ i ];
		});
		const where = describe( entry, row );
		const zeroDim = pl.params.some( ( e ) => ( e.kind === 'dim' || e.kind === 'derived' ) && vals[ e.p.fortran ] === 0 );
		// The argument list with every workspace ample; `slot` remembers where
		// each workspace goes.
		const slot = {};
		let args;
		try {
			args = callArgs( spec, pl, vals, 'ndarray', ( p ) => {
				slot[ p.fortran ] = -1;
				return { 'wsSlot': p.fortran };
			});
		} catch ( err ) {
			res.unrun.push( { 'why': 'translate: ' + err.message, 'args': where } );
			continue;
		}
		args.forEach( ( a, i ) => {
			if ( a && a.wsSlot ) {
				slot[ a.wsSlot ] = i;
				args[ i ] = ampleOf.get( a.wsSlot );
			}
		});
		const at = ( W, len ) => {
			const a = args.slice();
			const p = wsParams.find( ( q ) => q.fortran === W );
			a[ slot[ W ] ] = jsArray( p, len );
			return outcome( fn, a );
		};
		const base = outcome( fn, args );
		if ( base.kind === 'range' || base.kind === 'other' ) {
			res.unrun.push( { 'why': 'throws with every workspace ample: ' + base.msg.slice( 0, 200 ), 'args': where } );
			continue;
		}
		res.checked += 1;
		// The smallest length ndarray.js does not reject (others ample).
		const jsMin = ( W ) => {
			let lo = -1;
			let hi = ample;
			while ( hi - lo > 1 ) {
				const mid = Math.floor( ( lo + hi ) / 2 );
				if ( at( W, mid ).kind === 'range' ) {
					lo = mid;
				} else {
					hi = mid;
				}
			}
			return hi;
		};
		entry.workspaces.forEach( ( w, j ) => {
			const min = row[ nargs + j ];
			const W = w.name;
			if ( !( W in slot ) ) {
				res.unrun.push( { 'why': W + ': not a workspace argument of ndarray.js', 'args': where } );
				return;
			}
			const eff = row[ nargs + nw + j ];
			const x = at( W, min );
			if ( x.kind === 'other' ) {
				res.unrun.push( { 'why': W + ' at the reference minimum: ' + x.msg.slice( 0, 200 ), 'args': where } );
				return;
			}
			if ( x.kind === 'range' ) {
				// Above the routine's own check: too high unless a callee of
				// the reference rejects the call there anyway.
				const y = ( eff === null || eff === min ) ? null : at( W, eff );
				const js = jsMin( W );
				if ( eff === null || ( y && y.kind !== 'range' ) ) {
					res.calleeGap.push( { 'ws': W, 'kind': w.kind, 'dir': 'callee gap', 'js': js, 'ref': min, 'eff': eff, 'args': where } );
				} else {
					res.fail.push( { 'ws': W, 'kind': w.kind, 'dir': 'too high', 'js': js, 'ref': min, 'eff': eff, 'zeroDim': zeroDim, 'args': where } );
				}
				return;
			}
			if ( min === 0 ) {
				return;
			}
			const y = at( W, min - 1 );
			if ( y.kind === 'accept' && w.kind === 'declared' ) {
				// The reference rejects nothing here; a path that never
				// references the workspace (dtrsna's IWORK when JOB = 'E')
				// needs none of it.
				res.belowDeclared.push( { 'ws': W, 'kind': w.kind, 'dir': 'below declared', 'js': jsMin( W ), 'ref': min, 'args': where } );
			} else if ( y.kind === 'accept' ) {
				res.fail.push( { 'ws': W, 'kind': w.kind, 'dir': 'too low', 'js': jsMin( W ), 'ref': min, 'zeroDim': zeroDim, 'args': where } );
			} else if ( y.kind === 'early' ) {
				res.quick.push( { 'ws': W, 'kind': w.kind, 'zeroDim': zeroDim, 'ref': min, 'args': where } );
			} else if ( y.kind === 'other' ) {
				res.unrun.push( { 'why': W + ' at the reference minimum - 1 throws a non-RangeError: ' + y.msg.slice( 0, 200 ), 'args': where } );
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
	let routines = selectRoutines( argv, 'workspace-minimum' );
	if ( routines === null ) {
		process.exitCode = 2;
		return;
	}
	const cache = readCache();
	routines = routines.filter( ( r ) => cache.routines[ r ] );
	const all = ( await runCorpus( { 'tool': 'workspace-minimum', 'entry': ENTRY, 'extraFiles': [ LOADER, CACHE_FILE ], 'routines': routines, 'argv': argv } ) ).filter( Boolean );
	const errors = all.filter( ( x ) => x.error );
	const res = all.filter( ( x ) => !x.error );
	if ( asJson ) {
		console.log( JSON.stringify( all, null, 1 ) );
	} else {
		errors.forEach( ( x ) => console.log( 'ERROR      ' + x.routine + ': ' + x.error ) );
		const TAGS = { 'too high': 'TOO-HIGH   ', 'too low': 'TOO-LOW    ', 'callee gap': 'callee-gap ', 'below declared': 'below-decl ' };
		const show = ( x, xs ) => groupBy( xs, ( s ) => s.ws + ' ' + s.dir ).forEach( ( list ) => {
			// The example: the row with the largest gap.
			const worst = list.reduce( ( a, b ) => ( Math.abs( b.js - b.ref ) > Math.abs( a.js - a.ref ) ? b : a ) );
			const ref = ( worst.eff !== void 0 && worst.eff !== worst.ref ) ? worst.ref + ' (its callees ' + ( worst.eff === null ? 'reject even the bound' : worst.eff ) + ')' : String( worst.ref );
			const z = list.filter( ( s ) => s.zeroDim ).length;
			console.log( TAGS[ worst.dir ] + x.routine + ' ' + worst.ws + ' (' + worst.kind + '): ' + list.length + '/' + x.checked + ' rows' + ( z ? ' (' + z + ' with a zero dimension)' : '' ) + '; e.g. ' + worst.args + ': ndarray.js demands ' + worst.js + ', reference ' + ref );
			if ( allRows ) {
				list.forEach( ( s ) => console.log( '             ' + s.args + ': ' + s.js + ' vs ' + s.ref ) );
			}
		});
		res.forEach( ( x ) => show( x, x.fail ) );
		res.forEach( ( x ) => show( x, x.calleeGap ) );
		res.forEach( ( x ) => show( x, x.belowDeclared ) );
		res.forEach( ( x ) => {
			groupBy( x.quick, ( q ) => q.ws + ( q.zeroDim ? ' zero-dim' : ' quick' ) ).forEach( ( list ) => {
				console.log( ( list[ 0 ].zeroDim ? 'zero-dim   ' : 'quick      ' ) + x.routine + ' ' + list[ 0 ].ws + ': ' + list.length + ' row(s) return before base.js with minimum - 1 where the reference rejects (e.g. ' + list[ 0 ].args + ': reference minimum ' + list[ 0 ].ref + ')' );
			});
		});
		res.forEach( ( x ) => {
			groupBy( x.unrun, ( u ) => u.why ).forEach( ( list, why ) => {
				console.log( 'not run    ' + x.routine + ': ' + list.length + ' row(s): ' + why + ( list[ 0 ].args ? ' (e.g. ' + list[ 0 ].args + ')' : '' ) );
			});
		});
		const rows = res.reduce( ( a, x ) => a + x.checked, 0 );
		const nf = ( d ) => res.filter( ( x ) => x.fail.some( ( f ) => f.dir === d ) ).length;
		const zq = res.reduce( ( a, x ) => a + x.quick.filter( ( q ) => q.zeroDim ).length, 0 );
		const qq = res.reduce( ( a, x ) => a + x.quick.filter( ( q ) => !q.zeroDim ).length, 0 );
		console.log( '\n' + res.length + ' modules, ' + rows + ' rows checked; ' + res.filter( ( x ) => x.fail.length ).length + ' failing (' + nf( 'too high' ) + ' too high, ' + nf( 'too low' ) + ' too low; ' + res.reduce( ( a, x ) => a + x.fail.length, 0 ) + ' row-workspaces); ' + res.reduce( ( a, x ) => a + x.calleeGap.length, 0 ) + ' in a callee gap, ' + res.reduce( ( a, x ) => a + x.belowDeclared.length, 0 ) + ' below a declared extent, ' + zq + ' zero-dim and ' + qq + ' other quick-return row-workspaces (reported, not failed); ' + res.filter( ( x ) => x.unrun.length ).length + ' with rows not run; ' + errors.length + ' errors' );
	}
	if ( check && ( errors.length || res.some( ( x ) => x.fail.length ) ) ) {
		process.exitCode = 1;
	}
}

if ( isWorker() ) {
	workerMain( analyze );
} else {
	main( process.argv.slice( 2 ) );
}
