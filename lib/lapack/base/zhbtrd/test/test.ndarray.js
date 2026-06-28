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

/* eslint-disable max-len, max-lines, max-lines-per-function, no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbtrd from './../lib/ndarray.js';

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

test( 'zhbtrd: upper_kd2_n5_none', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = upper_kd2_n5_none;
	AB = new Complex128Array( 15 );
	d = new Float64Array( 5 );
	e = new Float64Array( 4 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 5 );
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
	info = zhbtrd( 'none', 'upper', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: lower_kd2_n5_none', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = lower_kd2_n5_none;
	AB = new Complex128Array( 15 );
	d = new Float64Array( 5 );
	e = new Float64Array( 4 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 5 );
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
	info = zhbtrd( 'none', 'lower', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: upper_kd1_n4_none', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = upper_kd1_n4_none;
	AB = new Complex128Array( 8 );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 1 );
	AB.set( [ 1, 1 ], 2 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 2, -1 ], 4 );
	AB.set( [ 6, 0 ], 5 );
	AB.set( [ 3, 1 ], 6 );
	AB.set( [ 7, 0 ], 7 );
	info = zhbtrd( 'none', 'upper', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: lower_kd1_n4_none', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = lower_kd1_n4_none;
	AB = new Complex128Array( 8 );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 0 );
	AB.set( [ 1, -1 ], 1 );
	AB.set( [ 5, 0 ], 2 );
	AB.set( [ 2, 1 ], 3 );
	AB.set( [ 6, 0 ], 4 );
	AB.set( [ 3, -1 ], 5 );
	AB.set( [ 7, 0 ], 6 );
	info = zhbtrd( 'none', 'lower', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: upper_kd2_n5_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = upper_kd2_n5_init;
	AB = new Complex128Array( 15 );
	d = new Float64Array( 5 );
	e = new Float64Array( 4 );
	Q = new Complex128Array( 25 );
	WORK = new Complex128Array( 5 );
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
	info = zhbtrd( 'initialize', 'upper', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: lower_kd2_n5_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = lower_kd2_n5_init;
	AB = new Complex128Array( 15 );
	d = new Float64Array( 5 );
	e = new Float64Array( 4 );
	Q = new Complex128Array( 25 );
	WORK = new Complex128Array( 5 );
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
	info = zhbtrd( 'initialize', 'lower', 5, 2, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: n_zero', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = n_zero;
	AB = new Complex128Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zhbtrd( 'none', 'upper', 0, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zhbtrd: n_one_upper_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = n_one_upper_init;
	AB = new Complex128Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	AB.set( [ 7, 0 ], 0 );
	info = zhbtrd( 'initialize', 'upper', 1, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: kd0_upper_none', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var d;
	var e;
	var Q;

	tc = kd0_upper_none;
	AB = new Complex128Array( 3 );
	d = new Float64Array( 3 );
	e = new Float64Array( 2 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 3 );
	AB.set( [ 2, 0 ], 0 );
	AB.set( [ 5, 0 ], 1 );
	AB.set( [ 8, 0 ], 2 );
	info = zhbtrd( 'none', 'upper', 3, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
});

test( 'zhbtrd: upper_kd3_n6_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = upper_kd3_n6_init;
	AB = new Complex128Array( 24 );
	d = new Float64Array( 6 );
	e = new Float64Array( 5 );
	Q = new Complex128Array( 36 );
	WORK = new Complex128Array( 6 );
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
	info = zhbtrd( 'initialize', 'upper', 6, 3, AB, 1, 4, 0, d, 1, 0, e, 1, 0, Q, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: lower_kd3_n6_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = lower_kd3_n6_init;
	AB = new Complex128Array( 24 );
	d = new Float64Array( 6 );
	e = new Float64Array( 5 );
	Q = new Complex128Array( 36 );
	WORK = new Complex128Array( 6 );
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
	info = zhbtrd( 'initialize', 'lower', 6, 3, AB, 1, 4, 0, d, 1, 0, e, 1, 0, Q, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: upper_kd1_n4_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = upper_kd1_n4_init;
	AB = new Complex128Array( 8 );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	Q = new Complex128Array( 16 );
	WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 1 );
	AB.set( [ 1, 1 ], 2 );
	AB.set( [ 5, 0 ], 3 );
	AB.set( [ 2, -1 ], 4 );
	AB.set( [ 6, 0 ], 5 );
	AB.set( [ 3, 1 ], 6 );
	AB.set( [ 7, 0 ], 7 );
	info = zhbtrd( 'initialize', 'upper', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});

test( 'zhbtrd: lower_kd1_n4_init', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var Qv;
	var d;
	var e;
	var Q;

	tc = lower_kd1_n4_init;
	AB = new Complex128Array( 8 );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	Q = new Complex128Array( 16 );
	WORK = new Complex128Array( 4 );
	AB.set( [ 4, 0 ], 0 );
	AB.set( [ 1, -1 ], 1 );
	AB.set( [ 5, 0 ], 2 );
	AB.set( [ 2, 1 ], 3 );
	AB.set( [ 6, 0 ], 4 );
	AB.set( [ 3, -1 ], 5 );
	AB.set( [ 7, 0 ], 6 );
	info = zhbtrd( 'initialize', 'lower', 4, 1, AB, 1, 2, 0, d, 1, 0, e, 1, 0, Q, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	assertArrayClose( toArray( e ), tc.e, 1e-13, 'e' );
	Qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( Qv ), tc.Q, 1e-13, 'Q' );
});
