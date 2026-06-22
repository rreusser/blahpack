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
import zgeqrt3 from './../lib/zgeqrt3.js';


// TESTS //

test( 'zgeqrt3 is a function', function t() {
	assert.strictEqual( typeof zgeqrt3, 'function', 'is a function' );
});

test( 'zgeqrt3 has expected arity', function t() {
	assert.strictEqual( zgeqrt3.length, 7, 'has expected arity' );
});

test( 'zgeqrt3 throws TypeError for invalid order', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgeqrt3 throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'row-major', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqrt3 throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'row-major', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqrt3 throws RangeError when M < N', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'column-major', 2, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'zgeqrt3 throws RangeError when LDA < N for row-major', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'row-major', 4, 4, new Complex128Array( 16 ), 2, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'zgeqrt3 throws RangeError when LDA < M for column-major', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'column-major', 4, 4, new Complex128Array( 16 ), 2, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'zgeqrt3 throws RangeError when LDT < N', function t() {
	assert.throws( function bad() {
		zgeqrt3( 'column-major', 4, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 2 );
	}, RangeError );
});

test( 'zgeqrt3 returns 0 for column-major M=2, N=1', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 2 );
	A.set( [ 2.0, 0.5 ], 0 );
	A.set( [ 1.5, -0.4 ], 1 );
	T = new Complex128Array( 1 );
	info = zgeqrt3( 'column-major', 2, 1, A, 2, T, 1 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'zgeqrt3 returns 0 for row-major M=4, N=2', function t() {
	var info;
	var A;
	var T;
	A = new Complex128Array( 8 );
	T = new Complex128Array( 4 );
	A.set( [ 2.0, 0.1 ], 0 );
	A.set( [ 1.5, -0.2 ], 1 );
	A.set( [ 0.7, -0.3 ], 2 );
	A.set( [ 3.0, 0.5 ], 3 );
	A.set( [ 0.5, 0.3 ], 4 );
	A.set( [ 1.1, -0.4 ], 5 );
	A.set( [ -1.0, 0.4 ], 6 );
	A.set( [ 0.4, 0.2 ], 7 );
	info = zgeqrt3( 'row-major', 4, 2, A, 2, T, 2 );
	assert.strictEqual( info, 0, 'returns 0' );
});
