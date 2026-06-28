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
import zgemm from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zgemm_basic_nn from './fixtures/zgemm_basic_nn.json' with { type: 'json' };
import zgemm_conja from './fixtures/zgemm_conja.json' with { type: 'json' };
import zgemm_alpha_beta from './fixtures/zgemm_alpha_beta.json' with { type: 'json' };
import zgemm_m_zero from './fixtures/zgemm_m_zero.json' with { type: 'json' };
import zgemm_transb from './fixtures/zgemm_transb.json' with { type: 'json' };
import zgemm_conjb from './fixtures/zgemm_conjb.json' with { type: 'json' };
import zgemm_transa_n from './fixtures/zgemm_transa_n.json' with { type: 'json' };
import zgemm_alpha_zero_beta_zero from './fixtures/zgemm_alpha_zero_beta_zero.json' with { type: 'json' };
import zgemm_alpha_zero_beta_scale from './fixtures/zgemm_alpha_zero_beta_scale.json' with { type: 'json' };
import zgemm_conja_conjb from './fixtures/zgemm_conja_conjb.json' with { type: 'json' };
import zgemm_transa_transb from './fixtures/zgemm_transa_transb.json' with { type: 'json' };
import zgemm_transa_conjb from './fixtures/zgemm_transa_conjb.json' with { type: 'json' };
import zgemm_conja_transb from './fixtures/zgemm_conja_transb.json' with { type: 'json' };
import zgemm_k_zero from './fixtures/zgemm_k_zero.json' with { type: 'json' };
import zgemm_nt_beta_scale from './fixtures/zgemm_nt_beta_scale.json' with { type: 'json' };
import zgemm_cc_beta_nonzero from './fixtures/zgemm_cc_beta_nonzero.json' with { type: 'json' };
import zgemm_nc_beta_scale from './fixtures/zgemm_nc_beta_scale.json' with { type: 'json' };
import zgemm_tn_beta_nonzero from './fixtures/zgemm_tn_beta_nonzero.json' with { type: 'json' };
import zgemm_cn_beta_nonzero from './fixtures/zgemm_cn_beta_nonzero.json' with { type: 'json' };
import zgemm_ct_beta_nonzero from './fixtures/zgemm_ct_beta_nonzero.json' with { type: 'json' };
import zgemm_tc_beta_nonzero from './fixtures/zgemm_tc_beta_nonzero.json' with { type: 'json' };
import zgemm_tt_beta_nonzero from './fixtures/zgemm_tt_beta_nonzero.json' with { type: 'json' };

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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgemm: main export is a function', function t() {
	assert.strictEqual( typeof zgemm, 'function' );
});

test( 'zgemm: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zgemm.ndarray, 'function' );
});

test( 'zgemm: basic N,N (M=2, N=2, K=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_basic_nn;
	A = new Complex128Array( [ 1, 1, 2, 0, 3, 0, 4, 1 ] );
	B = new Complex128Array( [ 1, 0, 0, -1, 0, 1, 1, 0 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_basic_nn c' );
});

test( 'zgemm: conjugate transpose A (C=A^H*B)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_conja;
	A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 1, 1, 2, 0 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'conjugate-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_conjA c' );
});

test( 'zgemm: alpha and beta scaling', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_alpha_beta;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 3, 2 ] );
	C = new Complex128Array( [ 1, 1, 0, 0, 0, 0, 1, 1 ] );
	alpha = new Complex128( 2, 1 );
	beta = new Complex128( 1, -1 );
	result = base( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_alpha_beta c' );
});

test( 'zgemm: M=0 quick return', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_m_zero;
	A = new Complex128Array( 0 );
	B = new Complex128Array( 0 );
	C = new Complex128Array( [ 99, 88 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 1, 0 );
	result = base( 'no-transpose', 'no-transpose', 0, 2, 2, alpha, A, 1, 1, 0, B, 1, 1, 0, beta, C, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_m_zero c' );
});

test( 'zgemm: transpose B (C=A*B^T)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_transb;
	A = new Complex128Array( [ 1, 1, 2, 0, 0, 1, 1, -1 ] );
	B = new Complex128Array( [ 1, 0, 0, 0, 0, 1, 1, 0 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 'transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_transB c' );
});

test( 'zgemm: conjugate transpose B (C=A*B^H)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_conjb;
	A = new Complex128Array( [ 1, 0, 0, 1, 2, 0, 0, 2 ] );
	B = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 'conjugate-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_conjB c' );
});

test( 'zgemm: transpose A, no transpose B (C=A^T*B)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_transa_n;
	A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 1, 1, 2, 0 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_transA_N c' );
});

test( 'zgemm: alpha=0, beta=0 (C should be zeroed)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_alpha_zero_beta_zero;
	A = new Complex128Array( [ 1, 1, 2, 0, 0, 0, 0, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 0, 0, 0, 0 ] );
	C = new Complex128Array( [ 5, 3, 7, 2, 1, 1, 9, 4 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_alpha_zero_beta_zero c' ); // eslint-disable-line max-len
});

test( 'zgemm: alpha=0, non-trivial beta (C := beta*C)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_alpha_zero_beta_scale;
	A = new Complex128Array( [ 1, 1, 0, 0, 0, 0, 0, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0 ] );
	C = new Complex128Array( [ 2, 1, 3, 2, 4, 3, 5, 4 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 2, 1 );
	result = base( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_alpha_zero_beta_scale c' ); // eslint-disable-line max-len
});

test( 'zgemm: alpha=0, beta=1 quick return (C unchanged)', function t() {
	var result;
	var alpha;
	var beta;
	var A;
	var B;
	var C;

	A = new Complex128Array( [ 1, 1, 0, 0, 0, 0, 0, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0 ] );
	C = new Complex128Array( [ 2, 1, 3, 2, 4, 3, 5, 4 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 1, 0 );
	result = base( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assert.deepStrictEqual( toArray( reinterpret( C, 0 ) ), [ 2, 1, 3, 2, 4, 3, 5, 4 ] ); // eslint-disable-line max-len
});

test( 'zgemm: conjugate A, conjugate B (C=A^H*B^H)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_conja_conjb;
	A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	B = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'conjugate-transpose', 'conjugate-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_conjA_conjB c' ); // eslint-disable-line max-len
});

test( 'zgemm: transpose A, transpose B (C=A^T*B^T)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_transa_transb;
	A = new Complex128Array( [ 1, 1, 2, 0, 3, 1, 4, 2 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 2, 1, 1, -1 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'transpose', 'transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_transA_transB c' ); // eslint-disable-line max-len
});

test( 'zgemm: transpose A, conjugate B (C=A^T*B^H)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_transa_conjb;
	A = new Complex128Array( [ 1, 1, 2, 0, 3, 1, 4, 2 ] );
	B = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'transpose', 'conjugate-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_transA_conjB c' ); // eslint-disable-line max-len
});

test( 'zgemm: conjugate A, transpose B (C=A^H*B^T)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_conja_transb;
	A = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 2, 1, 1, -1 ] );
	C = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'conjugate-transpose', 'transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_conjA_transB c' ); // eslint-disable-line max-len
});

test( 'zgemm: K=0 (C := beta*C)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_k_zero;
	A = new Complex128Array( 0 );
	B = new Complex128Array( 0 );
	C = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 2, 0 );
	result = base( 'no-transpose', 'no-transpose', 2, 2, 0, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_k_zero c' );
});

test( 'zgemm: N,T with non-trivial beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_nt_beta_scale;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 2, 1 );
	result = base( 'no-transpose', 'transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_NT_beta_scale c' ); // eslint-disable-line max-len
});

test( 'zgemm: C,C with non-zero beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_cc_beta_nonzero;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0.5, 0.5 );
	result = base( 'conjugate-transpose', 'conjugate-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_CC_beta_nonzero c' ); // eslint-disable-line max-len
});

test( 'zgemm: N,C with non-trivial beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_nc_beta_scale;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 2, 0 );
	result = base( 'no-transpose', 'conjugate-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_NC_beta_scale c' ); // eslint-disable-line max-len
});

test( 'zgemm: T,N with non-zero beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_tn_beta_nonzero;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 1, 1, 2, 0 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 1, 1 );
	result = base( 'transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_TN_beta_nonzero c' ); // eslint-disable-line max-len
});

test( 'zgemm: C,N with non-zero beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_cn_beta_nonzero;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 1, 1, 2, 0 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 1, 1 );
	result = base( 'conjugate-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_CN_beta_nonzero c' ); // eslint-disable-line max-len
});

test( 'zgemm: C,T with non-zero beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_ct_beta_nonzero;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 2, 1, 1, -1 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0.5, 0 );
	result = base( 'conjugate-transpose', 'transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_CT_beta_nonzero c' ); // eslint-disable-line max-len
});

test( 'zgemm: T,C with non-zero beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_tc_beta_nonzero;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0.5, 0 );
	result = base( 'transpose', 'conjugate-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_TC_beta_nonzero c' ); // eslint-disable-line max-len
});

test( 'zgemm: T,T with non-zero beta', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var B;
	var C;

	tc = zgemm_tt_beta_nonzero;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 0, 1, 2, 1, 1, -1 ] );
	C = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0.5, 0 );
	result = base( 'transpose', 'transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 'zgemm_TT_beta_nonzero c' ); // eslint-disable-line max-len
});

// ndarray validation tests

test( 'zgemm: ndarray throws TypeError for invalid transa', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgemm.ndarray( 'invalid', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zgemm: ndarray throws TypeError for invalid transb', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgemm.ndarray( 'no-transpose', 'invalid', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zgemm: ndarray throws RangeError for negative M', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgemm.ndarray( 'no-transpose', 'no-transpose', -1, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zgemm: ndarray throws RangeError for negative N', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgemm.ndarray( 'no-transpose', 'no-transpose', 2, -1, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zgemm: ndarray throws RangeError for negative K', function t() {
	var alpha = new Complex128( 1, 0 );
	var beta = new Complex128( 0, 0 );
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	assert.throws( function throws() {
		zgemm.ndarray( 'no-transpose', 'no-transpose', 2, 2, -1, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
