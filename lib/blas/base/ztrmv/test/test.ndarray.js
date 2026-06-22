/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrmv from './../lib/index.js';
import base from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import ztrmv_upper_no_trans from './fixtures/ztrmv_upper_no_trans.json' with { type: 'json' };
import ztrmv_lower_no_trans from './fixtures/ztrmv_lower_no_trans.json' with { type: 'json' };
import ztrmv_unit_diag from './fixtures/ztrmv_unit_diag.json' with { type: 'json' };
import ztrmv_upper_trans from './fixtures/ztrmv_upper_trans.json' with { type: 'json' };
import ztrmv_upper_conjtrans from './fixtures/ztrmv_upper_conjtrans.json' with { type: 'json' };
import ztrmv_n_zero from './fixtures/ztrmv_n_zero.json' with { type: 'json' };
import ztrmv_n_one from './fixtures/ztrmv_n_one.json' with { type: 'json' };
import ztrmv_stride from './fixtures/ztrmv_stride.json' with { type: 'json' };
import ztrmv_lower_conjtrans from './fixtures/ztrmv_lower_conjtrans.json' with { type: 'json' };
import ztrmv_lower_trans from './fixtures/ztrmv_lower_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

// FUNCTIONS //

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

test( 'ztrmv: main export is a function', function t() {
	assert.strictEqual( typeof ztrmv, 'function' );
});

test( 'ztrmv: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof ztrmv.ndarray, 'function' );
});

test( 'ztrmv: upper triangular, no transpose, non-unit diagonal (N=2)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_upper_no_trans;
	A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	x = new Complex128Array( [ 1, 0, 1, 1 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: lower triangular, no transpose, non-unit diagonal (N=2)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_lower_no_trans;
	A = new Complex128Array( [ 2, 1, 3, 1, 0, 0, 4, 2 ] );
	x = new Complex128Array( [ 1, 0, 1, 1 ] );
	result = base( 'lower', 'no-transpose', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: upper triangular, unit diagonal (N=2)', function t() {
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_unit_diag;
	A = new Complex128Array( [ 99, 99, 0, 0, 3, 1, 99, 99 ] );
	x = new Complex128Array( [ 1, 0, 1, 1 ] );
	result = base( 'upper', 'no-transpose', 'unit', 2, A, 1, 2, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: upper triangular, transpose (A^T), non-unit (N=2)', function t() {
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_upper_trans;
	A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	x = new Complex128Array( [ 1, 0, 1, 1 ] );
	result = base( 'upper', 'transpose', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: upper triangular, conjugate transpose (A^H), non-unit (N=2)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_upper_conjtrans;
	A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	x = new Complex128Array( [ 1, 0, 1, 1 ] );
	result = base( 'upper', 'conjugate-transpose', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: N=0 quick return', function t() {
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_n_zero;
	A = new Complex128Array( [ 1, 0 ] );
	x = new Complex128Array( [ 5, 5 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 0, A, 1, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: N=1, upper, non-unit', function t() {
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_n_one;
	A = new Complex128Array( [ 3, 2 ] );
	x = new Complex128Array( [ 2, 1 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 1, A, 1, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: non-unit stride (strideX=2), upper, no transpose (N=2)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_stride;
	A = new Complex128Array( [ 2, 0, 0, 0, 1, 1, 3, 0 ] );
	x = new Complex128Array( [ 1, 0, 99, 99, 0, 1 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 2, A, 1, 2, 0, x, 2, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: lower, conjugate transpose, non-unit (N=3)', function t() {
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_lower_conjtrans;
	A = new Complex128Array([
		1,
		1,
		2,
		1,
		3,
		1,
		0,
		0,
		4,
		2,
		5,
		2,
		0,
		0,
		0,
		0,
		6,
		3
	]);
	x = new Complex128Array( [ 1, 0, 0, 1, 1, 1 ] );
	result = base( 'lower', 'conjugate-transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztrmv: lower, transpose (no conjugate), non-unit (N=3)', function t() {
	var result;
	var tc;
	var A;
	var x;

	tc = ztrmv_lower_trans;
	A = new Complex128Array([
		1,
		1,
		2,
		1,
		3,
		1,
		0,
		0,
		4,
		2,
		5,
		2,
		0,
		0,
		0,
		0,
		6,
		3
	]);
	x = new Complex128Array( [ 1, 0, 0, 1, 1, 1 ] );
	result = base( 'lower', 'transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var x = new Complex128Array( [ 1, 0, 1, 1 ] );
	assert.throws( function f() {
		ndarray( 'foo', 'no-transpose', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var x = new Complex128Array( [ 1, 0, 1, 1 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'foo', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var x = new Complex128Array( [ 1, 0, 1, 1 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'foo', 2, A, 1, 2, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var x = new Complex128Array( [ 1, 0, 1, 1 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', -1, A, 1, 2, 0, x, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for strideX=0', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var x = new Complex128Array( [ 1, 0, 1, 1 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', 2, A, 1, 2, 0, x, 0, 0 );
	}, RangeError );
});

test( 'ndarray: N=0 early return', function t() {
	var out;
	var xv;
	var A;
	var x;

	A = new Complex128Array( [ 1, 0 ] );
	x = new Complex128Array( [ 5, 5 ] );
	out = ndarray( 'upper', 'no-transpose', 'non-unit', 0, A, 1, 1, 0, x, 1, 0 );
	assert.strictEqual( out, x );
	xv = reinterpret( x, 0 );
	assert.strictEqual( xv[ 0 ], 5 );
	assert.strictEqual( xv[ 1 ], 5 );
});
