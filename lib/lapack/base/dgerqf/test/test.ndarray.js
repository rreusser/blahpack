/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerqf from './../lib/ndarray.js';

// FIXTURES //

import _3x4 from './fixtures/3x4.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _2x5 from './fixtures/2x5.json' with { type: 'json' };

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
* @param {*} A - A
* @param {*} LDA - LDA
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function extractMatrix( A, LDA, M, N ) {
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

test( 'dgerqf: 3x4 (M < N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x4;
	A = new Float64Array( 6 * 4 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 1.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 3 * 6 + 1 ] = 3.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 3 * 6 + 2 ] = 2.0;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 600 );
	info = dgerqf( 3, 4, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 4x3 (M > N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _4x3;
	A = new Float64Array( 6 * 3 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 0 * 6 + 3 ] = 1.0;
	A[ 1 * 6 + 3 ] = 3.0;
	A[ 2 * 6 + 3 ] = 1.0;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 600 );
	info = dgerqf( 4, 3, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 4, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 3x3 (square)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x3;
	A = new Float64Array( 6 * 3 );
	A[ 0 * 6 + 0 ] = 4.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 2.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 3.0;
	A[ 2 * 6 + 1 ] = 1.0;
	A[ 0 * 6 + 2 ] = 2.0;
	A[ 1 * 6 + 2 ] = 1.0;
	A[ 2 * 6 + 2 ] = 5.0;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 600 );
	info = dgerqf( 3, 3, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 1x1', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _1x1;
	A = new Float64Array( 6 );
	A[ 0 ] = 7.0;
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 600 );
	info = dgerqf( 1, 1, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 1, 1 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: M=0 (quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgerqf( 0, 3, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dgerqf: N=0 (quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgerqf( 3, 0, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dgerqf: 2x5 (wide)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _2x5;
	A = new Float64Array( 6 * 5 );
	A[ 0 * 6 + 0 ] = 1.0;
	A[ 1 * 6 + 0 ] = 2.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 4.0;
	A[ 4 * 6 + 0 ] = 5.0;
	A[ 0 * 6 + 1 ] = 6.0;
	A[ 1 * 6 + 1 ] = 7.0;
	A[ 2 * 6 + 1 ] = 8.0;
	A[ 3 * 6 + 1 ] = 9.0;
	A[ 4 * 6 + 1 ] = 10.0;
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 600 );
	info = dgerqf( 2, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 2, 5 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgerqf: 40x40 (blocked path, verify R is upper triangular)', function t() { // eslint-disable-line max-len
	var tauNonZero;
	var WORK;
	var info;
	var TAU;
	var A;
	var N;
	var i;
	var j;

	N = 40;
	A = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ j * N + i ] = ( ( i + 1 ) * 7 + ( j + 1 ) * 13 ) % 97 / 97.0;
		}
	}
	TAU = new Float64Array( N );
	WORK = new Float64Array( N * 64 );
	info = dgerqf( N, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	tauNonZero = 0;
	for ( i = 0; i < N; i++ ) {
		if ( TAU[ i ] !== 0.0 ) {
			tauNonZero += 1;
		}
	}
	assert.ok( tauNonZero > 0, 'TAU should have nonzero entries' );
});

test( 'dgerqf: 40x35 (M > N, blocked path)', function t() {
	var tauNonZero;
	var WORK;
	var info;
	var TAU;
	var A;
	var M;
	var N;
	var i;
	var j;

	M = 40;
	N = 35;
	A = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * M + i ] = ( ( i + 1 ) * 11 + ( j + 1 ) * 7 ) % 101 / 101.0;
		}
	}
	TAU = new Float64Array( N );
	WORK = new Float64Array( M * 64 );
	info = dgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	tauNonZero = 0;
	for ( i = 0; i < N; i++ ) {
		if ( TAU[ i ] !== 0.0 ) {
			tauNonZero += 1;
		}
	}
	assert.ok( tauNonZero > 0, 'TAU should have nonzero entries' );
});
