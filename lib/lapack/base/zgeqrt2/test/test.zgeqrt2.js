/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeqrt2 from './../lib/zgeqrt2.js';


// TESTS //

test( 'zgeqrt2 is a function', function t() {
	assert.strictEqual( typeof zgeqrt2, 'function', 'is a function' );
});

test( 'zgeqrt2 has expected arity', function t() {
	assert.strictEqual( zgeqrt2.length, 7, 'has expected arity' );
});

test( 'zgeqrt2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqrt2( 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgeqrt2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqrt2( 'row-major', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqrt2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqrt2( 'row-major', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqrt2 throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		zgeqrt2( 'column-major', 4, 2, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqrt2 throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		zgeqrt2( 'row-major', 4, 2, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqrt2 throws RangeError for LDT too small', function t() {
	assert.throws( function throws() {
		zgeqrt2( 'column-major', 4, 3, new Complex128Array( 12 ), 4, new Complex128Array( 9 ), 1 );
	}, RangeError );
});

test( 'zgeqrt2 returns 0 on a basic column-major invocation', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 6 ); // 3x2, all zeros
	T = new Complex128Array( 4 ); // 2x2
	info = zgeqrt2( 'column-major', 3, 2, A, 3, T, 2 );
	assert.strictEqual( info, 0, 'returns 0 on success' );
});

test( 'zgeqrt2 returns 0 on a basic row-major invocation', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 6 ); // 3x2 row-major, all zeros
	T = new Complex128Array( 4 ); // 2x2
	info = zgeqrt2( 'row-major', 3, 2, A, 2, T, 2 );
	assert.strictEqual( info, 0, 'returns 0 on success' );
});
