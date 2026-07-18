/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpmv from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import lower_nonzero_beta from './fixtures/lower_nonzero_beta.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i += 1 ) {
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

test( 'zhpmv is a function', function t() {
	assert.strictEqual( typeof zhpmv, 'function' );
});

test( 'zhpmv: upper_basic (UPLO=upper, N=3, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len

	const tc = upper_basic;
	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( 3 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: lower_basic (UPLO=lower, N=3, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len

	const tc = lower_basic;
	const AP = new Complex128Array( [ 2, 0, 1, -1, 3, 2, 4, 0, 2, -1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( 3 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'lower', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: complex_alpha_beta (UPLO=upper, alpha=(2,1), beta=(0.5,-0.5))', function t() { // eslint-disable-line max-len

	const tc = complex_alpha_beta;
	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5 ] );
	const alpha = new Complex128( 2, 1 );
	const beta = new Complex128( 0.5, -0.5 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: alpha_zero (alpha=(0,0), beta=(2,0)) scales y only', function t() { // eslint-disable-line max-len

	const tc = alpha_zero;
	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	const alpha = new Complex128( 0, 0 );
	const beta = new Complex128( 2, 0 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: n_zero (N=0 quick return, y unchanged)', function t() {

	const tc = n_zero;
	const AP = new Complex128Array( 6 );
	const x = new Complex128Array( 3 );
	const y = new Complex128Array( [ 99, 0, 0, 0, 0, 0 ] );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'upper', 0, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ).slice( 0, 2 ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: alpha_zero_beta_zero (zeros y)', function t() {

	const tc = alpha_zero_beta_zero;
	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 99, 88, 77, 66, 55, 44 ] );
	const alpha = new Complex128( 0, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: stride_2 (incx=2, incy=2)', function t() {

	const tc = stride_2;
	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 0, 0, 2, -1, 0, 0, 3, 1, 0, 0 ] );
	const y = new Complex128Array( 6 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 2, 0, beta, y, 2, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: scalar (N=1, alpha=(2,1))', function t() {

	const tc = scalar;
	const AP = new Complex128Array( [ 3, 0 ] );
	const x = new Complex128Array( [ 5, 2 ] );
	const y = new Complex128Array( 1 );
	const alpha = new Complex128( 2, 1 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'upper', 1, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: lower_nonzero_beta (UPLO=lower, beta=(0.5,0))', function t() {

	const tc = lower_nonzero_beta;
	const AP = new Complex128Array( [ 2, 0, 1, -1, 3, 2, 4, 0, 2, -1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5 ] );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0.5, 0 );
	zhpmv( 'lower', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), tc.y, 1e-14, 'y' );
});

test( 'zhpmv: alpha=(1,0), beta=(1,0) quick return (no computation)', function t() { // eslint-disable-line max-len

	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 7, 8, 9, 10, 11, 12 ] );
	const alpha = new Complex128( 0, 0 );
	const beta = new Complex128( 1, 0 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), [ 7, 8, 9, 10, 11, 12 ], 1e-14, 'y unchanged' ); // eslint-disable-line max-len
});

test( 'zhpmv: returns y', function t() {

	const AP = new Complex128Array( [ 3, 0 ] );
	const x = new Complex128Array( [ 1, 0 ] );
	const y = new Complex128Array( 1 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const result = zhpmv( 'upper', 1, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
});

test( 'zhpmv: upper with complex beta (beta=(1,1))', function t() {

	const AP = new Complex128Array( [ 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 1, 0, 0, 1, 1, -1 ] );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 1, 1 );
	zhpmv( 'upper', 3, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), [ 17, 0, 13.5, 1.5, 22, 4.5 ], 1e-14, 'y' );
});

test( 'zhpmv: lower with stride 2', function t() {

	const AP = new Complex128Array( [ 2, 0, 1, -1, 3, 2, 4, 0, 2, -1, 5, 0 ] );
	const x = new Complex128Array( [ 1, 0.5, 0, 0, 2, -1, 0, 0, 3, 1, 0, 0 ] );
	const y = new Complex128Array( 6 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'lower', 3, alpha, AP, 1, 0, x, 2, 0, beta, y, 2, 0 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ), [ 16, -1, 0, 0, 14.5, 0.5, 0, 0, 20, 4.5, 0, 0 ], 1e-14, 'y' ); // eslint-disable-line max-len
});

test( 'zhpmv: upper with offset', function t() {

	const AP = new Complex128Array( [ 0, 0, 2, 0, 1, 1, 4, 0, 3, -2, 2, 1, 5, 0 ] );
	const x = new Complex128Array( [ 0, 0, 1, 0.5, 2, -1, 3, 1 ] );
	const y = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	zhpmv( 'upper', 3, alpha, AP, 1, 1, x, 1, 1, beta, y, 1, 1 );
	const yv = reinterpret( y, 0 );
	assertArrayClose( toArray( yv ).slice( 2, 8 ), [ 16, -1, 14.5, 0.5, 20, 4.5 ], 1e-14, 'y with offset' ); // eslint-disable-line max-len
});
