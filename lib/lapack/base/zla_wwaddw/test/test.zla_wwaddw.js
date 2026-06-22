/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaWwaddw from './../lib/zla_wwaddw.js';


// TESTS //

test( 'main export is a function', function t1() {
	assert.strictEqual( typeof zlaWwaddw, 'function', 'is a function' );
});

test( 'the function has expected arity', function t2() {
	assert.strictEqual( zlaWwaddw.length, 7, 'has expected arity' );
});

test( 'the function throws a RangeError for negative N', function t3() {
	var x;
	var y;
	var w;
	x = new Complex128Array( 4 );
	y = new Complex128Array( 4 );
	w = new Complex128Array( 4 );
	assert.throws( function throws() {
		zlaWwaddw( -1, x, 1, y, 1, w, 1 );
	}, RangeError );
});

test( 'the function adds a complex vector w to doubled-single (x,y)', function t4() {
	var xv;
	var yv;
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 1, 2, 3, 4 ] );
	y = new Complex128Array( [ 0.1, 0.2, 0.3, 0.4 ] );
	w = new Complex128Array( [ 10, 20, 30, 40 ] );
	zlaWwaddw( 2, x, 1, y, 1, w, 1 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );
	assert.strictEqual( xv[ 0 ], 11, 'x[0].re' );
	assert.strictEqual( xv[ 1 ], 22, 'x[0].im' );
	assert.strictEqual( xv[ 2 ], 33, 'x[1].re' );
	assert.strictEqual( xv[ 3 ], 44, 'x[1].im' );
	assert.strictEqual( yv[ 0 ], 0.1, 'y[0].re' );
	assert.strictEqual( yv[ 1 ], 0.2, 'y[0].im' );
});

test( 'the function supports negative strides', function t5() {
	var xv;
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 3, 4, 1, 2 ] );
	y = new Complex128Array( [ 0.3, 0.4, 0.1, 0.2 ] );
	w = new Complex128Array( [ 30, 40, 10, 20 ] );
	zlaWwaddw( 2, x, -1, y, -1, w, -1 );
	xv = reinterpret( x, 0 );

	// stride=-1 starts at index N-1=1 and moves backward
	assert.strictEqual( xv[ 0 ], 33, 'x[0].re' );
	assert.strictEqual( xv[ 1 ], 44, 'x[0].im' );
	assert.strictEqual( xv[ 2 ], 11, 'x[1].re' );
	assert.strictEqual( xv[ 3 ], 22, 'x[1].im' );
});

test( 'the function returns x for n = 0', function t6() {
	var xv;
	var x;
	var y;
	var w;
	var r;
	x = new Complex128Array( [ 1, 2 ] );
	y = new Complex128Array( [ 0.1, 0.2 ] );
	w = new Complex128Array( [ 10, 20 ] );
	r = zlaWwaddw( 0, x, 1, y, 1, w, 1 );
	xv = reinterpret( x, 0 );
	assert.strictEqual( r, x, 'returns x' );
	assert.strictEqual( xv[ 0 ], 1, 'x unchanged' );
});
