/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgehrd from './../lib/ndarray.js';

// FIXTURES //

import _4x4_full from './fixtures/4x4_full.json' with { type: 'json' };
import _5x5_full from './fixtures/5x5_full.json' with { type: 'json' };
import _4x4_partial_ilo2_ihi3 from './fixtures/4x4_partial_ilo2_ihi3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_two from './fixtures/n_two.json' with { type: 'json' };
import _35x35_blocked from './fixtures/35x35_blocked.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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

test( 'dgehrd: main export is a function', function t() {
	assert.strictEqual( typeof dgehrd, 'function' );
});

test( 'dgehrd: 4x4 full range (unblocked path)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var N;
	var A;

	tc = _4x4_full;
	N = 4;
	A = new Float64Array([
		1,
		5,
		9,
		13,
		2,
		6,
		10,
		14,
		3,
		7,
		11,
		15,
		4,
		8,
		12,
		16
	]);
	TAU = new Float64Array( N - 1 );
	WORK = new Float64Array( 5000 );
	info = dgehrd( N, 1, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-10, 'TAU' );
});

test( 'dgehrd: 5x5 full range', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var N;
	var A;

	tc = _5x5_full;
	N = 5;
	A = new Float64Array([
		2,
		1,
		3,
		1,
		4,
		1,
		4,
		1,
		2,
		1,
		3,
		1,
		5,
		1,
		2,
		1,
		2,
		1,
		6,
		1,
		4,
		1,
		2,
		1,
		7
	]);
	TAU = new Float64Array( N - 1 );
	WORK = new Float64Array( 5000 );
	info = dgehrd( N, 1, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-10, 'TAU' );
});

test( 'dgehrd: 4x4 partial range (ILO=2, IHI=3)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var N;
	var A;

	tc = _4x4_partial_ilo2_ihi3;
	N = 4;
	A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		8,
		0,
		3,
		6,
		9,
		0,
		4,
		7,
		10,
		11
	]);
	TAU = new Float64Array( N - 1 );
	WORK = new Float64Array( 5000 );
	info = dgehrd( N, 2, 3, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-10, 'TAU' );
});

test( 'dgehrd: N=1 (quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = n_one;
	A = new Float64Array( [ 42.0 ] );
	TAU = new Float64Array( 0 );
	WORK = new Float64Array( 10 );
	info = dgehrd( 1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertClose( A[ 0 ], tc.A[ 0 ], 1e-14, 'A[0]' );
});

test( 'dgehrd: N=2', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = n_two;
	A = new Float64Array( [ 3, 4, 1, 2 ] );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dgehrd( 2, 1, 2, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-10, 'TAU' );
});

test( 'dgehrd: 35x35 blocked path', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var N;
	var i;
	var j;
	var A;

	tc = _35x35_blocked;
	N = 35;
	A = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ j * N + i ] = N + i + 1;
			} else {
				A[ j * N + i ] = 1.0 / ( 1 + Math.abs( i - j ) );
			}
		}
	}
	TAU = new Float64Array( N - 1 );
	WORK = new Float64Array( 5000 );
	info = dgehrd( N, 1, N, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-8, 'A' );
	assertArrayClose( toArray( TAU ), tc.TAU, 1e-8, 'TAU' );
});

test( 'dgehrd: ILO=IHI (nothing to reduce)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var N;
	var A;

	tc = ilo_eq_ihi;
	N = 4;
	A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		9,
		0,
		4,
		7,
		10,
		11
	]);
	TAU = new Float64Array( N - 1 );
	WORK = new Float64Array( 5000 );
	info = dgehrd( N, 2, 2, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});
