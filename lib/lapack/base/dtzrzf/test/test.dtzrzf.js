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
import dtzrzf from './../lib/dtzrzf.js';


// TESTS //

test( 'dtzrzf is a function', function t() {
	assert.strictEqual( typeof dtzrzf, 'function', 'is a function' );
});

test( 'dtzrzf has expected arity', function t() {
	assert.strictEqual( dtzrzf.length, 9, 'has expected arity' );
});

test( 'dtzrzf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtzrzf( 'invalid', 2, 4, new Float64Array( 8 ), 2, new Float64Array( 2 ), 1, new Float64Array( 8 ), 1 );
	}, TypeError );
});

test( 'dtzrzf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtzrzf( 'column-major', -1, 4, new Float64Array( 8 ), 2, new Float64Array( 2 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dtzrzf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtzrzf( 'column-major', 2, -1, new Float64Array( 8 ), 2, new Float64Array( 2 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dtzrzf throws RangeError for N < M', function t() {
	assert.throws( function throws() {
		dtzrzf( 'column-major', 4, 2, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dtzrzf throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		dtzrzf( 'column-major', 4, 5, new Float64Array( 20 ), 2, new Float64Array( 4 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dtzrzf throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		dtzrzf( 'row-major', 4, 5, new Float64Array( 20 ), 3, new Float64Array( 4 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dtzrzf returns 0 for M=0 (quick return)', function t() {
	var info = dtzrzf( 'column-major', 0, 5, new Float64Array( 5 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	assert.strictEqual( info, 0, 'INFO' );
});

test( 'dtzrzf accepts row-major layout', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	// 2x4 row-major upper trapezoidal: A is stored row-by-row.
	A = new Float64Array( 8 );
	A[ 0 ] = 2.0;
	A[ 1 ] = 1.0;
	A[ 2 ] = 3.0;
	A[ 3 ] = 1.0;
	A[ 4 ] = 0.0;
	A[ 5 ] = 3.0;
	A[ 6 ] = 1.0;
	A[ 7 ] = 2.0;
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 * 32 );
	info = dtzrzf( 'row-major', 2, 4, A, 4, TAU, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'INFO' );

	// After factorization the leading 2x2 should be upper triangular (lower-left 0). Element [1,0] = A[1*4 + 0] should remain 0 (or be set to 0).
	assert.strictEqual( A[ 4 ], 0, 'A[1,0] must remain zero' );
});
