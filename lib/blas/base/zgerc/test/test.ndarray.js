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
import zgerc from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zgerc_basic from './fixtures/zgerc_basic.json' with { type: 'json' };
import zgerc_n_zero from './fixtures/zgerc_n_zero.json' with { type: 'json' };
import zgerc_m_zero from './fixtures/zgerc_m_zero.json' with { type: 'json' };
import zgerc_alpha_zero from './fixtures/zgerc_alpha_zero.json' with { type: 'json' };
import zgerc_complex_alpha from './fixtures/zgerc_complex_alpha.json' with { type: 'json' };
import zgerc_stride from './fixtures/zgerc_stride.json' with { type: 'json' };
import zgerc_nonsquare from './fixtures/zgerc_nonsquare.json' with { type: 'json' };

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
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

/**
* Extract M x N complex matrix from interleaved flat array with given strides.
* Returns just the M_N complex values (2_M*N doubles) in column-major order.
*/
function extractCMatrix( arr, M, N, sa1, sa2, offsetA ) {
	const out = [];
	let ia, i, j;
	const v = reinterpret( arr, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ia = offsetA * 2 + 2 * ( i * sa1 + j * sa2 );
			out.push( v[ ia ] );
			out.push( v[ ia + 1 ] );
		}
	}
	return out;
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

test( 'zgerc: main export is a function', function t() {
	assert.strictEqual( typeof zgerc, 'function' );
});

test( 'zgerc: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zgerc.ndarray, 'function' );
});

test( 'zgerc: basic 2x2 rank-1 update', function t() {

	const tc = zgerc_basic;
	const A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	const x = new Complex128Array( [ 1, 0, 0, 1 ] );
	const y = new Complex128Array( [ 1, 1, 0, 2 ] );
	const alpha = new Complex128( 1, 0 );
	const result = base( 2, 2, alpha, x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( extractCMatrix( A, 2, 2, 1, 2, 0 ), tc.a, 'a' );
});

test( 'zgerc: n=0 quick return', function t() {

	const tc = zgerc_n_zero;
	const A = new Complex128Array( [ 1, 1, 2, 2 ] );
	const x = new Complex128Array( [ 5, 5 ] );
	const y = new Complex128Array( [ 6, 6 ] );
	const alpha = new Complex128( 1, 0 );
	const result = base( 2, 0, alpha, x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 'a' );
});

test( 'zgerc: m=0 quick return', function t() {

	const tc = zgerc_m_zero;
	const A = new Complex128Array( [ 1, 1, 2, 2 ] );
	const x = new Complex128Array( [ 5, 5 ] );
	const y = new Complex128Array( [ 6, 6, 7, 7 ] );
	const alpha = new Complex128( 1, 0 );
	const result = base( 0, 2, alpha, x, 1, 0, y, 1, 0, A, 1, 0, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 'a' );
});

test( 'zgerc: alpha=0 quick return', function t() {

	const tc = zgerc_alpha_zero;
	const A = new Complex128Array( [ 7, 7, 8, 8, 9, 9, 10, 10 ] );
	const x = new Complex128Array( [ 5, 5, 6, 6 ] );
	const y = new Complex128Array( [ 7, 7, 8, 8 ] );
	const alpha = new Complex128( 0, 0 );
	const result = base( 2, 2, alpha, x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( extractCMatrix( A, 2, 2, 1, 2, 0 ), tc.a, 'a' );
});

test( 'zgerc: complex alpha', function t() {

	const tc = zgerc_complex_alpha;
	const A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	const x = new Complex128Array( [ 1, 0, 0, 1 ] );
	const y = new Complex128Array( [ 1, 0, 0, 1 ] );
	const alpha = new Complex128( 0, 1 );
	const result = base( 2, 2, alpha, x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( extractCMatrix( A, 2, 2, 1, 2, 0 ), tc.a, 'a' );
});

test( 'zgerc: non-unit strides (strideX=2, strideY=2)', function t() {

	const tc = zgerc_stride;
	const A = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	const x = new Complex128Array( [ 1, 2, 99, 99, 3, 4 ] );
	const y = new Complex128Array( [ 5, 6, 99, 99, 7, 8 ] );
	const alpha = new Complex128( 1, 0 );
	const result = base( 2, 2, alpha, x, 2, 0, y, 2, 0, A, 1, 2, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( extractCMatrix( A, 2, 2, 1, 2, 0 ), tc.a, 'a' );
});

test( 'zgerc: 3x2 non-square', function t() {

	const tc = zgerc_nonsquare;
	const A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ] );
	const x = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	const y = new Complex128Array( [ 1, 1, 2, 0 ] );
	const alpha = new Complex128( 1, 0 );
	const result = base( 3, 2, alpha, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assert.strictEqual( result, A );
	assertArrayClose( extractCMatrix( A, 3, 2, 1, 3, 0 ), tc.a, 'a' );
});
