/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetf2 from './../lib/ndarray.js';

// FIXTURES //

import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _3x4 from './fixtures/3x4.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _1x1_singular from './fixtures/1x1_singular.json' with { type: 'json' };
import col_vector from './fixtures/col_vector.json' with { type: 'json' };
import row_vector from './fixtures/row_vector.json' with { type: 'json' };
import sfmin from './fixtures/sfmin.json' with { type: 'json' };
import sfmin_path from './fixtures/sfmin_path.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are close within a tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - description
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise close within a tolerance.
*
* @private
* @param {Float64Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - description
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts an array to a plain Array.
*
* @private
* @param {TypedArray} arr - typed array
* @returns {Array} plain array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Converts 1-based Fortran IPIV to 0-based JS IPIV.
*
* @private
* @param {Array} ipiv - 1-based pivot indices
* @returns {Array} 0-based pivot indices
*/
function ipiv0( ipiv ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < ipiv.length; i++ ) {
		out.push( ipiv[ i ] - 1 );
	}
	return out;
}

// TESTS //

test( 'dgetf2 is a function', function t() {
	assert.equal( typeof dgetf2, 'function' );
});

test( 'dgetf2: 3x3 non-singular matrix', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = _3x3;
	A = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
	IPIV = new Int32Array( 3 );
	info = dgetf2( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: 4x4 matrix', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = _4x4;
	A = new Float64Array([
		2.0,
		4.0,
		8.0,
		6.0,
		1.0,
		3.0,
		7.0,
		7.0,
		1.0,
		3.0,
		9.0,
		9.0,
		0.0,
		1.0,
		5.0,
		8.0
	]);
	IPIV = new Int32Array( 4 );
	info = dgetf2( 4, 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: 4x3 tall matrix (M > N)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = _4x3;
	A = new Float64Array([
		2.0,
		0.0,
		1.0,
		0.0,
		1.0,
		3.0,
		0.0,
		1.0,
		0.0,
		1.0,
		4.0,
		2.0
	]);
	IPIV = new Int32Array( 3 );
	info = dgetf2( 4, 3, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: 3x4 wide matrix (M < N)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = _3x4;
	A = new Float64Array([
		1.0,
		4.0,
		7.0,
		2.0,
		5.0,
		8.0,
		3.0,
		6.0,
		9.0,
		10.0,
		11.0,
		12.0
	]);
	IPIV = new Int32Array( 3 );
	info = dgetf2( 3, 4, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: singular matrix (INFO > 0)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = singular;
	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	IPIV = new Int32Array( 3 );
	info = dgetf2( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: N=0 quick return', function t() {
	var IPIV;
	var info;
	var A;

	A = new Float64Array( [ 99.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgetf2( 3, 0, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 99.0 );
});

test( 'dgetf2: M=0 quick return', function t() {
	var IPIV;
	var info;
	var A;

	A = new Float64Array( [ 99.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgetf2( 0, 3, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgetf2: 1x1 matrix', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = _1x1;
	A = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgetf2( 1, 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: 1x1 singular (zero)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = _1x1_singular;
	A = new Float64Array( [ 0.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgetf2( 1, 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: Nx1 column vector', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = col_vector;
	A = new Float64Array( [ 1.0, 5.0, 3.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgetf2( 3, 1, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: 1xN row vector', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = row_vector;
	A = new Float64Array( [ 2.0, 3.0, 7.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgetf2( 1, 3, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: sfmin scaling path (large pivot after swap)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = sfmin;
	A = new Float64Array([
		1.0e-310,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0,
		7.0,
		8.0,
		9.0
	]);
	IPIV = new Int32Array( 3 );
	info = dgetf2( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});

test( 'dgetf2: sfmin scaling path (all-tiny column, element-by-element division)', function t() { // eslint-disable-line max-len
	var expected;
	var IPIV;
	var info;
	var tc;
	var A;

	tc = sfmin_path;
	A = new Float64Array([
		3.0e-310,
		1.0e-310,
		2.0e-310,
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	IPIV = new Int32Array( 3 );
	info = dgetf2( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
	expected = ipiv0( tc.ipiv );
	assert.deepEqual( toArray( IPIV ), expected );
});
