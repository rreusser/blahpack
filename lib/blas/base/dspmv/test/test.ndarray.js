/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspmv from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import lower_beta_zero from './fixtures/lower_beta_zero.json' with { type: 'json' };
import upper_beta_one from './fixtures/upper_beta_one.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import lower_stride_alpha_beta from './fixtures/lower_stride_alpha_beta.json' with { type: 'json' };
import negative_stride from './fixtures/negative_stride.json' with { type: 'json' };
import lower_negative_stride from './fixtures/lower_negative_stride.json' with { type: 'json' };

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

test( 'dspmv: upper_basic (uplo=U, N=4, alpha=1, beta=0, unit strides)', function t() { // eslint-disable-line max-len
	var tc = upper_basic;
	var AP = new Float64Array( [ 1, 2, 5, 3, 6, 8, 4, 7, 9, 10 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var y = new Float64Array( [ 0, 0, 0, 0 ] );

	dspmv( 'upper', 4, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: lower_basic (uplo=L, N=4, alpha=1, beta=0, unit strides)', function t() { // eslint-disable-line max-len
	var tc = lower_basic;
	var AP = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var y = new Float64Array( [ 0, 0, 0, 0 ] );

	dspmv( 'lower', 4, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: alpha_beta (uplo=U, alpha=2, beta=0.5)', function t() {
	var tc = alpha_beta;
	var AP = new Float64Array( [ 1, 2, 5, 3, 6, 8, 4, 7, 9, 10 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var y = new Float64Array( [ 10, 20, 30, 40 ] );

	dspmv( 'upper', 4, 2.0, AP, 1, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: n_zero (quick return)', function t() {
	var tc = n_zero;
	var AP = new Float64Array( [ 1 ] );
	var x = new Float64Array( [ 1 ] );
	var y = new Float64Array( [ 99 ] );

	dspmv( 'upper', 0, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: n_one (N=1, alpha=2, beta=3)', function t() {
	var tc = n_one;
	var AP = new Float64Array( [ 3 ] );
	var x = new Float64Array( [ 5 ] );
	var y = new Float64Array( [ 7 ] );

	dspmv( 'upper', 1, 2.0, AP, 1, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: alpha_zero (alpha=0, just scales y by beta)', function t() {
	var tc = alpha_zero;
	var AP = new Float64Array( [ 1, 2, 5, 3, 6, 8, 4, 7, 9, 10 ] );
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var y = new Float64Array( [ 10, 20, 30, 40 ] );

	dspmv( 'upper', 4, 0.0, AP, 1, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: lower_beta_zero (uplo=L, beta=0)', function t() {
	var tc = lower_beta_zero;
	var AP = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var x = new Float64Array( [ 1, 1, 1 ] );
	var y = new Float64Array( [ 99, 88, 77 ] );

	dspmv( 'lower', 3, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: upper_beta_one (uplo=U, beta=1)', function t() {
	var tc = upper_beta_one;
	var AP = new Float64Array( [ 1, 2, 4, 3, 5, 6 ] );
	var x = new Float64Array( [ 1, 1, 1 ] );
	var y = new Float64Array( [ 10, 20, 30 ] );

	dspmv( 'upper', 3, 1.0, AP, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: stride (uplo=U, N=4, incx=2, incy=2)', function t() {
	var tc = stride;
	var AP = new Float64Array( [ 1, 2, 5, 3, 6, 8, 4, 7, 9, 10 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	var y = new Float64Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );

	dspmv( 'upper', 4, 1.0, AP, 1, 0, x, 2, 0, 0.0, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: lower_stride_alpha_beta (uplo=L, N=3, incx=2, incy=2, alpha=2, beta=0.5)', function t() { // eslint-disable-line max-len
	var tc = lower_stride_alpha_beta;
	var AP = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3, 0 ] );
	var y = new Float64Array( [ 10, 0, 20, 0, 30, 0 ] );

	dspmv( 'lower', 3, 2.0, AP, 1, 0, x, 2, 0, 0.5, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: negative_stride (uplo=U, N=3, incx=-1, incy=-1)', function t() {
	var tc = negative_stride;
	var AP = new Float64Array( [ 1, 2, 4, 3, 5, 6 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 0, 0, 0 ] );

	dspmv( 'upper', 3, 1.0, AP, 1, 0, x, -1, 2, 0.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: lower_negative_stride (uplo=L, N=3, incx=-2, incy=-2)', function t() { // eslint-disable-line max-len
	var tc = lower_negative_stride;
	var AP = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3, 0 ] );
	var y = new Float64Array( [ 10, 0, 20, 0, 30, 0 ] );

	dspmv( 'lower', 3, 1.0, AP, 1, 0, x, -2, 4, 0.5, y, -2, 4 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dspmv: returns y', function t() {
	var result;
	var AP;
	var x;
	var y;

	AP = new Float64Array( [ 1 ] );
	x = new Float64Array( [ 1 ] );
	y = new Float64Array( [ 0 ] );
	result = dspmv( 'upper', 1, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( result, y );
});

test( 'dspmv: alpha=0 and beta=1 quick return does not modify y', function t() {
	var AP = new Float64Array( [ 1, 2, 3 ] );
	var x = new Float64Array( [ 1, 2 ] );
	var y = new Float64Array( [ 99, 88 ] );

	dspmv( 'upper', 2, 0.0, AP, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
	assert.equal( y[ 0 ], 99 );
	assert.equal( y[ 1 ], 88 );
});

// ndarray validation tests

test( 'dspmv: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function invalid() {
		ndarray( 'invalid', 2, 1.0, new Float64Array( 3 ), 1, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dspmv: ndarray throws RangeError for negative N', function t() {
	assert.throws( function invalid() {
		ndarray( 'upper', -1, 1.0, new Float64Array( 3 ), 1, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dspmv: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function invalid() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 3 ), 1, 0, new Float64Array( 2 ), 0, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dspmv: ndarray throws RangeError for zero strideY', function t() {
	assert.throws( function invalid() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 3 ), 1, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
