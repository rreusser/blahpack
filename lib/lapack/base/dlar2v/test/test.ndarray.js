/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlar2v from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import non_unit_stride from './fixtures/non_unit_stride.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import swap from './fixtures/swap.json' with { type: 'json' };
import mixed_strides from './fixtures/mixed_strides.json' with { type: 'json' };

// FUNCTIONS //

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
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dlar2v is a function', function t() {
	assert.equal( typeof dlar2v, 'function' );
});

test( 'dlar2v: basic (N=4, unit strides)', function t() {
	var tc = basic;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var y = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	var z = new Float64Array( [ 0.5, 1.0, 1.5, 2.0 ] );
	var c = new Float64Array( [ 0.8660254037844387, 0.7071067811865476, 0.5, 0.0 ] ); // eslint-disable-line max-len
	var s = new Float64Array( [ 0.5, 0.7071067811865476, 0.8660254037844387, 1.0 ] ); // eslint-disable-line max-len

	dlar2v( 4, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlar2v: n_zero (quick return)', function t() {
	var x = new Float64Array( [ 1.0 ] );
	var y = new Float64Array( [ 2.0 ] );
	var z = new Float64Array( [ 0.5 ] );
	var c = new Float64Array( [ 0.5 ] );
	var s = new Float64Array( [ 0.8660254037844387 ] );

	dlar2v( 0, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	// Arrays should be unchanged
	assert.equal( x[ 0 ], 1.0 );
	assert.equal( y[ 0 ], 2.0 );
	assert.equal( z[ 0 ], 0.5 );
});

test( 'dlar2v: n_one (single element)', function t() {
	var tc = n_one;
	var x = new Float64Array( [ 3.0 ] );
	var y = new Float64Array( [ 4.0 ] );
	var z = new Float64Array( [ 1.0 ] );
	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	dlar2v( 1, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlar2v: non-unit strides (INCX=2, INCC=2)', function t() {
	var tc = non_unit_stride;
	var x = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 0.0, 5.0, 0.0, 6.0 ] );
	var z = new Float64Array( [ 0.5, 0.0, 1.0, 0.0, 1.5 ] );
	var c = new Float64Array( [ 0.8, 0.0, 0.6, 0.0, 0.5 ] );
	var s = new Float64Array( [ 0.6, 0.0, 0.8, 0.0, 0.8660254037844387 ] );

	dlar2v( 3, x, 2, 0, y, 2, 0, z, 2, 0, c, 2, 0, s, 2, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlar2v: identity rotation (c=1, s=0)', function t() {
	var tc = identity;
	var x = new Float64Array( [ 10.0, 20.0, 30.0 ] );
	var y = new Float64Array( [ 40.0, 50.0, 60.0 ] );
	var z = new Float64Array( [ 5.0, 10.0, 15.0 ] );
	var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var s = new Float64Array( [ 0.0, 0.0, 0.0 ] );

	dlar2v( 3, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlar2v: swap rotation (c=0, s=1)', function t() {
	var tc = swap;
	var x = new Float64Array( [ 1.0, 2.0 ] );
	var y = new Float64Array( [ 3.0, 4.0 ] );
	var z = new Float64Array( [ 0.5, 1.0 ] );
	var c = new Float64Array( [ 0.0, 0.0 ] );
	var s = new Float64Array( [ 1.0, 1.0 ] );

	dlar2v( 2, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlar2v: mixed strides (INCX=3, INCC=2)', function t() {
	var tc = mixed_strides;
	var x = new Float64Array( [ 2.0, 0.0, 0.0, 4.0 ] );
	var y = new Float64Array( [ 6.0, 0.0, 0.0, 8.0 ] );
	var z = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
	var c = new Float64Array( [ 0.8, 0.0, 0.6 ] );
	var s = new Float64Array( [ 0.6, 0.0, 0.8 ] );

	dlar2v( 2, x, 3, 0, y, 3, 0, z, 3, 0, c, 2, 0, s, 2, 0 );

	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlar2v: offset support', function t() {
	var x = new Float64Array( [ 999.0, 3.0, 4.0 ] );
	var y = new Float64Array( [ 999.0, 4.0, 5.0 ] );
	var z = new Float64Array( [ 999.0, 1.0, 2.0 ] );
	var c = new Float64Array( [ 999.0, 0.6, 0.8 ] );
	var s = new Float64Array( [ 999.0, 0.8, 0.6 ] );

	dlar2v( 2, x, 1, 1, y, 1, 1, z, 1, 1, c, 1, 1, s, 1, 1 );

	// x[0], y[0], z[0] should be unchanged
	assert.equal( x[ 0 ], 999.0, 'x[0] unchanged' );
	assert.equal( y[ 0 ], 999.0, 'y[0] unchanged' );
	assert.equal( z[ 0 ], 999.0, 'z[0] unchanged' );

	// Verify the operation was applied to elements at offset 1 and 2

	// By hand-computing the transformation for first element (i=0):

	// xi=3, yi=4, zi=1, ci=0.6, si=0.8

	// t1 = 0.8*1 = 0.8

	// t2 = 0.6*1 = 0.6

	// t3 = 0.6 - 0.8*3 = 0.6 - 2.4 = -1.8

	// t4 = 0.6 + 0.8*4 = 0.6 + 3.2 = 3.8

	// t5 = 0.6*3 + 0.8 = 1.8 + 0.8 = 2.6

	// t6 = 0.6*4 - 0.8 = 2.4 - 0.8 = 1.6

	// x[1] = 0.6*2.6 + 0.8*3.8 = 1.56 + 3.04 = 4.6

	// y[1] = 0.6*1.6 - 0.8*(-1.8) = 0.96 + 1.44 = 2.4

	// z[1] = 0.6*3.8 - 0.8*2.6 = 2.28 - 2.08 = 0.2
	assert.ok( Math.abs( x[ 1 ] - 4.6 ) < 1e-14, 'x[1]' );
	assert.ok( Math.abs( y[ 1 ] - 2.4 ) < 1e-14, 'y[1]' );
	assert.ok( Math.abs( z[ 1 ] - 0.2 ) < 1e-14, 'z[1]' );
});
