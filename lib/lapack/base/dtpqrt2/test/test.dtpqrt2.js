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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpqrt2 from './../lib/dtpqrt2.js';


// TESTS //

test( 'dtpqrt2 is a function', function t() {
	assert.strictEqual( typeof dtpqrt2, 'function', 'is a function' );
});

test( 'dtpqrt2 has expected arity', function t() {
	assert.strictEqual( dtpqrt2.length, 10, 'has expected arity' );
});

test( 'dtpqrt2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtpqrt2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for invalid l (negative)', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for invalid l (> min(M,N))', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'row-major', 2, 2, 5, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for LDA too small', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'column-major', 2, 3, 2, new Float64Array( 9 ), 1, new Float64Array( 6 ), 2, new Float64Array( 9 ), 3 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for LDB too small (column-major)', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'column-major', 3, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 6 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for LDB too small (row-major)', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'row-major', 3, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 6 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtpqrt2 throws RangeError for LDT too small', function t() {
	assert.throws( function throws() {
		dtpqrt2( 'row-major', 2, 3, 2, new Float64Array( 9 ), 3, new Float64Array( 6 ), 3, new Float64Array( 9 ), 1 );
	}, RangeError );
});

test( 'dtpqrt2 column-major: produces R, V, T (small case)', function t() {
	var info;
	var A;
	var B;
	var T;

	A = new Float64Array( 9 );
	B = new Float64Array( 9 );
	T = new Float64Array( 9 );

	// A 3x3 upper triangular, column-major
	A[ 0 ] = 2.0;
	A[ 3 ] = 0.5;
	A[ 4 ] = 3.0;
	A[ 6 ] = 0.25;
	A[ 7 ] = 0.75;
	A[ 8 ] = 4.0;

	// B 3x3 upper triangular (L=3), column-major
	B[ 0 ] = 1.1;
	B[ 3 ] = 0.4;
	B[ 4 ] = 1.5;
	B[ 6 ] = 0.6;
	B[ 7 ] = 0.3;
	B[ 8 ] = 1.7;
	info = dtpqrt2( 'column-major', 3, 3, 3, A, 3, B, 3, T, 3 );
	assert.strictEqual( info, 0 );

	// Diagonal of R should be negative (Householder convention).
	assert.ok( A[ 0 ] < 0.0 );
	assert.ok( A[ 4 ] < 0.0 );
	assert.ok( A[ 8 ] < 0.0 );
});

test( 'dtpqrt2 row-major: produces R, V, T (small case)', function t() {
	var info;
	var A;
	var B;
	var T;

	A = new Float64Array( 9 );
	B = new Float64Array( 9 );
	T = new Float64Array( 9 );

	// A 3x3 upper triangular, row-major: A[i*3 + j]
	A[ 0 ] = 2.0;
	A[ 1 ] = 0.5;
	A[ 2 ] = 0.25;
	A[ 4 ] = 3.0;
	A[ 5 ] = 0.75;
	A[ 8 ] = 4.0;

	// B 3x3 upper triangular (L=3), row-major
	B[ 0 ] = 1.1;
	B[ 1 ] = 0.4;
	B[ 2 ] = 0.6;
	B[ 4 ] = 1.5;
	B[ 5 ] = 0.3;
	B[ 8 ] = 1.7;
	info = dtpqrt2( 'row-major', 3, 3, 3, A, 3, B, 3, T, 3 );
	assert.strictEqual( info, 0 );
	assert.ok( A[ 0 ] < 0.0 );
	assert.ok( A[ 4 ] < 0.0 );
	assert.ok( A[ 8 ] < 0.0 );
});
