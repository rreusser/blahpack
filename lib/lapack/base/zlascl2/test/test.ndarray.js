

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlascl2 from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import single_element from './fixtures/single_element.json' with { type: 'json' };
import rect_2x3 from './fixtures/rect_2x3.json' with { type: 'json' };
import rect_3x2 from './fixtures/rect_3x2.json' with { type: 'json' };
import negative_zero_d from './fixtures/negative_zero_d.json' with { type: 'json' };
import ldx_gt_m from './fixtures/ldx_gt_m.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assert.ok(
			Math.abs( actual[ i ] - expected[ i ] ) <= tol * Math.max( Math.abs( expected[ i ] ), 1.0 ),
			msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]
		);
	}
}

// TESTS //

test( 'zlascl2 is a function', function t() {
	assert.strictEqual( typeof zlascl2, 'function' );
});

test( 'zlascl2: basic_3x3', function t() {
	var view;
	var tc = basic_3x3;
	var x = new Complex128Array( [
		1, 2, 3, 4, 5, 6,
		7, 8, 9, 10, 11, 12,
		13, 14, 15, 16, 17, 18
	] );
	var d = new Float64Array( [ 2, 3, 4 ] );
	zlascl2( 3, 3, d, 1, 0, x, 1, 3, 0 );
	view = reinterpret( x, 0 );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zlascl2: m_zero (quick return)', function t() {
	var view;
	var x = new Complex128Array( [ 99, 88 ] );
	var d = new Float64Array( [ 2, 3, 4 ] );
	zlascl2( 0, 3, d, 1, 0, x, 1, 3, 0 );
	view = reinterpret( x, 0 );
	assert.strictEqual( view[ 0 ], 99.0 );
	assert.strictEqual( view[ 1 ], 88.0 );
});

test( 'zlascl2: n_zero (quick return)', function t() {
	var view;
	var x = new Complex128Array( [ 99, 88 ] );
	var d = new Float64Array( [ 2, 3, 4 ] );
	zlascl2( 3, 0, d, 1, 0, x, 1, 3, 0 );
	view = reinterpret( x, 0 );
	assert.strictEqual( view[ 0 ], 99.0 );
	assert.strictEqual( view[ 1 ], 88.0 );
});

test( 'zlascl2: single_element', function t() {
	var view;
	var tc = single_element;
	var x = new Complex128Array( [ 5, -3 ] );
	var d = new Float64Array( [ 3 ] );
	zlascl2( 1, 1, d, 1, 0, x, 1, 1, 0 );
	view = reinterpret( x, 0 );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zlascl2: rect_2x3', function t() {
	var view;
	var tc = rect_2x3;
	var x = new Complex128Array( [
		1, 0.5, 2, 1,
		3, 1.5, 4, 2,
		5, 2.5, 6, 3
	] );
	var d = new Float64Array( [ 0.5, 2.0 ] );
	zlascl2( 2, 3, d, 1, 0, x, 1, 2, 0 );
	view = reinterpret( x, 0 );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zlascl2: rect_3x2', function t() {
	var view;
	var tc = rect_3x2;
	var x = new Complex128Array( [
		1, -1, 2, -2, 3, -3,
		4, -4, 5, -5, 6, -6
	] );
	var d = new Float64Array( [ 10, 20, 30 ] );
	zlascl2( 3, 2, d, 1, 0, x, 1, 3, 0 );
	view = reinterpret( x, 0 );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zlascl2: negative and zero values in D', function t() {
	var view;
	var tc = negative_zero_d;
	var x = new Complex128Array( [
		1, 2, 3, 4,
		5, 6, 7, 8
	] );
	var d = new Float64Array( [ -1, 0 ] );
	zlascl2( 2, 2, d, 1, 0, x, 1, 2, 0 );
	view = reinterpret( x, 0 );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zlascl2: LDX > M (leading dimension larger than rows)', function t() {
	var view;
	var tc = ldx_gt_m;

	// X is 4-by-3 in memory but we only scale rows 0..1
	var x = new Complex128Array( [
		1, 0.1, 2, 0.2, 99, 99, 99, 99,
		3, 0.3, 4, 0.4, 99, 99, 99, 99,
		5, 0.5, 6, 0.6, 99, 99, 99, 99
	] );
	var d = new Float64Array( [ 2, 3 ] );
	zlascl2( 2, 3, d, 1, 0, x, 1, 4, 0 );
	view = reinterpret( x, 0 );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zlascl2: returns the output array X', function t() {
	var x = new Complex128Array( [ 1, 2, 3, 4 ] );
	var d = new Float64Array( [ 2, 3 ] );
	var out = zlascl2( 2, 1, d, 1, 0, x, 1, 2, 0 );
	assert.strictEqual( out, x );
});

test( 'zlascl2: supports non-unit stride for D', function t() {
	var view;

	// d = [2, ?, 3] with strideD=2 uses d[0]=2, d[2]=3
	var x = new Complex128Array( [
		1, 10, 2, 20,
		3, 30, 4, 40
	] );
	var d = new Float64Array( [ 2, 999, 3 ] );
	zlascl2( 2, 2, d, 2, 0, x, 1, 2, 0 );
	view = reinterpret( x, 0 );

	// row 0 scaled by 2: (1,10)*2=(2,20), (3,30)*2=(6,60)
	// row 1 scaled by 3: (2,20)*3=(6,60), (4,40)*3=(12,120)
	assert.strictEqual( view[ 0 ], 2 );
	assert.strictEqual( view[ 1 ], 20 );
	assert.strictEqual( view[ 2 ], 6 );
	assert.strictEqual( view[ 3 ], 60 );
	assert.strictEqual( view[ 4 ], 6 );
	assert.strictEqual( view[ 5 ], 60 );
	assert.strictEqual( view[ 6 ], 12 );
	assert.strictEqual( view[ 7 ], 120 );
});

test( 'zlascl2: supports offset for D', function t() {
	var view;

	// d starts at offset 1: d[1]=2, d[2]=3
	var x = new Complex128Array( [
		1, 10, 2, 20,
		3, 30, 4, 40
	] );
	var d = new Float64Array( [ 999, 2, 3 ] );
	zlascl2( 2, 2, d, 1, 1, x, 1, 2, 0 );
	view = reinterpret( x, 0 );

	// row 0 scaled by 2: (1,10)*2=(2,20), (3,30)*2=(6,60)
	// row 1 scaled by 3: (2,20)*3=(6,60), (4,40)*3=(12,120)
	assert.strictEqual( view[ 0 ], 2 );
	assert.strictEqual( view[ 1 ], 20 );
	assert.strictEqual( view[ 2 ], 6 );
	assert.strictEqual( view[ 3 ], 60 );
	assert.strictEqual( view[ 4 ], 6 );
	assert.strictEqual( view[ 5 ], 60 );
	assert.strictEqual( view[ 6 ], 12 );
	assert.strictEqual( view[ 7 ], 120 );
});

test( 'zlascl2: supports offset for X', function t() {
	var view;

	// X starts at offset 2 (complex elements)
	var x = new Complex128Array( [
		999, 999, 999, 999,
		1, 10, 2, 20,
		3, 30, 4, 40
	] );
	var d = new Float64Array( [ 2, 3 ] );
	zlascl2( 2, 2, d, 1, 0, x, 1, 2, 2 );
	view = reinterpret( x, 0 );

	assert.strictEqual( view[ 0 ], 999 );
	assert.strictEqual( view[ 1 ], 999 );
	assert.strictEqual( view[ 2 ], 999 );
	assert.strictEqual( view[ 3 ], 999 );
	assert.strictEqual( view[ 4 ], 2 );
	assert.strictEqual( view[ 5 ], 20 );
	assert.strictEqual( view[ 6 ], 6 );
	assert.strictEqual( view[ 7 ], 60 );
	assert.strictEqual( view[ 8 ], 6 );
	assert.strictEqual( view[ 9 ], 60 );
	assert.strictEqual( view[ 10 ], 12 );
	assert.strictEqual( view[ 11 ], 120 );
});
