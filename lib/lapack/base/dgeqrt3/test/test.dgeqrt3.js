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
import dgeqrt3 from './../lib/dgeqrt3.js';


// TESTS //

test( 'dgeqrt3 is a function', function t() {
	assert.strictEqual( typeof dgeqrt3, 'function', 'is a function' );
});

test( 'dgeqrt3 has expected arity', function t() {
	assert.strictEqual( dgeqrt3.length, 7, 'has expected arity' );
});

test( 'dgeqrt3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgeqrt3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqrt3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqrt3 throws RangeError when M < N', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'column-major', 2, 4, new Float64Array( 16 ), 2, new Float64Array( 16 ), 4 );
	}, RangeError );
});

test( 'dgeqrt3 throws RangeError for too-small LDA (row-major)', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'row-major', 4, 2, new Float64Array( 8 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqrt3 throws RangeError for too-small LDA (column-major)', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'column-major', 4, 2, new Float64Array( 8 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeqrt3 throws RangeError for too-small LDT (row-major)', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'row-major', 4, 2, new Float64Array( 8 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqrt3 throws RangeError for too-small LDT (column-major)', function t() {
	assert.throws( function throws() {
		dgeqrt3( 'column-major', 4, 2, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqrt3 succeeds with column-major layout', function t() {
	var info;
	var A;
	var T;
	A = new Float64Array( [ 2.0, 1.0, 0.5, 0.5, 3.0, 1.5 ] ); // 3x2 col-major
	T = new Float64Array( 4 );
	info = dgeqrt3( 'column-major', 3, 2, A, 3, T, 2 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dgeqrt3 succeeds with row-major layout', function t() {
	var info;
	var A;
	var T;
	A = new Float64Array( [ 2.0, 0.5, 1.0, 3.0, 0.5, 1.5 ] ); // 3x2 row-major
	T = new Float64Array( 4 );
	info = dgeqrt3( 'row-major', 3, 2, A, 2, T, 2 );
	assert.strictEqual( info, 0, 'returns 0' );
});
