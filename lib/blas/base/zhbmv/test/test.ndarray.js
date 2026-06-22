/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbmv from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };

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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zhbmv: main export is a function', function t() {
	assert.strictEqual( typeof zhbmv, 'function' );
});

test( 'zhbmv: upper_basic (UPLO=U, N=4, K=2, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = upper_basic;
	A = new Complex128Array([
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		3,
		-2,
		2,
		1,
		5,
		0,
		0.5,
		-1,
		1.5,
		0.5,
		3,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'upper', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: lower_basic (UPLO=L, N=4, K=2, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = lower_basic;
	A = new Complex128Array([
		2,
		0,
		1,
		-1,
		3,
		2,
		4,
		0,
		2,
		-1,
		0.5,
		1,
		5,
		0,
		1.5,
		-0.5,
		0,
		0,
		3,
		0,
		0,
		0,
		0,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'lower', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: complex_alpha_beta (alpha=(2,1), beta=(0.5,-0.5))', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = complex_alpha_beta;
	A = new Complex128Array([
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		3,
		-2,
		2,
		1,
		5,
		0,
		0.5,
		-1,
		1.5,
		0.5,
		3,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5, 3, 0 ] );
	alpha = new Complex128( 2, 1 );
	beta = new Complex128( 0.5, -0.5 );
	result = zhbmv( 'upper', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: alpha_zero (alpha=0, beta=(2,0) scales y only)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero;
	A = new Complex128Array([
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		3,
		-2,
		2,
		1,
		5,
		0,
		0.5,
		-1,
		1.5,
		0.5,
		3,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 2, 0 );
	result = zhbmv( 'upper', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: n_zero (N=0 quick return)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = n_zero;
	A = new Complex128Array( 0 );
	x = new Complex128Array( 0 );
	y = new Complex128Array( [ 99, 0 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'upper', 0, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: alpha_zero_beta_zero (alpha=0, beta=0 zeroes y)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero_beta_zero;
	A = new Complex128Array([
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		3,
		-2,
		2,
		1,
		5,
		0,
		0.5,
		-1,
		1.5,
		0.5,
		3,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( [ 99, 88, 77, 66, 55, 44, 33, 22 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'upper', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: stride_2 (non-unit strides)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = stride_2;
	A = new Complex128Array([
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		3,
		-2,
		2,
		1,
		5,
		0,
		0.5,
		-1,
		1.5,
		0.5,
		3,
		0
	]);
	x = new Complex128Array([
		1, 0.5, 0, 0, 2, -1, 0, 0, 3, 1, 0, 0, 4, 0, 0, 0
	]);
	y = new Complex128Array( 8 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'upper', 4, 2, alpha, A, 1, 3, 0, x, 2, 0, beta, y, 2, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: scalar (1x1, K=0, alpha=(2,1))', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = scalar;
	A = new Complex128Array( [ 5, 0 ] );
	x = new Complex128Array( [ 3, 2 ] );
	y = new Complex128Array( 1 );
	alpha = new Complex128( 2, 1 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'upper', 1, 0, alpha, A, 1, 1, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: alpha=0, beta=1 quick return (y unchanged)', function t() {
	var result;
	var alpha;
	var beta;
	var yv;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		1,
		4,
		0,
		3,
		-2,
		2,
		1,
		5,
		0,
		0.5,
		-1,
		1.5,
		0.5,
		3,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( [ 5, 6, 7, 8, 9, 10, 11, 12 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 1, 0 );
	result = zhbmv( 'upper', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	yv = reinterpret( y, 0 );
	assert.strictEqual( yv[ 0 ], 5 );
	assert.strictEqual( yv[ 1 ], 6 );
	assert.strictEqual( yv[ 2 ], 7 );
	assert.strictEqual( yv[ 3 ], 8 );
	assert.strictEqual( yv[ 4 ], 9 );
	assert.strictEqual( yv[ 5 ], 10 );
	assert.strictEqual( yv[ 6 ], 11 );
	assert.strictEqual( yv[ 7 ], 12 );
});

test( 'zhbmv: lower with non-unit strides', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		2,
		0,
		1,
		-1,
		3,
		2,
		4,
		0,
		2,
		-1,
		0.5,
		1,
		5,
		0,
		1.5,
		-0.5,
		0,
		0,
		3,
		0,
		0,
		0,
		0,
		0
	]);
	x = new Complex128Array([
		1, 0.5, 0, 0, 2, -1, 0, 0, 3, 1, 0, 0, 4, 0, 0, 0
	]);
	y = new Complex128Array( 8 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhbmv( 'lower', 4, 2, alpha, A, 1, 3, 0, x, 2, 0, beta, y, 2, 0 );
	assert.strictEqual( result, y );
	tc = stride_2;
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: lower with complex alpha and beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		2,
		0,
		1,
		-1,
		3,
		2,
		4,
		0,
		2,
		-1,
		0.5,
		1,
		5,
		0,
		1.5,
		-0.5,
		0,
		0,
		3,
		0,
		0,
		0,
		0,
		0
	]);
	x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 0 ] );
	y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5, 3, 0 ] );
	alpha = new Complex128( 2, 1 );
	beta = new Complex128( 0.5, -0.5 );
	result = zhbmv( 'lower', 4, 2, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	tc = complex_alpha_beta;
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhbmv: K=1 bandwidth (tridiagonal-like)', function t() {
	var alpha;
	var beta;
	var yv;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		0,
		0,
		2,
		0,
		1,
		1,
		3,
		0,
		2,
		-1,
		4,
		0
	]);
	x = new Complex128Array( [ 1, 0, 0, 1, 1, -1 ] );
	y = new Complex128Array( 3 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	zhbmv( 'upper', 3, 1, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	yv = reinterpret( y, 0 );
	assertClose( yv[ 0 ], 1, 1e-14, 'y[0].re' );
	assertClose( yv[ 1 ], 1, 1e-14, 'y[0].im' );
	assertClose( yv[ 2 ], 2, 1e-14, 'y[1].re' );
	assertClose( yv[ 3 ], -1, 1e-14, 'y[1].im' );
	assertClose( yv[ 4 ], 3, 1e-14, 'y[2].re' );
	assertClose( yv[ 5 ], -2, 1e-14, 'y[2].im' );
});

test( 'zhbmv: lower K=1 bandwidth (tridiagonal-like)', function t() {
	var alpha;
	var beta;
	var yv;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		2,
		0,
		1,
		-1,
		3,
		0,
		2,
		1,
		4,
		0,
		0,
		0
	]);
	x = new Complex128Array( [ 1, 0, 0, 1, 1, -1 ] );
	y = new Complex128Array( 3 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	zhbmv( 'lower', 3, 1, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	yv = reinterpret( y, 0 );
	assertClose( yv[ 0 ], 1, 1e-14, 'y[0].re' );
	assertClose( yv[ 1 ], 1, 1e-14, 'y[0].im' );
	assertClose( yv[ 2 ], 2, 1e-14, 'y[1].re' );
	assertClose( yv[ 3 ], -1, 1e-14, 'y[1].im' );
	assertClose( yv[ 4 ], 3, 1e-14, 'y[2].re' );
	assertClose( yv[ 5 ], -2, 1e-14, 'y[2].im' );
});

test( 'zhbmv: beta scaling with non-trivial imaginary part', function t() {
	var alpha;
	var beta;
	var yv;
	var A;
	var x;
	var y;

	A = new Complex128Array( [ 3, 0 ] );
	x = new Complex128Array( [ 1, 0 ] );
	y = new Complex128Array( [ 2, 3 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 1 );
	zhbmv( 'upper', 1, 0, alpha, A, 1, 1, 0, x, 1, 0, beta, y, 1, 0 );
	yv = reinterpret( y, 0 );
	assertClose( yv[ 0 ], 0, 1e-14, 'y[0].re' );
	assertClose( yv[ 1 ], 2, 1e-14, 'y[0].im' );
});
