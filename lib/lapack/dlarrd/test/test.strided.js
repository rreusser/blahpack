
/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import stridedFn from './../lib/strided.js';
import base from './../lib/base.js';
import dsterf from './../../dsterf/lib/base.js';


// FIXTURES //

const fixtures = readFileSync( resolve( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures', 'dlarrd.jsonl' ), 'utf8' )
	.trim()
	.split( '\n' )
	.map( function parse( line ) { return JSON.parse( line ); } );

function byName( name ) {
	for ( let i = 0; i < fixtures.length; i++ ) {
		if ( fixtures[ i ].name === name ) {
			return fixtures[ i ];
		}
	}
	throw new Error( 'missing fixture: ' + name );
}


// HELPERS //

const SAFEMN = 2.2250738585072014e-308;
const EPS = 2.220446049250313e-16;
const PIVMIN = SAFEMN;
const RELTOL = EPS * 4.0;

function buildGers( d, e, N ) {
	const GERS = new Float64Array( 2 * N );
	let i, tmp;
	if ( N === 1 ) {
		GERS[ 0 ] = d[ 0 ];
		GERS[ 1 ] = d[ 0 ];
		return GERS;
	}
	GERS[ 0 ] = d[ 0 ] - Math.abs( e[ 0 ] );
	GERS[ 1 ] = d[ 0 ] + Math.abs( e[ 0 ] );
	for ( i = 1; i < N - 1; i++ ) {
		tmp = Math.abs( e[ i - 1 ] ) + Math.abs( e[ i ] );
		GERS[ 2 * i ] = d[ i ] - tmp;
		GERS[ 2 * i + 1 ] = d[ i ] + tmp;
	}
	GERS[ 2 * (N - 1) ] = d[ N - 1 ] - Math.abs( e[ N - 2 ] );
	GERS[ 2 * (N - 1) + 1 ] = d[ N - 1 ] + Math.abs( e[ N - 2 ] );
	return GERS;
}


// TESTS //

test( 'strided is a function', function t() {
	assert.strictEqual( typeof stridedFn, 'function', 'is a function' );
});

test( 'strided is a function', function t() {
	assert.strictEqual( typeof stridedFn, 'function', 'is a function' );
});

test( 'strided: unit-stride zero-offset matches fixture (range=all, 5x5)', function t() {
	const m = new Int32Array( 1 );
	const wl = new Float64Array( 1 );
	const wu = new Float64Array( 1 );
	const N = 5;
	const d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	const E2 = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = e[ i ] * e[ i ];
	}
	const GERS = buildGers( d, e, N );
	const ISPLIT = new Int32Array( [ 5 ] );
	const w = new Float64Array( N );
	const WERR = new Float64Array( N );
	const IBLOCK = new Int32Array( N );
	const INDEXW = new Int32Array( N );

	const res = stridedFn( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, m, w, 1, 0, WERR, 1, 0, wl, wu, IBLOCK, 1, 0, INDEXW, 1, 0, new Float64Array( Math.max( 1, 4 * N ) ), 1, 0, new Int32Array( Math.max( 1, 3 * N ) ), 1, 0 );

	const expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res, expected.info, 'info' );
	assert.strictEqual( m[ 0 ], expected.m, 'm' );
	for ( i = 0; i < m[ 0 ]; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + ']' );
		assert.strictEqual( IBLOCK[ i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'strided: non-zero offsets on d, e, E2, GERS match fixture', function t() {
	const m = new Int32Array( 1 );
	const wl = new Float64Array( 1 );
	const wu = new Float64Array( 1 );
	const N = 5;

	// Prepad each input by 2 elements
	const d = new Float64Array( [ 0.0, 0.0, 2.0, -1.0, 3.0, 0.5, 4.0 ] );
	const e = new Float64Array( [ 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	const E2 = new Float64Array( 7 );
	let i;
	for ( i = 0; i < N; i++ ) {
		E2[ 2 + i ] = e[ 2 + i ] * e[ 2 + i ];
	}
	// Build GERS normally, then prepad
	const baseGers = buildGers(
		new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] ),
		new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] ),
		N
	);
	const GERS = new Float64Array( 2 * N + 3 );
	for ( i = 0; i < 2 * N; i++ ) {
		GERS[ 3 + i ] = baseGers[ i ];
	}

	const ISPLIT = new Int32Array( [ 0, 5 ] );
	const w = new Float64Array( N + 1 );
	const WERR = new Float64Array( N + 1 );
	const IBLOCK = new Int32Array( N + 1 );
	const INDEXW = new Int32Array( N + 1 );

	const res = stridedFn( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 3, RELTOL, d, 1, 2, e, 1, 2, E2, 1, 2, PIVMIN, 1, ISPLIT, 1, 1, m, w, 1, 1, WERR, 1, 1, wl, wu, IBLOCK, 1, 1, INDEXW, 1, 1, new Float64Array( Math.max( 1, 4 * N ) ), 1, 0, new Int32Array( Math.max( 1, 3 * N ) ), 1, 0 );

	const expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res, expected.info, 'info' );
	assert.strictEqual( m[ 0 ], expected.m, 'm' );
	for ( i = 0; i < m[ 0 ]; i++ ) {
		assert.ok( Math.abs( w[ 1 + i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ 1 + i ] + ' vs ' + expected.w[ i ] );
		assert.strictEqual( IBLOCK[ 1 + i ], expected.iblock[ i ], 'iblock[' + i + ']' );
	}
});

test( 'strided: non-unit stride on d and e match fixture', function t() {
	const m = new Int32Array( 1 );
	const wl = new Float64Array( 1 );
	const wu = new Float64Array( 1 );
	const N = 5;

	// Interleave d with zeros at stride 2
	const d = new Float64Array( [ 2.0, 0.0, -1.0, 0.0, 3.0, 0.0, 0.5, 0.0, 4.0 ] );
	const e = new Float64Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0 ] );
	const E2src = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
	const E2 = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		E2[ i ] = E2src[ i ];
	}
	const GERS = buildGers(
		new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] ),
		new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] ),
		N
	);
	const ISPLIT = new Int32Array( [ 5 ] );
	const w = new Float64Array( N );
	const WERR = new Float64Array( N );
	const IBLOCK = new Int32Array( N );
	const INDEXW = new Int32Array( N );

	const res = stridedFn( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 2, 0, e, 2, 0, E2, 1, 0, PIVMIN, 1, ISPLIT, 1, 0, m, w, 1, 0, WERR, 1, 0, wl, wu, IBLOCK, 1, 0, INDEXW, 1, 0, new Float64Array( Math.max( 1, 4 * N ) ), 1, 0, new Int32Array( Math.max( 1, 3 * N ) ), 1, 0 );

	const expected = byName( 'range_all_order_entire' );
	assert.strictEqual( res, expected.info, 'info' );
	assert.strictEqual( m[ 0 ], expected.m, 'm' );
	for ( i = 0; i < m[ 0 ]; i++ ) {
		assert.ok( Math.abs( w[ i ] - expected.w[ i ] ) < 1e-12, 'w[' + i + '] ' + w[ i ] + ' vs ' + expected.w[ i ] );
	}
});


// MULTI-BLOCK, RANGE AND ORDER //

/**
* Gershgorin intervals of each diagonal block given 1-based block ends `split`.
*/
function blockGers( d, e, split ) {
	const GERS = new Float64Array( 2 * d.length );
	let first = 0;
	let i, k, t;
	for ( k = 0; k < split.length; k++ ) {
		for ( i = first; i < split[ k ]; i++ ) {
			t = 0.0;
			if ( i > first ) {
				t += Math.abs( e[ i - 1 ] );
			}
			if ( i < split[ k ] - 1 ) {
				t += Math.abs( e[ i ] );
			}
			GERS[ 2 * i ] = d[ i ] - t;
			GERS[ ( 2 * i ) + 1 ] = d[ i ] + t;
		}
		first = split[ k ];
	}
	return GERS;
}

/**
* Ascending eigenvalues of the tridiagonal (d, e) rows [lo, hi) via dsterf.
*/
function refEig( d, e, lo, hi ) {
	const dd = new Float64Array( d.slice( lo, hi ) );
	const ee = new Float64Array( Math.max( 1, hi - lo - 1 ) );
	let i;
	for ( i = lo; i < hi - 1; i++ ) {
		ee[ i - lo ] = e[ i ];
	}
	dsterf( hi - lo, dd, 1, 0, ee, 1, 0 );
	return Array.from( dd );
}

function runSplit( range, order, d, e, split, vl, vu, il, iu, reltol ) {
	const N = d.length;
	const E2 = new Float64Array( N );
	const m = new Int32Array( 1 );
	const w = new Float64Array( N );
	const WERR = new Float64Array( N );
	const wl = new Float64Array( 1 );
	const wu = new Float64Array( 1 );
	const IBLOCK = new Int32Array( N );
	const INDEXW = new Int32Array( N );
	let i;
	for ( i = 0; i < N - 1; i++ ) {
		E2[ i ] = e[ i ] * e[ i ];
	}
	const info = stridedFn( range, order, N, vl, vu, il, iu, blockGers( d, e, split ), 1, 0, reltol, new Float64Array( d ), 1, 0, new Float64Array( e ), 1, 0, E2, 1, 0, PIVMIN, split.length, new Int32Array( split ), 1, 0, m, w, 1, 0, WERR, 1, 0, wl, wu, IBLOCK, 1, 0, INDEXW, 1, 0, new Float64Array( 4 * N ), 1, 0, new Int32Array( 3 * N ), 1, 0 );
	return {
		'info': info,
		'm': m[ 0 ],
		'w': Array.from( w.slice( 0, m[ 0 ] ) ),
		'werr': Array.from( WERR.slice( 0, m[ 0 ] ) ),
		'iblock': Array.from( IBLOCK.slice( 0, m[ 0 ] ) ),
		'indexw': Array.from( INDEXW.slice( 0, m[ 0 ] ) )
	};
}

/**
* Asserts that each returned eigenvalue is the INDEXW-th eigenvalue of block |IBLOCK| (within tol) and that the values match `expected` (sorted copy compared when `sorted`).
*/
function checkBlocks( r, d, e, split, expected, tol, msg ) {
	const got = r.w.slice();
	let blk, lo, k;
	assert.equal( r.m, expected.length, msg + ': m' );
	for ( k = 0; k < r.m; k++ ) {
		blk = Math.abs( r.iblock[ k ] );
		assert.ok( blk >= 1 && blk <= split.length, msg + ': iblock in range' );
		lo = ( blk === 1 ) ? 0 : split[ blk - 2 ];
		assertClose( r.w[ k ], refEig( d, e, lo, split[ blk - 1 ] )[ r.indexw[ k ] - 1 ], tol, msg + ': w[' + k + '] is eigenvalue ' + r.indexw[ k ] + ' of block ' + blk );
	}
	got.sort( function cmp( a, b ) {
		return a - b;
	} );
	for ( k = 0; k < r.m; k++ ) {
		assertClose( got[ k ], expected[ k ], tol, msg + ': sorted w[' + k + ']' );
	}
}

function assertClose( actual, expected, tol, msg ) {
	assert.ok( Math.abs( actual - expected ) <= tol * Math.max( 1.0, Math.abs( expected ) ), msg + ': expected ' + expected + ', got ' + actual );
}

// Blocks (1-based ends): [1] 1x1, [2..4] 3x3, [5] 1x1, [6..7] 2x2; e is zero at the splits.
const SD = [ 1.0, 2.0, -1.0, 3.0, 1.0, 0.5, 4.0 ];
const SE = [ 0.0, 0.5, 0.7, 0.0, 0.0, 1.0, 0.0 ];
const SPLIT = [ 1, 4, 5, 7 ];
const BTOL = 1.0e-13;

test( 'strided: four blocks (two 1x1), range=all, order=block: per-block eigenvalues and IBLOCK/INDEXW', function t() {
	const r = runSplit( 'all', 'block', SD, SE, SPLIT, 0.0, 0.0, 0, 0, RELTOL );
	let k;
	assert.equal( r.info, 0, 'info' );
	checkBlocks( r, SD, SE, SPLIT, refEig( SD, SE, 0, 7 ), BTOL, 'all/block' );

	// Block order: IBLOCK is non-decreasing and INDEXW counts up within each block.
	assert.deepEqual( r.iblock, [ 1, 2, 2, 2, 3, 4, 4 ], 'iblock' );
	assert.deepEqual( r.indexw, [ 1, 1, 2, 3, 1, 1, 2 ], 'indexw' );
	for ( k = 0; k < r.m; k++ ) {
		assert.ok( r.werr[ k ] >= 0.0 && r.werr[ k ] <= BTOL, 'werr' );
	}
});

test( 'strided: four blocks, range=index il=1 iu=N (treated as all), order=entire: sorted ascending', function t() {
	const r = runSplit( 'index', 'entire', SD, SE, SPLIT, 0.0, 0.0, 1, 7, RELTOL );
	const expected = refEig( SD, SE, 0, 7 );
	let k;
	assert.equal( r.info, 0, 'info' );
	checkBlocks( r, SD, SE, SPLIT, expected, BTOL, 'index 1..N' );
	for ( k = 0; k < r.m; k++ ) {
		assertClose( r.w[ k ], expected[ k ], BTOL, 'ascending w[' + k + ']' );
	}
});

test( 'strided: four blocks, range=value (0.9, 3.5]: 1x1 blocks inside the range, count matches', function t() {
	const all = refEig( SD, SE, 0, 7 );
	const expected = all.filter( function inRange( v ) {
		return v > 0.9 && v <= 3.5;
	} );
	const r = runSplit( 'value', 'entire', SD, SE, SPLIT, 0.9, 3.5, 0, 0, RELTOL );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.m, 4, 'm = number of eigenvalues in (0.9, 3.5]' );
	checkBlocks( r, SD, SE, SPLIT, expected, BTOL, 'value' );
});

test( 'strided: four blocks, range=value (3.8, 5]: blocks wholly below vl are skipped', function t() {
	const expected = refEig( SD, SE, 0, 7 ).filter( function inRange( v ) {
		return v > 3.8 && v <= 5.0;
	} );
	const r = runSplit( 'value', 'block', SD, SE, SPLIT, 3.8, 5.0, 0, 0, RELTOL );
	assert.equal( r.info, 0, 'info' );
	assert.equal( expected.length, 1, 'one eigenvalue in range' );
	checkBlocks( r, SD, SE, SPLIT, expected, BTOL, 'value high' );
	assert.deepEqual( r.iblock, [ 4 ], 'eigenvalue comes from block 4' );
	assert.deepEqual( r.indexw, [ 2 ], 'it is the larger eigenvalue of block 4' );
});

test( 'strided: four blocks, range=index il=3 iu=5: M = iu-il+1 and the 3rd..5th eigenvalues', function t() {
	const expected = refEig( SD, SE, 0, 7 ).slice( 2, 5 );
	const r = runSplit( 'index', 'entire', SD, SE, SPLIT, 0.0, 0.0, 3, 5, RELTOL );
	assert.equal( r.info, 0, 'info' );
	checkBlocks( r, SD, SE, SPLIT, expected, BTOL, 'index 3..5' );
});

test( 'strided: repeated eigenvalue across 1x1 blocks, range=index discards the surplus copies', function t() {
	// Diagonal of four equal 1x1 blocks: every eigenvalue is 1, so the bracketing interval holds all four and the surplus must be discarded below il and above iu.
	const d = [ 1.0, 1.0, 1.0, 1.0 ];
	const e = [ 0.0, 0.0, 0.0, 0.0 ];
	const split = [ 1, 2, 3, 4 ];
	let r = runSplit( 'index', 'entire', d, e, split, 0.0, 0.0, 2, 3, RELTOL );
	assert.equal( r.info, 0, 'info il=2 iu=3' );
	checkBlocks( r, d, e, split, [ 1.0, 1.0 ], 0.0, 'il=2 iu=3' );
	assert.notEqual( r.iblock[ 0 ], r.iblock[ 1 ], 'distinct blocks' );
	r = runSplit( 'index', 'block', d, e, split, 0.0, 0.0, 2, 2, RELTOL );
	assert.equal( r.info, 0, 'info il=iu=2' );
	checkBlocks( r, d, e, split, [ 1.0 ], 0.0, 'il=iu=2' );
	r = runSplit( 'index', 'block', d, e, split, 0.0, 0.0, 1, 1, RELTOL );
	assert.equal( r.info, 0, 'info il=iu=1' );
	checkBlocks( r, d, e, split, [ 1.0 ], 0.0, 'il=iu=1' );
	r = runSplit( 'index', 'block', d, e, split, 0.0, 0.0, 4, 4, RELTOL );
	assert.equal( r.info, 0, 'info il=iu=4' );
	checkBlocks( r, d, e, split, [ 1.0 ], 0.0, 'il=iu=4' );
});

test( 'strided: reltol=0 cannot converge below one ulp: as in the reference, DLAEBZ\'s IINFO is returned with M counting only the earlier blocks', function t() {
	// The reference returns INFO = IINFO as soon as DLAEBZ (IJOB = 2) leaves an interval unconverged; the old code went on and returned INFO = 1 with negative IBLOCK entries (see test/harness/LEARNINGS.md, 2026-11-27, dlarrd).
	const tc = byName( 'given_r_reltol0' );
	const r = runSplit( 'all', 'entire', SD, SE, SPLIT, 0.0, 0.0, 0, 0, 0.0 );
	assert.equal( tc.info, 3, 'reference info' );
	assert.equal( r.info, tc.info, 'info = IINFO of the 3x3 block' );
	assert.equal( r.m, tc.m, 'm counts only the 1x1 block before it' );
	assert.deepStrictEqual( r.w, tc.w.slice( 0, tc.m ), 'w' );
	assert.deepStrictEqual( r.werr, tc.werr.slice( 0, tc.m ), 'werr' );
	assert.deepStrictEqual( r.iblock, tc.iblock.slice( 0, tc.m ), 'iblock' );
	assert.deepStrictEqual( r.indexw, tc.indexw.slice( 0, tc.m ), 'indexw' );
});

test( 'strided: ISPLIT covering only the leading rows yields too few eigenvalues (info=2)', function t() {
	// nsplit=1, ISPLIT=[4]: only rows 1..4 are searched, so M=4 < N=5 for range=all.
	const d = [ 2.0, -1.0, 3.0, 0.5, 4.0 ];
	const e = [ 1.0, 1.0, 1.0, 0.0, 0.0 ];
	const r = runSplit( 'all', 'block', d, e, [ 4 ], 0.0, 0.0, 0, 0, RELTOL );
	assert.equal( r.info, 2, 'info = 2 (too few eigenvalues)' );
	checkBlocks( r, d, e, [ 4 ], refEig( d, e, 0, 4 ), BTOL, 'leading block' );
});

test( 'base: invalid range or order returns info -1 / -2 with m=0', function t() {
	const N = 2;
	const d = new Float64Array( [ 1.0, 2.0 ] );
	const e = new Float64Array( [ 0.5, 0.0 ] );
	const E2 = new Float64Array( [ 0.25, 0.0 ] );
	const GERS = buildGers( d, e, N );
	const m = new Int32Array( [ 9 ] );
	const args = [ N, 0.0, 0.0, 0, 0, GERS, 1, 0, RELTOL, d, 1, 0, e, 1, 0, E2, 1, 0, PIVMIN, 1, new Int32Array( [ 2 ] ), 1, 0, m, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Int32Array( N ), 1, 0, new Int32Array( N ), 1, 0, new Float64Array( 4 * N ), 1, 0, new Int32Array( 3 * N ), 1, 0 ];
	assert.equal( base( 'bogus', 'entire', ...args ), -1, 'info=-1' );
	assert.equal( m[ 0 ], 0, 'm=0' );
	m[ 0 ] = 9;
	assert.equal( base( 'all', 'bogus', ...args ), -2, 'info=-2' );
	assert.equal( m[ 0 ], 0, 'm=0' );
});

test( 'strided: cluster split across blocks, range=index: bisection-rounded copies are discarded by value (both ends)', function t() {
	// Three 2x2 blocks [[1+t, s], [s, 1+t+u]] with s = sqrt(t*(t+u)), so each block's smaller eigenvalue is 1 in exact arithmetic. The per-block bisection midpoints land above the global bracket end, so the surplus copies below il (and, negated, above iu) are removed by the discard-by-value loops.
	const d = [ 1.4882907792172821, 1.891417084071514, 1.9421491009612333, 2.3420889564054503, 1.8516292121268947, 2.8837974288425396 ];
	const e = [ 0.6597505154138772, 0.0, 1.1244767243866787, 0.0, 1.2666084320467166, 0.0 ];
	const split = [ 2, 4, 6 ];
	const nd = d.map( function neg( v ) {
		return -v;
	} );
	let r = runSplit( 'index', 'block', d, e, split, 0.0, 0.0, 2, 3, RELTOL );
	assert.equal( r.info, 0, 'info (low end)' );
	checkBlocks( r, d, e, split, refEig( d, e, 0, 6 ).slice( 1, 3 ), BTOL, 'il=2 iu=3' );
	r = runSplit( 'index', 'block', nd, e, split, 0.0, 0.0, 4, 5, RELTOL );
	assert.equal( r.info, 0, 'info (high end)' );
	checkBlocks( r, nd, e, split, refEig( nd, e, 0, 6 ).slice( 3, 5 ), BTOL, 'negated il=4 iu=5' );
});

test( 'strided: range=value (-3, -0.6]: a block whose Gershgorin interval lies above vu is skipped', function t() {
	// Block 4 (rows 6..7) has Gershgorin interval [-0.5, 2] > vu, block 2 holds the only eigenvalue in range.
	const expected = refEig( SD, SE, 0, 7 ).filter( function inRange( v ) {
		return v > -3.0 && v <= -0.6;
	} );
	const r = runSplit( 'value', 'entire', SD, SE, SPLIT, -3.0, -0.6, 0, 0, RELTOL );
	assert.equal( r.info, 0, 'info' );
	assert.equal( expected.length, 1, 'one eigenvalue in range' );
	checkBlocks( r, SD, SE, SPLIT, expected, BTOL, 'value low' );
	assert.deepEqual( r.iblock, [ 2 ], 'from block 2' );
	assert.deepEqual( r.indexw, [ 1 ], 'smallest of block 2' );
});


// REFERENCE CASES FOUND BY MUTATION (ticket 0110) //

test( 'strided: reference cases that separate base.js mutants (info, m, w, werr, iblock, indexw, wl, wu bit for bit)', function t() {
	const RANGES = {
		'A': 'all',
		'V': 'value',
		'I': 'index'
	};
	const cases = fixtures.filter( function isGiven( c ) {
		return c.name.indexOf( 'given_' ) === 0;
	});
	let INDEXW;
	let IBLOCK;
	let WERR;
	let info;
	let tc;
	let wl;
	let wu;
	let k;
	let m;
	let w;
	let N;
	assert.ok( cases.length > 40, 'fixture cases present' );
	for ( k = 0; k < cases.length; k++ ) {
		tc = cases[ k ];
		N = tc.N;
		m = new Int32Array( [ 5 ] );
		w = new Float64Array( N ).fill( 0.125 );
		WERR = new Float64Array( N ).fill( 0.125 );
		IBLOCK = new Int32Array( N ).fill( 7 );
		INDEXW = new Int32Array( N ).fill( 7 );
		wl = new Float64Array( 1 );
		wu = new Float64Array( 1 );
		info = stridedFn( RANGES[ tc.range ], ( tc.order === 'B' ) ? 'block' : 'entire', N, tc.vl, tc.vu, tc.il, tc.iu, new Float64Array( tc.gers ), 1, 0, tc.reltol, new Float64Array( tc.d ), 1, 0, new Float64Array( tc.e ), 1, 0, new Float64Array( tc.e2 ), 1, 0, tc.pivmin, tc.nsplit, new Int32Array( tc.isplit ), 1, 0, m, w, 1, 0, WERR, 1, 0, wl, wu, IBLOCK, 1, 0, INDEXW, 1, 0, new Float64Array( 4 * N ), 1, 0, new Int32Array( 3 * N ), 1, 0 );
		assert.equal( info, tc.info, tc.name + ': info' );
		assert.equal( m[ 0 ], tc.m, tc.name + ': m' );
		assert.deepStrictEqual( Array.from( w.slice( 0, tc.m ) ), tc.w.slice( 0, tc.m ), tc.name + ': w' );
		assert.deepStrictEqual( Array.from( WERR.slice( 0, tc.m ) ), tc.werr.slice( 0, tc.m ), tc.name + ': werr' );
		assert.deepStrictEqual( Array.from( IBLOCK.slice( 0, tc.m ) ), tc.iblock.slice( 0, tc.m ), tc.name + ': iblock' );
		assert.deepStrictEqual( Array.from( INDEXW.slice( 0, tc.m ) ), tc.indexw.slice( 0, tc.m ), tc.name + ': indexw' );
		assert.ok( Object.is( wl[ 0 ], tc.wl ), tc.name + ': wl expected ' + tc.wl + ', got ' + wl[ 0 ] );
		assert.ok( Object.is( wu[ 0 ], tc.wu ), tc.name + ': wu expected ' + tc.wu + ', got ' + wu[ 0 ] );
	}
});
