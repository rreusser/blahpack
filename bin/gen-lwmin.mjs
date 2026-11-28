#!/usr/bin/env node

/**
* Records the reference's workspace minimum (CONVENTIONS W3; ticket 0016)
* into the committed cache data/fortran-lwmin.json, which
* bin/workspace-minimum.mjs checks every strided.js's workspace check
* against.
*
* Scope: the d/z modules whose spec has a workspace-length argument (LWORK,
* LRWORK, LIWORK, ...; bin/lib/lwkopt.mjs `routineSet()`), over the rows of
* the same grid as bin/gen-lwkopt.mjs. A routine with no INFO argument
* cannot reject anything (`noInfo`).
*
* For each routine this writes a Fortran driver from the spec (bin/lib/
* fortran-ref.mjs; compiled against the reference library gen-lwkopt
* builds, with an XERBLA that returns instead of stopping) and talks to it a
* call at a time. For each grid row:
*
* 1. If the reference has a workspace query, it queries (every length -1);
*    a row whose query returns INFO != 0 is not recorded. Each workspace's
*    upper bound is the larger of its optimum and the spec's minLength
*    evaluated; without a query, that estimate times 2 plus 64, else the
*    buffer size.
* 2. It calls with every workspace at its upper bound: INFO = -k for a
*    workspace raises that bound to the buffer size once; any other
*    negative INFO means the row's arguments are invalid (not recorded).
*    The driver re-zeroes the input arrays before every call, so each call
*    runs the algorithm on the same zero data; INFO > 0 or any value other
*    than -k means "accepted".
* 3. For each workspace with a length argument in turn (the others at their
*    bound), the minimum is the smallest length whose call does not return
*    INFO = -k (k from the reference's check of that argument). It first
*    tries the spec's estimate (min - 1 rejected and min accepted), else
*    bisects in [0, bound]. Monotonicity is assumed and verified at the
*    boundary found: min - 1 rejected, min accepted. A routine's own check
*    can be weaker than its callees' (dggsvd3 checks LWORK >= 1, then
*    passes WORK on to DGGSVP3): the driver's XERBLA ends the process when
*    a callee rejects (the routine had accepted). So it also records the
*    effective minimum, the smallest length (>= min) whose call no callee
*    rejects either (null when callees reject even at the bound), verified
*    the same way.
*    "Accepted" is not enough either: a routine's check can be weaker than
*    what it writes (dorgtsqr_row checks LWORK >= 1, then DLARFB_GETT writes
*    NB*max( NB, N-NB ); dlamtsqr's SIDE = 'R' check is MB*NB, its
*    DGEMQRT writes M*NB). So each probe fills the workspace past the length
*    L it passes (past max( 1, L ) for a WORK( MAX( 1, LWORK ) )
*    declaration) with a sentinel, and the driver reports the last element
*    changed. The effective minimum is the smallest length that is accepted,
*    that no callee rejects, and past which nothing is written. Where the
*    reference writes past its own check's minimum, the entry's `overruns`
*    records it (rows, the example with the largest overrun): there the JS
*    must demand more than the reference's check. Writes only: a read past
*    L leaves no trace.
* 4. Every row is measured three times: on zero data, on seeded random data
*    (real and complex input arrays uniform in [-1, 1], seed 1 + the row's
*    index; IPIV the identity, other integer inputs and SELECT as above),
*    and on that random data made rank-deficient (in every 2-D input, each
*    second column a copy of the one before it: rank about half, > 0, so
*    the rank-deficient paths of ggsvp3, gelsy, geqp3 run), and each
*    minimum is the largest. A sampled minimum is only a lower bound of
*    the minimum over all data. Zero data hides data-dependent extents:
*    on it d/z ggsvp3's ranks K and L are 0, and the callees that write the
*    declared extents of U, V and A never run. INFO > 0 on random data
*    (singular, not positive definite) still counts as accepted. A crash of
*    a random-data run keeps the other sources' minimums (`randomCrashed`);
*    `randomRaised` counts, per random source, the rows whose minimum it
*    raised above the zero data's.
*    Known limit: a routine whose full path needs structured input
*    (symmetric positive definite, a factored or reduced matrix: d/z potrs-
*    like callers, the tridiagonal/Hessenberg/Schur-form inputs of hseqr,
*    hgeqz, trsen, tgsen, tgsna, trevc3, the reflectors of the orm and unm
*    families) may not reach it on either kind of data; its minimum is what
*    these two runs reach.
* 5. A workspace without a length argument whose declaration gives its
*    extent from the integer arguments (RWORK( 8*N )) records that extent,
*    evaluated by the driver in Fortran (`declared`).
*
* A workspace with a length argument that no row rejects (min 0 everywhere:
* dlaqr0's LWORK is never checked) is `unmeasured`, with that reason; a
* routine left with nothing measured is `noCheck`. A crash or a timeout
* loses its row (reported). Failures throw: a routine in scope with no INFO
* is `noInfo`, and one the generator cannot handle must be listed in
* bin/lib/lwmin.mjs `UNHANDLED` with the reason.
*
* Usage:
*   node bin/gen-lwmin.mjs [<routine>...]   regenerate (needs gfortran and the
*                                           gitignored Fortran sources)
*   node bin/gen-lwmin.mjs --check          CI: every module in scope has an
*                                           entry (or is noInfo/noCheck/
*                                           UNHANDLED) and each entry is the
*                                           one its current spec gives (reads
*                                           only the cache and the specs, T6)
*   --jobs <n>                              parallel drivers (default: CPUs)
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from './lib/corpus.mjs';
import { specLib, grid, routineSet, jsScope, evalJs, maxDim } from './lib/lwkopt.mjs';
import { SRC, BIG, pool, buildLibrary, sourceCode, hasQuery, driver, compile, Session } from './lib/fortran-ref.mjs';
import { LWMIN_VERSION, CACHE_FILE, UNHANDLED, measured, entryHash, hasInfo } from './lib/lwmin.mjs';

// Rows per driver process (the unit of parallel work).
const CHUNK = 48;

// One call's wall-clock limit.
const TIMEOUT = 30000;


// PROBE //

class RowCrash extends Error {}

/**
* Measures one grid row. Returns { row } (the cache row), { rejected } (the
* query or the call at the bounds rejects the row's arguments), or throws
* RowCrash.
*/
async function measureRow( ctx, s, call, seed ) {
	const { pl, m, lworks, query } = ctx;
	const vals = {};
	ctx.g.args.forEach( ( a, i ) => {
		vals[ a ] = call[ i ];
	});
	const big = maxDim( pl, vals );
	// Every non-workspace array is at most ~ (largest dimension + 2)^2.
	const zext = Math.min( BIG, 4 * ( big + 2 ) * ( big + 2 ) );
	const ldValue = Math.max( 1, big );
	const scope = jsScope( ctx.spec, pl, vals );
	const checked = m.workspaces.filter( ( w ) => w.kind === 'check' );
	// A call: { declared, info, out }, { declared, callee } or
	// { declared, crashed }.
	const invoke = async ( lens ) => {
		const args = call.concat( [ zext, seed ], lworks.map( ( L ) => ( L.of ? lens[ L.of ] : ldValue ) ) );
		ctx.calls += 1;
		return s.call( args );
	};
	// The query and the call at the bounds must return.
	const must = ( res, what ) => {
		if ( res.crashed || ( res.callee && what === 'query' ) ) {
			throw new RowCrash( what + ': ' + ( res.crashed || 'callee XERBLA ' + res.callee ) );
		}
		return res;
	};
	const upper = {};
	if ( query ) {
		const q = {};
		checked.forEach( ( w ) => {
			q[ w.name ] = -1;
		});
		const res = must( await invoke( q ), 'query' );
		if ( res.info !== 0 ) {
			return { 'rejected': true };
		}
		checked.forEach( ( w ) => {
			const i = lworks.findIndex( ( L ) => L.of === w.name );
			upper[ w.name ] = Math.max( 1, Math.ceil( res.out[ i ] ) );
		});
	}
	checked.forEach( ( w ) => {
		const est = evalJs( w.estimate, scope );
		const e = Number.isNaN( est ) ? NaN : Math.max( 0, Math.ceil( est ) );
		w.est = e;
		if ( query ) {
			upper[ w.name ] = Math.min( BIG, Math.max( upper[ w.name ], Number.isNaN( e ) ? 0 : e ) );
		} else {
			upper[ w.name ] = Number.isNaN( e ) ? BIG : Math.min( BIG, 2 * e + 64 );
		}
	});
	// The call at the bounds. A callee's XERBLA means the routine accepted
	// it (its own checks come first).
	const rejects = ( res, w ) => !res.callee && res.info === w.info;
	let base = must( await invoke( upper ), 'call at the bounds' );
	let hit = checked.filter( ( w ) => rejects( base, w ) );
	if ( hit.length ) {
		hit.forEach( ( w ) => {
			upper[ w.name ] = BIG;
		});
		base = must( await invoke( upper ), 'call at the buffer size' );
		hit = checked.filter( ( w ) => rejects( base, w ) );
		if ( hit.length ) {
			throw new Error( ctx.spec.routine + ': rejects ' + hit.map( ( w ) => w.name ).join( ', ' ) + ' even at the buffer size ' + BIG + ' (' + describe( ctx.g, call ) + ')' );
		}
	}
	if ( !base.callee && base.info < 0 ) {
		return { 'rejected': true };
	}
	// The others must be ample while one is measured: when a callee rejects
	// the call at the bounds, or it writes past one (dtgsen passes DTGSYL
	// less than its optimum asks for), every bound becomes the buffer size.
	const writtenPast = ( res ) => lworks.filter( ( L ) => L.of ).some( ( L, k ) => {
		const w = checked.find( ( x ) => x.name === L.of );
		return w && res.out && res.out[ lworks.length + k ] > Math.max( w.floor1 ? 1 : 0, upper[ w.name ] );
	});
	if ( base.callee || writtenPast( base ) ) {
		checked.forEach( ( w ) => {
			upper[ w.name ] = BIG;
		});
		base = must( await invoke( upper ), 'call at the buffer size' );
		if ( !base.callee && base.info < 0 ) {
			return { 'rejected': true };
		}
	}
	const mins = {};
	const effs = {};
	const overruns = {};
	for ( const w of checked ) {
		const memo = new Map();
		const probe = async ( L ) => {
			if ( !memo.has( L ) ) {
				const lens = Object.assign( {}, upper, { [ w.name ]: L } );
				const res = await invoke( lens );
				if ( res.crashed ) {
					ctx.faults += 1;
				}
				memo.set( L, res );
			}
			return memo.get( L );
		};
		// The routine rejects before it does any work, so a call that ends
		// any other way (a callee's XERBLA, a crash or a timeout in the
		// algorithm) was accepted.
		const accepted = async ( L ) => {
			const res = await probe( L );
			return Boolean( res.crashed ) || !rejects( res, w );
		};
		// ... and ran clean when no callee rejected what it was passed
		// either and nothing past L was written.
		const wx = lworks.length + lworks.filter( ( L ) => L.of ).findIndex( ( L ) => L.of === w.name );
		const wrote = ( res ) => ( res.out ? res.out[ wx ] : 0 );
		// What the declaration gives a length L: WORK( MAX( 1, LWORK ) ).
		const extent = ( L ) => ( w.floor1 ? Math.max( 1, L ) : L );
		const clean = async ( L ) => {
			const res = await probe( L );
			return !res.crashed && !res.callee && res.info !== w.info && wrote( res ) <= extent( L );
		};
		memo.set( upper[ w.name ], base );
		const first = async ( test, lo, hi ) => {
			// The smallest L in ( lo, hi ] passing `test`, given test( hi ).
			while ( hi - lo > 1 ) {
				const mid = Math.floor( ( lo + hi ) / 2 );
				if ( await test( mid ) ) {
					hi = mid;
				} else {
					lo = mid;
				}
			}
			return hi;
		};
		let min = null;
		const e = w.est;
		if ( !Number.isNaN( e ) && e <= upper[ w.name ] && await accepted( e ) && ( e === 0 || !( await accepted( e - 1 ) ) ) ) {
			min = e;
		} else if ( await accepted( 0 ) ) {
			min = 0;
		} else {
			min = await first( accepted, 0, upper[ w.name ] );
		}
		// The boundary: min accepted, min - 1 rejected.
		if ( !( await accepted( min ) ) || ( min > 0 && await accepted( min - 1 ) ) ) {
			throw new Error( ctx.spec.routine + ' ' + w.name + ': not monotone at ' + min + ' (' + describe( ctx.g, call ) + ')' );
		}
		mins[ w.name ] = min;
		// The effective minimum: the smallest length no callee rejects
		// either (dggsvd3 checks only LWORK >= 1; its DGGSVP3 needs more).
		// Null when callees reject even at the bound.
		// The reference writing past what its own check accepts: the JS
		// must demand more than that check (dorgtsqr_row checks LWORK >= 1;
		// its DLARFB_GETT writes NB*max( NB, N-NB )).
		const atMin = await probe( min );
		if ( !atMin.crashed && !atMin.callee && wrote( atMin ) > extent( min ) ) {
			overruns[ w.name ] = wrote( atMin );
		}
		let eff = null;
		let top = upper[ w.name ];
		if ( !( await clean( top ) ) && top < BIG && await clean( BIG ) ) {
			top = BIG;
		}
		if ( await clean( min ) ) {
			eff = min;
		} else if ( await clean( top ) ) {
			eff = await first( clean, min, top );
			if ( !( await clean( eff ) ) || await clean( eff - 1 ) ) {
				throw new Error( ctx.spec.routine + ' ' + w.name + ': callee rejections or writes past the length not monotone at ' + eff + ' (' + describe( ctx.g, call ) + ')' );
			}
		}
		effs[ w.name ] = eff;
	}
	let d = 0;
	m.workspaces.forEach( ( w ) => {
		if ( w.kind === 'declared' ) {
			mins[ w.name ] = base.declared[ d ];
			effs[ w.name ] = mins[ w.name ];
			upper[ w.name ] = mins[ w.name ];
			d += 1;
		}
	});
	return { 'overruns': overruns, 'row': call.concat( m.workspaces.map( ( w ) => mins[ w.name ] ), m.workspaces.map( ( w ) => effs[ w.name ] ), m.workspaces.map( ( w ) => upper[ w.name ] ) ) };
}

function describe( g, call ) {
	return g.args.map( ( a, i ) => a + '=' + call[ i ] ).join( ' ' );
}

async function prepare( r ) {
	const spec = specLib.load( r );
	const g = grid( spec );
	if ( g.error ) {
		throw new Error( r + ': cannot build its grid: ' + g.error );
	}
	const m = measured( spec );
	if ( !m.workspaces.length ) {
		throw new Error( r + ': no workspace with a length argument or a declared extent to measure (' + JSON.stringify( m.unmeasured ) + '); list it in bin/lib/lwmin.mjs UNHANDLED with the reason' );
	}
	const query = hasQuery( r, spec );
	if ( query === null ) {
		throw new Error( r + ': has a workspace-length argument but no reference source' );
	}
	// The driver's XERBLA tells the routine's own rejections from a callee's
	// by name.
	const names = ( sourceCode( r ).match( /CALL\s+XERBLA\s*\(\s*'[^']*'/gi ) || [] ).map( ( x ) => x.replace( /^[^']*'|'$/g, '' ).trim().toUpperCase() );
	if ( names.some( ( x ) => x !== r.toUpperCase() ) ) {
		throw new Error( r + ': calls XERBLA as ' + names.join( ', ' ) + ', not ' + r.toUpperCase() + ': its own rejections would read as a callee\'s' );
	}
	let source;
	try {
		source = driver( spec, g, { 'declared': m.workspaces.filter( ( w ) => w.kind === 'declared' ) } );
	} catch ( err ) {
		throw new Error( r + ': cannot write its driver: ' + err.message );
	}
	const bin = await compile( 'lwmin', r, source );
	const lworks = g.plan.params.filter( ( e ) => e.kind === 'lwork' ).map( ( e ) => e.p );
	const nout = lworks.length + lworks.filter( ( L ) => L.of ).length;
	return { 'r': r, 'spec': spec, 'g': g, 'pl': g.plan, 'm': m, 'lworks': lworks, 'query': query, 'bin': bin, 'nout': nout, 'calls': 0, 'faults': 0, 'hash': entryHash( g.hash, m ) };
}

// The data sources, in row order: zero data, seeded random data, and the
// same random data made rank-deficient (every second column of each 2-D
// input a copy of the one before it; the driver reads seed < 0 as that).
const SOURCES = [ 'zero', 'random', 'rank-deficient' ];

// One row from its measurements on each source: the arguments, then per
// source and workspace the minimum and the effective minimum (null when
// that run crashed or was rejected), the bounds (the largest), and last the
// seed of the random data. The overruns are the largest; `raised` names,
// per random source, the workspaces whose effective minimum it raised above
// the zero data's; `randomCrashed` that a random run crashed.
function combine( ctx, xs, seed ) {
	const x0 = xs[ 0 ];
	if ( !x0.row ) {
		return x0;
	}
	const n = ctx.g.args.length;
	const nw = ctx.m.workspaces.length;
	const rs = xs.map( ( x ) => x.row || null );
	const pick = ( row, k ) => ctx.m.workspaces.map( ( w, j ) => ( row ? row[ n + k * nw + j ] : null ) );
	const raised = {};
	xs.forEach( ( x, k ) => {
		if ( k === 0 || !rs[ k ] ) {
			return;
		}
		ctx.m.workspaces.forEach( ( w, j ) => {
			const e0 = rs[ 0 ][ n + nw + j ];
			const e = rs[ k ][ n + nw + j ];
			if ( e0 !== null && e !== null && e > e0 ) {
				( raised[ SOURCES[ k ] ] || ( raised[ SOURCES[ k ] ] = [] ) ).push( w.name );
			}
		});
	});
	const uppers = ctx.m.workspaces.map( ( w, j ) => Math.max( ...rs.map( ( r ) => ( r ? r[ n + 2 * nw + j ] : 0 ) ) ) );
	let row = x0.row.slice( 0, n );
	rs.forEach( ( r ) => {
		row = row.concat( pick( r, 0 ), pick( r, 1 ) );
	});
	row = row.concat( uppers, [ seed ] );
	const overruns = {};
	xs.forEach( ( x, k ) => {
		Object.keys( ( rs[ k ] && x.overruns ) || {} ).forEach( ( W ) => {
			overruns[ W ] = Math.max( overruns[ W ] || 0, x.overruns[ W ] );
		});
	});
	const out = { 'row': row, 'overruns': overruns, 'raised': raised };
	const crashed = xs.filter( ( x ) => x.crashed ).map( ( x ) => x.crashed );
	if ( crashed.length ) {
		out.randomCrashed = crashed.join( '; ' );
	}
	return out;
}

async function runChunk( ctx, from, to ) {
	const s = new Session( ctx.bin, ctx.nout, TIMEOUT );
	const out = [];
	try {
		for ( let i = from; i < to; i++ ) {
			const call = ctx.g.calls[ i ];
			try {
				// Each row works on its own copy of the measured list.
				const copy = () => Object.assign( {}, ctx, { 'calls': 0, 'faults': 0, 'm': { 'workspaces': ctx.m.workspaces.map( ( w ) => Object.assign( {}, w ) ) } } );
				// On zero data, then on seeded random data (row i: seed 1 + i),
				// then on that data made rank-deficient (seed -(1 + i)); the
				// largest minimum counts.
				const seed = 1 + i;
				const xs = [];
				for ( let k = 0; k < SOURCES.length; k++ ) {
					const c = copy();
					try {
						xs.push( await measureRow( c, s, call, [ 0, seed, -seed ][ k ] ) );
					} catch ( err ) {
						if ( k === 0 || !( err instanceof RowCrash ) ) {
							throw err;
						}
						xs.push( { 'crashed': SOURCES[ k ] + ': ' + err.message } );
					}
					ctx.calls += c.calls;
					ctx.faults += c.faults;
				}
				out.push( combine( ctx, xs, seed ) );
			} catch ( err ) {
				if ( !( err instanceof RowCrash ) ) {
					throw err;
				}
				out.push( { 'crashed': describe( ctx.g, call ) + ': ' + err.message } );
			}
		}
	} finally {
		s.close();
	}
	return out;
}

// The cache entry from a routine's row results, or null when no workspace
// with a length argument is ever rejected and none is declared (noCheck).
function assemble( ctx, results ) {
	const m = ctx.m;
	const nargs = ctx.g.args.length;
	const nw = m.workspaces.length;
	const rows = results.filter( ( x ) => x.row ).map( ( x ) => x.row );
	const unmeasured = Object.assign( {}, m.unmeasured );
	const keep = [];
	m.workspaces.forEach( ( w, j ) => {
		if ( w.kind === 'check' && rows.every( ( row ) => [ 0, 1, 2, 3, 4, 5 ].every( ( k ) => !row[ nargs + k * nw + j ] ) ) ) {
			unmeasured[ w.name ] = 'the reference never rejects it and never writes it: ' + w.length + ' = 0 is accepted and runs clean in every row (INFO != ' + w.info + ')';
		} else {
			keep.push( j );
		}
	});
	if ( !keep.length ) {
		return null;
	}
	// Per workspace: the rows where the reference writes past the length its
	// own check accepts, and the example with the largest overrun.
	const overruns = {};
	results.filter( ( x ) => x.row ).forEach( ( x ) => {
		Object.keys( x.overruns ).forEach( ( W ) => {
			const j = m.workspaces.findIndex( ( w ) => w.name === W );
			const own = x.row[ nargs + j ];
			const o = overruns[ W ] || ( overruns[ W ] = { 'rows': 0, 'example': null, 'own': 0, 'wrote': 0 } );
			o.rows += 1;
			if ( o.example === null || x.overruns[ W ] - own > o.wrote - o.own ) {
				o.example = describe( ctx.g, x.row );
				o.own = own;
				o.wrote = x.overruns[ W ];
			}
		});
	});
	if ( !rows.length ) {
		throw new Error( ctx.r + ': no grid row was measured (' + ctx.g.calls.length + ' calls); widen its grid' );
	}
	return {
		'hash': ctx.hash,
		'grid': ctx.g.hash,
		'calls': ctx.g.calls.length,
		'rejected': results.filter( ( x ) => x.rejected ).length,
		'crashed': results.filter( ( x ) => x.crashed ).length,
		'probes': ctx.calls,
		'faults': ctx.faults,
		'args': ctx.g.args,
		'workspaces': keep.map( ( j ) => {
			const w = m.workspaces[ j ];
			const o = { 'name': w.name, 'kind': w.kind };
			if ( w.kind === 'check' ) {
				o.length = w.length;
				o.info = w.info;
			} else {
				o.fortran = w.fortran;
			}
			return o;
		}),
		'unmeasured': unmeasured,
		'overruns': overruns,
		'randomRaised': Object.fromEntries( SOURCES.slice( 1 ).map( ( src ) => [ src, Object.fromEntries( keep.map( ( j ) => m.workspaces[ j ].name ).map( ( W ) => [ W, results.filter( ( x ) => x.raised && x.raised[ src ] && x.raised[ src ].includes( W ) ).length ] ).filter( ( e ) => e[ 1 ] > 0 ) ) ] ).filter( ( e ) => Object.keys( e[ 1 ] ).length ) ),
		'randomCrashed': results.filter( ( x ) => x.randomCrashed ).length,
		'rows': rows.map( ( row ) => row.slice( 0, nargs ).concat( ...[ 0, 1, 2, 3, 4, 5, 6 ].map( ( k ) => keep.map( ( j ) => row[ nargs + k * nw + j ] ) ), [ row[ nargs + 7 * nw ] ] ) )
	};
}


// CACHE //

// Deterministic, one row per line.
function serialize( cache ) {
	const obj = ( o ) => JSON.stringify( o, Object.keys( o ).sort() );
	const out = [ '{' ];
	out.push( '\t"$comment": ' + JSON.stringify( cache.$comment ) + ',' );
	out.push( '\t"version": ' + cache.version + ',' );
	out.push( '\t"noInfo": ' + JSON.stringify( cache.noInfo ) + ',' );
	out.push( '\t"noCheck": ' + obj( cache.noCheck ) + ',' );
	out.push( '\t"unhandled": ' + obj( cache.unhandled ) + ',' );
	out.push( '\t"routines": {' );
	const names = Object.keys( cache.routines ).sort();
	names.forEach( ( r, k ) => {
		const e = cache.routines[ r ];
		out.push( '\t\t' + JSON.stringify( r ) + ': {' );
		[ 'hash', 'grid', 'calls', 'rejected', 'crashed', 'randomCrashed', 'probes', 'faults', 'args', 'workspaces', 'randomRaised' ].forEach( ( f ) => {
			out.push( '\t\t\t' + JSON.stringify( f ) + ': ' + JSON.stringify( ( e[ f ] === void 0 ) ? null : e[ f ] ) + ',' );
		});
		out.push( '\t\t\t"unmeasured": ' + obj( e.unmeasured ) + ',' );
		out.push( '\t\t\t"overruns": ' + JSON.stringify( Object.fromEntries( Object.keys( e.overruns || {} ).sort().map( ( W ) => [ W, e.overruns[ W ] ] ) ) ) + ',' );
		out.push( '\t\t\t"rows": [' );
		e.rows.forEach( ( row, i ) => out.push( '\t\t\t\t' + JSON.stringify( row ) + ( ( i < e.rows.length - 1 ) ? ',' : '' ) ) );
		out.push( '\t\t\t]' );
		out.push( '\t\t}' + ( ( k < names.length - 1 ) ? ',' : '' ) );
	});
	out.push( '\t}' );
	out.push( '}' );
	return out.join( '\n' ) + '\n';
}

const COMMENT = 'Generated by bin/gen-lwmin.mjs from the reference (CONVENTIONS W3, ticket 0016); read by bin/workspace-minimum.mjs. Per routine: `args` are Fortran argument names (options as Fortran letters; SELECT is the number of leading .TRUE. entries), over the grid of bin/gen-lwkopt.mjs; each row ends with, per workspace of `workspaces`: its minimum and its effective minimum on zero data, the same on seeded random data, the same on that data made rank-deficient (every second column of each 2-D input a copy of the one before; null: that run crashed or was rejected), the length each was given while another was measured, and last the seed of the random data (bin/lib/fortran-ref.mjs fills the real and complex inputs, in argument order, with a Park-Miller sequence from it). A `check` minimum is the smallest length whose call does not return INFO = `info` (min - 1 is rejected); its effective minimum the smallest length at which no callee rejects what the routine passes it either and nothing past the length is written (null: callees reject even at the bound). `overruns`: per workspace, the rows where the reference writes past what its own check accepts (`own`: the minimum of that check, `wrote`: the last element written, in `example`); writes only, reads past the length are not seen. A `declared` minimum (and effective minimum) is the extent the reference declares. Only rows whose arguments the reference accepts are recorded. `unmeasured`: workspaces with no minimum, and why. `noInfo`: modules whose reference has no INFO argument, so rejects nothing. `noCheck`: modules whose reference never rejects any workspace length (value: the entry hash). `unhandled`: modules the generator cannot measure, and why (bin/lib/lwmin.mjs UNHANDLED).';

function readCache() {
	return fs.existsSync( CACHE_FILE ) ? JSON.parse( fs.readFileSync( CACHE_FILE, 'utf8' ) ) : null;
}

function expectedHash( r ) {
	const spec = specLib.load( r );
	if ( !spec ) {
		return { 'error': 'spec/' + r + '.json is gone' };
	}
	const g = grid( spec );
	if ( g.error ) {
		return { 'error': g.error };
	}
	return { 'hash': entryHash( g.hash, measured( spec ) ) };
}

function check() {
	const cache = readCache();
	const problems = [];
	if ( !cache ) {
		console.error( 'gen-lwmin --check: missing ' + path.relative( ROOT, CACHE_FILE ) + '; run node bin/gen-lwmin.mjs' );
		return 1;
	}
	if ( cache.version !== LWMIN_VERSION ) {
		problems.push( 'cache version ' + cache.version + ' != ' + LWMIN_VERSION );
	}
	const scope = routineSet();
	const known = new Set( Object.keys( cache.routines ).concat( cache.noInfo, Object.keys( cache.noCheck ), Object.keys( cache.unhandled ) ) );
	scope.forEach( ( r ) => {
		if ( !known.has( r ) ) {
			problems.push( r + ': module with a workspace-length argument with no entry and no listed reason' );
		}
	});
	cache.noInfo.forEach( ( r ) => {
		if ( hasInfo( specLib.load( r ) || { 'params': [ { 'role': 'info' } ] } ) ) {
			problems.push( r + ': listed as noInfo, but its spec has an INFO argument' );
		}
	});
	Object.keys( cache.unhandled ).concat( Object.keys( UNHANDLED ) ).forEach( ( r ) => {
		if ( cache.unhandled[ r ] !== UNHANDLED[ r ] ) {
			problems.push( r + ': the cache\'s unhandled reason and bin/lib/lwmin.mjs UNHANDLED differ' );
		}
		if ( !scope.includes( r ) ) {
			problems.push( r + ': listed as unhandled but not in scope' );
		}
	});
	const stale = ( r, hash ) => {
		const x = expectedHash( r );
		if ( x.error ) {
			problems.push( r + ': ' + x.error );
		} else if ( x.hash !== hash ) {
			problems.push( r + ': stale (the grid or the workspaces its spec gives have changed)' );
		}
	};
	Object.keys( cache.routines ).concat( Object.keys( cache.noCheck ), cache.noInfo ).forEach( ( r ) => {
		if ( !scope.includes( r ) ) {
			problems.push( r + ': in the cache but no longer in scope' );
		}
	});
	Object.keys( cache.routines ).forEach( ( r ) => stale( r, cache.routines[ r ].hash ) );
	Object.keys( cache.noCheck ).forEach( ( r ) => stale( r, cache.noCheck[ r ] ) );
	problems.forEach( ( p ) => console.log( 'gen-lwmin --check: ' + p ) );
	if ( problems.length ) {
		console.log( 'regenerate with node bin/gen-lwmin.mjs (needs gfortran and the Fortran sources)' );
		return 1;
	}
	console.log( 'gen-lwmin --check: ' + Object.keys( cache.routines ).length + ' routines up to date (' + cache.noInfo.length + ' without INFO, ' + Object.keys( cache.noCheck ).length + ' that reject no workspace, ' + Object.keys( cache.unhandled ).length + ' unhandled)' );
	return 0;
}

async function main( argv ) {
	if ( argv.includes( '--check' ) ) {
		process.exitCode = check();
		return;
	}
	if ( !fs.existsSync( SRC ) ) {
		console.error( 'gen-lwmin: needs the Fortran sources (bin/fetch-reference.sh)' );
		process.exitCode = 2;
		return;
	}
	const t0 = Date.now();
	const ji = argv.indexOf( '--jobs' );
	const jobs = ( ji >= 0 ) ? Math.max( 1, Number( argv[ ji + 1 ] ) ) : Math.max( 1, os.availableParallelism() );
	const only = argv.filter( ( a, i ) => !a.startsWith( '--' ) && argv[ i - 1 ] !== '--jobs' );
	await buildLibrary( jobs, false, 'gen-lwmin' );
	const prev = readCache();
	const cache = ( prev && only.length ) ? prev : { 'routines': {}, 'noInfo': [], 'noCheck': {}, 'unhandled': {} };
	cache.$comment = COMMENT;
	cache.version = LWMIN_VERSION;
	const todo = [];
	( only.length ? only : routineSet() ).forEach( ( r ) => {
		delete cache.routines[ r ];
		delete cache.noCheck[ r ];
		delete cache.unhandled[ r ];
		cache.noInfo = cache.noInfo.filter( ( x ) => x !== r );
		const spec = specLib.load( r );
		if ( !hasInfo( spec ) ) {
			cache.noInfo.push( r );
		} else if ( r in UNHANDLED ) {
			cache.unhandled[ r ] = UNHANDLED[ r ];
		} else {
			todo.push( r );
		}
	});
	cache.noInfo.sort();
	const ctxs = await pool( todo, jobs, prepare );
	const tasks = [];
	ctxs.forEach( ( ctx ) => {
		for ( let i = 0; i < ctx.g.calls.length; i += CHUNK ) {
			tasks.push( { 'ctx': ctx, 'from': i, 'to': Math.min( ctx.g.calls.length, i + CHUNK ) } );
		}
	});
	let done = 0;
	const res = await pool( tasks, jobs, async ( t ) => {
		const x = await runChunk( t.ctx, t.from, t.to );
		done += 1;
		if ( process.stderr.isTTY ) {
			process.stderr.write( '\rgen-lwmin: ' + done + '/' + tasks.length + ' chunks   ' );
		}
		return x;
	});
	if ( process.stderr.isTTY ) {
		process.stderr.write( '\n' );
	}
	ctxs.forEach( ( ctx ) => {
		const results = [];
		tasks.forEach( ( t, i ) => {
			if ( t.ctx === ctx ) {
				res[ i ].forEach( ( x ) => results.push( x ) );
			}
		});
		results.filter( ( x ) => x.crashed ).forEach( ( x ) => console.log( 'crashed   ' + ctx.r + ': ' + x.crashed ) );
		const e = assemble( ctx, results );
		if ( e === null ) {
			cache.noCheck[ ctx.r ] = ctx.hash;
		} else {
			cache.routines[ ctx.r ] = e;
		}
	});
	fs.writeFileSync( CACHE_FILE, serialize( cache ) );
	const n = Object.values( cache.routines ).reduce( ( a, e ) => a + e.rows.length, 0 );
	console.log( 'gen-lwmin: ' + Object.keys( cache.routines ).length + ' routines, ' + n + ' rows; ' + cache.noInfo.length + ' without INFO; ' + Object.keys( cache.noCheck ).length + ' rejecting no workspace; ' + Object.keys( cache.unhandled ).length + ' unhandled; ' + ( ( Date.now() - t0 ) / 1000 ).toFixed( 0 ) + ' s -> ' + path.relative( ROOT, CACHE_FILE ) );
}

main( process.argv.slice( 2 ) );
