/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zdotu from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import non_unit_stride from './fixtures/non_unit_stride.json' with { type: 'json' };
import negative_stride from './fixtures/negative_stride.json' with { type: 'json' };
import both_negative from './fixtures/both_negative.json' with { type: 'json' };
import purely_real from './fixtures/purely_real.json' with { type: 'json' };
import purely_imaginary from './fixtures/purely_imaginary.json' with { type: 'json' };
import larger_n from './fixtures/larger_n.json' with { type: 'json' };

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

// TESTS //

test( 'zdotu: main export is a function', function t() {
	assert.strictEqual( typeof zdotu, 'function' );
});

test( 'zdotu: basic (N=3, unit stride)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = basic;
	x = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	y = new Complex128Array( [ 7, 8, 9, 10, 11, 12 ] );
	result = zdotu( 3, x, 1, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: N=0 returns (0,0)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = n_zero;
	x = new Complex128Array( [ 1, 2, 3, 4 ] );
	y = new Complex128Array( [ 5, 6, 7, 8 ] );
	result = zdotu( 0, x, 1, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: N=1', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = n_one;
	x = new Complex128Array( [ 3, 4 ] );
	y = new Complex128Array( [ 1, 2 ] );
	result = zdotu( 1, x, 1, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: non-unit stride (incx=2, incy=1)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = non_unit_stride;
	x = new Complex128Array( [ 1, 2, 99, 99, 3, 4, 99, 99, 5, 6 ] );
	y = new Complex128Array( [ 7, 8, 9, 10, 11, 12 ] );
	result = zdotu( 3, x, 2, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: negative stride (incx=-1)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = negative_stride;
	x = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	y = new Complex128Array( [ 7, 8, 9, 10, 11, 12 ] );
	result = zdotu( 3, x, -1, 2, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: both negative strides', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = both_negative;
	x = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	y = new Complex128Array( [ 7, 8, 9, 10, 11, 12 ] );
	result = zdotu( 3, x, -1, 2, y, -1, 2 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: purely real vectors', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = purely_real;
	x = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	y = new Complex128Array( [ 4, 0, 5, 0, 6, 0 ] );
	result = zdotu( 3, x, 1, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: purely imaginary vectors', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = purely_imaginary;
	x = new Complex128Array( [ 0, 1, 0, 2, 0, 3 ] );
	y = new Complex128Array( [ 0, 4, 0, 5, 0, 6 ] );
	result = zdotu( 3, x, 1, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: larger N (N=6)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = larger_n;
	x = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6 ] );
	y = new Complex128Array( [ 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0 ] );
	result = zdotu( 6, x, 1, 0, y, 1, 0 );
	assertClose( real( result ), tc.result[ 0 ], 1e-14, 'real' );
	assertClose( imag( result ), tc.result[ 1 ], 1e-14, 'imag' );
});

test( 'zdotu: offset support', function t() {
	var result;
	var x;
	var y;

	x = new Complex128Array( [ 99, 99, 3, 4 ] );
	y = new Complex128Array( [ 88, 88, 1, 2 ] );
	result = zdotu( 1, x, 1, 1, y, 1, 1 );
	assertClose( real( result ), -5.0, 1e-14, 'real' );
	assertClose( imag( result ), 10.0, 1e-14, 'imag' );
});
