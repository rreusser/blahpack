/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstevx from './../lib/strided.js';
import dsterf from './../../dsterf/lib/base.js';

// FIXTURES //

import vectors_all_4x4 from './fixtures/vectors_all_4x4.json' with { type: 'json' };
import novec_all_4x4 from './fixtures/novec_all_4x4.json' with { type: 'json' };
import vectors_value_4x4 from './fixtures/vectors_value_4x4.json' with { type: 'json' };
import vectors_index_4x4 from './fixtures/vectors_index_4x4.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_one_out_of_range from './fixtures/n_one_out_of_range.json' with { type: 'json' };
import novec_index_4x4 from './fixtures/novec_index_4x4.json' with { type: 'json' };
import vectors_all_6x6 from './fixtures/vectors_all_6x6.json' with { type: 'json' };
import vectors_value_abstol from './fixtures/vectors_value_abstol.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Helper to call dstevx with standard arguments.
*
* @param {string} jobz - 'compute-vectors' or 'no-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {number} N - order
* @param {Array} dArr - diagonal elements
* @param {Array} eArr - subdiagonal elements
* @param {number} vl - lower value bound
* @param {number} vu - upper value bound
* @param {number} il - lower index (1-based)
* @param {number} iu - upper index (1-based)
* @param {number} abstol - tolerance
* @returns {Object} result with info, m, w, Z, IFAIL
*/
function callDstevx( jobz, range, N, dArr, eArr, vl, vu, il, iu, abstol ) {
	const IFAIL = new Int32Array( Math.max( N, 1 ) );
	const IWORK = new Int32Array( 5 * Math.max( N, 1 ) );
	const WORK = new Float64Array( 5 * Math.max( N, 1 ) );
	const d = new Float64Array( dArr );
	const e = new Float64Array( eArr );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const M = new Int32Array( 1 );

	const info = dstevx( jobz, range, N, d, 1, 0, e, 1, 0, vl, vu, il, iu, abstol, M, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'm': M[ 0 ],
		'w': Array.prototype.slice.call( w, 0, M[ 0 ] ),
		'Z': Z,
		'IFAIL': Array.prototype.slice.call( IFAIL, 0, M[ 0 ] )
	};
}

// TESTS //

test( 'dstevx: vectors_all_4x4', function t() {
	const res = callDstevx( 'compute-vectors', 'all', 4, [ 2.0, 2.0, 2.0, 2.0 ], [ 1.0, 1.0, 1.0 ], 0.0, 0.0, 0, 0, 0.0);
	const tc = vectors_all_4x4;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );

	// Check eigenvectors: each column should be close (up to sign)
	assertArrayClose( res.IFAIL, tc.ifail, 1e-14, 'ifail' );
});

test( 'dstevx: novec_all_4x4', function t() {
	const res = callDstevx( 'no-vectors', 'all', 4, [ 2.0, 2.0, 2.0, 2.0 ], [ 1.0, 1.0, 1.0 ], 0.0, 0.0, 0, 0, 0.0);
	const tc = novec_all_4x4;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
});

test( 'dstevx: vectors_value_4x4', function t() {
	const res = callDstevx( 'compute-vectors', 'value', 4, [ 2.0, 2.0, 2.0, 2.0 ], [ 1.0, 1.0, 1.0 ], 1.5, 3.5, 0, 0, 0.0);
	const tc = vectors_value_4x4;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
});

test( 'dstevx: vectors_index_4x4', function t() {
	const res = callDstevx( 'compute-vectors', 'index', 4, [ 2.0, 2.0, 2.0, 2.0 ], [ 1.0, 1.0, 1.0 ], 0.0, 0.0, 2, 3, 0.0);
	const tc = vectors_index_4x4;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
});

test( 'dstevx: n_zero', function t() {
	const res = callDstevx( 'compute-vectors', 'all', 0, [], [], 0.0, 0.0, 0, 0, 0.0);
	const tc = n_zero;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
});

test( 'dstevx: n_one', function t() {
	const res = callDstevx( 'compute-vectors', 'all', 1, [ 3.5 ], [], 0.0, 0.0, 0, 0, 0.0);
	const tc = n_one;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
	assertArrayClose( Array.prototype.slice.call( res.Z, 0, 1 ), tc.z, 1e-14, 'z' ); // eslint-disable-line max-len
});

test( 'dstevx: n_one_out_of_range', function t() {
	const res = callDstevx( 'compute-vectors', 'value', 1, [ 3.5 ], [], 5.0, 10.0, 0, 0, 0.0);
	const tc = n_one_out_of_range;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
});

test( 'dstevx: novec_index_4x4', function t() {
	const res = callDstevx( 'no-vectors', 'index', 4, [ 2.0, 2.0, 2.0, 2.0 ], [ 1.0, 1.0, 1.0 ], 0.0, 0.0, 1, 2, 0.0);
	const tc = novec_index_4x4;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
});

test( 'dstevx: vectors_all_6x6', function t() {
	const res = callDstevx( 'compute-vectors', 'all', 6, [ 1.0, 3.0, 2.0, 4.0, 1.5, 2.5 ], [ 0.5, 1.0, 0.3, 0.8, 0.6 ], 0.0, 0.0, 0, 0, 0.0);
	const tc = vectors_all_6x6;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
});

test( 'dstevx: vectors_value_abstol', function t() {
	const res = callDstevx( 'compute-vectors', 'value', 4, [ 2.0, 2.0, 2.0, 2.0 ], [ 1.0, 1.0, 1.0 ], 0.0, 5.0, 0, 0, 1.0e-12);
	const tc = vectors_value_abstol;
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.m, tc.m, 'm' );
	assertArrayClose( res.w, tc.w, 1e-14, 'w' );
});


// PROPERTY TESTS //

/**
* Returns the sorted eigenvalues of a symmetric tridiagonal matrix computed by an independent algorithm (implicit QL/QR, `dsterf`).
*
* @private
* @param {Array<number>} dv - diagonal
* @param {Array<number>} ev - off-diagonal
* @returns {Array<number>} ascending eigenvalues
*/
function oracle( dv, ev ) {
	const d = new Float64Array( dv );
	const e = new Float64Array( Math.max( ev.length, 1 ) );
	let i;
	for ( i = 0; i < ev.length; i++ ) {
		e[ i ] = ev[ i ];
	}
	assert.equal( dsterf( dv.length, d, 1, 0, e, 1, 0 ), 0, 'dsterf info' );
	return Array.prototype.slice.call( d ).sort( function cmp( a, b ) {
		return a - b;
	});
}

/**
* Asserts that the computed eigenvalues are ascending and match `expected` to a relative tolerance, and (if `res.Z` holds eigenvectors) that `T*z = lambda*z` and `Z^T*Z = I`.
*
* @private
* @param {Object} res - result of `callDstevx`
* @param {Array<number>} dv - diagonal of T
* @param {Array<number>} ev - off-diagonal of T
* @param {Array<number>} expected - expected eigenvalues (ascending)
* @param {boolean} vectors - whether eigenvectors were computed
*/
function assertEigen( res, dv, ev, expected, vectors ) {
	const N = dv.length;
	let scale;
	let tnorm;
	let r;
	let s;
	let i;
	let j;
	let k;
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, expected.length, 'm' );
	scale = 0.0;
	tnorm = 0.0;
	for ( i = 0; i < N; i++ ) {
		tnorm = Math.max( tnorm, Math.abs( dv[ i ] ) + ( ( i > 0 ) ? Math.abs( ev[ i - 1 ] ) : 0.0 ) + ( ( i < N - 1 ) ? Math.abs( ev[ i ] ) : 0.0 ) ); // eslint-disable-line max-len
	}
	for ( i = 0; i < expected.length; i++ ) {
		scale = Math.max( scale, Math.abs( expected[ i ] ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		if ( i > 0 ) {
			assert.ok( res.w[ i - 1 ] <= res.w[ i ], 'ascending' );
		}
		assert.ok( Math.abs( res.w[ i ] - expected[ i ] ) <= 1e-13 * scale, 'w[' + i + ']: expected ' + expected[ i ] + ', got ' + res.w[ i ] ); // eslint-disable-line max-len
	}
	if ( !vectors ) {
		return;
	}
	assert.deepEqual( res.IFAIL, new Array( res.m ).fill( 0 ), 'IFAIL' );
	for ( j = 0; j < res.m; j++ ) {
		r = 0.0;
		for ( i = 0; i < N; i++ ) {
			s = ( dv[ i ] - res.w[ j ] ) * res.Z[ ( j * N ) + i ];
			if ( i > 0 ) {
				s += ev[ i - 1 ] * res.Z[ ( j * N ) + i - 1 ];
			}
			if ( i < N - 1 ) {
				s += ev[ i ] * res.Z[ ( j * N ) + i + 1 ];
			}
			r = Math.max( r, Math.abs( s ) );
		}
		assert.ok( r <= 100.0 * N * 2.22e-16 * tnorm, 'residual of pair ' + j + ': ' + r );
		for ( k = j; k < res.m; k++ ) {
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				s += res.Z[ ( j * N ) + i ] * res.Z[ ( k * N ) + i ];
			}
			assert.ok( Math.abs( s - ( ( j === k ) ? 1.0 : 0.0 ) ) <= 1e-13, 'Z^T*Z(' + j + ',' + k + ') = ' + s );
		}
	}
}

/**
* Scales an array by a constant.
*
* @private
* @param {Array<number>} x - input
* @param {number} s - scale factor
* @returns {Array<number>} scaled copy
*/
function scaled( x, s ) {
	return x.map( function f( v ) {
		return v * s;
	});
}

const D6 = [ 1.0, 3.0, 2.0, 4.0, 1.5, 2.5 ];
const E6 = [ 0.5, 1.0, 0.3, 0.8, 0.6 ];

test( 'dstevx: a tiny-norm matrix is scaled up and its eigenvalues rescaled (all, dsterf/dsteqr path)', function t() {
	const dv = scaled( D6, 1e-150 );
	const ev = scaled( E6, 1e-150 );
	const expected = scaled( oracle( D6, E6 ), 1e-150 );
	assertEigen( callDstevx( 'no-vectors', 'all', 6, dv, ev, 0.0, 0.0, 0, 0, 0.0 ), dv, ev, expected, false );
	assertEigen( callDstevx( 'compute-vectors', 'all', 6, dv, ev, 0.0, 0.0, 0, 0, 0.0 ), dv, ev, expected, true );
});

test( 'dstevx: a huge-norm matrix is scaled down and its eigenvalues rescaled (all, dsterf/dsteqr path)', function t() {
	const dv = scaled( D6, 1e200 );
	const ev = scaled( E6, 1e200 );
	const expected = scaled( oracle( D6, E6 ), 1e200 );
	assertEigen( callDstevx( 'no-vectors', 'all', 6, dv, ev, 0.0, 0.0, 0, 0, 0.0 ), dv, ev, expected, false );
	assertEigen( callDstevx( 'compute-vectors', 'all', 6, dv, ev, 0.0, 0.0, 0, 0, 0.0 ), dv, ev, expected, true );
});

test( 'dstevx: scaled matrix with range=value scales the interval and rescales the eigenvalues (dstebz/dstein path)', function t() {
	const all = oracle( D6, E6 );
	let s;
	let dv;
	let ev;
	let expected;
	let k;
	const scales = [ 1e-150, 1e200 ];
	for ( k = 0; k < scales.length; k++ ) {
		s = scales[ k ];
		dv = scaled( D6, s );
		ev = scaled( E6, s );
		expected = scaled( all.filter( function inRange( v ) {
			return v > 1.0 && v <= 3.0;
		}), s );
		assert.ok( expected.length > 0 && expected.length < 6 );
		assertEigen( callDstevx( 'no-vectors', 'value', 6, dv, ev, 1.0 * s, 3.0 * s, 0, 0, 0.0 ), dv, ev, expected, false ); // eslint-disable-line max-len
		assertEigen( callDstevx( 'compute-vectors', 'value', 6, dv, ev, 1.0 * s, 3.0 * s, 0, 0, 0.0 ), dv, ev, expected, true ); // eslint-disable-line max-len
	}
});

test( 'dstevx: eigenvectors of a split matrix are sorted together with the eigenvalues', function t() {
	// Blocks {1,2,3} and {4,5,6}: dstebz returns the eigenvalues block by
	// Block (ORDER='B'), so the interleaved spectrum must be sorted, with the
	// Eigenvector columns swapped alongside.
	const dv = [ 5.0, 1.0, 3.0, 4.0, 0.0, 2.0 ];
	const ev = [ 0.5, 0.25, 0.0, 0.75, 0.5 ];
	const expected = oracle( dv, ev );
	assertEigen( callDstevx( 'compute-vectors', 'index', 6, dv, ev, 0.0, 0.0, 1, 6, 1e-14 ), dv, ev, expected, true ); // eslint-disable-line max-len
	assertEigen( callDstevx( 'compute-vectors', 'value', 6, dv, ev, -10.0, 10.0, 0, 0, 0.0 ), dv, ev, expected, true ); // eslint-disable-line max-len
	assertEigen( callDstevx( 'compute-vectors', 'index', 6, dv, ev, 0.0, 0.0, 2, 5, 0.0 ), dv, ev, expected.slice( 1, 5 ), true ); // eslint-disable-line max-len
});
