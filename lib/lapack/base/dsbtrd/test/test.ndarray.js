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

/* eslint-disable max-len, max-lines, no-restricted-syntax, stdlib/first-unit-test */

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
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = upper_kd2_n5_none;
	N = 5;
	kd = 2;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( N );
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
	info = dsbtrd( 'none', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: lower_kd2_n5_none', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = lower_kd2_n5_none;
	N = 5;
	kd = 2;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( N );
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
	info = dsbtrd( 'none', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: upper_kd1_n4_none (tridiagonal, no reduction)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = upper_kd1_n4_none;
	N = 4;
	kd = 1;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( N );
	AB[ 1 + 0 * LDAB ] = 4.0;
	AB[ 0 + 1 * LDAB ] = 1.0;
	AB[ 1 + 1 * LDAB ] = 5.0;
	AB[ 0 + 2 * LDAB ] = 2.0;
	AB[ 1 + 2 * LDAB ] = 6.0;
	AB[ 0 + 3 * LDAB ] = 3.0;
	AB[ 1 + 3 * LDAB ] = 7.0;
	info = dsbtrd( 'none', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: lower_kd1_n4_none (tridiagonal, no reduction)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = lower_kd1_n4_none;
	N = 4;
	kd = 1;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 4.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 0 + 1 * LDAB ] = 5.0;
	AB[ 1 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 6.0;
	AB[ 1 + 2 * LDAB ] = 3.0;
	AB[ 0 + 3 * LDAB ] = 7.0;
	info = dsbtrd( 'none', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: upper_kd3_n6_init (VECT=initialize, with Q)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = upper_kd3_n6_init;
	N = 6;
	kd = 3;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( N );
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
	info = dsbtrd( 'initialize', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: lower_kd3_n6_init (VECT=initialize, with Q)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = lower_kd3_n6_init;
	N = 6;
	kd = 3;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( N );
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
	info = dsbtrd( 'initialize', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: upper_kd2_n4_update (VECT=update)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;
	var i;

	tc = upper_kd2_n4_update;
	N = 4;
	kd = 2;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( N );
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
	info = dsbtrd( 'update', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: n_zero (quick return)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = n_zero;
	AB = new Float64Array( 1 );
	d = new Float64Array( 0 );
	e = new Float64Array( 0 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( 0 );
	info = dsbtrd( 'none', 'upper', 0, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsbtrd: n_one_upper_init (N=1, VECT=initialize)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = n_one_upper_init;
	AB = new Float64Array( [ 7.0 ] );
	d = new Float64Array( 1 );
	e = new Float64Array( 0 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsbtrd( 'initialize', 'upper', 1, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: n_one_lower_none (N=1, VECT=none)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = n_one_lower_none;
	AB = new Float64Array( [ 7.0 ] );
	d = new Float64Array( 1 );
	e = new Float64Array( 0 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsbtrd( 'none', 'lower', 1, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
});

test( 'dsbtrd: kd0_upper_none (diagonal matrix, KD=0)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = kd0_upper_none;
	N = 3;
	LDAB = 1;
	AB = new Float64Array( [ 2.0, 5.0, 8.0 ] );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( 1 );
	WORK = new Float64Array( N );
	info = dsbtrd( 'none', 'upper', N, 0, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
});

test( 'dsbtrd: lower_kd2_n4_init (VECT=initialize, lower)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = lower_kd2_n4_init;
	N = 4;
	kd = 2;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 3.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 2 + 0 * LDAB ] = 2.0;
	AB[ 0 + 1 * LDAB ] = 4.0;
	AB[ 1 + 1 * LDAB ] = 1.0;
	AB[ 2 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 5.0;
	AB[ 1 + 2 * LDAB ] = 1.0;
	AB[ 0 + 3 * LDAB ] = 6.0;
	info = dsbtrd( 'initialize', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: upper_kd1_n4_init (tridiagonal, VECT=initialize)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = upper_kd1_n4_init;
	N = 4;
	kd = 1;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( N );
	AB[ 1 + 0 * LDAB ] = 4.0;
	AB[ 0 + 1 * LDAB ] = 1.0;
	AB[ 1 + 1 * LDAB ] = 5.0;
	AB[ 0 + 2 * LDAB ] = 2.0;
	AB[ 1 + 2 * LDAB ] = 6.0;
	AB[ 0 + 3 * LDAB ] = 3.0;
	AB[ 1 + 3 * LDAB ] = 7.0;
	info = dsbtrd( 'initialize', 'upper', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});

test( 'dsbtrd: lower_kd1_n4_init (tridiagonal, VECT=initialize)', function t() {
	var LDAB;
	var WORK;
	var info;
	var tc;
	var kd;
	var AB;
	var N;
	var d;
	var e;
	var Q;

	tc = lower_kd1_n4_init;
	N = 4;
	kd = 1;
	LDAB = kd + 1;
	AB = new Float64Array( LDAB * N );
	d = new Float64Array( N );
	e = new Float64Array( N - 1 );
	Q = new Float64Array( N * N );
	WORK = new Float64Array( N );
	AB[ 0 + 0 * LDAB ] = 4.0;
	AB[ 1 + 0 * LDAB ] = 1.0;
	AB[ 0 + 1 * LDAB ] = 5.0;
	AB[ 1 + 1 * LDAB ] = 2.0;
	AB[ 0 + 2 * LDAB ] = 6.0;
	AB[ 1 + 2 * LDAB ] = 3.0;
	AB[ 0 + 3 * LDAB ] = 7.0;
	info = dsbtrd( 'initialize', 'lower', N, kd, AB, 1, LDAB, 0, d, 1, 0, e, 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( d, toFloat64( tc.d ), 1e-14, 'd' );
	assertArrayClose( e, toFloat64( tc.e ), 1e-14, 'e' );
	assertArrayClose( Q, toFloat64( tc.Q ), 1e-14, 'Q' );
});
