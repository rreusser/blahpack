/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrtrs from './../lib/ndarray.js';
var ndarray = dtrtrs;

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };

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

test( 'dtrtrs: upper_no_trans', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = upper_no_trans;
	A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	B = new Float64Array( [ 1, 2, 3 ] );
	info = dtrtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dtrtrs: lower_no_trans', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = lower_no_trans;
	A = new Float64Array( [ 2, 1, 3, 0, 4, 5, 0, 0, 6 ] );
	B = new Float64Array( [ 1, 2, 3 ] );
	info = dtrtrs( 'lower', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dtrtrs: upper_trans', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = upper_trans;
	A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	B = new Float64Array( [ 1, 2, 3 ] );
	info = dtrtrs( 'upper', 'transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dtrtrs: upper_unit_diag', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = upper_unit_diag;
	A = new Float64Array( [ 1, 0, 0, 2, 1, 0, 3, 4, 1 ] );
	B = new Float64Array( [ 10, 5, 1 ] );
	info = dtrtrs( 'upper', 'no-transpose', 'unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dtrtrs: n_zero', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = new Float64Array( 1 );
	B = new Float64Array( 1 );
	info = dtrtrs( 'upper', 'no-transpose', 'non-unit', 0, 1, A, 1, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dtrtrs: singular', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = singular;
	A = new Float64Array( [ 2, 0, 0, 1, 0, 0, 3, 5, 6 ] );
	B = new Float64Array( [ 1, 2, 3 ] );
	info = dtrtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dtrtrs: multi_rhs', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = multi_rhs;
	A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	B = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	info = dtrtrs( 'upper', 'no-transpose', 'non-unit', 3, 2, A, 1, 3, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

test( 'dtrtrs: lower_trans', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = lower_trans;
	A = new Float64Array( [ 2, 1, 3, 0, 4, 5, 0, 0, 6 ] );
	B = new Float64Array( [ 1, 2, 3 ] );
	info = dtrtrs( 'lower', 'transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	var A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	var B = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'foo', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	var A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	var B = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'foo', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	var A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	var B = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'foo', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	var B = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', -1, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative NRHS', function t() {
	var A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	var B = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', 3, -1, A, 1, 3, 0, B, 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: N=0 early return', function t() {
	var info;
	var A;
	var B;

	A = new Float64Array( 1 );
	B = new Float64Array( 1 );
	info = ndarray( 'upper', 'no-transpose', 'non-unit', 0, 1, A, 1, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});
