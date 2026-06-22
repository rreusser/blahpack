/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dggsvp3 from './../lib/ndarray.js';

// FIXTURES //

import basic_4x3_3x3_uvq from './fixtures/basic_4x3_3x3_uvq.json' with { type: 'json' };
import basic_4x3_3x3_nnn from './fixtures/basic_4x3_3x3_nnn.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import p_zero from './fixtures/p_zero.json' with { type: 'json' };
import rank_deficient_b from './fixtures/rank_deficient_b.json' with { type: 'json' };
import wide_2x5_uvq from './fixtures/wide_2x5_uvq.json' with { type: 'json' };
import diagonal_3x3 from './fixtures/diagonal_3x3.json' with { type: 'json' };
import tall_b_3x5x3 from './fixtures/tall_b_3x5x3.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* ExtractMatrix.
*
* @private
* @param {TypedArray} arr - input array
* @param {*} offset - offset
* @param {*} strideA1 - strideA1
* @param {*} strideA2 - strideA2
* @param {*} m - m
* @param {*} n - n
* @returns {*} result
*/
function extractMatrix( arr, offset, strideA1, strideA2, m, n ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			out.push( arr[ offset + (i * strideA1) + (j * strideA2) ] );
		}
	}
	return out;
}

/**
* Verify that a matrix is orthogonal: Q^T * Q = I.
*/
function assertOrthogonal( Q, n, stride1, stride2, offset, tol, msg ) {
	var dot;
	var i;
	var j;
	var k;
	for ( i = 0; i < n; i++ ) {
		for ( j = i; j < n; j++ ) {
			dot = 0.0;
			for ( k = 0; k < n; k++ ) {
				dot += Q[ offset + (k * stride1) + (i * stride2) ] * Q[ offset + (k * stride1) + (j * stride2) ]; // eslint-disable-line max-len
			}
			if ( i === j ) {
				assertClose( dot, 1.0, tol, msg + ': col ' + i + ' norm' );
			} else {
				assert.ok( Math.abs( dot ) < tol, msg + ': cols ' + i + ',' + j + ' dot=' + dot ); // eslint-disable-line max-len
			}
		}
	}
}

// TESTS //

test( 'dggsvp3: basic_4x3_3x3_UVQ', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = basic_4x3_3x3_uvq;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	B = new Float64Array( [ 10, 1, 1, 1, 10, 1, 1, 1, 10 ] );
	U = new Float64Array( 16 );
	V = new Float64Array( 9 );
	Q = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 4, 3, 3, A, 1, 4, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 4, 0, V, 1, 3, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 4, 4, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
	assertOrthogonal( U, 4, 1, 4, 0, 1e-12, 'U orthogonal' );
	assertArrayClose( extractMatrix( V, 0, 1, 3, 3, 3 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: basic_4x3_3x3_NNN', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = basic_4x3_3x3_nnn;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	B = new Float64Array( [ 10, 1, 1, 1, 10, 1, 1, 1, 10 ] );
	U = new Float64Array( 1 );
	V = new Float64Array( 1 );
	Q = new Float64Array( 1 );
	IWORK = new Int32Array( 3 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'none', 'none', 'none', 4, 3, 3, A, 1, 4, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 4, 4, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
});

test( 'dggsvp3: m_zero', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = m_zero;
	A = new Float64Array( 1 );
	B = new Float64Array( [ 5, 1, 1, 5 ] );
	U = new Float64Array( 1 );
	V = new Float64Array( 4 );
	Q = new Float64Array( 4 );
	IWORK = new Int32Array( 2 );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 0, 2, 2, A, 1, 1, 0, B, 1, 2, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
});

test( 'dggsvp3: n_zero', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = n_zero;
	A = new Float64Array( 1 );
	B = new Float64Array( 1 );
	U = new Float64Array( 9 );
	V = new Float64Array( 4 );
	Q = new Float64Array( 1 );
	IWORK = new Int32Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 2, 0, A, 1, 3, 0, B, 1, 2, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 2, 0, Q, 1, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
});

test( 'dggsvp3: p_zero', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = p_zero;
	A = new Float64Array( [ 5, 1, 1, 5 ] );
	B = new Float64Array( 1 );
	U = new Float64Array( 4 );
	V = new Float64Array( 1 );
	Q = new Float64Array( 4 );
	IWORK = new Int32Array( 2 );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 0, 2, A, 1, 2, 0, B, 1, 1, 0, 1e-8, 1e-8, K, l, U, 1, 2, 0, V, 1, 1, 0, Q, 1, 2, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
});

test( 'dggsvp3: rank_deficient_B', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = rank_deficient_b;
	A = new Float64Array( [ 2, 1, 0, 1, 3, 1, 0, 1, 4 ] );
	B = new Float64Array( [ 5, 1, 0, 1, 5, 0, 1, 1, 0 ] );
	U = new Float64Array( 9 );
	V = new Float64Array( 9 );
	Q = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, A, 1, 3, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 3, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 3, 3, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 3, 3, 3 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 3, 3, 3 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: wide_2x5_UVQ', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = wide_2x5_uvq;
	A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	B = new Float64Array( [ 10, 1, 1, 10, 2, 2, 3, 3, 1, 1 ] );
	U = new Float64Array( 4 );
	V = new Float64Array( 4 );
	Q = new Float64Array( 25 );
	IWORK = new Int32Array( 5 );
	TAU = new Float64Array( 5 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 5, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, l, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 5, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 2, 2, 5 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 2, 2, 5 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 2, 2, 2 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 2, 2, 2 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 5, 5, 5 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: diagonal_3x3', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = diagonal_3x3;
	A = new Float64Array( [ 10, 0, 0, 0, 5, 0, 0, 0, 1 ] );
	B = new Float64Array( [ 8, 0, 0, 0, 4, 0, 0, 0, 2 ] );
	U = new Float64Array( 9 );
	V = new Float64Array( 9 );
	Q = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, A, 1, 3, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 3, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 3, 3, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 3, 3, 3 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 3, 3, 3 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: tall_B_3x5x3', function t() {
	var IWORK;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var B;
	var U;
	var V;
	var Q;
	var K;
	var l;

	tc = tall_b_3x5x3;
	A = new Float64Array( [ 2, 1, 0.5, 0.5, 3, 1, 1, 0.5, 4 ] );
	B = new Float64Array( [ 10, 1, 1, 1, 1, 1, 10, 1, 1, 1, 1, 1, 10, 1, 1 ] );
	U = new Float64Array( 9 );
	V = new Float64Array( 25 );
	Q = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 5000 );
	K = [ 0 ];
	l = [ 0 ];
	info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 5, 3, A, 1, 3, 0, B, 1, 5, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 5, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 5000 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 3, 3, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 5, 5, 3 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 3, 3, 3 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 5, 5, 5 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});
