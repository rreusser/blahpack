/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelqf from './../lib/ndarray.js';

// FIXTURES //

import _3x5 from './fixtures/3x5.json' with { type: 'json' };
import _5x3 from './fixtures/5x3.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _35x40 from './fixtures/35x40.json' with { type: 'json' };
import _2x6 from './fixtures/2x6.json' with { type: 'json' };

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
* Extract column-major sub-matrix of size M x N from flat array with leading dim LDA.
*
* @param {Float64Array} A - flat array
* @param {number} LDA - leading dimension
* @param {number} M - rows to extract
* @param {number} N - cols to extract
* @returns {Array} M*N values in column-major order
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

test( 'dgelqf: 3x5 (M < N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x5;
	A = new Float64Array( 3 * 5 );
	A[ 0 * 3 + 0 ] = 2.0;
	A[ 1 * 3 + 0 ] = 1.0;
	A[ 2 * 3 + 0 ] = 3.0;
	A[ 3 * 3 + 0 ] = 1.0;
	A[ 4 * 3 + 0 ] = 4.0;
	A[ 0 * 3 + 1 ] = 1.0;
	A[ 1 * 3 + 1 ] = 4.0;
	A[ 2 * 3 + 1 ] = 2.0;
	A[ 3 * 3 + 1 ] = 3.0;
	A[ 4 * 3 + 1 ] = 1.0;
	A[ 0 * 3 + 2 ] = 3.0;
	A[ 1 * 3 + 2 ] = 2.0;
	A[ 2 * 3 + 2 ] = 5.0;
	A[ 3 * 3 + 2 ] = 2.0;
	A[ 4 * 3 + 2 ] = 3.0;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgelqf(3, 5, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 3, 3, 5 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelqf: 5x3 (M > N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _5x3;
	A = new Float64Array( 5 * 3 );
	A[ 0 * 5 + 0 ] = 2.0;
	A[ 0 * 5 + 1 ] = 1.0;
	A[ 0 * 5 + 2 ] = 3.0;
	A[ 0 * 5 + 3 ] = 1.0;
	A[ 0 * 5 + 4 ] = 2.0;
	A[ 1 * 5 + 0 ] = 1.0;
	A[ 1 * 5 + 1 ] = 4.0;
	A[ 1 * 5 + 2 ] = 2.0;
	A[ 1 * 5 + 3 ] = 3.0;
	A[ 1 * 5 + 4 ] = 1.0;
	A[ 2 * 5 + 0 ] = 3.0;
	A[ 2 * 5 + 1 ] = 2.0;
	A[ 2 * 5 + 2 ] = 5.0;
	A[ 2 * 5 + 3 ] = 1.0;
	A[ 2 * 5 + 4 ] = 4.0;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 5 * 32 );
	info = dgelqf(5, 3, A, 1, 5, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 5, 5, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelqf: 4x4 (square)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _4x4;
	A = new Float64Array( 4 * 4 );
	A[ 0 * 4 + 0 ] = 4.0;
	A[ 1 * 4 + 0 ] = 1.0;
	A[ 2 * 4 + 0 ] = 2.0;
	A[ 3 * 4 + 0 ] = 1.0;
	A[ 0 * 4 + 1 ] = 1.0;
	A[ 1 * 4 + 1 ] = 3.0;
	A[ 2 * 4 + 1 ] = 1.0;
	A[ 3 * 4 + 1 ] = 2.0;
	A[ 0 * 4 + 2 ] = 2.0;
	A[ 1 * 4 + 2 ] = 1.0;
	A[ 2 * 4 + 2 ] = 5.0;
	A[ 3 * 4 + 2 ] = 3.0;
	A[ 0 * 4 + 3 ] = 1.0;
	A[ 1 * 4 + 3 ] = 2.0;
	A[ 2 * 4 + 3 ] = 3.0;
	A[ 3 * 4 + 3 ] = 6.0;
	TAU = new Float64Array( 4 );
	WORK = new Float64Array( 4 * 32 );
	info = dgelqf(4, 4, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 4, 4, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelqf: 1x1 (edge case)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _1x1;
	A = new Float64Array( 1 );
	A[ 0 ] = 7.0;
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 32 );
	info = dgelqf(1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelqf: M=0 (quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgelqf(0, 5, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dgelqf: N=0 (quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgelqf(3, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dgelqf: 35x40 (blocked path, NB=32)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var i;
	var j;

	tc = _35x40;
	A = new Float64Array( 35 * 40 );
	for ( i = 0; i < 35; i++ ) {
		for ( j = 0; j < 40; j++ ) {
			A[ j * 35 + i ] = 1.0 / ( i + j + 2 );
		}
		A[ i * 35 + i ] = 10.0 + ( i + 1 );
	}
	TAU = new Float64Array( 35 );
	WORK = new Float64Array( 35 * 32 );
	info = dgelqf(35, 40, A, 1, 35, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 35, 35, 40 ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-12, 'TAU' );
});

test( 'dgelqf: 2x6 (wide)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _2x6;
	A = new Float64Array( 2 * 6 );
	A[ 0 * 2 + 0 ] = 1.0;
	A[ 1 * 2 + 0 ] = 2.0;
	A[ 2 * 2 + 0 ] = 3.0;
	A[ 3 * 2 + 0 ] = 4.0;
	A[ 4 * 2 + 0 ] = 5.0;
	A[ 5 * 2 + 0 ] = 6.0;
	A[ 0 * 2 + 1 ] = 7.0;
	A[ 1 * 2 + 1 ] = 8.0;
	A[ 2 * 2 + 1 ] = 9.0;
	A[ 3 * 2 + 1 ] = 10.0;
	A[ 4 * 2 + 1 ] = 11.0;
	A[ 5 * 2 + 1 ] = 12.0;
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 * 32 );
	info = dgelqf(2, 6, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 2, 2, 6 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelqf: compact layout (LDA=M, no padding)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _4x4;
	A = new Float64Array( 4 * 4 );
	A[ 0 * 4 + 0 ] = 4.0;
	A[ 1 * 4 + 0 ] = 1.0;
	A[ 2 * 4 + 0 ] = 2.0;
	A[ 3 * 4 + 0 ] = 1.0;
	A[ 0 * 4 + 1 ] = 1.0;
	A[ 1 * 4 + 1 ] = 3.0;
	A[ 2 * 4 + 1 ] = 1.0;
	A[ 3 * 4 + 1 ] = 2.0;
	A[ 0 * 4 + 2 ] = 2.0;
	A[ 1 * 4 + 2 ] = 1.0;
	A[ 2 * 4 + 2 ] = 5.0;
	A[ 3 * 4 + 2 ] = 3.0;
	A[ 0 * 4 + 3 ] = 1.0;
	A[ 1 * 4 + 3 ] = 2.0;
	A[ 2 * 4 + 3 ] = 3.0;
	A[ 3 * 4 + 3 ] = 6.0;
	TAU = new Float64Array( 4 );
	WORK = new Float64Array( 4 * 32 );
	info = dgelqf(4, 4, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});

test( 'dgelqf: non-zero offset', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 5 + 4 * 2 );
	A[ 5 ] = 4.0;
	A[ 6 ] = 1.0;
	A[ 9 ] = 1.0;
	A[ 10 ] = 3.0;
	TAU = new Float64Array( 4 );
	WORK = new Float64Array( 2 * 32 );
	info = dgelqf(2, 2, A, 1, 4, 5, TAU, 1, 1, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assert.ok( !isNaN( TAU[ 1 ] ), 'TAU[1] is a number' );
	assert.ok( !isNaN( TAU[ 2 ] ), 'TAU[2] is a number' );
});

test( 'dgelqf: throws RangeError when WORK is null', function t() {
	assert.throws( function() {
		dgelqf( 3, 5, new Float64Array( 15 ), 1, 3, 0, new Float64Array( 3 ), 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'dgelqf: padded LDA (LDA > M)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = _3x5;
	A = new Float64Array( 6 * 5 );
	A[ 0 * 6 + 0 ] = 2.0;
	A[ 1 * 6 + 0 ] = 1.0;
	A[ 2 * 6 + 0 ] = 3.0;
	A[ 3 * 6 + 0 ] = 1.0;
	A[ 4 * 6 + 0 ] = 4.0;
	A[ 0 * 6 + 1 ] = 1.0;
	A[ 1 * 6 + 1 ] = 4.0;
	A[ 2 * 6 + 1 ] = 2.0;
	A[ 3 * 6 + 1 ] = 3.0;
	A[ 4 * 6 + 1 ] = 1.0;
	A[ 0 * 6 + 2 ] = 3.0;
	A[ 1 * 6 + 2 ] = 2.0;
	A[ 2 * 6 + 2 ] = 5.0;
	A[ 3 * 6 + 2 ] = 2.0;
	A[ 4 * 6 + 2 ] = 3.0;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgelqf(3, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( extractMatrix( A, 6, 3, 5 ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-14, 'TAU' );
});
