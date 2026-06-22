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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrt from './../lib/dgeqrt.js';


// TESTS //

test( 'dgeqrt is a function', function t() {
	assert.strictEqual( typeof dgeqrt, 'function', 'is a function' );
});

test( 'dgeqrt has expected arity', function t() {
	assert.strictEqual( dgeqrt.length, 9, 'has expected arity' );
});

test( 'dgeqrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrt( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 8 ) );
	}, TypeError );
});

test( 'dgeqrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrt( 'column-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 8 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrt( 'column-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 8 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		dgeqrt( 'column-major', 4, 3, 0, new Float64Array( 12 ), 4, new Float64Array( 9 ), 3, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for nb > min(M,N)', function t() {
	assert.throws( function throws() {
		dgeqrt( 'column-major', 4, 3, 5, new Float64Array( 12 ), 4, new Float64Array( 15 ), 5, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		dgeqrt( 'column-major', 4, 3, 2, new Float64Array( 12 ), 1, new Float64Array( 6 ), 2, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		dgeqrt( 'row-major', 4, 3, 2, new Float64Array( 12 ), 1, new Float64Array( 6 ), 3, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for LDT too small (column-major)', function t() {
	assert.throws( function throws() {
		dgeqrt( 'column-major', 4, 3, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 1, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dgeqrt throws RangeError for LDT too small (row-major)', function t() {
	assert.throws( function throws() {
		dgeqrt( 'row-major', 4, 3, 2, new Float64Array( 12 ), 3, new Float64Array( 6 ), 1, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dgeqrt accepts column-major valid call', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ] ); // 4x3 column-major
	T = new Float64Array( 6 ); // 2x3
	WORK = new Float64Array( 12 );
	info = dgeqrt( 'column-major', 4, 3, 2, A, 4, T, 2, WORK );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dgeqrt accepts row-major valid call', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( [ 2, 1, 3, 1, 4, 2, 3, 2, 5, 1, 3, 1 ] ); // 4x3 row-major
	T = new Float64Array( 6 ); // 2x3 row-major (LDT=3)
	WORK = new Float64Array( 12 );
	info = dgeqrt( 'row-major', 4, 3, 2, A, 3, T, 3, WORK );
	assert.strictEqual( info, 0, 'returns 0' );
});
