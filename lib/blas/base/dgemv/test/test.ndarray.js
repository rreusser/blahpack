/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemv from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import transpose from './fixtures/transpose.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import transpose_alpha_beta from './fixtures/transpose_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };

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

// A = [1 4; 2 5; 3 6] column-major (3x2): strideA1=1, strideA2=3
var A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );

test( 'dgemv: basic trans=N', function t() {
	var tc = basic;
	var x = new Float64Array( [ 1, 2 ] );
	var y = new Float64Array( 3 );
	dgemv( 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'basic' );
});

test( 'dgemv: transpose trans=T', function t() {
	var tc = transpose;
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( 2 );
	dgemv( 'transpose', 3, 2, 1.0, A, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'transpose' );
});

test( 'dgemv: alpha and beta scaling', function t() {
	var tc = alpha_beta;
	var x = new Float64Array( [ 1, 2 ] );
	var y = new Float64Array( [ 10, 20, 30 ] );
	dgemv( 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'alpha_beta' );
});

test( 'dgemv: N=0 quick return', function t() {
	var tc = n_zero;
	var y = new Float64Array( [ 99 ] );
	dgemv( 'no-transpose', 3, 0, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, y, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( y, tc.y, 1e-14, 'n_zero' );
});

test( 'dgemv: M=0 quick return', function t() {
	var tc = m_zero;
	var y = new Float64Array( [ 99 ] );
	dgemv( 'no-transpose', 0, 2, 1.0, A, 1, 1, 0, new Float64Array( 2 ), 1, 0, 0.0, y, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( y, tc.y, 1e-14, 'm_zero' );
});

test( 'dgemv: non-unit strides incx=2, incy=2', function t() {
	var tc;
	var x;
	var y;

	tc = stride;
	x = new Float64Array( 20 );
	x[ 0 ] = 1;
	x[ 2 ] = 2;
	y = new Float64Array( 20 );
	y[ 0 ] = 10;
	y[ 2 ] = 20;
	y[ 4 ] = 30;
	dgemv( 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, x, 2, 0, 1.0, y, 2, 0 );
	assertArrayClose( y.subarray( 0, 6 ), tc.y, 1e-14, 'stride' );
});

test( 'dgemv: transpose with alpha and beta', function t() {
	var tc = transpose_alpha_beta;
	var x = new Float64Array( [ 1, 1, 1 ] );
	var y = new Float64Array( [ 5, 10 ] );
	dgemv( 'transpose', 3, 2, 2.0, A, 1, 3, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'transpose_alpha_beta' );
});

test( 'dgemv: alpha=0 just scales y by beta', function t() {
	var tc = alpha_zero;
	var y = new Float64Array( [ 10, 20, 30 ] );
	dgemv( 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 2.0, y, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( y, tc.y, 1e-14, 'alpha_zero' );
});

// ndarray validation tests

test( 'dgemv: ndarray throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 2, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dgemv: ndarray throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', -1, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemv: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', 2, -1, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemv: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', 2, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 0, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemv: ndarray throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', 2, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
