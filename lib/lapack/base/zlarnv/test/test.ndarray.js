/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarnv from './../lib/ndarray.js';

// FIXTURES //

import idist1_uniform_01 from './fixtures/idist1_uniform_01.json' with { type: 'json' };
import idist2_uniform_m1_1 from './fixtures/idist2_uniform_m1_1.json' with { type: 'json' };
import idist3_normal from './fixtures/idist3_normal.json' with { type: 'json' };
import idist4_disc from './fixtures/idist4_disc.json' with { type: 'json' };
import idist5_circle from './fixtures/idist5_circle.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import idist1_large_seed from './fixtures/idist1_large_seed.json' with { type: 'json' };
import idist4_alt_seed from './fixtures/idist4_alt_seed.json' with { type: 'json' };
import idist5_alt_seed from './fixtures/idist5_alt_seed.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zlarnv: IDIST=1, uniform real/imag in (0,1)', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	tc = idist1_uniform_01;
	x = new Complex128Array( 5 );
	zlarnv( 1, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=2, uniform real/imag in (-1,1)', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	tc = idist2_uniform_m1_1;
	x = new Complex128Array( 5 );
	zlarnv( 2, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=3, normal(0,1)', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	tc = idist3_normal;
	x = new Complex128Array( 5 );
	zlarnv( 3, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=4, uniform on unit disc', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	tc = idist4_disc;
	x = new Complex128Array( 5 );
	zlarnv( 4, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=5, uniform on unit circle', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	tc = idist5_circle;
	x = new Complex128Array( 5 );
	zlarnv( 5, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: N=0 edge case', function t() {
	var iseed = new Int32Array( [ 1, 1, 1, 1 ] );
	var tc = n_zero;
	var x = new Complex128Array( 5 );

	zlarnv( 1, iseed, 1, 0, 0, x, 1, 0 );

	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=1, larger N with different seed', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 42, 7, 13, 99 ] );
	tc = idist1_large_seed;
	x = new Complex128Array( 10 );
	zlarnv( 1, iseed, 1, 0, 10, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=4, alternate seed', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 42, 7, 13, 99 ] );
	tc = idist4_alt_seed;
	x = new Complex128Array( 5 );
	zlarnv( 4, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});

test( 'zlarnv: IDIST=5, alternate seed', function t() {
	var iseed;
	var tc;
	var xv;
	var x;

	iseed = new Int32Array( [ 42, 7, 13, 99 ] );
	tc = idist5_alt_seed;
	x = new Complex128Array( 5 );
	zlarnv( 5, iseed, 1, 0, 5, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( iseed ), tc.iseed_out, 'iseed_out' );
});
