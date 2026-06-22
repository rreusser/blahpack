/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import drot from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import swap from './fixtures/swap.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import neg_stride from './fixtures/neg_stride.json' with { type: 'json' };
import negate from './fixtures/negate.json' with { type: 'json' };

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

test( 'drot: basic rotation (c=cos(pi/4), s=sin(pi/4))', function t() {
	var tc = basic;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 6.0, 7.0, 8.0, 9.0, 10.0 ] );
	var c = Math.cos( Math.PI / 4.0 );
	var s = Math.sin( Math.PI / 4.0 );

	drot( 5, x, 1, 0, y, 1, 0, c, s );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: identity rotation (c=1, s=0)', function t() {
	var tc = identity;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 6.0, 7.0, 8.0, 9.0, 10.0 ] );

	drot( 5, x, 1, 0, y, 1, 0, 1.0, 0.0 );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: full swap rotation (c=0, s=1)', function t() {
	var tc = swap;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 6.0, 7.0, 8.0, 9.0, 10.0 ] );

	drot( 5, x, 1, 0, y, 1, 0, 0.0, 1.0 );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: n=0 (no-op)', function t() {
	var tc = n_zero;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 6.0, 7.0, 8.0, 9.0, 10.0 ] );
	var c = Math.cos( Math.PI / 4.0 );
	var s = Math.sin( Math.PI / 4.0 );

	drot( 0, x, 1, 0, y, 1, 0, c, s );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: n=1', function t() {
	var tc = n_one;
	var x = new Float64Array( [ 3.0 ] );
	var y = new Float64Array( [ 4.0 ] );

	drot( 1, x, 1, 0, y, 1, 0, 0.6, 0.8 );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: non-unit strides (incx=2, incy=3)', function t() {
	var tc = stride;
	var x = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	var y = new Float64Array( [ 10.0, 0.0, 0.0, 20.0, 0.0, 0.0, 30.0, 0.0, 0.0 ] );

	drot( 3, x, 2, 0, y, 3, 0, 0.6, 0.8 );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: negative stride (incx=-1)', function t() {
	var tc = neg_stride;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var y = new Float64Array( [ 10.0, 20.0, 30.0, 40.0 ] );

	// Fortran with incx=-1 starts at index (-N+1)*incx+1 = (-4+1)*(-1)+1 = 4 (1-based) = 3 (0-based) // eslint-disable-line max-len

	// In our base.js API, offset is explicit, so offset = 3 and stride = -1
	drot( 4, x, -1, 3, y, 1, 0, 0.6, 0.8 );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: negate (c=-1, s=0)', function t() {
	var tc = negate;
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

	drot( 3, x, 1, 0, y, 1, 0, -1.0, 0.0 );
	assertArrayClose( x, tc.dx, 1e-14, 'dx' );
	assertArrayClose( y, tc.dy, 1e-14, 'dy' );
});

test( 'drot: returns y', function t() {
	var out;
	var x;
	var y;

	x = new Float64Array( [ 1.0, 2.0 ] );
	y = new Float64Array( [ 3.0, 4.0 ] );
	out = drot( 2, x, 1, 0, y, 1, 0, 1.0, 0.0 );
	assert.equal( out, y, 'returns y' );
});

test( 'drot: offset support', function t() {
	// Test using offsets to access sub-arrays
	var x = new Float64Array( [ 999.0, 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 999.0, 6.0, 7.0, 8.0 ] );

	drot( 3, x, 1, 1, y, 1, 1, 0.0, 1.0 );

	// c=0, s=1: x_new = s*y = y, y_new = -s*x = -x
	assert.equal( x[ 0 ], 999.0, 'x[0] unchanged' );
	assert.equal( x[ 1 ], 6.0, 'x[1]' );
	assert.equal( x[ 2 ], 7.0, 'x[2]' );
	assert.equal( x[ 3 ], 8.0, 'x[3]' );

	assert.equal( y[ 0 ], 999.0, 'y[0] unchanged' );
	assert.equal( y[ 1 ], -1.0, 'y[1]' );
	assert.equal( y[ 2 ], -2.0, 'y[2]' );
	assert.equal( y[ 3 ], -3.0, 'y[3]' );
});
