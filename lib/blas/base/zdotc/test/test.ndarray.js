/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zdotc from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import conjugation from './fixtures/conjugation.json' with { type: 'json' };
import non_unit_stride from './fixtures/non_unit_stride.json' with { type: 'json' };
import negative_stride from './fixtures/negative_stride.json' with { type: 'json' };
import both_negative from './fixtures/both_negative.json' with { type: 'json' };
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

/**
* Asserts that a Complex128 result matches expected [real, imag] from fixture.
*/
function assertComplexClose( result, expected, tol, msg ) {
	assertClose( real( result ), expected[ 0 ], tol, msg + ' real' );
	assertClose( imag( result ), expected[ 1 ], tol, msg + ' imag' );
}

// TESTS //

test( 'zdotc: main export is a function', function t() {
	assert.strictEqual( typeof zdotc, 'function' );
});

test( 'zdotc: basic (N=3, unit stride)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = basic;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, 1, 0, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'basic' );
});

test( 'zdotc: N=0 returns (0,0)', function t() {
	var result;
	var x;
	var y;

	x = new Complex128Array( [ 1, 2, 3, 4 ] );
	y = new Complex128Array( [ 5, 6, 7, 8 ] );
	result = zdotc( 0, x, 1, 0, y, 1, 0 );
	assert.strictEqual( real( result ), 0.0 );
	assert.strictEqual( imag( result ), 0.0 );
});

test( 'zdotc: throws RangeError for N<0', function t() {
	var x = new Complex128Array( [ 1, 2, 3, 4 ] );
	var y = new Complex128Array( [ 5, 6, 7, 8 ] );
	assert.throws( function() {
		zdotc( -1, x, 1, 0, y, 1, 0 );
	}, RangeError );
});

test( 'zdotc: N=1', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = n_one;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, 1, 0, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'n_one' );
});

test( 'zdotc: conjugation verification', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = conjugation;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, 1, 0, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'conjugation' );
});

test( 'zdotc: non-unit stride (strideX=2, strideY=1)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = non_unit_stride;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, 2, 0, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'non_unit_stride' );
});

test( 'zdotc: negative stride (strideX=-1)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = negative_stride;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, -1, 2, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'negative_stride' );
});

test( 'zdotc: both negative strides', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = both_negative;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, -1, 2, y, -1, 2 );
	assertComplexClose( result, tc.result, 1e-14, 'both_negative' );
});

test( 'zdotc: purely imaginary vectors', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = purely_imaginary;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, 1, 0, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'purely_imaginary' );
});

test( 'zdotc: larger N (N=6)', function t() {
	var result;
	var tc;
	var x;
	var y;

	tc = larger_n;
	x = new Complex128Array( tc.x );
	y = new Complex128Array( tc.y );
	result = zdotc( tc.N, x, 1, 0, y, 1, 0 );
	assertComplexClose( result, tc.result, 1e-14, 'larger_n' );
});

test( 'zdotc: offsetX and offsetY', function t() {
	var result;
	var x;
	var y;

	x = new Complex128Array( [ 99, 99, 1, 2, 3, 4, 5, 6 ] );
	y = new Complex128Array( [ 99, 99, 99, 99, 7, 8, 9, 10, 11, 12 ] );
	result = zdotc( 3, x, 1, 1, y, 1, 2 );
	assertClose( real( result ), 217.0, 1e-14, 'offset real' );
	assertClose( imag( result ), -18.0, 1e-14, 'offset imag' );
});

test( 'zdotc: self dot product gives squared norm', function t() {
	var result;
	var x;

	x = new Complex128Array( [ 1, 2, 3, 4 ] );
	result = zdotc( 2, x, 1, 0, x, 1, 0 );
	assertClose( real( result ), 30.0, 1e-14, 'self-dot real' );
	assertClose( imag( result ), 0.0, 1e-14, 'self-dot imag' );
});
