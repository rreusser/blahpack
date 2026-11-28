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

/* eslint-disable max-len, max-lines, max-lines-per-function, no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbtrd from './../lib/strided.js';

// FIXTURES //

import upper_kd2_n5_none from './fixtures/upper_kd2_n5_none.json' with { type: 'json' };
import lower_kd2_n5_none from './fixtures/lower_kd2_n5_none.json' with { type: 'json' };
import upper_kd1_n4_none from './fixtures/upper_kd1_n4_none.json' with { type: 'json' };
import lower_kd1_n4_none from './fixtures/lower_kd1_n4_none.json' with { type: 'json' };
import upper_kd2_n5_init from './fixtures/upper_kd2_n5_init.json' with { type: 'json' };
import lower_kd2_n5_init from './fixtures/lower_kd2_n5_init.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper_init from './fixtures/n_one_upper_init.json' with { type: 'json' };
import kd0_upper_none from './fixtures/kd0_upper_none.json' with { type: 'json' };
import upper_kd3_n6_init from './fixtures/upper_kd3_n6_init.json' with { type: 'json' };
import lower_kd3_n6_init from './fixtures/lower_kd3_n6_init.json' with { type: 'json' };
import upper_kd1_n4_init from './fixtures/upper_kd1_n4_init.json' with { type: 'json' };
import lower_kd1_n4_init from './fixtures/lower_kd1_n4_init.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zhbtrd: upper_kd2_n5_none', function t() {

	const tc = upper_kd2_n5_none;
	const AB = new Complex128Array( 15 );
	const d = new Float64Array( 5 );
	const e = new Float64Array( 4 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 5 );
	AB.set( [ 4, 0 ], 2 );
	AB.set( [ 1, 1 ], 4 );
	AB.set( [ 5, 0 ], 5 );
	AB.set( [ 2, -1 ], 6 );
	AB.set( [ 3, 1 ], 7 );
	AB.set( [ 6, 0 ], 8 );
	AB.set( [ 1, -1 ], 9 );
	AB.set( [ 2, 1 ], 10 );
	AB.set( [ 7, 0 ], 11 );
	AB.set( [ 1, -1 ], 12 );
	AB.set( [ 3, 1 ], 13 );
	AB.set( [ 8, 0 ], 14 );
	const info = zhbtrd( 'none', 'upper', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: lower_kd2_n5_none', function t() {

	const tc = lower_kd2_n5_none;
	const AB = new Complex128Array( 15 );
	const d = new Float64Array( 5 );
	const e = new Float64Array( 4 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 5 );
	AB.set( [ 4, 0 ], 0 );
	AB.set( [ 1, -1 ], 1 );
	AB.set( [ 2, 1 ], 2 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 3, -1 ], 4 );
	AB.set( [ 1, 1 ], 5 );
	AB.set( [ 6, 0 ], 6 );
	AB.set( [ 2, -1 ], 7 );
	AB.set( [ 1, 1 ], 8 );
	AB.set( [ 7, 0 ], 9 );
	AB.set( [ 3, -1 ], 10 );
	AB.set( [ 8, 0 ], 12 );
	const info = zhbtrd( 'none', 'lower', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: upper_kd1_n4_none', function t() {

	const tc = upper_kd1_n4_none;
	const AB = new Complex128Array( 8 );
	const d = new Float64Array( 4 );
	const e = new Float64Array( 3 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 1 );
	AB.set( [ 1, 1 ], 2 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 2, -1 ], 4 );
	AB.set( [ 6, 0 ], 5 );
	AB.set( [ 3, 1 ], 6 );
	AB.set( [ 7, 0 ], 7 );
	const info = zhbtrd( 'none', 'upper', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: lower_kd1_n4_none', function t() {

	const tc = lower_kd1_n4_none;
	const AB = new Complex128Array( 8 );
	const d = new Float64Array( 4 );
	const e = new Float64Array( 3 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 0 );
	AB.set( [ 1, -1 ], 1 );
	AB.set( [ 5, 0 ], 2 );
	AB.set( [ 2, 1 ], 3 );
	AB.set( [ 6, 0 ], 4 );
	AB.set( [ 3, -1 ], 5 );
	AB.set( [ 7, 0 ], 6 );
	const info = zhbtrd( 'none', 'lower', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: upper_kd2_n5_init', function t() {

	const tc = upper_kd2_n5_init;
	const AB = new Complex128Array( 15 );
	const d = new Float64Array( 5 );
	const e = new Float64Array( 4 );
	const Q = new Complex128Array( 25 );
	const WORK = new Complex128Array( 5 );
	AB.set( [ 4, 0 ], 2 );
	AB.set( [ 1, 1 ], 4 );
	AB.set( [ 5, 0 ], 5 );
	AB.set( [ 2, -1 ], 6 );
	AB.set( [ 3, 1 ], 7 );
	AB.set( [ 6, 0 ], 8 );
	AB.set( [ 1, -1 ], 9 );
	AB.set( [ 2, 1 ], 10 );
	AB.set( [ 7, 0 ], 11 );
	AB.set( [ 1, -1 ], 12 );
	AB.set( [ 3, 1 ], 13 );
	AB.set( [ 8, 0 ], 14 );
	const info = zhbtrd( 'initialize', 'upper', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: lower_kd2_n5_init', function t() {

	const tc = lower_kd2_n5_init;
	const AB = new Complex128Array( 15 );
	const d = new Float64Array( 5 );
	const e = new Float64Array( 4 );
	const Q = new Complex128Array( 25 );
	const WORK = new Complex128Array( 5 );
	AB.set( [ 4, 0 ], 0 );
	AB.set( [ 1, -1 ], 1 );
	AB.set( [ 2, 1 ], 2 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 3, -1 ], 4 );
	AB.set( [ 1, 1 ], 5 );
	AB.set( [ 6, 0 ], 6 );
	AB.set( [ 2, -1 ], 7 );
	AB.set( [ 1, 1 ], 8 );
	AB.set( [ 7, 0 ], 9 );
	AB.set( [ 3, -1 ], 10 );
	AB.set( [ 8, 0 ], 12 );
	const info = zhbtrd( 'initialize', 'lower', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: n_zero', function t() {

	const tc = n_zero;
	const AB = new Complex128Array( 1 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const info = zhbtrd( 'none', 'upper', 0, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zhbtrd: n_one_upper_init', function t() {

	const tc = n_one_upper_init;
	const AB = new Complex128Array( 1 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	AB.set( [ 7, 0 ], 0 );
	const info = zhbtrd( 'initialize', 'upper', 1, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: kd0_upper_none', function t() {

	const tc = kd0_upper_none;
	const AB = new Complex128Array( 3 );
	const d = new Float64Array( 3 );
	const e = new Float64Array( 2 );
	const Q = new Complex128Array( 1 );
	const WORK = new Complex128Array( 3 );
	AB.set( [ 2, 0 ], 0 );
	AB.set( [ 5, 0 ], 1 );
	AB.set( [ 8, 0 ], 2 );
	const info = zhbtrd( 'none', 'upper', 3, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: upper_kd3_n6_init', function t() {

	const tc = upper_kd3_n6_init;
	const AB = new Complex128Array( 24 );
	const d = new Float64Array( 6 );
	const e = new Float64Array( 5 );
	const Q = new Complex128Array( 36 );
	const WORK = new Complex128Array( 6 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 2, 1 ], 6 );
	AB.set( [ 6, 0 ], 7 );
	AB.set( [ 1, -1 ], 9 );
	AB.set( [ 3, -1 ], 10 );
	AB.set( [ 7, 0 ], 11 );
	AB.set( [ 3, 1 ], 12 );
	AB.set( [ 1, 1 ], 13 );
	AB.set( [ 2, -1 ], 14 );
	AB.set( [ 8, 0 ], 15 );
	AB.set( [ 2, -1 ], 16 );
	AB.set( [ 3, 1 ], 17 );
	AB.set( [ 1, 1 ], 18 );
	AB.set( [ 9, 0 ], 19 );
	AB.set( [ 1, -1 ], 20 );
	AB.set( [ 2, 1 ], 21 );
	AB.set( [ 3, -1 ], 22 );
	AB.set( [ 10, 0 ], 23 );
	const info = zhbtrd( 'initialize', 'upper', 6, 3, AB, 1, 4, 0, d, 1, 0, e, 1, 0, Q, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: lower_kd3_n6_init', function t() {

	const tc = lower_kd3_n6_init;
	const AB = new Complex128Array( 24 );
	const d = new Float64Array( 6 );
	const e = new Float64Array( 5 );
	const Q = new Complex128Array( 36 );
	const WORK = new Complex128Array( 6 );
	AB.set( [ 5, 0 ], 0 );
	AB.set( [ 2, -1 ], 1 );
	AB.set( [ 1, 1 ], 2 );
	AB.set( [ 3, -1 ], 3 );
	AB.set( [ 6, 0 ], 4 );
	AB.set( [ 3, 1 ], 5 );
	AB.set( [ 1, -1 ], 6 );
	AB.set( [ 2, 1 ], 7 );
	AB.set( [ 7, 0 ], 8 );
	AB.set( [ 2, 1 ], 9 );
	AB.set( [ 3, -1 ], 10 );
	AB.set( [ 1, 1 ], 11 );
	AB.set( [ 8, 0 ], 12 );
	AB.set( [ 1, -1 ], 13 );
	AB.set( [ 2, -1 ], 14 );
	AB.set( [ 9, 0 ], 16 );
	AB.set( [ 3, 1 ], 17 );
	AB.set( [ 10, 0 ], 20 );
	const info = zhbtrd( 'initialize', 'lower', 6, 3, AB, 1, 4, 0, d, 1, 0, e, 1, 0, Q, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: upper_kd1_n4_init', function t() {

	const tc = upper_kd1_n4_init;
	const AB = new Complex128Array( 8 );
	const d = new Float64Array( 4 );
	const e = new Float64Array( 3 );
	const Q = new Complex128Array( 16 );
	const WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 1 );
	AB.set( [ 1, 1 ], 2 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 2, -1 ], 4 );
	AB.set( [ 6, 0 ], 5 );
	AB.set( [ 3, 1 ], 6 );
	AB.set( [ 7, 0 ], 7 );
	const info = zhbtrd( 'initialize', 'upper', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: lower_kd1_n4_init', function t() {

	const tc = lower_kd1_n4_init;
	const AB = new Complex128Array( 8 );
	const d = new Float64Array( 4 );
	const e = new Float64Array( 3 );
	const Q = new Complex128Array( 16 );
	const WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 0 );
	AB.set( [ 1, -1 ], 1 );
	AB.set( [ 5, 0 ], 2 );
	AB.set( [ 2, 1 ], 3 );
	AB.set( [ 6, 0 ], 4 );
	AB.set( [ 3, -1 ], 5 );
	AB.set( [ 7, 0 ], 6 );
	const info = zhbtrd( 'initialize', 'lower', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	const Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

/**
* Returns a dense Hermitian band test matrix as interleaved column-major data.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {boolean} zeroOffdiag - whether to zero the first super-diagonal element
* @returns {Float64Array} dense matrix (N-by-N, column-major, interleaved)
*/
function denseHermitian( N, kd, zeroOffdiag ) {
	const A = new Float64Array( 2 * N * N );
	let re;
	let im;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		A[ 2 * ( j + ( j * N ) ) ] = 4.0 + Math.cos( j );
		for ( i = Math.max( 0, j - kd ); i < j; i++ ) {
			re = Math.sin( ( 3 * i ) + j + 1 );
			im = Math.cos( i + ( 2 * j ) + 1 ) * 0.5;
			if ( zeroOffdiag && i === 0 && j === 1 ) {
				re = 0.0;
				im = 0.0;
			}
			A[ 2 * ( i + ( j * N ) ) ] = re;
			A[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = im;
			A[ 2 * ( j + ( i * N ) ) ] = re;
			A[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -im;
		}
	}
	return A;
}

/**
* Packs a dense Hermitian matrix into column-major band storage.
*
* @private
* @param {Float64Array} A - dense matrix (interleaved, column-major)
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @returns {Complex128Array} band storage (LDAB = kd+1)
*/
function toBand( A, uplo, N, kd ) {
	const AB = new Complex128Array( ( kd + 1 ) * N );
	const v = reinterpret( AB, 0 );
	let r;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' && i <= j && j - i <= kd ) {
				r = kd + i - j;
			} else if ( uplo === 'lower' && i >= j && i - j <= kd ) {
				r = i - j;
			} else {
				continue;
			}
			v[ 2 * ( r + ( j * ( kd + 1 ) ) ) ] = A[ 2 * ( i + ( j * N ) ) ];
			v[ ( 2 * ( r + ( j * ( kd + 1 ) ) ) ) + 1 ] = A[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
		}
	}
	return AB;
}

/**
* Computes the maximum absolute entry of `Q*T*Q^H - A` and of `Q^H*Q - I`.
*
* @private
* @param {Float64Array} A - dense matrix (interleaved, column-major)
* @param {Float64Array} Qv - unitary matrix (interleaved, column-major)
* @param {Float64Array} d - diagonal of T
* @param {Float64Array} e - off-diagonal of T
* @param {NonNegativeInteger} N - order
* @returns {Array<number>} reconstruction and orthogonality errors
*/
function residuals( A, Qv, d, e, N ) {
	const QT = new Float64Array( 2 * N * N );
	let rec = 0.0;
	let orth = 0.0;
	let sr;
	let si;
	let t;
	let i;
	let j;
	let k;

	// QT = Q * T (T real tridiagonal):
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = Qv[ 2 * ( i + ( j * N ) ) ] * d[ j ];
			si = Qv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] * d[ j ];
			if ( j > 0 ) {
				sr += Qv[ 2 * ( i + ( ( j - 1 ) * N ) ) ] * e[ j - 1 ];
				si += Qv[ ( 2 * ( i + ( ( j - 1 ) * N ) ) ) + 1 ] * e[ j - 1 ];
			}
			if ( j < N - 1 ) {
				sr += Qv[ 2 * ( i + ( ( j + 1 ) * N ) ) ] * e[ j ];
				si += Qv[ ( 2 * ( i + ( ( j + 1 ) * N ) ) ) + 1 ] * e[ j ];
			}
			QT[ 2 * ( i + ( j * N ) ) ] = sr;
			QT[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = si;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// (QT * Q^H)(i,j) = sum_k QT(i,k) * conj(Q(j,k))
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				sr += ( QT[ 2 * ( i + ( k * N ) ) ] * Qv[ 2 * ( j + ( k * N ) ) ] ) + ( QT[ ( 2 * ( i + ( k * N ) ) ) + 1 ] * Qv[ ( 2 * ( j + ( k * N ) ) ) + 1 ] );
				si += ( QT[ ( 2 * ( i + ( k * N ) ) ) + 1 ] * Qv[ 2 * ( j + ( k * N ) ) ] ) - ( QT[ 2 * ( i + ( k * N ) ) ] * Qv[ ( 2 * ( j + ( k * N ) ) ) + 1 ] );
			}
			t = Math.max( Math.abs( sr - A[ 2 * ( i + ( j * N ) ) ] ), Math.abs( si - A[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ) );
			rec = Math.max( rec, t );

			// (Q^H * Q)(i,j) = sum_k conj(Q(k,i)) * Q(k,j)
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				sr += ( Qv[ 2 * ( k + ( i * N ) ) ] * Qv[ 2 * ( k + ( j * N ) ) ] ) + ( Qv[ ( 2 * ( k + ( i * N ) ) ) + 1 ] * Qv[ ( 2 * ( k + ( j * N ) ) ) + 1 ] );
				si += ( Qv[ 2 * ( k + ( i * N ) ) ] * Qv[ ( 2 * ( k + ( j * N ) ) ) + 1 ] ) - ( Qv[ ( 2 * ( k + ( i * N ) ) ) + 1 ] * Qv[ 2 * ( k + ( j * N ) ) ] );
			}
			t = Math.max( Math.abs( sr - ( ( i === j ) ? 1.0 : 0.0 ) ), Math.abs( si ) );
			orth = Math.max( orth, t );
		}
	}
	return [ rec, orth ];
}

/**
* Runs zhbtrd with `vect = 'initialize'` and checks `A = Q*T*Q^H` and `Q^H*Q = I`.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {boolean} zeroOffdiag - whether to zero the first super-diagonal element
* @returns {Object} results
*/
function checkReconstruction( uplo, N, kd, zeroOffdiag ) {
	const A = denseHermitian( N, kd, zeroOffdiag );
	const AB = toBand( A, uplo, N, kd );
	const d = new Float64Array( N );
	const e = new Float64Array( Math.max( N - 1, 1 ) );
	const Q = new Complex128Array( N * N );
	const info = zhbtrd( 'initialize', uplo, N, kd, AB, 1, kd + 1, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, new Complex128Array( N ), 1, 0 );
	const r = residuals( A, reinterpret( Q, 0 ), d, e, N );
	assert.equal( info, 0, 'info' );
	assert.ok( r[ 0 ] < 1e-12, uplo + ' N=' + N + ' kd=' + kd + ': reconstruction error ' + r[ 0 ] );
	assert.ok( r[ 1 ] < 1e-12, uplo + ' N=' + N + ' kd=' + kd + ': orthogonality error ' + r[ 1 ] );
	for ( let i = 0; i < N - 1; i++ ) {
		assert.ok( e[ i ] >= 0.0, 'e is real nonnegative' );
	}
	return {
		'A': A,
		'd': d,
		'e': e,
		'Q': Q
	};
}

/**
* Checks that `vect = 'update'` with a diagonal unitary `Q0` yields `Q0 * Q`.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
*/
function checkUpdate( uplo, N, kd ) {
	const ref = checkReconstruction( uplo, N, kd, false );
	const Qr = reinterpret( ref.Q, 0 );
	const AB = toBand( ref.A, uplo, N, kd );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Complex128Array( N * N );
	const Qv = reinterpret( Q, 0 );
	const c = new Float64Array( N );
	const s = new Float64Array( N );
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		c[ i ] = Math.cos( 0.7 * ( i + 1 ) );
		s[ i ] = Math.sin( 0.7 * ( i + 1 ) );
		Qv[ 2 * ( i + ( i * N ) ) ] = c[ i ];
		Qv[ ( 2 * ( i + ( i * N ) ) ) + 1 ] = s[ i ];
	}
	const info = zhbtrd( 'update', uplo, N, kd, AB, 1, kd + 1, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, new Complex128Array( N ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepStrictEqual( d, ref.d, 'd' );
	assert.deepStrictEqual( e, ref.e, 'e' );

	// Q = diag(c + i*s) * Qref:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			const re = ( c[ i ] * Qr[ 2 * ( i + ( j * N ) ) ] ) - ( s[ i ] * Qr[ ( 2 * ( i + ( j * N ) ) ) + 1 ] );
			const im = ( c[ i ] * Qr[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ) + ( s[ i ] * Qr[ 2 * ( i + ( j * N ) ) ] );
			assert.ok( Math.abs( Qv[ 2 * ( i + ( j * N ) ) ] - re ) < 1e-13, 'Q re (' + i + ',' + j + ')' );
			assert.ok( Math.abs( Qv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] - im ) < 1e-13, 'Q im (' + i + ',' + j + ')' );
		}
	}
}

test( 'zhbtrd: upper, kd=2, N=12 (long rotation sequences) satisfies A = Q*T*Q^H', function t() {
	checkReconstruction( 'upper', 12, 2, false );
});

test( 'zhbtrd: lower, kd=2, N=12 (long rotation sequences) satisfies A = Q*T*Q^H', function t() {
	checkReconstruction( 'lower', 12, 2, false );
});

test( 'zhbtrd: upper, kd=3, N=10 satisfies A = Q*T*Q^H', function t() {
	checkReconstruction( 'upper', 10, 3, false );
});

test( 'zhbtrd: lower, kd=3, N=10 satisfies A = Q*T*Q^H', function t() {
	checkReconstruction( 'lower', 10, 3, false );
});

test( 'zhbtrd: upper, kd=4, N=16 satisfies A = Q*T*Q^H', function t() {
	checkReconstruction( 'upper', 16, 4, false );
});

test( 'zhbtrd: lower, kd=4, N=16 satisfies A = Q*T*Q^H', function t() {
	checkReconstruction( 'lower', 16, 4, false );
});

test( 'zhbtrd: upper, update multiplies the input Q by the reducing transformation', function t() {
	checkUpdate( 'upper', 8, 2 );
});

test( 'zhbtrd: lower, update multiplies the input Q by the reducing transformation', function t() {
	checkUpdate( 'lower', 8, 2 );
});

test( 'zhbtrd: upper, kd=1 with a zero off-diagonal element', function t() {
	const r = checkReconstruction( 'upper', 4, 1, true );
	assert.strictEqual( r.e[ 0 ], 0.0, 'e[0]' );
});

test( 'zhbtrd: lower, kd=1 with a zero off-diagonal element', function t() {
	const r = checkReconstruction( 'lower', 4, 1, true );
	assert.strictEqual( r.e[ 0 ], 0.0, 'e[0]' );
});

test( 'zhbtrd: lower, kd=0 copies the diagonal and zeros E', function t() {
	const AB = new Complex128Array( [ 3.0, 0.0, -1.5, 0.0, 2.0, 0.0 ] );
	const d = new Float64Array( 3 );
	const e = new Float64Array( [ 9.0, 9.0 ] );
	const info = zhbtrd( 'none', 'lower', 3, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 3 ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.deepStrictEqual( d, new Float64Array( [ 3.0, -1.5, 2.0 ] ), 'd' );
	assert.deepStrictEqual( e, new Float64Array( [ 0.0, 0.0 ] ), 'e' );
});
