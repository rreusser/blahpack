/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf2 from './../lib/ndarray.js';

// FIXTURES //

import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _3x4 from './fixtures/3x4.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import col_vector from './fixtures/col_vector.json' with { type: 'json' };
import row_vector from './fixtures/row_vector.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };

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
* Converts 1-based Fortran IPIV values to 0-based JS IPIV values.
*/
function ipivTo0Based( ipiv1 ) {
	var out = new Int32Array( ipiv1.length );
	var i;
	for ( i = 0; i < ipiv1.length; i++ ) {
		out[ i ] = ipiv1[ i ] - 1;
	}
	return out;
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

test( 'zgetrf2: 3x3 non-singular complex matrix', function t() {
	var expectedIPIV;
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = _3x3;
	a = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		3,
		1,
		0.5,
		3,
		1,
		7,
		2,
		1,
		0.1,
		3,
		0.5,
		9,
		1
	]);
	ipiv = new Int32Array( 3 );
	info = zgetrf2( 3, 3, a, 1, 3, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	expectedIPIV = ipivTo0Based( tc.ipiv );
	assert.deepEqual( ipiv, expectedIPIV, 'ipiv' );
});

test( 'zgetrf2: 4x3 tall matrix (M > N)', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = _4x3;
	a = new Complex128Array([
		2,
		1,
		0,
		0.5,
		1,
		0.2,
		0,
		0.1,
		1,
		0.3,
		3,
		1,
		0,
		0.4,
		1,
		0.5,
		0,
		0.1,
		1,
		0.6,
		4,
		2,
		2,
		1
	]);
	ipiv = new Int32Array( 3 );
	info = zgetrf2( 4, 3, a, 1, 4, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: 3x4 wide matrix (M < N)', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = _3x4;
	a = new Complex128Array([
		1,
		0.5,
		4,
		1,
		7,
		2,
		2,
		0.3,
		5,
		1.5,
		8,
		2.5,
		3,
		0.1,
		6,
		0.5,
		9,
		3,
		10,
		1,
		11,
		2,
		12,
		3
	]);
	ipiv = new Int32Array( 3 );
	info = zgetrf2( 3, 4, a, 1, 3, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: singular matrix (info > 0)', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = singular;
	a = new Complex128Array([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0
	]);
	ipiv = new Int32Array( 3 );
	info = zgetrf2( 3, 3, a, 1, 3, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info should be 2 (singular at column 2)' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: N=0 quick return', function t() {
	var ipiv;
	var info;
	var a;

	a = new Complex128Array( [ 99, 99 ] );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 3, 0, a, 1, 3, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zgetrf2: M=0 quick return', function t() {
	var ipiv;
	var info;
	var a;

	a = new Complex128Array( 1 );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 0, 3, a, 1, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zgetrf2: 1x1 non-singular', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = _1x1;
	a = new Complex128Array( [ 5, 3 ] );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 1, 1, a, 1, 1, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: 1x1 singular (zero)', function t() {
	var ipiv;
	var info;
	var view;
	var a;

	a = new Complex128Array( [ 0, 0 ] );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 1, 1, a, 1, 1, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assert.equal( view[ 0 ], 0.0, 'a[0] should be 0' );
	assert.equal( view[ 1 ], 0.0, 'a[1] should be 0' );
	assert.equal( info, 1, 'info should be 1' );
	assert.equal( ipiv[ 0 ], 0, 'ipiv[0] should be 0 (0-based)' );
});

test( 'zgetrf2: Nx1 column vector', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = col_vector;
	a = new Complex128Array( [ 1, 0.5, 5, 2, 3, 1 ] );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 3, 1, a, 1, 3, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: 1xN row vector', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = row_vector;
	a = new Complex128Array( [ 2, 1, 3, 0.5, 7, 2 ] );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 1, 3, a, 1, 1, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: 4x4 well-conditioned complex matrix', function t() {
	var ipiv;
	var info;
	var view;
	var tc;
	var a;

	tc = _4x4;
	a = new Complex128Array([
		10,
		1,
		1,
		2,
		2,
		-1,
		3,
		0.5,        // col 0
		1,
		-1,
		12,
		2,
		1,
		3,
		2,
		-0.5,        // col 1
		2,
		0.5,
		3,
		-1,
		15,
		1,
		1,
		2,         // col 2
		1,
		1,
		2,
		0.5,
		3,
		-2,
		20,
		3          // col 3
	]);
	ipiv = new Int32Array( 4 );
	info = zgetrf2( 4, 4, a, 1, 4, 0, ipiv, 1, 0 );
	view = reinterpret( a, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( ipiv, ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf2: Nx1 column with subnormal pivot (sfmin path)', function t() {
	var ipiv;
	var info;
	var view;
	var a;

	a = new Complex128Array( [ 1e-310, 0, 5e-311, 0, 2e-311, 0 ] );
	ipiv = new Int32Array( 1 );
	info = zgetrf2( 3, 1, a, 1, 3, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
	assert.equal( ipiv[ 0 ], 0, 'pivot should be row 0 (largest element)' );
	view = reinterpret( a, 0 );
	assertClose( view[ 2 ], 5e-311 / 1e-310, 1e-10, 'a[1] real' );
	assertClose( view[ 4 ], 2e-311 / 1e-310, 1e-10, 'a[2] real' );
});
