/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgtsv from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_single_rhs from './fixtures/basic_5x5_single_rhs.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import pivoting from './fixtures/pivoting.json' with { type: 'json' };
import three_rhs from './fixtures/three_rhs.json' with { type: 'json' };
import pivoting_multi_rhs from './fixtures/pivoting_multi_rhs.json' with { type: 'json' };

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
* Extracts a subarray from a Float64Array.
*/
function toArray( arr, offset, length ) {
	var out = [];
	var i;
	for ( i = 0; i < length; i++ ) {
		out.push( arr[ offset + i ] );
	}
	return out;
}

/**
* Extracts a column from a column-major matrix stored in a Float64Array.
*/
function getColumn( B, LDB, col, N ) {
	var out = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		out.push( B[ col * LDB + i ] );
	}
	return out;
}

// TESTS //

test( 'dgtsv: basic_5x5_single_rhs', function t() {
	var info;
	var tc;
	var dl;
	var du;
	var N;
	var d;
	var B;

	tc = basic_5x5_single_rhs;
	N = 5;
	dl = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	du = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dgtsv( N, 1, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B, 0, N ), tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( d, 0, N ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( dl, 0, N - 1 ), tc.dl, 1e-14, 'dl' );
	assertArrayClose( toArray( du, 0, N - 1 ), tc.du, 1e-14, 'du' );
});

test( 'dgtsv: multi_rhs', function t() {
	var nrhs;
	var info;
	var LDB;
	var tc;
	var dl;
	var du;
	var N;
	var d;
	var B;

	tc = multi_rhs;
	N = 4;
	nrhs = 2;
	LDB = N;
	dl = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	d = new Float64Array( [ 3.0, 3.0, 3.0, 3.0 ] );
	du = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0
	]);
	info = dgtsv( N, nrhs, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, LDB, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( getColumn( B, LDB, 0, N ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( getColumn( B, LDB, 1, N ), tc.b2, 1e-14, 'b2' );
	assertArrayClose( toArray( d, 0, N ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( dl, 0, N - 1 ), tc.dl, 1e-14, 'dl' );
	assertArrayClose( toArray( du, 0, N - 1 ), tc.du, 1e-14, 'du' );
});

test( 'dgtsv: n_one', function t() {
	var info;
	var tc;
	var dl;
	var du;
	var d;
	var B;

	tc = n_one;
	d = new Float64Array( [ 5.0 ] );
	dl = new Float64Array( 0 );
	du = new Float64Array( 0 );
	B = new Float64Array( [ 10.0 ] );
	info = dgtsv( 1, 1, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B, 0, 1 ), tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( d, 0, 1 ), tc.d, 1e-14, 'd' );
});

test( 'dgtsv: n_zero', function t() {
	var info;
	var tc;
	var dl;
	var du;
	var d;
	var B;

	tc = n_zero;
	dl = new Float64Array( 0 );
	d = new Float64Array( 0 );
	du = new Float64Array( 0 );
	B = new Float64Array( 0 );
	info = dgtsv( 0, 1, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dgtsv: singular', function t() {
	var info;
	var tc;
	var dl;
	var du;
	var d;
	var B;

	tc = singular;
	dl = new Float64Array( [ 0.0, 0.0 ] );
	d = new Float64Array( [ 0.0, 2.0, 3.0 ] );
	du = new Float64Array( [ 1.0, 1.0 ] );
	B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dgtsv( 3, 1, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'dgtsv: pivoting', function t() {
	var info;
	var tc;
	var dl;
	var du;
	var N;
	var d;
	var B;

	tc = pivoting;
	N = 4;
	dl = new Float64Array( [ 5.0, 7.0, 9.0 ] );
	d = new Float64Array( [ 1.0, 3.0, 2.0, 1.0 ] );
	du = new Float64Array( [ 2.0, 4.0, 6.0 ] );
	B = new Float64Array( [ 5.0, 12.0, 15.0, 10.0 ] );
	info = dgtsv( N, 1, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( B, 0, N ), tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( d, 0, N ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( dl, 0, N - 1 ), tc.dl, 1e-14, 'dl' );
	assertArrayClose( toArray( du, 0, N - 1 ), tc.du, 1e-14, 'du' );
});

test( 'dgtsv: three_rhs', function t() {
	var nrhs;
	var info;
	var LDB;
	var tc;
	var dl;
	var du;
	var N;
	var d;
	var B;

	tc = three_rhs;
	N = 3;
	nrhs = 3;
	LDB = N;
	dl = new Float64Array( [ 1.0, 1.0 ] );
	d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	du = new Float64Array( [ 1.0, 1.0 ] );
	B = new Float64Array([
		6.0,
		9.0,
		9.0,
		1.0,
		2.0,
		3.0,
		10.0,
		5.0,
		10.0
	]);
	info = dgtsv( N, nrhs, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, LDB, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( getColumn( B, LDB, 0, N ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( getColumn( B, LDB, 1, N ), tc.b2, 1e-14, 'b2' );
	assertArrayClose( getColumn( B, LDB, 2, N ), tc.b3, 1e-14, 'b3' );
	assertArrayClose( toArray( d, 0, N ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( dl, 0, N - 1 ), tc.dl, 1e-14, 'dl' );
	assertArrayClose( toArray( du, 0, N - 1 ), tc.du, 1e-14, 'du' );
});

test( 'dgtsv: pivoting_multi_rhs', function t() {
	var nrhs;
	var info;
	var LDB;
	var tc;
	var dl;
	var du;
	var N;
	var d;
	var B;

	tc = pivoting_multi_rhs;
	N = 4;
	nrhs = 2;
	LDB = N;
	dl = new Float64Array( [ 5.0, 7.0, 9.0 ] );
	d = new Float64Array( [ 1.0, 3.0, 2.0, 1.0 ] );
	du = new Float64Array( [ 2.0, 4.0, 6.0 ] );
	B = new Float64Array([
		5.0,
		12.0,
		15.0,
		10.0,
		3.0,
		7.0,
		9.0,
		10.0
	]);
	info = dgtsv( N, nrhs, dl, 1, 0, d, 1, 0, du, 1, 0, B, 1, LDB, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( getColumn( B, LDB, 0, N ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( getColumn( B, LDB, 1, N ), tc.b2, 1e-14, 'b2' );
	assertArrayClose( toArray( d, 0, N ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( dl, 0, N - 1 ), tc.dl, 1e-14, 'dl' );
	assertArrayClose( toArray( du, 0, N - 1 ), tc.du, 1e-14, 'du' );
});
