/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemv from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zgemv_basic from './fixtures/zgemv_basic.json' with { type: 'json' };
import zgemv_conj_trans from './fixtures/zgemv_conj_trans.json' with { type: 'json' };
import zgemv_alpha_beta from './fixtures/zgemv_alpha_beta.json' with { type: 'json' };
import zgemv_zero_dim from './fixtures/zgemv_zero_dim.json' with { type: 'json' };
import zgemv_trans from './fixtures/zgemv_trans.json' with { type: 'json' };
import zgemv_stride from './fixtures/zgemv_stride.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' ); // eslint-disable-line max-len
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgemv: main export is a function', function t() {
	assert.strictEqual( typeof zgemv, 'function' );
});

test( 'zgemv: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zgemv.ndarray, 'function' );
});

test( 'zgemv: basic trans=N (M=2, N=2, alpha=(1,0), beta=(0,0))', function t() {

	const tc = zgemv_basic;
	const A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( 2 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const result = base( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'zgemv_basic y' );
});

test( 'zgemv: conjugate transpose (trans=C, M=2, N=2)', function t() {

	const tc = zgemv_conj_trans;
	const A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	const x = new Complex128Array( [ 1, 1, 1, 1 ] );
	const y = new Complex128Array( 2 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const result = base( 'conjugate-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'zgemv_conj_trans y' );
});

test( 'zgemv: alpha and beta scaling (trans=N)', function t() {

	const tc = zgemv_alpha_beta;
	const A = new Complex128Array( [ 1, 0, 0, 1, 2, 0, 0, 2 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( [ 1, 0, 0, 1 ] );
	const alpha = new Complex128( 2, 1 );
	const beta = new Complex128( 1, 1 );
	const result = base( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'zgemv_alpha_beta y' );
});

test( 'zgemv: zero dimensions (M=0, N=0) — quick return', function t() {

	const tc = zgemv_zero_dim;
	const A = new Complex128Array( 0 );
	const x = new Complex128Array( 0 );
	const y = new Complex128Array( [ 99, 88 ] );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const result = base( 'no-transpose', 0, 0, alpha, A, 1, 1, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'zgemv_zero_dim y' );
});

test( 'zgemv: transpose (trans=T, no conjugate)', function t() {

	const tc = zgemv_trans;
	const A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	const x = new Complex128Array( [ 1, 0, 0, 1 ] );
	const y = new Complex128Array( 2 );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const result = base( 'transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'zgemv_trans y' );
});

test( 'zgemv: alpha=0, beta=1 quick return (y unchanged)', function t() {

	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 1, 2, 2 ] );
	const y = new Complex128Array( [ 5, 6, 7, 8 ] );
	const alpha = new Complex128( 0, 0 );
	const beta = new Complex128( 1, 0 );
	const result = base( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assert.deepStrictEqual( toArray( reinterpret( y, 0 ) ), [ 5, 6, 7, 8 ] );
});

test( 'zgemv: alpha=0, non-trivial beta (y := beta*y only)', function t() {

	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 1, 2, 2 ] );
	const y = new Complex128Array( [ 1, 0, 0, 1 ] );
	const alpha = new Complex128( 0, 0 );
	const beta = new Complex128( 2, 0 );
	const result = base( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assert.deepStrictEqual( toArray( reinterpret( y, 0 ) ), [ 2, 0, 0, 2 ] );
});

test( 'zgemv: non-unit stride (incx=2, incy=2, trans=N)', function t() {

	const tc = zgemv_stride;
	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 1, 99, 99, 2, 2 ] );
	const y = new Complex128Array( [ 0, 0, 88, 88, 0, 0 ] );
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const result = base( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 2, 0, beta, y, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'zgemv_stride y' );
});

// ndarray validation tests

test( 'zgemv: ndarray throws TypeError for invalid trans', function t() {
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgemv.ndarray( 'invalid', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
	}, TypeError );
});

test( 'zgemv: ndarray throws RangeError for negative M', function t() {
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgemv.ndarray( 'no-transpose', -1, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zgemv: ndarray throws RangeError for negative N', function t() {
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgemv.ndarray( 'no-transpose', 2, -1, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zgemv: ndarray throws RangeError for zero strideX', function t() {
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgemv.ndarray( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 0, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zgemv: ndarray throws RangeError for zero strideY', function t() {
	const alpha = new Complex128( 1, 0 );
	const beta = new Complex128( 0, 0 );
	const A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	const x = new Complex128Array( [ 1, 0, 1, 0 ] );
	const y = new Complex128Array( 2 );
	assert.throws( function throws() {
		zgemv.ndarray( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
