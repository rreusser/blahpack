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
import base from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans_nonunit from './fixtures/upper_no_trans_nonunit.json' with { type: 'json' };
import upper_trans_nonunit from './fixtures/upper_trans_nonunit.json' with { type: 'json' };
import upper_conj_trans_nonunit from './fixtures/upper_conj_trans_nonunit.json' with { type: 'json' };
import upper_no_trans_unit from './fixtures/upper_no_trans_unit.json' with { type: 'json' };
import lower_no_trans_nonunit from './fixtures/lower_no_trans_nonunit.json' with { type: 'json' };
import lower_trans_nonunit from './fixtures/lower_trans_nonunit.json' with { type: 'json' };
import lower_conj_trans_nonunit from './fixtures/lower_conj_trans_nonunit.json' with { type: 'json' };
import lower_no_trans_unit from './fixtures/lower_no_trans_unit.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_stride_2 from './fixtures/upper_stride_2.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

// Upper packed AP (4x4):
// [a11, a12, a22, a13, a23, a33, a14, a24, a34, a44]
// = [(2,1), (1,0.5), (3,-1), (4,2), (5,0), (6,-0.5), (7,1), (8,-2), (9,0.5), (10,-1)] // eslint-disable-line max-len
/**
* UpperAP.
*
* @private
* @returns {*} result
*/
function upperAP( ) {
	return new Complex128Array([
		2, 1, 1, 0.5, 3, -1, 4, 2, 5, 0, 6, -0.5, 7, 1, 8, -2, 9, 0.5, 10, -1
	]);
}

// Lower packed AP (4x4):
// [a11, a21, a31, a41, a22, a32, a42, a33, a43, a44]
// = [(2,1), (1,0.5), (4,2), (7,1), (3,-1), (5,0), (8,-2), (6,-0.5), (9,0.5), (10,-1)] // eslint-disable-line max-len
/**
* LowerAP.
*
* @private
* @returns {*} result
*/
function lowerAP( ) {
	return new Complex128Array([
		2, 1, 1, 0.5, 4, 2, 7, 1, 3, -1, 5, 0, 8, -2, 6, -0.5, 9, 0.5, 10, -1
	]);
}

// Input x vector (4 complex elements):
// [(1,0), (2,1), (3,-1), (4,0.5)]
/**
* InputX.
*
* @private
* @returns {*} result
*/
function inputX( ) {
	return new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
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

test( 'ztpmv: base is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
});

test( 'ztpmv: upper, no-transpose, non-unit diagonal (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = upper_no_trans_nonunit;
	ap = upperAP();
	x = inputX();
	result = base( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: upper, transpose, non-unit diagonal (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = upper_trans_nonunit;
	ap = upperAP();
	x = inputX();
	result = base( 'upper', 'transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: upper, conjugate-transpose, non-unit diagonal (N=4)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var ap;
	var x;

	tc = upper_conj_trans_nonunit;
	ap = upperAP();
	x = inputX();
	result = base( 'upper', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: upper, no-transpose, unit diagonal (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = upper_no_trans_unit;
	ap = upperAP();
	x = inputX();
	result = base( 'upper', 'no-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: lower, no-transpose, non-unit diagonal (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = lower_no_trans_nonunit;
	ap = lowerAP();
	x = inputX();
	result = base( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: lower, transpose, non-unit diagonal (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = lower_trans_nonunit;
	ap = lowerAP();
	x = inputX();
	result = base( 'lower', 'transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: lower, conjugate-transpose, non-unit diagonal (N=4)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var ap;
	var x;

	tc = lower_conj_trans_nonunit;
	ap = lowerAP();
	x = inputX();
	result = base( 'lower', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: lower, no-transpose, unit diagonal (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = lower_no_trans_unit;
	ap = lowerAP();
	x = inputX();
	result = base( 'lower', 'no-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: N=0 quick return', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = n_zero;
	ap = upperAP();
	x = new Complex128Array( [ 99, 0 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 0, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: upper, no-transpose, non-unit, strideX=2 (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = upper_stride_2;
	ap = upperAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	result = base( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: N=1, scalar case', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = scalar;
	ap = new Complex128Array( [ 5, 2 ] );
	x = new Complex128Array( [ 3, -1 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 1, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'ztpmv: upper, transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = upperAP();
	x = inputX();
	base( 'upper', 'transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'result should not be NaN' );
	assert.ok( !Number.isNaN( xv[ 1 ] ), 'result should not be NaN' );
});

test( 'ztpmv: lower, transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = inputX();
	base( 'lower', 'transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'result should not be NaN' );
	assert.ok( !Number.isNaN( xv[ 6 ] ), 'result should not be NaN' );
});

test( 'ztpmv: upper, conjugate-transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = upperAP();
	x = inputX();
	base( 'upper', 'conjugate-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'result should not be NaN' );
	assert.ok( !Number.isNaN( xv[ 1 ] ), 'result should not be NaN' );
});

test( 'ztpmv: lower, conjugate-transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = inputX();
	base( 'lower', 'conjugate-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'result should not be NaN' );
	assert.ok( !Number.isNaN( xv[ 6 ] ), 'result should not be NaN' );
});

test( 'ztpmv: x with all zeros returns zeros (upper, no-transpose)', function t() { // eslint-disable-line max-len
	var ap;
	var xv;
	var x;
	var i;

	ap = upperAP();
	x = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	base( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	for ( i = 0; i < 8; i += 1 ) {
		assert.strictEqual( xv[ i ], 0.0, 'x[' + i + '] should be zero' );
	}
});

test( 'ztpmv: x with all zeros returns zeros (lower, no-transpose)', function t() { // eslint-disable-line max-len
	var ap;
	var xv;
	var x;
	var i;

	ap = lowerAP();
	x = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	base( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	for ( i = 0; i < 8; i += 1 ) {
		assert.strictEqual( xv[ i ], 0.0, 'x[' + i + '] should be zero' );
	}
});

test( 'ztpmv: lower, no-transpose, stride 2 (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	base( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'x[0] should not be NaN' );
	assert.ok( !Number.isNaN( xv[ 4 ] ), 'x[4] should not be NaN' );
});

test( 'ztpmv: upper, transpose, stride 2 (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = upperAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	base( 'upper', 'transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'x[0] should not be NaN' );
});

test( 'ztpmv: lower, conjugate-transpose, stride 2 (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	base( 'lower', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'x[0] should not be NaN' );
});

test( 'ztpmv: with offsetAP and offsetX', function t() {
	var result;
	var ap;
	var xv;
	var x;

	ap = new Complex128Array([
		99,
		99,
		99,
		99,
		5,
		2,
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
		0,
		0,
		0
	]);
	x = new Complex128Array( [ 99, 99, 3, -1 ] );
	result = base( 'upper', 'no-transpose', 'non-unit', 1, ap, 1, 2, x, 1, 1 );
	assert.strictEqual( result, x );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 2 ], 17.0, 'x real' );
	assertClose( xv[ 3 ], 1.0, 'x imag' );
});
