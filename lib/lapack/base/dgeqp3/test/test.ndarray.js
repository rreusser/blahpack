/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgeqp3 from './../lib/ndarray.js';

// FIXTURES //

import rect_4x3 from './fixtures/rect_4x3.json' with { type: 'json' };
import rect_3x4 from './fixtures/rect_3x4.json' with { type: 'json' };
import square_4x4 from './fixtures/square_4x4.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import fixed_col1 from './fixtures/fixed_col1.json' with { type: 'json' };
import fixed_col3_swap from './fixtures/fixed_col3_swap.json' with { type: 'json' };
import fixed_two_cols from './fixtures/fixed_two_cols.json' with { type: 'json' };
import wide_8x36 from './fixtures/wide_8x36.json' with { type: 'json' };
import large_140x130_blocked from './fixtures/large_140x130_blocked.json' with { type: 'json' };

// VARIABLES //

var LDA = 8; // Matches Fortran MAXMN

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
* Creates a column-major matrix from values.
* vals is an array of column-major values for an M-by-N matrix, stored with leading dimension M.
* Returns a Float64Array of size LDA*N with values placed using leading dimension LDA.
*/
function makeMatrix( vals, M, N ) {
	var A = new Float64Array( LDA * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = vals[ j * M + i ];
		}
	}
	return A;
}

/**
* Extracts column-major values from matrix A (LDA-by-N) as M-by-N.
*/
function extractMatrix( A, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
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

test( 'dgeqp3: 4x3 matrix (tall)', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = rect_4x3;
	A = makeMatrix( [1, 2, 0, 1, 0, 1, 3, 2, 3, 0, 1, 2], 4, 3 );
	JPVT = new Int32Array( 3 );
	TAU = new Float64Array( 3 );
	info = dgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: 3x4 matrix (wide)', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = rect_3x4;
	A = makeMatrix( [1, 0, 2, 3, 1, 0, 0, 2, 1, 1, 0, 3], 3, 4 );
	JPVT = new Int32Array( 4 );
	TAU = new Float64Array( 3 );
	info = dgeqp3( 3, 4, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 3, 4 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: square 4x4', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = square_4x4;
	A = makeMatrix( [2, 1, 0, 1, 0, 3, 1, 2, 1, 0, 4, 1, 3, 2, 1, 5], 4, 4 );
	JPVT = new Int32Array( 4 );
	TAU = new Float64Array( 4 );
	info = dgeqp3( 4, 4, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 4 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: N=0 (quick return)', function t() {
	var JPVT;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	JPVT = new Int32Array( 1 );
	TAU = new Float64Array( 1 );
	info = dgeqp3( 3, 0, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dgeqp3: M=0 (quick return)', function t() {
	var JPVT;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	JPVT = new Int32Array( 3 );
	TAU = new Float64Array( 1 );
	info = dgeqp3( 0, 3, A, 1, 1, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dgeqp3: 1x1 matrix', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = one_by_one;
	A = new Float64Array( LDA );
	A[ 0 ] = 5.0;
	JPVT = new Int32Array( 1 );
	TAU = new Float64Array( 1 );
	info = dgeqp3( 1, 1, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 1, 1 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: fixed column 1', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixed_col1;
	A = makeMatrix( [1, 0, 0, 0, 3, 4, 0, 1, 2], 3, 3 );
	JPVT = new Int32Array( [1, 0, 0] );
	TAU = new Float64Array( 3 );
	info = dgeqp3( 3, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 3, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: fixed column 3 (swap to front)', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixed_col3_swap;
	A = makeMatrix( [1, 2, 0, 1, 3, 0, 2, 1, 0, 1, 3, 2], 4, 3 );
	JPVT = new Int32Array( [0, 0, 1] );
	TAU = new Float64Array( 3 );
	info = dgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: fix columns 1 and 3', function t() {
	var JPVT;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixed_two_cols;
	A = makeMatrix( [1, 2, 0, 1, 3, 0, 2, 1, 0, 1, 3, 2], 4, 3 );
	JPVT = new Int32Array( [1, 0, 1] );
	TAU = new Float64Array( 3 );
	info = dgeqp3( 4, 3, A, 1, LDA, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractMatrix( A, 4, 3 ), tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: wide 8x36 (unblocked, sminmn < NB)', function t() {
	var BIGMN;
	var JPVT;
	var info;
	var aOut;
	var TAU;
	var tc;
	var M;
	var N;
	var A;
	var i;
	var j;

	tc = wide_8x36;
	BIGMN = 40;
	M = 8;
	N = 36;
	A = new Float64Array( BIGMN * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * BIGMN + i ] = ((i + 1) * (j + 1) + 3 * (i + 1) + 7) % 11 - 5.0;
		}
	}
	JPVT = new Int32Array( N );
	TAU = new Float64Array( M );
	info = dgeqp3( M, N, A, 1, BIGMN, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	aOut = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			aOut.push( A[ j * BIGMN + i ] );
		}
	}
	assertArrayClose( aOut, tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});

test( 'dgeqp3: large 140x130 (triggers blocked dlaqps path)', function t() {
	var BIGMN;
	var JPVT;
	var info;
	var aOut;
	var TAU;
	var tc;
	var M;
	var N;
	var A;
	var i;
	var j;

	tc = large_140x130_blocked;
	BIGMN = 140;
	M = 140;
	N = 130;
	A = new Float64Array( BIGMN * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * BIGMN + i ] = Math.sin( (i + 1) * 0.7 + (j + 1) * 1.3 ) + Math.cos( (i + 1) * (j + 1) * 0.3 ); // eslint-disable-line max-len
		}
	}
	JPVT = new Int32Array( N );
	TAU = new Float64Array( N );
	info = dgeqp3( M, N, A, 1, BIGMN, 0, JPVT, 1, 0, TAU, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	aOut = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			aOut.push( A[ j * BIGMN + i ] );
		}
	}
	assertArrayClose( aOut, tc.a, 1e-10, 'a' );
	assertArrayClose( toArray( TAU ), tc.tau, 1e-10, 'tau' );
	assert.deepStrictEqual( toArray( JPVT ), tc.jpvt, 'jpvt' );
});
