/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpotrf2 from './../lib/ndarray.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_one_notposdef from './fixtures/n_one_notposdef.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };

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

test( 'dpotrf2: lower_3x3', function t() {
	var info;
	var tc;
	var A;

	tc = lower_3x3;
	A = new Float64Array( [ 4, 2, 1, 2, 5, 3, 1, 3, 9 ] );
	info = dpotrf2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.L, 1e-14, 'L' );
});

test( 'dpotrf2: upper_3x3', function t() {
	var info;
	var tc;
	var A;

	tc = upper_3x3;
	A = new Float64Array( [ 4, 2, 1, 2, 5, 3, 1, 3, 9 ] );
	info = dpotrf2( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.U, 1e-14, 'U' );
});

test( 'dpotrf2: not_posdef', function t() {
	var info;
	var tc;
	var A;

	tc = not_posdef;
	A = new Float64Array( [ 1, 2, 3, 2, 1, 4, 3, 4, 1 ] );
	info = dpotrf2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'dpotrf2: n_zero', function t() {
	var info;
	var tc;
	var A;

	tc = n_zero;
	A = new Float64Array( 1 );
	info = dpotrf2( 'lower', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dpotrf2: n_one', function t() {
	var info;
	var tc;
	var A;

	tc = n_one;
	A = new Float64Array( [ 9 ] );
	info = dpotrf2( 'lower', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dpotrf2: n_one_notposdef', function t() {
	var info;
	var tc;
	var A;

	tc = n_one_notposdef;
	A = new Float64Array( [ -4 ] );
	info = dpotrf2( 'lower', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dpotrf2: lower_4x4', function t() {
	var info;
	var tc;
	var A;

	tc = lower_4x4;
	A = new Float64Array( [ 4, 2, 1, 0, 2, 5, 3, 1, 1, 3, 9, 2, 0, 1, 2, 8 ] );
	info = dpotrf2( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.L, 1e-14, 'L' );
});

test( 'dpotrf2: upper_4x4', function t() {
	var info;
	var tc;
	var A;

	tc = upper_4x4;
	A = new Float64Array( [ 4, 2, 1, 0, 2, 5, 3, 1, 1, 3, 9, 2, 0, 1, 2, 8 ] );
	info = dpotrf2( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.U, 1e-14, 'U' );
});

test( 'dpotrf2: upper_4x4 not posdef in A22 block', function t() {
	var info;
	var A;

	A = new Float64Array([
		4,
		2,
		1,
		1,
		2,
		5,
		3,
		3,
		1,
		3,
		-1,
		0,
		1,
		3,
		0,
		-1
	]);
	info = dpotrf2( 'upper', 4, A, 1, 4, 0 );
	assert.ok( info > 2, 'info should be > 2 (failure in A22 block), got ' + info ); // eslint-disable-line max-len
});
