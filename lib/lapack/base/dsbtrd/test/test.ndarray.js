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

/* eslint-disable max-len, max-lines, no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbtrd from './../lib/ndarray.js';

// FIXTURES //

import upper_kd2_n5_none from './fixtures/upper_kd2_n5_none.json' with { type: 'json' };
import lower_kd2_n5_none from './fixtures/lower_kd2_n5_none.json' with { type: 'json' };
import upper_kd1_n4_none from './fixtures/upper_kd1_n4_none.json' with { type: 'json' };
import lower_kd1_n4_none from './fixtures/lower_kd1_n4_none.json' with { type: 'json' };
import upper_kd3_n6_init from './fixtures/upper_kd3_n6_init.json' with { type: 'json' };
import lower_kd3_n6_init from './fixtures/lower_kd3_n6_init.json' with { type: 'json' };
import upper_kd2_n4_update from './fixtures/upper_kd2_n4_update.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper_init from './fixtures/n_one_upper_init.json' with { type: 'json' };
import n_one_lower_none from './fixtures/n_one_lower_none.json' with { type: 'json' };
import kd0_upper_none from './fixtures/kd0_upper_none.json' with { type: 'json' };
import lower_kd2_n4_init from './fixtures/lower_kd2_n4_init.json' with { type: 'json' };
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
* ToFloat64.
*
* @private
* @param {TypedArray} arr - input array
* @returns {*} result
*/
function toFloat64( arr ) {
	return new Float64Array( arr );
}

// TESTS //

test( 'dsbtrd: upper_kd2_n5_none', function t() {

	const tc = upper_kd2_n5_none;
	const N = 5;
	const kd = 2;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 0.0;
	AB[ 1 + 0 * LDAB ] = 0.0;
	AB[ 2 + 0 * LDAB ] = 4.0;
	AB[ 0 + 1 * LDAB ] = 0.0;
	AB[ 1 + 1 * LDAB ] = 1.0;
	AB[ 2 + 1 * LDAB ] = 5.0;
	AB[ 0 + 2 * LDAB ] = 2.0;
	AB[ 1 + 2 * LDAB ] = 3.0;
	AB[ 2 + 2 * LDAB ] = 6.0;
	AB[ 0 + 3 * LDAB ] = 1.0;
	AB[ 1 + 3 * LDAB ] = 2.0;
	AB[ 2 + 3 * LDAB ] = 7.0;
	AB[ 0 + 4 * LDAB ] = 1.0;
	AB[ 1 + 4 * LDAB ] = 3.0;
	AB[ 2 + 4 * LDAB ] = 8.0;
	const info = dsbtrd( 'none', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: lower_kd2_n5_none', function t() {

	const tc = lower_kd2_n5_none;
	const N = 5;
	const kd = 2;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 4.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 2 + 0 * LDAB ] = 2.0;
	AB[ 0 + 1 * LDAB ] = 5.0;
	AB[ 1 + 1 * LDAB ] = 3.0;
	AB[ 2 + 1 * LDAB ] = 1.0;
	AB[ 0 + 2 * LDAB ] = 6.0;
	AB[ 1 + 2 * LDAB ] = 2.0;
	AB[ 2 + 2 * LDAB ] = 1.0;
	AB[ 0 + 3 * LDAB ] = 7.0;
	AB[ 1 + 3 * LDAB ] = 3.0;
	AB[ 0 + 4 * LDAB ] = 8.0;
	const info = dsbtrd( 'none', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: upper_kd1_n4_none (tridiagonal, no reduction)', function t() {

	const tc = upper_kd1_n4_none;
	const N = 4;
	const kd = 1;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	AB[ 1 + 0 * LDAB ] = 4.0;
	AB[ 0 + 1 * LDAB ] = 1.0;
	AB[ 1 + 1 * LDAB ] = 5.0;
	AB[ 0 + 2 * LDAB ] = 2.0;
	AB[ 1 + 2 * LDAB ] = 6.0;
	AB[ 0 + 3 * LDAB ] = 3.0;
	AB[ 1 + 3 * LDAB ] = 7.0;
	const info = dsbtrd( 'none', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: lower_kd1_n4_none (tridiagonal, no reduction)', function t() {

	const tc = lower_kd1_n4_none;
	const N = 4;
	const kd = 1;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 4.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 0 + 1 * LDAB ] = 5.0;
	AB[ 1 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 6.0;
	AB[ 1 + 2 * LDAB ] = 3.0;
	AB[ 0 + 3 * LDAB ] = 7.0;
	const info = dsbtrd( 'none', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: upper_kd3_n6_init (VECT=initialize, with Q)', function t() {

	const tc = upper_kd3_n6_init;
	const N = 6;
	const kd = 3;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	AB[ 3 + 0 * LDAB ] = 5.0;
	AB[ 2 + 1 * LDAB ] = 2.0;
	AB[ 3 + 1 * LDAB ] = 6.0;
	AB[ 1 + 2 * LDAB ] = 1.0;
	AB[ 2 + 2 * LDAB ] = 3.0;
	AB[ 3 + 2 * LDAB ] = 7.0;
	AB[ 0 + 3 * LDAB ] = 3.0;
	AB[ 1 + 3 * LDAB ] = 1.0;
	AB[ 2 + 3 * LDAB ] = 2.0;
	AB[ 3 + 3 * LDAB ] = 8.0;
	AB[ 0 + 4 * LDAB ] = 2.0;
	AB[ 1 + 4 * LDAB ] = 3.0;
	AB[ 2 + 4 * LDAB ] = 1.0;
	AB[ 3 + 4 * LDAB ] = 9.0;
	AB[ 0 + 5 * LDAB ] = 1.0;
	AB[ 1 + 5 * LDAB ] = 2.0;
	AB[ 2 + 5 * LDAB ] = 3.0;
	AB[ 3 + 5 * LDAB ] = 10.0;
	const info = dsbtrd( 'initialize', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: lower_kd3_n6_init (VECT=initialize, with Q)', function t() {

	const tc = lower_kd3_n6_init;
	const N = 6;
	const kd = 3;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 5.0;
	AB[ 1 + 0 * LDAB ] = 2.0;
	AB[ 2 + 0 * LDAB ] = 1.0;
	AB[ 3 + 0 * LDAB ] = 3.0;
	AB[ 0 + 1 * LDAB ] = 6.0;
	AB[ 1 + 1 * LDAB ] = 3.0;
	AB[ 2 + 1 * LDAB ] = 1.0;
	AB[ 3 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 7.0;
	AB[ 1 + 2 * LDAB ] = 2.0;
	AB[ 2 + 2 * LDAB ] = 3.0;
	AB[ 3 + 2 * LDAB ] = 1.0;
	AB[ 0 + 3 * LDAB ] = 8.0;
	AB[ 1 + 3 * LDAB ] = 1.0;
	AB[ 2 + 3 * LDAB ] = 2.0;
	AB[ 0 + 4 * LDAB ] = 9.0;
	AB[ 1 + 4 * LDAB ] = 3.0;
	AB[ 0 + 5 * LDAB ] = 10.0;
	const info = dsbtrd( 'initialize', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: upper_kd2_n4_update (VECT=update)', function t() {
	let i;

	const tc = upper_kd2_n4_update;
	const N = 4;
	const kd = 2;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	AB[ 2 + 0 * LDAB ] = 3.0;
	AB[ 1 + 1 * LDAB ] = 1.0;
	AB[ 2 + 1 * LDAB ] = 4.0;
	AB[ 0 + 2 * LDAB ] = 2.0;
	AB[ 1 + 2 * LDAB ] = 1.0;
	AB[ 2 + 2 * LDAB ] = 5.0;
	AB[ 0 + 3 * LDAB ] = 2.0;
	AB[ 1 + 3 * LDAB ] = 1.0;
	AB[ 2 + 3 * LDAB ] = 6.0;
	for ( i = 0; i < N; i++ ) {
		Q[ i + i * N ] = 1.0;
	}
	const info = dsbtrd( 'update', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: n_zero (quick return)', function t() {

	const tc = n_zero;
	const AB = new Float64Array( 1 );
	const d = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( 0 );
	const info = dsbtrd( 'none', 'upper', 0, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsbtrd: n_one_upper_init (N=1, VECT=initialize)', function t() {

	const tc = n_one_upper_init;
	const AB = new Float64Array( [ 7.0 ] );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 0 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsbtrd( 'initialize', 'upper', 1, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: n_one_lower_none (N=1, VECT=none)', function t() {

	const tc = n_one_lower_none;
	const AB = new Float64Array( [ 7.0 ] );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 0 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dsbtrd( 'none', 'lower', 1, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
});

test( 'dsbtrd: kd0_upper_none (diagonal matrix, KD=0)', function t() {

	const tc = kd0_upper_none;
	const N = 3;
	const LDAB = 1;
	const AB = new Float64Array( [ 2.0, 5.0, 8.0 ] );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	const info = dsbtrd( 'none', 'upper', N, 0, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: lower_kd2_n4_init (VECT=initialize, lower)', function t() {

	const tc = lower_kd2_n4_init;
	const N = 4;
	const kd = 2;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 3.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 2 + 0 * LDAB ] = 2.0;
	AB[ 0 + 1 * LDAB ] = 4.0;
	AB[ 1 + 1 * LDAB ] = 1.0;
	AB[ 2 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 5.0;
	AB[ 1 + 2 * LDAB ] = 1.0;
	AB[ 0 + 3 * LDAB ] = 6.0;
	const info = dsbtrd( 'initialize', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: upper_kd1_n4_init (tridiagonal, VECT=initialize)', function t() {

	const tc = upper_kd1_n4_init;
	const N = 4;
	const kd = 1;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	AB[ 1 + 0 * LDAB ] = 4.0;
	AB[ 0 + 1 * LDAB ] = 1.0;
	AB[ 1 + 1 * LDAB ] = 5.0;
	AB[ 0 + 2 * LDAB ] = 2.0;
	AB[ 1 + 2 * LDAB ] = 6.0;
	AB[ 0 + 3 * LDAB ] = 3.0;
	AB[ 1 + 3 * LDAB ] = 7.0;
	const info = dsbtrd( 'initialize', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: lower_kd1_n4_init (tridiagonal, VECT=initialize)', function t() {

	const tc = lower_kd1_n4_init;
	const N = 4;
	const kd = 1;
	const LDAB = kd + 1;
	const AB = new Float64Array( LDAB * N );
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 4.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 0 + 1 * LDAB ] = 5.0;
	AB[ 1 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 6.0;
	AB[ 1 + 2 * LDAB ] = 3.0;
	AB[ 0 + 3 * LDAB ] = 7.0;
	const info = dsbtrd( 'initialize', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});


// PROPERTY TESTS //

/**
* Returns a deterministic symmetric band matrix (column-major, N-by-N) with bandwidth `kd`.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @returns {Float64Array} dense matrix
*/
function bandMatrix( N, kd ) {
	const A = new Float64Array( N * N );
	let v, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min( N - 1, j + kd ); i++ ) {
			v = ( i === j ) ? 4.0 + Math.sin( i + 1 ) : Math.cos( ( 3 * i ) + ( 7 * j ) + 1 );
			A[ i + ( j * N ) ] = v;
			A[ j + ( i * N ) ] = v;
		}
	}
	return A;
}

/**
* Packs a dense symmetric matrix into LAPACK band storage with `LDAB = kd+1` (column-major).
*
* @private
* @param {Float64Array} A - dense matrix
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {string} uplo - triangle
* @returns {Float64Array} band storage
*/
function toBand( A, N, kd, uplo ) {
	const ldab = kd + 1;
	const AB = new Float64Array( ldab * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		if ( uplo === 'upper' ) {
			for ( i = Math.max( 0, j - kd ); i <= j; i++ ) {
				AB[ ( kd + i - j ) + ( j * ldab ) ] = A[ i + ( j * N ) ];
			}
		} else {
			for ( i = j; i <= Math.min( N - 1, j + kd ); i++ ) {
				AB[ ( i - j ) + ( j * ldab ) ] = A[ i + ( j * N ) ];
			}
		}
	}
	return AB;
}

/**
* Asserts that `Q*T*Q^T` equals `B` and that `Q^T*Q = I`.
*
* @private
* @param {Float64Array} Q - N-by-N column-major matrix
* @param {Float64Array} d - diagonal of T
* @param {Float64Array} e - off-diagonal of T
* @param {Float64Array} B - expected N-by-N column-major matrix
* @param {NonNegativeInteger} N - order
* @param {string} msg - message
*/
function assertReconstruction( Q, d, e, B, N, msg ) {
	const QT = new Float64Array( N * N );
	let s, i, j, k;

	// QT = Q*T
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = Q[ i + ( j * N ) ] * d[ j ];
			if ( j > 0 ) {
				s += Q[ i + ( ( j - 1 ) * N ) ] * e[ j - 1 ];
			}
			if ( j < N - 1 ) {
				s += Q[ i + ( ( j + 1 ) * N ) ] * e[ j ];
			}
			QT[ i + ( j * N ) ] = s;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// (Q*T*Q^T)(i,j) and (Q^T*Q)(i,j)
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += QT[ i + ( k * N ) ] * Q[ j + ( k * N ) ];
			}
			assert.ok( Math.abs( s - B[ i + ( j * N ) ] ) <= 1e-12 * N * 8.0, msg + ': reconstruction (' + i + ',' + j + ') ' + s + ' vs ' + B[ i + ( j * N ) ] );
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Q[ k + ( i * N ) ] * Q[ k + ( j * N ) ];
			}
			assert.ok( Math.abs( s - ( ( i === j ) ? 1.0 : 0.0 ) ) <= 1e-13 * N, msg + ': orthogonality (' + i + ',' + j + ')' );
		}
	}
}

test( 'dsbtrd: VECT=initialize reconstructs A = Q*T*Q^T for wide bands relative to kd (both triangles)', function t() {
	const cases = [ [ 10, 2 ], [ 12, 3 ], [ 13, 4 ], [ 9, 2 ] ];
	const uplos = [ 'upper', 'lower' ];
	let info, AB, kd, N, A, Q, d, e, c, u;
	for ( c = 0; c < cases.length; c++ ) {
		N = cases[ c ][ 0 ];
		kd = cases[ c ][ 1 ];
		A = bandMatrix( N, kd );
		for ( u = 0; u < uplos.length; u++ ) {
			AB = toBand( A, N, kd, uplos[ u ] );
			d = new Float64Array( N );
			e = new Float64Array( N - 1 );
			Q = new Float64Array( N * N );
			info = dsbtrd( 'initialize', uplos[ u ], N, kd, AB, 1, kd + 1, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, new Float64Array( N ), 1, 0 );
			assert.equal( info, 0 );
			assertReconstruction( Q, d, e, A, N, uplos[ u ] + ' N=' + N + ' kd=' + kd );
		}
	}
});

test( 'dsbtrd: VECT=update accumulates into a given orthogonal Q0 (Q*T*Q^T = Q0*A*Q0^T), both triangles', function t() {
	const cases = [ [ 10, 2 ], [ 12, 3 ], [ 5, 2 ] ];
	const uplos = [ 'upper', 'lower' ];
	let info, AB, kd, N, A, B, Q, d, e, c, u, i, j;
	for ( c = 0; c < cases.length; c++ ) {
		N = cases[ c ][ 0 ];
		kd = cases[ c ][ 1 ];
		A = bandMatrix( N, kd );

		// Q0 = reversal permutation, so B = Q0*A*Q0^T has B(i,j) = A(N-1-i,N-1-j):
		B = new Float64Array( N * N );
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < N; i++ ) {
				B[ i + ( j * N ) ] = A[ ( N - 1 - i ) + ( ( N - 1 - j ) * N ) ];
			}
		}
		for ( u = 0; u < uplos.length; u++ ) {
			AB = toBand( A, N, kd, uplos[ u ] );
			d = new Float64Array( N );
			e = new Float64Array( N - 1 );
			Q = new Float64Array( N * N );
			for ( i = 0; i < N; i++ ) {
				Q[ ( N - 1 - i ) + ( i * N ) ] = 1.0;
			}
			info = dsbtrd( 'update', uplos[ u ], N, kd, AB, 1, kd + 1, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, new Float64Array( N ), 1, 0 );
			assert.equal( info, 0 );
			assertReconstruction( Q, d, e, B, N, uplos[ u ] + ' N=' + N + ' kd=' + kd );
		}
	}
});

test( 'dsbtrd: VECT=none yields the same d and e as VECT=initialize (wide bands, both triangles)', function t() {
	const uplos = [ 'upper', 'lower' ];
	const N = 11;
	const kd = 3;
	const A = bandMatrix( N, kd );
	let d1, d2, e1, e2, u, i;
	for ( u = 0; u < uplos.length; u++ ) {
		d1 = new Float64Array( N );
		e1 = new Float64Array( N - 1 );
		d2 = new Float64Array( N );
		e2 = new Float64Array( N - 1 );
		dsbtrd( 'none', uplos[ u ], N, kd, toBand( A, N, kd, uplos[ u ] ), 1, kd + 1, 0, d1, 1, 0, e1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( N ), 1, 0 );
		dsbtrd( 'initialize', uplos[ u ], N, kd, toBand( A, N, kd, uplos[ u ] ), 1, kd + 1, 0, d2, 1, 0, e2, 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0 );
		for ( i = 0; i < N; i++ ) {
			assert.equal( d1[ i ], d2[ i ], uplos[ u ] + ' d[' + i + ']' );
		}
		for ( i = 0; i < N - 1; i++ ) {
			assert.equal( e1[ i ], e2[ i ], uplos[ u ] + ' e[' + i + ']' );
		}
	}
});

test( 'dsbtrd: KD=0 (lower) copies the diagonal and zeroes e', function t() {
	const AB = new Float64Array( [ 2.0, -5.0, 8.0 ] );
	const d = new Float64Array( 3 );
	const e = new Float64Array( [ 99.0, 99.0 ] );
	const Q = new Float64Array( 9 );
	const info = dsbtrd( 'initialize', 'lower', 3, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 3, 0, new Float64Array( 3 ), 1, 0 );
	assert.equal( info, 0 );
	assert.deepEqual( Array.from( d ), [ 2.0, -5.0, 8.0 ] );
	assert.deepEqual( Array.from( e ), [ 0.0, 0.0 ] );
	assert.deepEqual( Array.from( Q ), [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
});
