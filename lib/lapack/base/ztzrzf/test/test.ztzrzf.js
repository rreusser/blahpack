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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztzrzf from './../lib/ztzrzf.js';


// TESTS //

test( 'ztzrzf is a function', function t() {
	assert.strictEqual( typeof ztzrzf, 'function', 'is a function' );
});

test( 'ztzrzf has expected arity', function t() {
	assert.strictEqual( ztzrzf.length, 9, 'has expected arity' );
});

test( 'ztzrzf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztzrzf( 'invalid', 2, 4, new Complex128Array( 8 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 8 ), 1 );
	}, TypeError );
});

test( 'ztzrzf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztzrzf( 'column-major', -1, 4, new Complex128Array( 8 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'ztzrzf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztzrzf( 'column-major', 2, -1, new Complex128Array( 8 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'ztzrzf throws RangeError for N < M', function t() {
	assert.throws( function throws() {
		ztzrzf( 'column-major', 4, 2, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'ztzrzf throws RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		ztzrzf( 'column-major', 4, 5, new Complex128Array( 20 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'ztzrzf throws RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		ztzrzf( 'row-major', 4, 5, new Complex128Array( 20 ), 3, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'ztzrzf returns 0 for M=0 (quick return)', function t() {
	var info = ztzrzf( 'column-major', 0, 5, new Complex128Array( 5 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	assert.strictEqual( info, 0, 'INFO' );
});

test( 'ztzrzf accepts row-major layout', function t() {
	var WORK;
	var info;
	var TAU;
	var av;
	var A;

	// 2x4 row-major upper trapezoidal: A is stored row-by-row.
	A = new Complex128Array( 8 );
	av = reinterpret( A, 0 );
	av[ 0 ] = 2.0;
	av[ 1 ] = 0.2;
	av[ 2 ] = 1.0;
	av[ 3 ] = -0.1;
	av[ 4 ] = 3.0;
	av[ 5 ] = 0.4;
	av[ 6 ] = 1.0;
	av[ 7 ] = -0.3;
	av[ 8 ] = 0.0;
	av[ 9 ] = 0.0;
	av[ 10 ] = 3.0;
	av[ 11 ] = 0.3;
	av[ 12 ] = 1.0;
	av[ 13 ] = -0.2;
	av[ 14 ] = 2.0;
	av[ 15 ] = 0.5;
	TAU = new Complex128Array( 2 );
	WORK = new Complex128Array( 2 * 32 );
	info = ztzrzf( 'row-major', 2, 4, A, 4, TAU, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'INFO' );

	// After factorization the leading 2x2 should be upper triangular (the lower-left element of the leading 2x2 — A[1,0] — at row-major offset 4 must remain zero).
	assert.strictEqual( av[ 8 ], 0.0, 'A[1,0].re must remain zero' );
	assert.strictEqual( av[ 9 ], 0.0, 'A[1,0].im must remain zero' );
});
