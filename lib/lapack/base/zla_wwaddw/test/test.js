/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaWwaddw from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t1() {
	assert.strictEqual( typeof zlaWwaddw, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t2() {
	assert.strictEqual( typeof zlaWwaddw.ndarray, 'function', 'has ndarray method' );
});

test( 'main export: basic complex doubled-single addition', function t3() {
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

test( 'main export: ndarray interface with offsets', function t4() {
	var xv;
	var x;
	var y;
	var w;
	x = new Complex128Array( [ 999, 999, 1, 2, 3, 4 ] );
	y = new Complex128Array( [ 999, 999, 0.1, 0.2, 0.3, 0.4 ] );
	w = new Complex128Array( [ 999, 999, 10, 20, 30, 40 ] );
	zlaWwaddw.ndarray( 2, x, 1, 1, y, 1, 1, w, 1, 1 );
	xv = reinterpret( x, 0 );
	assert.strictEqual( xv[ 0 ], 999, 'x[0] unchanged' );
	assert.strictEqual( xv[ 2 ], 11, 'x[1].re' );
	assert.strictEqual( xv[ 4 ], 33, 'x[2].re' );
});
