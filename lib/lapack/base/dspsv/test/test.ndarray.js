/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dspsv from './../lib/ndarray.js';
const ndarray = dspsv;

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
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dspsv: 3x3_upper_1rhs', function t() {

	const tc = _3x3_upper_1rhs;
	const AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	const info = dspsv( 'upper', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: 3x3_lower_1rhs', function t() {

	const tc = _3x3_lower_1rhs;
	const AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	const info = dspsv( 'lower', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: 3x3_lower_2rhs', function t() {

	const tc = _3x3_lower_2rhs;
	const AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	const info = dspsv( 'lower', 3, 2, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: singular_upper (info > 0)', function t() {

	// A = [ 1  2  3; 2  4  6; 3  6  9 ] (rank 1, singular)
	const AP = new Float64Array( [ 1.0, 2.0, 4.0, 3.0, 6.0, 9.0 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const info = dspsv( 'upper', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});

test( 'dspsv: n_zero', function t() {

	const tc = n_zero;
	const AP = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( 1 );
	const info = dspsv( 'lower', 0, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dspsv: nrhs_zero', function t() {

	const tc = nrhs_zero;
	const AP = new Float64Array( [ 5.0 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( 1 );
	const info = dspsv( 'lower', 1, 0, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dspsv: n_one_lower', function t() {

	const tc = n_one_lower;
	const AP = new Float64Array( [ 4.0 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( [ 8.0 ] );
	const info = dspsv( 'lower', 1, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: n_one_upper', function t() {

	const tc = n_one_upper;
	const AP = new Float64Array( [ 5.0 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( [ 15.0 ] );
	const info = dspsv( 'upper', 1, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dspsv: 3x3_upper_2rhs', function t() {

	const tc = _3x3_upper_2rhs;
	const AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	const info = dspsv( 'upper', 3, 2, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
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
