/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import base from './../lib/ndarray.js';
var ndarray = base;


// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import nZero from './fixtures/n_zero.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import negative from './fixtures/negative.json' with { type: 'json' };
import largeValues from './fixtures/large_values.json' with { type: 'json' };
import zeros from './fixtures/zeros.json' with { type: 'json' };
import purelyImaginary from './fixtures/purely_imaginary.json' with { type: 'json' };


// FUNCTIONS //

/**
* Converts a typed array view to a plain Array.
*
* @private
* @param {TypedArray} view - typed array
* @returns {Array} plain array copy
*/
function toArray( view ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < view.length; i += 1 ) {
		out.push( view[ i ] );
	}
	return out;
}

/**
* Asserts two numbers are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'base is a function', function t1() {
	assert.equal( typeof base, 'function' );
});

test( 'base: basic (n=5)', function t2() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	y = new Complex128Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0 ] );
	w = new Complex128Array( [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ] );
	base( 5, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), basic.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), basic.y, 1e-14, 'y' );
});

test( 'base: n_zero (arrays unchanged)', function t3() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 1, 2, 3, 4 ] );
	y = new Complex128Array( [ 0.1, 0.2, 0.3, 0.4 ] );
	w = new Complex128Array( [ 10, 20, 30, 40 ] );
	base( 0, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), nZero.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), nZero.y, 1e-14, 'y' );
});

test( 'base: n_one', function t4() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 1, 2 ] );
	y = new Complex128Array( [ 0.1, 0.2 ] );
	w = new Complex128Array( [ 10, 20 ] );
	base( 1, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), nOne.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), nOne.y, 1e-14, 'y' );
});

test( 'base: negative values', function t5() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ -1, -2, -3, -4, -5, -6, -7, -8 ] );
	y = new Complex128Array( [ 0.01, -0.02, 0.03, -0.04, 0.05, -0.06, 0.07, -0.08 ] );
	w = new Complex128Array( [ 0.5, -0.5, -0.5, 0.5, 1.5, -1.5, -1.5, 1.5 ] );
	base( 4, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), negative.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), negative.y, 1e-14, 'y' );
});

test( 'base: large values (precision)', function t6() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 1e15, 2e15, 3e15, 4e15, 5e15, 6e15 ] );
	y = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	w = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	base( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), largeValues.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), largeValues.y, 1e-14, 'y' );
});

test( 'base: zeros', function t7() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 0, 0, 0, 0, 0, 0 ] );
	y = new Complex128Array( [ 0, 0, 0, 0, 0, 0 ] );
	w = new Complex128Array( [ 0, 0, 0, 0, 0, 0 ] );
	base( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), zeros.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), zeros.y, 1e-14, 'y' );
});

test( 'base: purely imaginary', function t8() {
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 0, 1, 0, 3, 0, 5 ] );
	y = new Complex128Array( [ 0, 0.1, 0, 0.3, 0, 0.5 ] );
	w = new Complex128Array( [ 0, 10, 0, 30, 0, 50 ] );
	base( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), purelyImaginary.x, 1e-14, 'x' );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), purelyImaginary.y, 1e-14, 'y' );
});

test( 'base: non-unit strides', function t9() {
	var xv;
	var yv;
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 999, 999, 1, 2, 999, 999, 3, 4, 999, 999, 5, 6 ] );
	y = new Complex128Array( [ 999, 999, 0.1, 0.2, 999, 999, 0.3, 0.4, 999, 999, 0.5, 0.6 ] );
	w = new Complex128Array( [ 999, 999, 10, 20, 999, 999, 30, 40, 999, 999, 50, 60 ] );
	base( 3, x, 2, 1, y, 2, 1, w, 2, 1 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );
	assertClose( xv[ 2 ], basic.x[ 0 ], 1e-14, 'x[1].re' );
	assertClose( xv[ 3 ], basic.x[ 1 ], 1e-14, 'x[1].im' );
	assertClose( xv[ 6 ], basic.x[ 2 ], 1e-14, 'x[3].re' );
	assertClose( xv[ 7 ], basic.x[ 3 ], 1e-14, 'x[3].im' );
	assertClose( xv[ 10 ], basic.x[ 4 ], 1e-14, 'x[5].re' );
	assertClose( xv[ 11 ], basic.x[ 5 ], 1e-14, 'x[5].im' );
	assertClose( yv[ 2 ], basic.y[ 0 ], 1e-14, 'y[1].re' );
	assertClose( yv[ 3 ], basic.y[ 1 ], 1e-14, 'y[1].im' );
	assertClose( yv[ 6 ], basic.y[ 2 ], 1e-14, 'y[3].re' );
	assertClose( yv[ 7 ], basic.y[ 3 ], 1e-14, 'y[3].im' );
	assertClose( yv[ 10 ], basic.y[ 4 ], 1e-14, 'y[5].re' );
	assertClose( yv[ 11 ], basic.y[ 5 ], 1e-14, 'y[5].im' );
	assert.equal( xv[ 0 ], 999.0, 'x pad 0' );
	assert.equal( xv[ 1 ], 999.0, 'x pad 1' );
});

test( 'ndarray: basic via wrapper', function tn1() {
	var xv;
	var x;
	var y;
	var w;
	var r;
	x = new Complex128Array( [ 1, 2, 3, 4 ] );
	y = new Complex128Array( [ 0.1, 0.2, 0.3, 0.4 ] );
	w = new Complex128Array( [ 10, 20, 30, 40 ] );
	r = ndarray( 2, x, 1, 0, y, 1, 0, w, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.strictEqual( r, x, 'returns x' );
	assert.strictEqual( xv[ 0 ], 11, 'x[0].re' );
	assert.strictEqual( xv[ 3 ], 44, 'x[1].im' );
});

test( 'ndarray: throws RangeError for negative N', function tn2() {
	var x;
	var y;
	var w;
	x = new Complex128Array( 2 );
	y = new Complex128Array( 2 );
	w = new Complex128Array( 2 );
	assert.throws( function throws() {
		ndarray( -1, x, 1, 0, y, 1, 0, w, 1, 0 );
	}, RangeError );
});

test( 'base: negative strides', function t10() {
	var xv;
	var yv;
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 5, 6, 3, 4, 1, 2 ] );
	y = new Complex128Array( [ 0.5, 0.6, 0.3, 0.4, 0.1, 0.2 ] );
	w = new Complex128Array( [ 50, 60, 30, 40, 10, 20 ] );
	base( 3, x, -1, 2, y, -1, 2, w, -1, 2 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );
	assertClose( xv[ 4 ], basic.x[ 0 ], 1e-14, 'x[2].re' );
	assertClose( xv[ 5 ], basic.x[ 1 ], 1e-14, 'x[2].im' );
	assertClose( xv[ 2 ], basic.x[ 2 ], 1e-14, 'x[1].re' );
	assertClose( xv[ 3 ], basic.x[ 3 ], 1e-14, 'x[1].im' );
	assertClose( xv[ 0 ], basic.x[ 4 ], 1e-14, 'x[0].re' );
	assertClose( xv[ 1 ], basic.x[ 5 ], 1e-14, 'x[0].im' );
	assertClose( yv[ 4 ], basic.y[ 0 ], 1e-14, 'y[2].re' );
	assertClose( yv[ 5 ], basic.y[ 1 ], 1e-14, 'y[2].im' );
	assertClose( yv[ 2 ], basic.y[ 2 ], 1e-14, 'y[1].re' );
	assertClose( yv[ 3 ], basic.y[ 3 ], 1e-14, 'y[1].im' );
});
