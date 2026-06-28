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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeqrt from './../lib/zgeqrt.js';


// TESTS //

test( 'zgeqrt is a function', function t() {
	assert.strictEqual( typeof zgeqrt, 'function', 'is a function' );
});

test( 'zgeqrt has expected arity', function t() {
	assert.strictEqual( zgeqrt.length, 9, 'has expected arity' );
});

test( 'zgeqrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqrt( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'zgeqrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqrt( 'column-major', -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqrt( 'column-major', 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		zgeqrt( 'column-major', 4, 3, 0, new Complex128Array( 12 ), 4, new Complex128Array( 9 ), 3, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for nb > min(M,N)', function t() {
	assert.throws( function throws() {
		zgeqrt( 'column-major', 4, 3, 5, new Complex128Array( 12 ), 4, new Complex128Array( 15 ), 5, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		zgeqrt( 'column-major', 4, 3, 2, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		zgeqrt( 'row-major', 4, 3, 2, new Complex128Array( 12 ), 1, new Complex128Array( 6 ), 3, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for LDT too small (column-major)', function t() {
	assert.throws( function throws() {
		zgeqrt( 'column-major', 4, 3, 2, new Complex128Array( 12 ), 4, new Complex128Array( 6 ), 1, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'zgeqrt throws RangeError for LDT too small (row-major)', function t() {
	assert.throws( function throws() {
		zgeqrt( 'row-major', 4, 3, 2, new Complex128Array( 12 ), 3, new Complex128Array( 6 ), 1, new Complex128Array( 12 ) );
	}, RangeError );
});

test( 'zgeqrt accepts column-major valid call', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Complex128Array( 12 ); // 4x3 column-major
	T = new Complex128Array( 6 ); // 2x3
	WORK = new Complex128Array( 12 );
	info = zgeqrt( 'column-major', 4, 3, 2, A, 4, T, 2, WORK );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'zgeqrt accepts row-major valid call', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Complex128Array( 12 ); // 4x3 row-major
	T = new Complex128Array( 6 ); // 2x3 row-major (LDT=3)
	WORK = new Complex128Array( 12 );
	info = zgeqrt( 'row-major', 4, 3, 2, A, 3, T, 3, WORK );
	assert.strictEqual( info, 0, 'returns 0' );
});
