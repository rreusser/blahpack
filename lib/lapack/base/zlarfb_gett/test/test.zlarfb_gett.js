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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarfb_gett from './../lib/zlarfb_gett.js';


// TESTS //

test( 'zlarfb_gett is a function', function t() {
	assert.strictEqual( typeof zlarfb_gett, 'function', 'is a function' );
});

test( 'zlarfb_gett has expected arity', function t() {
	assert.strictEqual( zlarfb_gett.length, 13, 'has expected arity' );
});

test( 'zlarfb_gett throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'invalid', 'identity', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarfb_gett throws TypeError for invalid ident', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarfb_gett throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarfb_gett throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarfb_gett throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', 2, 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarfb_gett throws RangeError for LDT < max(1,M) when column-major', function t() {
	assert.throws( function throws() {
		zlarfb_gett( 'column-major', 'identity', 4, 4, 2, new Complex128Array( 16 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'zlarfb_gett runs without throwing for valid input', function t() {
	var WORK;
	var out;
	var A;
	var B;
	var K;
	var M;
	var N;
	var T;

	K = 2;
	M = 3;
	N = 3;
	T = new Complex128Array( K * K );
	A = new Complex128Array( K * N );
	B = new Complex128Array( M * N );
	WORK = new Complex128Array( K * N );
	out = zlarfb_gett( 'column-major', 'identity', M, N, K, T, M, A, M, B, M, WORK, M );
	assert.ok( out, 'returns A' );
});
