/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpmv from './../lib/ndarray.js';

// FIXTURES //

import upper_notrans_nonunit from './fixtures/upper_notrans_nonunit.json' with { type: 'json' };
import upper_trans_nonunit from './fixtures/upper_trans_nonunit.json' with { type: 'json' };
import upper_notrans_unit from './fixtures/upper_notrans_unit.json' with { type: 'json' };
import lower_notrans_nonunit from './fixtures/lower_notrans_nonunit.json' with { type: 'json' };
import lower_trans_nonunit from './fixtures/lower_trans_nonunit.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };

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

// TESTS //

// 4x4 upper triangular matrix:
//   [ 2  3  5  8 ]
//   [ 0  4  6  9 ]
//   [ 0  0  7 10 ]
//   [ 0  0  0 11 ]
// Upper packed (column-major): 2, 3, 4, 5, 6, 7, 8, 9, 10, 11

// 4x4 lower triangular matrix:
//   [ 2  0  0  0 ]
//   [ 3  5  0  0 ]
//   [ 4  6  8  0 ]
//   [ 7  9 10 11 ]
// Lower packed (column-major): 2, 3, 4, 7, 5, 6, 9, 8, 10, 11

test( 'dtpmv: upper_notrans_nonunit', function t() {
	var tc = upper_notrans_nonunit;
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	dtpmv( 'upper', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpmv: upper_trans_nonunit', function t() {
	var tc = upper_trans_nonunit;
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	dtpmv( 'upper', 'transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpmv: upper_notrans_unit', function t() {
	var tc = upper_notrans_unit;
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	dtpmv( 'upper', 'no-transpose', 'unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpmv: lower_notrans_nonunit', function t() {
	var tc = lower_notrans_nonunit;
	var AP = new Float64Array( [ 2, 3, 4, 7, 5, 6, 9, 8, 10, 11 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	dtpmv( 'lower', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpmv: lower_trans_nonunit', function t() {
	var tc = lower_trans_nonunit;
	var AP = new Float64Array( [ 2, 3, 4, 7, 5, 6, 9, 8, 10, 11 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	dtpmv( 'lower', 'transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpmv: n_zero', function t() {
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 99.0 ] );
	dtpmv( 'upper', 'no-transpose', 'non-unit', 0, AP, 1, 0, x, 1, 0 );
	assert.equal( x[ 0 ], 99.0 );
});

test( 'dtpmv: stride', function t() {
	var tc = stride;
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	dtpmv( 'upper', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 2, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});
