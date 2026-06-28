/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqr2 from './../lib/ndarray.js';

// FIXTURES //

import basic_3x2 from './fixtures/basic_3x2.json' with { type: 'json' };
import square_2x2 from './fixtures/square_2x2.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };

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

// TESTS //

test( 'zgeqr2: basic 3x2 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = basic_3x2;
	a = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 1, 5, 1, 6, 1 ] );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqr2( 3, 2, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqr2: square 2x2 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = square_2x2;
	a = new Complex128Array( [ 1, 1, 0, 1, 1, 0, 1, 1 ] );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqr2( 2, 2, a, 1, 2, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqr2: M=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 2 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 2 );
	info = zgeqr2( 0, 2, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgeqr2: N=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 6 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 2 );
	info = zgeqr2( 3, 0, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgeqr2: 1x1 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = one_by_one;
	a = new Complex128Array( [ 5, 3 ] );
	tau = new Complex128Array( 1 );
	work = new Complex128Array( 2 );
	info = zgeqr2( 1, 1, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});
