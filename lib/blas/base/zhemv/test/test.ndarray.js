/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhemv from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero_beta_one from './fixtures/alpha_zero_beta_one.json' with { type: 'json' };
import alpha_zero_beta_scale from './fixtures/alpha_zero_beta_scale.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_stride from './fixtures/upper_stride.json' with { type: 'json' };
import lower_stride from './fixtures/lower_stride.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import beta_zero from './fixtures/beta_zero.json' with { type: 'json' };

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

test( 'zhemv: upper_basic (UPLO=U, N=3, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = upper_basic;
	A = new Complex128Array([
		2,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		3,
		0,
		0,
		0,
		2,
		-1,
		1,
		2,
		4,
		0
	]);
	x = new Complex128Array( [ 1, 0, 0, 1, 1, 1 ] );
	y = new Complex128Array( 3 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhemv( 'upper', 3, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: lower_basic (UPLO=L, N=3, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len
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
		2,
		1,
		0,
		0,
		3,
		0,
		1,
		-2,
		0,
		0,
		0,
		0,
		4,
		0
	]);
	x = new Complex128Array( [ 1, 0, 0, 1, 1, 1 ] );
	y = new Complex128Array( 3 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhemv( 'lower', 3, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: n_zero (N=0 quick return)', function t() {
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
	y = new Complex128Array( [ 99, 88 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhemv( 'upper', 0, alpha, A, 1, 1, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: alpha_zero_beta_one (alpha=0, beta=1 quick return)', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero_beta_one;
	A = new Complex128Array( 4 );
	x = new Complex128Array( [ 1, 0, 1, 0 ] );
	y = new Complex128Array( [ 5, 6, 7, 8 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 1, 0 );
	result = zhemv( 'upper', 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: alpha_zero_beta_scale (alpha=0, beta=(2,1) — scale y only)', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero_beta_scale;
	A = new Complex128Array( 4 );
	x = new Complex128Array( [ 1, 0, 1, 0 ] );
	y = new Complex128Array( [ 1, 0, 0, 1 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 2, 1 );
	result = zhemv( 'upper', 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: n_one (N=1)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = n_one;
	A = new Complex128Array( [ 5, 0 ] );
	x = new Complex128Array( [ 2, 3 ] );
	y = new Complex128Array( [ 1, 1 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 1, 0 );
	result = zhemv( 'upper', 1, alpha, A, 1, 1, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: upper_stride (UPLO=U, incx=2, incy=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = upper_stride;
	A = new Complex128Array([
		2,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		3,
		0,
		0,
		0,
		2,
		-1,
		1,
		2,
		4,
		0
	]);
	x = new Complex128Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 1, 1 ] );
	y = new Complex128Array( 5 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhemv( 'upper', 3, alpha, A, 1, 3, 0, x, 2, 0, beta, y, 2, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: lower_stride (UPLO=L, incx=2, incy=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = lower_stride;
	A = new Complex128Array([
		2,
		0,
		1,
		-1,
		2,
		1,
		0,
		0,
		3,
		0,
		1,
		-2,
		0,
		0,
		0,
		0,
		4,
		0
	]);
	x = new Complex128Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 1, 1 ] );
	y = new Complex128Array( 5 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhemv( 'lower', 3, alpha, A, 1, 3, 0, x, 2, 0, beta, y, 2, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: complex_alpha_beta (alpha=(2,1), beta=(1,-1))', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = complex_alpha_beta;
	A = new Complex128Array([
		2,
		0,
		0,
		0,
		0,
		0,
		1,
		1
	]);
	x = new Complex128Array( [ 1, 0, 1, 0 ] );
	y = new Complex128Array( [ 1, 0, 0, 1 ] );
	alpha = new Complex128( 2, 1 );
	beta = new Complex128( 1, -1 );
	result = zhemv( 'upper', 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zhemv: beta_zero (beta=0 zeroes y first)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = beta_zero;
	A = new Complex128Array([
		1,
		0,
		0,
		0,
		1,
		1,
		2,
		0
	]);
	x = new Complex128Array( [ 1, 0, 1, 0 ] );
	y = new Complex128Array( [ 99, 99, 99, 99 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = zhemv( 'upper', 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

// ndarray validation tests

test( 'zhemv: ndarray throws TypeError for invalid uplo', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	assert.throws( function throws() {
		ndarray( 'invalid', 2, alpha, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, beta, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhemv: ndarray throws RangeError for negative N', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	assert.throws( function throws() {
		ndarray( 'upper', -1, alpha, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, beta, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhemv: ndarray throws RangeError for zero strideX', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	assert.throws( function throws() {
		ndarray( 'upper', 2, alpha, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 0, 0, beta, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhemv: ndarray throws RangeError for zero strideY', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	assert.throws( function throws() {
		ndarray( 'upper', 2, alpha, new Complex128Array( 4 ), 1, 2, 0, new Complex128Array( 2 ), 1, 0, beta, new Complex128Array( 2 ), 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
