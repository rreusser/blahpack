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
* For each workspace in turn, the others ample, against the reference's
* minimum: for a workspace with a length argument the effective one, the
* smallest length at which neither the routine nor any callee rejects the
* call (dggsvd3 checks only LWORK >= 1, but its DGGSVP3 needs more; below
* the effective minimum the reference fails in a callee, and base.js, which
* calls its callees' base.js unchecked, may overrun); for a `declared`
* workspace the extent the reference declares.
*
* (The effective minimum also covers writes: the generator's probes fill the
* workspace past the length with a sentinel, and the smallest length past
* which the reference writes nothing is the minimum. Where that exceeds the
* reference's own check, e.g. dorgtsqr_row checks LWORK >= 1 but writes
* NB*max( NB, N-NB ), the cache's `overruns` says so and this report lists
* it: the JS deliberately demands more than the reference's check there.
* Reads past the length are not seen. Each minimum is the larger of the
* reference's on zero data, on seeded random data and on that data made
* rank-deficient, each replayed here on the same data, so data-dependent
* extents (d/z ggsvp3's ranks) count; a sampled minimum is still only a
* lower bound of the minimum over all data; inputs that need structure to reach a
* path are a known limit, bin/gen-lwmin.mjs.)
*
* - at the minimum: a RangeError fails the row (`too high`: it rejects a
*   valid call), at a zero dimension too. Here the minimum is the largest
*   that any data source gave for the row (a JS minimum that cannot see the
*   data must cover them all); `too low` below is judged per source, on
*   that source's data (a JS minimum that depends on the data, like
*   dtrsen's count of selected eigenvalues, sees the same data);
* - at minimum - 1 (when the minimum is > 0): accepting it (reaching base.js)
*   fails the row (`too low`: base.js may overrun). Each failure reports the
*   JS boundary (bisected over the same call) next to the reference's.
* - Except: at a row where some dimension is 0, accepting less is reported
*   and counted (`zero-dim`), not failed, whether ndarray.js returns early
*   or base.js is reached: an empty problem needs no workspace (W3, V10).
*   For a `declared` minimum (which the reference cannot check), accepting
*   less is reported (`below declared`), not failed: a path that never
*   references the workspace needs none of it. A quick return in ndarray.js
*   at non-zero dimensions that accepts less is reported (`quick`).
* - A row whose call throws for another reason on arguments the reference
*   accepted, or whose reference callees reject at every length, is
*   reported (`not run`), not failed.
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
import { BIG } from './lib/fortran-ref.mjs';
import { CACHE_FILE } from './lib/lwmin.mjs';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

const ENTRY = fileURLToPath( import.meta.url );
const LOADER = path.join( ROOT, 'bin', 'workspace-optimum-loader.mjs' );
const STOP = { 'wsMinStop': true };

/**
* Fills the real and complex input arrays as the generator's driver does
* (bin/lib/fortran-ref.mjs): in argument order, `zext` values each (two per
* complex element) from one Park-Miller sequence started at `seed`, IPIV
* left alone; with `rankDeficient` (the row's values) every second column
* of each 2-D array is then a copy of the one before it.
*/
function fillRandom( arrays, seed, zext, rankDeficient ) {
	let st = seed;
	const next = () => {
		st = ( st * 16807 ) % 2147483647;
		return ( 2 * st / 2147483647 ) - 1;
	};
	arrays.slice().sort( ( a, b ) => a[ 0 ].position - b[ 0 ].position ).forEach( ( [ p, arr ] ) => {
		if ( p.fortran === 'IPIV' || ( p.dtype !== 'float64' && p.dtype !== 'complex128' ) ) {
			return;
		}
		const v = ( p.dtype === 'complex128' ) ? reinterpret( arr, 0 ) : arr;
		const per = ( p.dtype === 'complex128' ) ? 2 : 1;
		for ( let i = 0; i < zext * per; i++ ) {
			const x = next();
			if ( i < v.length ) {
				v[ i ] = x;
			}
		}
		// Rank-deficient: column j a copy of column j - 1 for every odd j
		// (0-based), over the first `zext` elements at the row's leading
		// dimension, as the driver's dup_d/dup_z.
		const ld = ( rankDeficient && p.ld ) ? rankDeficient[ p.ld ] : 0;
		if ( ld >= 1 ) {
			for ( let j = 1; j < Math.floor( zext / ld ); j += 2 ) {
				for ( let i = 0; i < ld * per; i++ ) {
					const to = ( j * ld * per ) + i;
					if ( to < v.length ) {
						v[ to ] = v[ ( ( j - 1 ) * ld * per ) + i ];
					}
				}
			}
		}
	});
}

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
	const res = { 'routine': r, 'rows': entry.rows.length, 'checked': 0, 'checkedRandom': 0, 'fail': [], 'belowDeclared': [], 'quick': [], 'unrun': [] };
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
		const most = Math.max( 0, ...row.slice( nargs + 6 * nw, nargs + 7 * nw ) );
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
		const seen = new Set();
		const push = ( list, x ) => {
			// A row-workspace counts once, whichever data found it.
			const k = String( x.ws || x.why ) + '\0' + ( x.dir || x.how || '' ) + '\0' + x.args.replace( / \[[a-z-]+ data\]$/, '' );
			if ( !seen.has( k ) ) {
				seen.add( k );
				list.push( x );
			}
		};
		// The reference's minimums on zero data, then on its seeded random
		// data, which the same arrays here are filled with.
		for ( const data of [ 'zero', 'random', 'rank-deficient' ] ) {
			const off = { 'zero': 0, 'random': 2 * nw, 'rank-deficient': 4 * nw }[ data ];
			if ( data !== 'zero' && entry.workspaces.every( ( w, j ) => row[ nargs + off + nw + j ] === null && row[ nargs + off + j ] === null ) ) {
				continue;
			}
			const arrays = [];
			const tag = ( data === 'zero' ) ? '' : ' [' + data + ' data]';
			// The argument list with every workspace ample; `slot` remembers where
			// each workspace goes.
			const slot = {};
			let args;
			try {
				args = callArgs( spec, pl, vals, 'ndarray', ( p ) => {
					slot[ p.fortran ] = -1;
					return { 'wsSlot': p.fortran };
				}, ( p, arr ) => arrays.push( [ p, arr ] ) );
			} catch ( err ) {
				res.unrun.push( { 'why': 'translate: ' + err.message, 'args': where + tag } );
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
			if ( data !== 'zero' ) {
				fillRandom( arrays, row[ nargs + 7 * nw ], Math.min( BIG, 4 * ( maxDim( pl, vals ) + 2 ) * ( maxDim( pl, vals ) + 2 ) ), ( data === 'rank-deficient' ) ? vals : null );
			}
			const base = outcome( fn, args );
			if ( base.kind === 'range' || base.kind === 'other' ) {
				push( res.unrun, { 'why': 'throws with every workspace ample: ' + base.msg.slice( 0, 200 ), 'args': where + tag } );
				continue;
			}
			res[ ( data === 'zero' ) ? 'checked' : 'checkedRandom' ] += 1;
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
				const W = w.name;
				if ( !( W in slot ) ) {
					res.unrun.push( { 'why': W + ': not a workspace argument of ndarray.js', 'args': where + tag } );
					return;
				}
				// The reference's minimum is the effective one: the smallest
				// length no callee rejects either. Below it the reference fails
				// in a callee, and base.js, which calls its callees' base.js
				// unchecked, may overrun. Null: callees reject even at the bound.
				const own = row[ nargs + off + j ];
				const ref = row[ nargs + off + nw + j ];
				if ( ref === null ) {
					push( res.unrun, { 'why': W + ': callees of the reference reject the call at every length', 'args': where + tag } );
					return;
				}
				// Too high is judged against the largest minimum any data
				// source gave: a sampled minimum is a lower bound, and a JS
				// minimum that does not depend on the data (the JS cannot see
				// the ranks) must cover every source. Too low is per source.
				const top = Math.max( ref, ...[ 0, 2, 4 ].map( ( o ) => row[ nargs + ( o + 1 ) * nw + j ] ).filter( ( e ) => e !== null ) );
				const x = at( W, top );
				if ( x.kind === 'other' ) {
					res.unrun.push( { 'why': W + ' at the reference minimum: ' + x.msg.slice( 0, 200 ), 'args': where + tag } );
					return;
				}
				if ( x.kind === 'range' ) {
					// Rejects a valid call, at a zero dimension too.
					push( res.fail, { 'ws': W, 'kind': w.kind, 'dir': 'too high', 'js': jsMin( W ), 'ref': top, 'own': own, 'zeroDim': zeroDim, 'args': where + tag } );
					return;
				}
				if ( ref === 0 ) {
					return;
				}
				const y = at( W, ref - 1 );
				if ( y.kind === 'other' ) {
					res.unrun.push( { 'why': W + ' at the reference minimum - 1 throws a non-RangeError: ' + y.msg.slice( 0, 200 ), 'args': where + tag } );
					return;
				}
				if ( y.kind === 'range' ) {
					return;
				}
				if ( zeroDim ) {
					// An empty problem needs no workspace (W3): reported, not
					// failed, whether ndarray.js returns early or base.js runs.
					push( res.quick, { 'ws': W, 'kind': w.kind, 'zeroDim': true, 'how': ( y.kind === 'early' ) ? 'returns early' : 'reaches base.js', 'ref': ref, 'args': where + tag } );
				} else if ( w.kind === 'declared' ) {
					// The reference rejects nothing here; a path that never
					// references the workspace (dtrsna's IWORK when JOB = 'E')
					// needs none of it.
					push( res.belowDeclared, { 'ws': W, 'kind': w.kind, 'dir': 'below declared', 'js': jsMin( W ), 'ref': ref, 'args': where + tag } );
				} else if ( y.kind === 'accept' ) {
					push( res.fail, { 'ws': W, 'kind': w.kind, 'dir': 'too low', 'js': jsMin( W ), 'ref': ref, 'own': own, 'zeroDim': false, 'args': where + tag } );
				} else {
					push( res.quick, { 'ws': W, 'kind': w.kind, 'zeroDim': false, 'how': 'returns early', 'ref': ref, 'args': where + tag } );
				}
			});
		}
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
		const TAGS = { 'too high': 'TOO-HIGH   ', 'too low': 'TOO-LOW    ', 'below declared': 'below-decl ' };
		const show = ( x, xs ) => groupBy( xs, ( s ) => s.ws + ' ' + s.dir ).forEach( ( list ) => {
			// The example: the row with the largest gap.
			const worst = list.reduce( ( a, b ) => ( Math.abs( b.js - b.ref ) > Math.abs( a.js - a.ref ) ? b : a ) );
			const ref = ( worst.own !== void 0 && worst.own !== worst.ref ) ? worst.ref + ' (its own check: ' + worst.own + ')' : String( worst.ref );
			const z = list.filter( ( s ) => s.zeroDim ).length;
			console.log( TAGS[ worst.dir ] + x.routine + ' ' + worst.ws + ' (' + worst.kind + '): ' + list.length + '/' + x.checked + ' rows' + ( z ? ' (' + z + ' with a zero dimension)' : '' ) + '; e.g. ' + worst.args + ': ndarray.js demands ' + worst.js + ', reference ' + ref );
			if ( allRows ) {
				list.forEach( ( s ) => console.log( '             ' + s.args + ': ' + s.js + ' vs ' + s.ref ) );
			}
		});
		res.forEach( ( x ) => show( x, x.fail ) );
		res.forEach( ( x ) => show( x, x.belowDeclared ) );
		res.forEach( ( x ) => {
			groupBy( x.quick, ( q ) => q.ws + ( q.zeroDim ? ' zero-dim' : ' quick' ) ).forEach( ( list ) => {
				const early = list.filter( ( q ) => q.how === 'returns early' ).length;
				console.log( ( list[ 0 ].zeroDim ? 'zero-dim   ' : 'quick      ' ) + x.routine + ' ' + list[ 0 ].ws + ': ' + list.length + ' row(s) accept the minimum - 1 where the reference rejects (' + early + ' return before base.js, ' + ( list.length - early ) + ' reach it; e.g. ' + list[ 0 ].args + ': reference minimum ' + list[ 0 ].ref + ')' );
			});
		});
		routines.forEach( ( r ) => {
			Object.keys( cache.routines[ r ].overruns || {} ).sort().forEach( ( W ) => {
				const o = cache.routines[ r ].overruns[ W ];
				console.log( 'overrun    ' + r + ' ' + W + ': the reference writes past its own check in ' + o.rows + '/' + cache.routines[ r ].rows.length + ' rows (e.g. ' + o.example + ': check accepts ' + o.own + ', writes element ' + o.wrote + '); the minimum here is what it writes' );
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
		console.log( '\n' + res.length + ' modules, ' + rows + ' rows checked; ' + res.filter( ( x ) => x.fail.length ).length + ' failing (' + nf( 'too high' ) + ' too high, ' + nf( 'too low' ) + ' too low; ' + res.reduce( ( a, x ) => a + x.fail.length, 0 ) + ' row-workspaces); ' + res.reduce( ( a, x ) => a + x.belowDeclared.length, 0 ) + ' below a declared extent, ' + zq + ' zero-dim and ' + qq + ' other quick-return row-workspaces (reported, not failed); ' + res.filter( ( x ) => x.unrun.length ).length + ' with rows not run; ' + errors.length + ' errors' );
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
