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
import zgelqf from './../lib/ndarray.js';

// FIXTURES //

import basic_3x5 from './fixtures/basic_3x5.json' with { type: 'json' };
import square_4x4 from './fixtures/square_4x4.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import wide_2x5 from './fixtures/wide_2x5.json' with { type: 'json' };
import tall_4x3 from './fixtures/tall_4x3.json' with { type: 'json' };
import large_35x50 from './fixtures/large_35x50.json' with { type: 'json' };

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

test( 'zgelqf: basic 3x5 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = basic_3x5;
	a = new Complex128Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		1,
		2,
		3,
		4,
		5
	]);
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 100 );
	info = zgelqf( 3, 5, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelqf: square 4x4 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = square_4x4;
	a = new Complex128Array([
		1,
		1,
		0,
		1,
		1,
		0,
		2,
		0.5,
		2,
		0.5,
		1,
		1,
		0.5,
		0.5,
		3,
		1,
		0,
		1,
		1,
		0,
		2,
		2,
		1,
		1,
		3,
		0,
		0.5,
		1.5,
		1,
		2,
		4,
		0.5
	]);
	tau = new Complex128Array( 4 );
	work = new Complex128Array( 100 );
	info = zgelqf( 4, 4, a, 1, 4, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelqf: M=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 2 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgelqf( 0, 5, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgelqf: N=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 10 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgelqf( 3, 0, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgelqf: 1x1 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = one_by_one;
	a = new Complex128Array( [ 5, 3 ] );
	tau = new Complex128Array( 1 );
	work = new Complex128Array( 10 );
	info = zgelqf( 1, 1, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelqf: wide 2x5 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = wide_2x5;
	a = new Complex128Array([
		1,
		1,
		2,
		0,
		3,
		2,
		4,
		1,
		5,
		3,
		6,
		0.5,
		7,
		1,
		8,
		2,
		9,
		0,
		0,
		1
	]);
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 100 );
	info = zgelqf( 2, 5, a, 1, 2, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelqf: tall 4x3 matrix (M > N)', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = tall_4x3;
	a = new Complex128Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6
	]);
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 100 );
	info = zgelqf( 4, 3, a, 1, 4, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelqf: works with offset', function t() {
	var work;
	var info;
	var pad;
	var tau;
	var tc;
	var av;
	var a;

	tc = square_4x4;
	pad = 2;
	a = new Complex128Array( pad + 16 );
	av = reinterpret( a, 0 );
	av.set([
		1,
		1,
		0,
		1,
		1,
		0,
		2,
		0.5,
		2,
		0.5,
		1,
		1,
		0.5,
		0.5,
		3,
		1,
		0,
		1,
		1,
		0,
		2,
		2,
		1,
		1,
		3,
		0,
		0.5,
		1.5,
		1,
		2,
		4,
		0.5
	], pad * 2 );
	tau = new Complex128Array( pad + 4 );
	work = new Complex128Array( 100 );
	info = zgelqf( 4, 4, a, 1, 4, pad, tau, 1, pad, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose(reinterpret( a, 0 ).subarray( pad * 2, pad * 2 + 32 ), tc.a, 1e-10, 'a with offset');
	assertArrayClose(reinterpret( tau, 0 ).subarray( pad * 2, pad * 2 + 8 ), tc.tau, 1e-10, 'tau with offset');
});

test( 'zgelqf: null WORK triggers internal allocation', function t() {
	var info;
	var tau;
	var tc;
	var a;

	tc = basic_3x5;
	a = new Complex128Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		1,
		2,
		3,
		4,
		5
	]);
	tau = new Complex128Array( 3 );
	info = zgelqf( 3, 5, a, 1, 3, 0, tau, 1, 0, null, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgelqf: large 35x50 matrix (blocked path)', function t() {
	var work;
	var info;
	var idx;
	var tau;
	var tc;
	var av;
	var M;
	var N;
	var a;
	var i;
	var j;

	tc = large_35x50;
	M = 35;
	N = 50;
	a = new Complex128Array( M * N );
	av = reinterpret( a, 0 );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			idx = 2 * ( ( i - 1 ) + ( j - 1 ) * M );
			av[ idx ] = ( ( i * 7 + j * 13 ) % 100 ) / 10.0;
			av[ idx + 1 ] = ( ( i * 11 + j * 3 ) % 100 ) / 10.0;
		}
	}
	tau = new Complex128Array( M );
	work = new Complex128Array( M * 64 );
	info = zgelqf( M, N, a, 1, M, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});
