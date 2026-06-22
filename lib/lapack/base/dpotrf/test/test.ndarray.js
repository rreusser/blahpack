/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpotrf from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';
import dpotrf2 from './../../dpotrf2/lib/base.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };

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
* Creates a random N-by-N SPD matrix (col-major) by computing A = B^T _ B + N_I.
*/
function randomSPD( N ) {
	var A = new Float64Array( N * N );
	var B = new Float64Array( N * N );
	var i;
	var j;
	var k;
	for ( i = 0; i < N * N; i++ ) {
		B[ i ] = ( i * 7 + 3 ) % 13 - 6; // deterministic pseudo-random
	}
	// A = B^T * B
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			var sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += B[ k + i * N ] * B[ k + j * N ];
			}
			A[ i + j * N ] = sum;
		}
	}
	// Add N*I for strong positive definiteness
	for ( i = 0; i < N; i++ ) {
		A[ i + i * N ] += N;
	}
	return A;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dpotrf: lower_3x3', function t() {
	var info;
	var tc;
	var A;

	tc = lower_3x3;
	A = new Float64Array( [ 4, 2, 1, 2, 5, 3, 1, 3, 9 ] );
	info = dpotrf( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.L, 1e-14, 'L' );
});

test( 'dpotrf: upper_3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_3x3;
	A = new Float64Array( [ 4, 2, 1, 2, 5, 3, 1, 3, 9 ] );
	info = dpotrf( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.U, 1e-14, 'U' );
});

test( 'dpotrf: lower_4x4', function t() {
	var info;
	var tc;
	var A;

	tc = lower_4x4;
	A = new Float64Array( [ 4, 2, 1, 0, 2, 5, 3, 1, 1, 3, 9, 2, 0, 1, 2, 8 ] );
	info = dpotrf( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.L, 1e-14, 'L' );
});

test( 'dpotrf: upper_4x4', function t() {
	var info;
	var tc;
	var A;

	tc = upper_4x4;
	A = new Float64Array( [ 4, 2, 1, 0, 2, 5, 3, 1, 1, 3, 9, 2, 0, 1, 2, 8 ] );
	info = dpotrf( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.U, 1e-14, 'U' );
});

test( 'dpotrf: not_posdef', function t() {
	var info;
	var tc;
	var A;

	tc = not_posdef;
	A = new Float64Array( [ 1, 2, 3, 2, 1, 4, 3, 4, 1 ] );
	info = dpotrf( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'dpotrf: n_zero', function t() {
	var info;
	var tc;
	var A;

	tc = n_zero;
	A = new Float64Array( 1 );
	info = dpotrf( 'lower', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dpotrf: large lower (blocked path) matches dpotrf2', function t() {
	var info1;
	var info2;
	var A1;
	var A2;
	var N;

	N = 80;
	A1 = randomSPD( N );
	A2 = new Float64Array( A1 );
	info1 = dpotrf( 'lower', N, A1, 1, N, 0 );
	info2 = dpotrf2( 'lower', N, A2, 1, N, 0 );
	assert.equal( info1, 0 );
	assert.equal( info2, 0 );
	assertArrayClose( toArray( A1 ), toArray( A2 ), 1e-12, 'large lower blocked vs unblocked' ); // eslint-disable-line max-len
});

test( 'dpotrf: large upper (blocked path) matches dpotrf2', function t() {
	var info1;
	var info2;
	var A1;
	var A2;
	var N;

	N = 80;
	A1 = randomSPD( N );
	A2 = new Float64Array( A1 );
	info1 = dpotrf( 'upper', N, A1, 1, N, 0 );
	info2 = dpotrf2( 'upper', N, A2, 1, N, 0 );
	assert.equal( info1, 0 );
	assert.equal( info2, 0 );
	assertArrayClose( toArray( A1 ), toArray( A2 ), 1e-12, 'large upper blocked vs unblocked' ); // eslint-disable-line max-len
});

test( 'dpotrf: large not-posdef (blocked path)', function t() {
	var info;
	var N;
	var A;

	N = 80;
	A = randomSPD( N );
	A[ (N - 1) + (N - 1) * N ] = -1000.0;
	info = dpotrf( 'lower', N, A, 1, N, 0 );
	assert.ok( info > 0 );
});

test( 'dpotrf: large not-posdef upper (blocked path)', function t() {
	var info;
	var N;
	var A;

	N = 80;
	A = randomSPD( N );
	A[ (N - 1) + (N - 1) * N ] = -1000.0;
	info = dpotrf( 'upper', N, A, 1, N, 0 );
	assert.ok( info > 0 );
});

// ndarray validation tests

test( 'dpotrf: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 3, new Float64Array( 9 ), 1, 3, 0 );
	}, TypeError );
});

test( 'dpotrf: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', -1, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});
