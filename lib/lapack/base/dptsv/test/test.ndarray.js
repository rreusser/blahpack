/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptsv from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_single_rhs from './fixtures/basic_5x5_single_rhs.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };

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
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dptsv: basic_5x5_single_rhs', function t() {
	var info;
	var tc;
	var d;
	var e;
	var B;

	tc = basic_5x5_single_rhs;
	d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	e = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dptsv( 5, 1, d, 1, 0, e, 1, 0, B, 1, 5, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dptsv: multi_rhs', function t() {
	var info;
	var tc;
	var d;
	var e;
	var B;

	tc = multi_rhs;
	d = new Float64Array( [ 3.0, 3.0, 3.0, 3.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		1.0,  // column 1
		2.0,
		1.0,
		1.0,
		2.0   // column 2
	]);
	info = dptsv( 4, 2, d, 1, 0, e, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-14, 'e' );
	assertArrayClose( toArray( B.subarray( 0, 4 ) ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( toArray( B.subarray( 4, 8 ) ), tc.b2, 1e-14, 'b2' );
});

test( 'dptsv: n_one', function t() {
	var info;
	var tc;
	var d;
	var e;
	var B;

	tc = n_one;
	d = new Float64Array( [ 5.0 ] );
	e = new Float64Array( 0 );
	B = new Float64Array( [ 10.0 ] );
	info = dptsv( 1, 1, d, 1, 0, e, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( B ), tc.b, 1e-14, 'b' );
});

test( 'dptsv: n_zero (quick return)', function t() {
	var info;
	var tc;
	var d;
	var e;
	var B;

	tc = n_zero;
	d = new Float64Array( 0 );
	e = new Float64Array( 0 );
	B = new Float64Array( 0 );
	info = dptsv( 0, 1, d, 1, 0, e, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dptsv: not_posdef (returns INFO > 0)', function t() {
	var info;
	var tc;
	var d;
	var e;
	var B;

	tc = not_posdef;
	d = new Float64Array( [ -1.0, 4.0, 4.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );
	B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dptsv( 3, 1, d, 1, 0, e, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'dptsv: nrhs=0 (quick return)', function t() {
	var info;
	var d;
	var e;
	var B;

	d = new Float64Array( [ 4.0, 4.0 ] );
	e = new Float64Array( [ -1.0 ] );
	B = new Float64Array( 0 );
	info = dptsv( 2, 0, d, 1, 0, e, 1, 0, B, 1, 2, 0 );
	assert.equal( info, 0 );
	assert.equal( d[ 0 ], 4.0 );
	assert.equal( d[ 1 ], 4.0 );
	assert.equal( e[ 0 ], -1.0 );
});

test( 'dptsv: non-unit strides with offset', function t() {
	var info;
	var dRef;
	var eRef;
	var BRef;
	var d;
	var e;
	var B;

	d = new Float64Array( [ 0.0, 4.0, 0.0, 4.0, 0.0, 4.0 ] );
	e = new Float64Array( [ 0.0, -1.0, 0.0, -1.0 ] );
	B = new Float64Array( [ 0.0, 1.0, 0.0, 2.0, 0.0, 3.0 ] );
	info = dptsv( 3, 1, d, 2, 1, e, 2, 1, B, 2, 6, 1 );
	assert.equal( info, 0 );
	dRef = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	eRef = new Float64Array( [ -1.0, -1.0 ] );
	BRef = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dptsv( 3, 1, dRef, 1, 0, eRef, 1, 0, BRef, 1, 3, 0 );
	assertClose( B[ 1 ], BRef[ 0 ], 1e-14, 'b[0]' );
	assertClose( B[ 3 ], BRef[ 1 ], 1e-14, 'b[1]' );
	assertClose( B[ 5 ], BRef[ 2 ], 1e-14, 'b[2]' );
});
