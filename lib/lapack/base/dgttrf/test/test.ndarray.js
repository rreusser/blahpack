/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgttrf from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5 from './fixtures/basic_5x5.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_two from './fixtures/n_two.json' with { type: 'json' };
import n_two_pivot from './fixtures/n_two_pivot.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import pivot_5x5 from './fixtures/pivot_5x5.json' with { type: 'json' };

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

test( 'dgttrf: basic_5x5', function t() {
	var ipiv;
	var info;
	var du2;
	var tc;
	var dl;
	var du;
	var d;

	tc = basic_5x5;
	dl = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	du = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	du2 = new Float64Array( 3 );
	ipiv = new Int32Array( 5 );
	info = dgttrf( 5, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( dl, new Float64Array( tc.dl ), 1e-14, 'dl' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( du, new Float64Array( tc.du ), 1e-14, 'du' );
	assertArrayClose( du2, new Float64Array( tc.du2 ), 1e-14, 'du2' );
	assert.deepEqual( toArray( ipiv ), tc.ipiv.map( function map( v ) { return v - 1; } ), 'ipiv' ); // eslint-disable-line max-len
});

test( 'dgttrf: n_one', function t() {
	var ipiv;
	var info;
	var du2;
	var tc;
	var dl;
	var du;
	var d;

	tc = n_one;
	dl = new Float64Array( 0 );
	d = new Float64Array( [ 5.0 ] );
	du = new Float64Array( 0 );
	du2 = new Float64Array( 0 );
	ipiv = new Int32Array( 1 );
	info = dgttrf( 1, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assert.deepEqual( toArray( ipiv ), tc.ipiv.map( function map( v ) { return v - 1; } ), 'ipiv' ); // eslint-disable-line max-len
});

test( 'dgttrf: n_two', function t() {
	var ipiv;
	var info;
	var du2;
	var tc;
	var dl;
	var du;
	var d;

	tc = n_two;
	dl = new Float64Array( [ 3.0 ] );
	d = new Float64Array( [ 4.0, 7.0 ] );
	du = new Float64Array( [ 1.0 ] );
	du2 = new Float64Array( 0 );
	ipiv = new Int32Array( 2 );
	info = dgttrf( 2, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( dl, new Float64Array( tc.dl ), 1e-14, 'dl' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( du, new Float64Array( tc.du ), 1e-14, 'du' );
	assert.deepEqual( toArray( ipiv ), tc.ipiv.map( function map( v ) { return v - 1; } ), 'ipiv' ); // eslint-disable-line max-len
});

test( 'dgttrf: n_two_pivot', function t() {
	var ipiv;
	var info;
	var du2;
	var tc;
	var dl;
	var du;
	var d;

	tc = n_two_pivot;
	dl = new Float64Array( [ 5.0 ] );
	d = new Float64Array( [ 2.0, 3.0 ] );
	du = new Float64Array( [ 1.0 ] );
	du2 = new Float64Array( 0 );
	ipiv = new Int32Array( 2 );
	info = dgttrf( 2, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( dl, new Float64Array( tc.dl ), 1e-14, 'dl' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( du, new Float64Array( tc.du ), 1e-14, 'du' );
	assert.deepEqual( toArray( ipiv ), tc.ipiv.map( function map( v ) { return v - 1; } ), 'ipiv' ); // eslint-disable-line max-len
});

test( 'dgttrf: singular', function t() {
	var ipiv;
	var info;
	var du2;
	var tc;
	var dl;
	var du;
	var d;

	tc = singular;
	dl = new Float64Array( [ 1.0, 1.0 ] );
	d = new Float64Array( [ 0.0, 0.0, 1.0 ] );
	du = new Float64Array( [ 0.0, 1.0 ] );
	du2 = new Float64Array( 1 );
	ipiv = new Int32Array( 3 );
	info = dgttrf( 3, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info (singular, 1-based)' );
	assertArrayClose( dl, new Float64Array( tc.dl ), 1e-14, 'dl' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( du, new Float64Array( tc.du ), 1e-14, 'du' );
	assertArrayClose( du2, new Float64Array( tc.du2 ), 1e-14, 'du2' );
	assert.deepEqual( toArray( ipiv ), tc.ipiv.map( function map( v ) { return v - 1; } ), 'ipiv' ); // eslint-disable-line max-len
});

test( 'dgttrf: n_zero', function t() {
	var ipiv;
	var info;
	var du2;
	var dl;
	var du;
	var d;

	dl = new Float64Array( 0 );
	d = new Float64Array( 0 );
	du = new Float64Array( 0 );
	du2 = new Float64Array( 0 );
	ipiv = new Int32Array( 0 );
	info = dgttrf( 0, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dgttrf: pivot_5x5', function t() {
	var ipiv;
	var info;
	var du2;
	var tc;
	var dl;
	var du;
	var d;

	tc = pivot_5x5;
	dl = new Float64Array( [ 10.0, 10.0, 10.0, 10.0 ] );
	d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	du = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
	du2 = new Float64Array( 3 );
	ipiv = new Int32Array( 5 );
	info = dgttrf( 5, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( dl, new Float64Array( tc.dl ), 1e-14, 'dl' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( du, new Float64Array( tc.du ), 1e-14, 'du' );
	assertArrayClose( du2, new Float64Array( tc.du2 ), 1e-14, 'du2' );
	assert.deepEqual( toArray( ipiv ), tc.ipiv.map( function map( v ) { return v - 1; } ), 'ipiv' ); // eslint-disable-line max-len
});

test( 'dgttrf: throws RangeError for N<0', function t() {
	var dl = new Float64Array( 0 );
	var d = new Float64Array( 0 );
	var du = new Float64Array( 0 );
	var du2 = new Float64Array( 0 );
	var ipiv = new Int32Array( 0 );
	assert.throws( function() {
		dgttrf( -1, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	}, RangeError );
});

test( 'dgttrf: supports stride and offset parameters', function t() {
	var ipiv;
	var info;
	var du2;
	var dl;
	var du;
	var tc;
	var d;

	dl = new Float64Array( [ 0.0, 3.0, 0.0 ] );
	d = new Float64Array( [ 0.0, 4.0, 0.0, 7.0, 0.0 ] );
	du = new Float64Array( [ 0.0, 1.0, 0.0 ] );
	du2 = new Float64Array( 1 );
	ipiv = new Int32Array( [ 0, 0, 0, 0, 0 ] );
	tc = n_two;
	info = dgttrf( 2, dl, 2, 1, d, 2, 1, du, 2, 1, du2, 1, 0, ipiv, 2, 1 );
	assert.equal( info, tc.info, 'info' );
	assertClose( dl[ 1 ], tc.dl[ 0 ], 1e-14, 'dl[0]' );
	assertClose( d[ 1 ], tc.d[ 0 ], 1e-14, 'd[0]' );
	assertClose( d[ 3 ], tc.d[ 1 ], 1e-14, 'd[1]' );
	assertClose( du[ 1 ], tc.du[ 0 ], 1e-14, 'du[0]' );
	assert.equal( ipiv[ 1 ], tc.ipiv[ 0 ] - 1, 'ipiv[0]' );
	assert.equal( ipiv[ 3 ], tc.ipiv[ 1 ] - 1, 'ipiv[1]' );
});
