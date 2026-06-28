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

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbmv from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import no_trans_basic from './fixtures/no_trans_basic.json' with { type: 'json' };
import trans_basic from './fixtures/trans_basic.json' with { type: 'json' };
import conj_trans_basic from './fixtures/conj_trans_basic.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import incx_2 from './fixtures/incx_2.json' with { type: 'json' };
import incy_2 from './fixtures/incy_2.json' with { type: 'json' };
import rect_m_lt_n from './fixtures/rect_m_lt_n.json' with { type: 'json' };
import beta_one from './fixtures/beta_one.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

/**
* Create the 4x4 test band matrix (KL=1, KU=2, LDA=4) as a Complex128Array.
*
* Band storage (column-major, 4 rows per column):
*   Row 1 (2nd superdiag): _        _        a13      a24
_   Row 2 (1st superdiag): _        a12      a23      a34
_   Row 3 (diagonal):      a11      a22      a33      a44
_   Row 4 (subdiag):       a21      a32      a43      _
* Full matrix (derived from actual Fortran index assignments):
*   [ (1,0.5)    (3,1)      (6,-0.5)    0        ]
*   [ (2,-1)     (4,0)      (7,1.5)     0        ]
*   [ 0          (5,2)      (8,-1)     (10,1)    ]
*   [ 0          0          (9,0)      (11,-2)   ]
*
* Note: Fortran a(16)=(12,0.5) lands in band row 4 of col 4, which maps to
* full row i=5 > M=4, so it is padding and ignored by the algorithm.
*
* @returns {Complex128Array} band matrix in band storage
*/
function createBandMatrix44() {
	// 4 rows x 4 cols = 16 complex elements, interleaved as 32 doubles
	// Matches Fortran: a(k) at 0-based complex index (k-1)
	var data = [
		// Col 1 (band rows 1-4): *, *, A(1,1), A(2,1)
		0,
		0,
		0,
		0,
		1,
		0.5,
		2,
		-1,

		// Col 2 (band rows 1-4): *, A(1,2), A(2,2), A(3,2)
		0,
		0,
		3,
		1,
		4,
		0,
		5,
		2,

		// Col 3 (band rows 1-4): A(1,3), A(2,3), A(3,3), A(4,3)
		6,
		-0.5,
		7,
		1.5,
		8,
		-1,
		9,
		0,

		// Col 4 (band rows 1-4): *, A(3,4), A(4,4), padding
		0,
		0,
		10,
		1,
		11,
		-2,
		12,
		0.5
	];
	return new Complex128Array( data );
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

test( 'zgbmv: main export is a function', function t() {
	assert.strictEqual( typeof zgbmv, 'function' );
});

test( 'zgbmv: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof zgbmv.ndarray, 'function' );
});

test( 'zgbmv: no-transpose basic (M=4, N=4, KL=1, KU=2, alpha=(1,0), beta=(0,0))', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = no_trans_basic;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'no_trans_basic y' );
});

test( 'zgbmv: transpose basic (M=4, N=4, KL=1, KU=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = trans_basic;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'trans_basic y' );
});

test( 'zgbmv: conjugate-transpose basic (M=4, N=4, KL=1, KU=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = conj_trans_basic;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'conjugate-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'conj_trans_basic y' );
});

test( 'zgbmv: complex alpha and beta (alpha=(2,1), beta=(0.5,-0.5))', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = complex_alpha_beta;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5, 3, 0 ] );
	alpha = new Complex128( 2, 1 );
	beta = new Complex128( 0.5, -0.5 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'complex_alpha_beta y' ); // eslint-disable-line max-len
});

test( 'zgbmv: alpha=(0,0), beta=(2,0) — only scale y', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 2, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'alpha_zero y' );
});

test( 'zgbmv: M=0 quick return', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var yv;
	var A;
	var x;
	var y;

	tc = m_zero;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 99, 0, 77, 66 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 0, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	yv = reinterpret( y, 0 );
	assert.strictEqual( yv[ 0 ], 99 );
	assert.strictEqual( yv[ 1 ], 0 );
});

test( 'zgbmv: N=0, beta=(0,0) — zero y since leny=M=4 but no matrix', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var yv;
	var A;
	var x;
	var y;

	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 99, 0, 77, 66, 55, 44, 33, 22 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 4, 0, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	yv = reinterpret( y, 0 );
	assert.strictEqual( yv[ 0 ], 99 );
	assert.strictEqual( yv[ 1 ], 0 );
});

test( 'zgbmv: alpha=(0,0), beta=(0,0) — zero out y', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero_beta_zero;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 99, 88, 77, 66, 55, 44, 33, 22 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'alpha_zero_beta_zero y' ); // eslint-disable-line max-len
});

test( 'zgbmv: non-unit incx=2 (strideX=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = incx_2;
	A = createBandMatrix44();
	x = new Complex128Array([
		1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0
	]);
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 2, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'incx_2 y' );
});

test( 'zgbmv: non-unit incy=2 (strideY=2)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = incy_2;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( 8 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'incy_2 y' );
});

test( 'zgbmv: rectangular M<N (3x5 matrix, KL=1, KU=1, LDA=3)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = rect_m_lt_n;
	A = new Complex128Array([
		// Col 1: *, A(1,1)=(1,1), A(2,1)=(2,0)
		0,
		0,
		1,
		1,
		2,
		0,

		// Col 2: A(1,2)=(3,-1), A(2,2)=(4,0.5), A(3,2)=(5,1)
		3,
		-1,
		4,
		0.5,
		5,
		1,

		// Col 3: A(2,3)=(6,0), A(3,3)=(7,-0.5), *
		6,
		0,
		7,
		-0.5,
		0,
		0,

		// Col 4: A(3,4)=(8,1), *, *
		8,
		1,
		0,
		0,
		0,
		0,

		// Col 5: *, *, *
		0,
		0,
		0,
		0,
		0,
		0
	]);
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 0.5, 0.5, 1, -0.5 ] );
	y = new Complex128Array( 3 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'no-transpose', 3, 5, 1, 1, alpha, A, 1, 3, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'rect_m_lt_n y' );
});

test( 'zgbmv: beta=(1,0) — add to existing y', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	tc = beta_one;
	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 10, 5, 20, -10, 30, 15, 40, -20 ] );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 1, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'beta_one y' );
});

test( 'zgbmv: alpha=(0,0), beta=(1,0) quick return (y unchanged)', function t() { // eslint-disable-line max-len
	var result;
	var alpha;
	var beta;
	var A;
	var x;
	var y;

	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 5, 6, 7, 8, 9, 10, 11, 12 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 1, 0 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	assert.deepStrictEqual( toArray( reinterpret( y, 0 ) ), [ 5, 6, 7, 8, 9, 10, 11, 12 ] ); // eslint-disable-line max-len
});

test( 'zgbmv: conjugate-transpose with non-unit strides', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	A = createBandMatrix44();
	x = new Complex128Array([
		1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0
	]);
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'conjugate-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 2, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	tc = conj_trans_basic;
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'conj_trans_stride y' ); // eslint-disable-line max-len
});

test( 'zgbmv: transpose with non-unit strides', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var A;
	var x;
	var y;

	A = createBandMatrix44();
	x = new Complex128Array([
		1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0
	]);
	y = new Complex128Array( 4 );
	alpha = new Complex128( 1, 0 );
	beta = new Complex128( 0, 0 );
	result = base( 'transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 2, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	tc = trans_basic;
	assertArrayClose( toArray( reinterpret( y, 0 ) ), tc.y, 'trans_stride y' );
});

test( 'zgbmv: complex beta scaling (alpha=0, beta=(1,1))', function t() {
	var result;
	var alpha;
	var beta;
	var yv;
	var A;
	var x;
	var y;

	A = createBandMatrix44();
	x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	y = new Complex128Array( [ 1, 0, 0, 1, 2, 0, 0, 2 ] );
	alpha = new Complex128( 0, 0 );
	beta = new Complex128( 1, 1 );
	result = base( 'no-transpose', 4, 4, 1, 2, alpha, A, 1, 4, 0, x, 1, 0, beta, y, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, y );
	yv = reinterpret( y, 0 );
	assertClose( yv[ 0 ], 1, 'beta_complex y[0] re' );
	assertClose( yv[ 1 ], 1, 'beta_complex y[0] im' );
	assertClose( yv[ 2 ], -1, 'beta_complex y[1] re' );
	assertClose( yv[ 3 ], 1, 'beta_complex y[1] im' );
	assertClose( yv[ 4 ], 2, 'beta_complex y[2] re' );
	assertClose( yv[ 5 ], 2, 'beta_complex y[2] im' );
	assertClose( yv[ 6 ], -2, 'beta_complex y[3] re' );
	assertClose( yv[ 7 ], 2, 'beta_complex y[3] im' );
});
