/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytf2 from './../lib/ndarray.js';

// FIXTURES //

import _4x4_lower from './fixtures/4x4_lower.json' with { type: 'json' };
import _4x4_upper from './fixtures/4x4_upper.json' with { type: 'json' };
import _4x4_indef_lower from './fixtures/4x4_indef_lower.json' with { type: 'json' };
import _4x4_indef_upper from './fixtures/4x4_indef_upper.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import _5x5_lower from './fixtures/5x5_lower.json' with { type: 'json' };
import _5x5_upper from './fixtures/5x5_upper.json' with { type: 'json' };

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
* Converts Fortran 1-based IPIV to 0-based JS IPIV.
* Positive values: subtract 1. Negative values: unchanged (already encodes 0-based via ~kp).
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
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

test( 'dsytf2: 4x4_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_lower;
	A = new Float64Array([
		2,
		-1,
		0,
		0,
		0,
		2,
		-1,
		0,
		0,
		0,
		2,
		-1,
		0,
		0,
		0,
		2
	]);
	info = dsytf2( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: 4x4_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_upper;
	A = new Float64Array([
		2,
		0,
		0,
		0,
		-1,
		2,
		0,
		0,
		0,
		-1,
		2,
		0,
		0,
		0,
		-1,
		2
	]);
	info = dsytf2( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: 4x4_indef_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_indef_lower;
	A = new Float64Array([
		0,
		1,
		2,
		3,
		0,
		0,
		4,
		5,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		0
	]);
	info = dsytf2( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: 4x4_indef_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_indef_upper;
	A = new Float64Array([
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		2,
		4,
		0,
		0,
		3,
		5,
		6,
		0
	]);
	info = dsytf2( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: n_zero', function t() {
	var ipiv;
	var info;
	var A;

	ipiv = new Int32Array( 1 );
	A = new Float64Array( 1 );
	info = dsytf2( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytf2: n_one', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 1 );
	tc = n_one;
	A = new Float64Array([ 5.0 ]);
	info = dsytf2( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: singular', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 2 );
	tc = singular;
	A = new Float64Array([ 0, 0, 0, 0 ]);
	info = dsytf2( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: 5x5_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 5 );
	tc = _5x5_lower;
	A = new Float64Array([
		1,
		-2,
		0,
		3,
		1,
		0,
		0,
		4,
		-1,
		2,
		0,
		0,
		-3,
		2,
		0,
		0,
		0,
		0,
		1,
		-2,
		0,
		0,
		0,
		0,
		4
	]);
	info = dsytf2( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2: 5x5_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 5 );
	tc = _5x5_upper;
	A = new Float64Array( 25 );
	A[ 0 ] = 1;
	A[ 5 ] = -2;
	A[ 6 ] = 0;
	A[ 10 ] = 0;
	A[ 11 ] = 4;
	A[ 12 ] = -3;
	A[ 15 ] = 3;
	A[ 16 ] = -1;
	A[ 17 ] = 2;
	A[ 18 ] = 1;
	A[ 20 ] = 1;
	A[ 21 ] = 2;
	A[ 22 ] = 0;
	A[ 23 ] = -2;
	A[ 24 ] = 4;
	info = dsytf2( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});
