/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dspsv from './../lib/ndarray.js';
var ndarray = dspsv;

// FIXTURES //

import _3x3_upper_1rhs from './fixtures/3x3_upper_1rhs.json' with { type: 'json' };
import _3x3_lower_1rhs from './fixtures/3x3_lower_1rhs.json' with { type: 'json' };
import _3x3_lower_2rhs from './fixtures/3x3_lower_2rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import _3x3_upper_2rhs from './fixtures/3x3_upper_2rhs.json' with { type: 'json' };

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

test( 'dspsv: 3x3_upper_1rhs', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = _3x3_upper_1rhs;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	info = dspsv( 'upper', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: 3x3_lower_1rhs', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = _3x3_lower_1rhs;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	info = dspsv( 'lower', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: 3x3_lower_2rhs', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = _3x3_lower_2rhs;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	info = dspsv( 'lower', 3, 2, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: singular_upper (info > 0)', function t() {
	var IPIV;
	var info;
	var AP;
	var B;

	// A = [ 1  2  3; 2  4  6; 3  6  9 ] (rank 1, singular)
	AP = new Float64Array( [ 1.0, 2.0, 4.0, 3.0, 6.0, 9.0 ] );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dspsv( 'upper', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});

test( 'dspsv: n_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = n_zero;
	AP = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( 1 );
	info = dspsv( 'lower', 0, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dspsv: nrhs_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = nrhs_zero;
	AP = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( 1 );
	info = dspsv( 'lower', 1, 0, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dspsv: n_one_lower', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = n_one_lower;
	AP = new Float64Array( [ 4.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( [ 8.0 ] );
	info = dspsv( 'lower', 1, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: n_one_upper', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = n_one_upper;
	AP = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( [ 15.0 ] );
	info = dspsv( 'upper', 1, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: 3x3_upper_2rhs', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var B;

	tc = _3x3_upper_2rhs;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	info = dspsv( 'upper', 3, 2, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

// ndarray validation tests

test( 'dspsv: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 3, 1, new Float64Array( 6 ), 1, 0, new Int32Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dspsv: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', -1, 1, new Float64Array( 6 ), 1, 0, new Int32Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dspsv: ndarray throws RangeError for negative NRHS', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 3, -1, new Float64Array( 6 ), 1, 0, new Int32Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
