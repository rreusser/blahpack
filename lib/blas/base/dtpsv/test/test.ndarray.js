/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpsv from './../lib/ndarray.js';

// FIXTURES //

import upper_n_nonunit from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import lower_n_nonunit from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import upper_t_nonunit from './fixtures/upper_t_nonunit.json' with { type: 'json' };
import lower_t_nonunit from './fixtures/lower_t_nonunit.json' with { type: 'json' };
import upper_n_unit from './fixtures/upper_n_unit.json' with { type: 'json' };
import lower_n_unit from './fixtures/lower_n_unit.json' with { type: 'json' };
import upper_t_unit from './fixtures/upper_t_unit.json' with { type: 'json' };
import lower_t_unit from './fixtures/lower_t_unit.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_one_unit from './fixtures/n_one_unit.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };
import neg_stride from './fixtures/neg_stride.json' with { type: 'json' };
import upper_n_zeros from './fixtures/upper_n_zeros.json' with { type: 'json' };
import lower_t_stride_2 from './fixtures/lower_t_stride_2.json' with { type: 'json' };

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

// Upper triangular 4x4 matrix A:
//   [2  3  4  5]
//   [0  6  7  8]
//   [0  0  9 10]
//   [0  0  0 11]
// Upper packed (column-major): 2, 3, 6, 4, 7, 9, 5, 8, 10, 11

// Lower triangular 4x4 matrix A:
//   [2  0  0  0]
//   [3  6  0  0]
//   [4  7  9  0]
//   [5  8 10 11]
// Lower packed (column-major): 2, 3, 4, 5, 6, 7, 8, 9, 10, 11

test( 'dtpsv: upper_n_nonunit', function t() {
	var tc = upper_n_nonunit;

	// B = A * [1, 2, 3, 4] = [40, 65, 67, 44]
	var AP = new Float64Array( [ 2, 3, 6, 4, 7, 9, 5, 8, 10, 11 ] );
	var x = new Float64Array( [ 40, 65, 67, 44 ] );
	dtpsv( 'upper', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: lower_n_nonunit', function t() {
	var tc = lower_n_nonunit;

	// B = A * [1, 2, 3, 4] = [2, 15, 45, 95]
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 2, 15, 45, 95 ] );
	dtpsv( 'lower', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: upper_t_nonunit', function t() {
	var tc = upper_t_nonunit;

	// B = A^T * [1, 2, 3, 4] = [2, 15, 45, 95] (upper A)
	var AP = new Float64Array( [ 2, 3, 6, 4, 7, 9, 5, 8, 10, 11 ] );
	var x = new Float64Array( [ 2, 15, 45, 95 ] );
	dtpsv( 'upper', 'transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: lower_t_nonunit', function t() {
	var tc = lower_t_nonunit;

	// B = A^T * [1, 2, 3, 4] = [40, 65, 67, 44] (lower A)
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 40, 65, 67, 44 ] );
	dtpsv( 'lower', 'transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: upper_n_unit', function t() {
	var tc = upper_n_unit;

	// Unit diag A = [1 3 4 5; 0 1 7 8; 0 0 1 10; 0 0 0 1]

	// B = A * [1,2,3,4] = [39, 55, 43, 4]

	// Diagonal positions have 99 (should be ignored)
	var AP = new Float64Array( [ 99, 3, 99, 4, 7, 99, 5, 8, 10, 99 ] );
	var x = new Float64Array( [ 39, 55, 43, 4 ] );
	dtpsv( 'upper', 'no-transpose', 'unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: lower_n_unit', function t() {
	var tc = lower_n_unit;

	// Unit diag A = [1 0 0 0; 3 1 0 0; 4 7 1 0; 5 8 10 1]

	// B = A * [1,2,3,4] = [1, 5, 21, 55]
	var AP = new Float64Array( [ 99, 3, 4, 5, 99, 7, 8, 99, 10, 99 ] );
	var x = new Float64Array( [ 1, 5, 21, 55 ] );
	dtpsv( 'lower', 'no-transpose', 'unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: upper_t_unit', function t() {
	var tc = upper_t_unit;

	// Unit diag A = [1 3 4 5; 0 1 7 8; 0 0 1 10; 0 0 0 1]

	// B = A^T * [1,2,3,4] = [1, 5, 21, 55]
	var AP = new Float64Array( [ 99, 3, 99, 4, 7, 99, 5, 8, 10, 99 ] );
	var x = new Float64Array( [ 1, 5, 21, 55 ] );
	dtpsv( 'upper', 'transpose', 'unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: lower_t_unit', function t() {
	var tc = lower_t_unit;

	// Unit diag A = [1 0 0 0; 3 1 0 0; 4 7 1 0; 5 8 10 1]

	// B = A^T * [1,2,3,4] = [39, 55, 43, 4]
	var AP = new Float64Array( [ 99, 3, 4, 5, 99, 7, 8, 99, 10, 99 ] );
	var x = new Float64Array( [ 39, 55, 43, 4 ] );
	dtpsv( 'lower', 'transpose', 'unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: n_zero', function t() {
	var AP = new Float64Array( [ 2 ] );
	var x = new Float64Array( [ 99.0 ] );
	dtpsv( 'upper', 'no-transpose', 'non-unit', 0, AP, 1, 0, x, 1, 0 );
	assert.equal( x[ 0 ], 99.0 );
});

test( 'dtpsv: n_one', function t() {
	var tc = n_one;

	// N=1: AP=[5], x=[15] => x = 15/5 = 3
	var AP = new Float64Array( [ 5 ] );
	var x = new Float64Array( [ 15 ] );
	dtpsv( 'upper', 'no-transpose', 'non-unit', 1, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: n_one_unit', function t() {
	var tc = n_one_unit;

	// N=1, unit diag: x unchanged = 7
	var AP = new Float64Array( [ 99 ] );
	var x = new Float64Array( [ 7 ] );
	dtpsv( 'lower', 'transpose', 'unit', 1, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: stride_2', function t() {
	var tc = stride_2;

	// Upper, no-trans, non-unit, stride=2
	var AP = new Float64Array( [ 2, 3, 6, 4, 7, 9, 5, 8, 10, 11 ] );
	var x = new Float64Array( [ 40, 0, 65, 0, 67, 0, 44, 0 ] );
	dtpsv( 'upper', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 2, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: neg_stride', function t() {
	var tc = neg_stride;

	// Lower, no-trans, non-unit, stride=-1

	// Fortran x = [95, 45, 15, 2] with INCX=-1

	// In JS, negative stride means start from end: offsetX = (N-1)*|stride| = 3
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 95, 45, 15, 2 ] );
	dtpsv( 'lower', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, -1, 3 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: upper_n_zeros', function t() {
	var tc = upper_n_zeros;

	// Upper, no-trans, non-unit with zero RHS entries
	var AP = new Float64Array( [ 2, 3, 6, 4, 7, 9, 5, 8, 10, 11 ] );
	var x = new Float64Array( [ 0, 0, 0, 44 ] );
	dtpsv( 'upper', 'no-transpose', 'non-unit', 4, AP, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtpsv: lower_t_stride_2', function t() {
	var tc = lower_t_stride_2;

	// Lower, transpose, non-unit, stride=2
	var AP = new Float64Array( [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] );
	var x = new Float64Array( [ 40, 0, 65, 0, 67, 0, 44, 0 ] );
	dtpsv( 'lower', 'transpose', 'non-unit', 4, AP, 1, 0, x, 2, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});
