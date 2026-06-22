/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlascl2 from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import single_element from './fixtures/single_element.json' with { type: 'json' };
import rect_2x3 from './fixtures/rect_2x3.json' with { type: 'json' };
import rect_3x2 from './fixtures/rect_3x2.json' with { type: 'json' };
import negative_zero_d from './fixtures/negative_zero_d.json' with { type: 'json' };
import ldx_gt_m from './fixtures/ldx_gt_m.json' with { type: 'json' };

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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol * Math.max( Math.abs( expected[ i ] ), 1.0 ), // eslint-disable-line max-len
			msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]);
	}
}

// TESTS //

test( 'dlascl2 is a function', function t() {
	assert.strictEqual( typeof dlascl2, 'function' );
});

test( 'dlascl2: basic_3x3', function t() {
	var tc = basic_3x3;
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
	var d = new Float64Array( [ 2, 3, 4 ] );
	dlascl2( 3, 3, d, 1, 0, x, 1, 3, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlascl2: m_zero (quick return)', function t() {
	var x = new Float64Array( [ 99 ] );
	var d = new Float64Array( [ 2, 3, 4 ] );
	dlascl2( 0, 3, d, 1, 0, x, 1, 3, 0 );
	assert.strictEqual( x[ 0 ], 99.0 );
});

test( 'dlascl2: n_zero (quick return)', function t() {
	var x = new Float64Array( [ 99 ] );
	var d = new Float64Array( [ 2, 3, 4 ] );
	dlascl2( 3, 0, d, 1, 0, x, 1, 3, 0 );
	assert.strictEqual( x[ 0 ], 99.0 );
});

test( 'dlascl2: single_element', function t() {
	var tc = single_element;
	var x = new Float64Array( [ 5 ] );
	var d = new Float64Array( [ 3 ] );
	dlascl2( 1, 1, d, 1, 0, x, 1, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlascl2: rect_2x3', function t() {
	var tc = rect_2x3;
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var d = new Float64Array( [ 0.5, 2.0 ] );
	dlascl2( 2, 3, d, 1, 0, x, 1, 2, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlascl2: rect_3x2', function t() {
	var tc = rect_3x2;
	var x = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var d = new Float64Array( [ 10, 20, 30 ] );
	dlascl2( 3, 2, d, 1, 0, x, 1, 3, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlascl2: negative and zero values in D', function t() {
	var tc = negative_zero_d;
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var d = new Float64Array( [ -1, 0 ] );
	dlascl2( 2, 2, d, 1, 0, x, 1, 2, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlascl2: LDX > M (leading dimension larger than rows)', function t() {
	var tc = ldx_gt_m;

	// X is 4-by-3 in memory but we only scale rows 0..1
	var x = new Float64Array([
		1,
		2,
		99,
		99,
		3,
		4,
		99,
		99,
		5,
		6,
		99,
		99
	]);
	var d = new Float64Array( [ 2, 3 ] );
	dlascl2( 2, 3, d, 1, 0, x, 1, 4, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlascl2: returns the output array X', function t() {
	var out;
	var x;
	var d;

	x = new Float64Array( [ 1, 2, 3, 4 ] );
	d = new Float64Array( [ 2, 3 ] );
	out = dlascl2( 2, 2, d, 1, 0, x, 1, 2, 0 );
	assert.strictEqual( out, x );
});

test( 'dlascl2: supports non-unit stride for D', function t() {
	// d = [2, ?, 3] with strideD=2 uses d[0]=2, d[2]=3
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var d = new Float64Array( [ 2, 999, 3 ] );
	dlascl2( 2, 2, d, 2, 0, x, 1, 2, 0 );

	// Row 0: 1*2=2, 3*2=6; row 1: 2*3=6, 4*3=12
	assert.strictEqual( x[ 0 ], 2 );
	assert.strictEqual( x[ 1 ], 6 );
	assert.strictEqual( x[ 2 ], 6 );
	assert.strictEqual( x[ 3 ], 12 );
});

test( 'dlascl2: supports offset for D', function t() {
	// d starts at offset 1: d[1]=2, d[2]=3
	var x = new Float64Array( [ 1, 2, 3, 4 ] );
	var d = new Float64Array( [ 999, 2, 3 ] );
	dlascl2( 2, 2, d, 1, 1, x, 1, 2, 0 );

	// Row 0: 1*2=2, 3*2=6; row 1: 2*3=6, 4*3=12
	assert.strictEqual( x[ 0 ], 2 );
	assert.strictEqual( x[ 1 ], 6 );
	assert.strictEqual( x[ 2 ], 6 );
	assert.strictEqual( x[ 3 ], 12 );
});

test( 'dlascl2: supports offset for X', function t() {
	// X starts at offset 2
	var x = new Float64Array( [ 999, 999, 1, 2, 3, 4 ] );
	var d = new Float64Array( [ 2, 3 ] );
	dlascl2( 2, 2, d, 1, 0, x, 1, 2, 2 );

	assert.strictEqual( x[ 0 ], 999 );
	assert.strictEqual( x[ 1 ], 999 );
	assert.strictEqual( x[ 2 ], 2 );
	assert.strictEqual( x[ 3 ], 6 );
	assert.strictEqual( x[ 4 ], 6 );
	assert.strictEqual( x[ 5 ], 12 );
});
