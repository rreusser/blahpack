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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunbdb6 from './../lib/zunbdb6.js';


// TESTS //

test( 'zunbdb6 is a function', function t() {
	assert.strictEqual( typeof zunbdb6, 'function', 'is a function' );
});

test( 'zunbdb6 has expected arity', function t() {
	assert.strictEqual( zunbdb6.length, 14, 'has expected arity' );
});

test( 'zunbdb6 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunbdb6( 'invalid', 2, 2, 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zunbdb6 throws RangeError for negative m1', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', -1, 2, 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for negative m2', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', 2, -1, 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', 2, 2, -1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for zero strideX1', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', 2, 2, 2, new Complex128Array( 2 ), 0, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for zero strideX2', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', 2, 2, 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for LDQ1 too small (column-major)', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', 4, 4, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 4, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for LDQ2 too small (column-major)', function t() {
	assert.throws( function throws() {
		zunbdb6( 'column-major', 4, 4, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for LDQ1 too small (row-major)', function t() {
	assert.throws( function throws() {
		zunbdb6( 'row-major', 2, 2, 4, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 throws RangeError for LDQ2 too small (row-major)', function t() {
	assert.throws( function throws() {
		zunbdb6( 'row-major', 2, 2, 4, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb6 (column-major): basic complex projection', function t() {
	// Q has 1 orthonormal column = (e1; 0) -> Q1 = [(1,0);(0,0)], Q2 = [(0,0);(0,0)].
	// X = ((3,4),(4,5) | (5,6),(6,7)); after projection X1[0] -= (3+4i)*1 = (0,0).
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;

	Q1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	Q2 = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	X1 = new Complex128Array( [ 3.0, 4.0, 4.0, 5.0 ] );
	X2 = new Complex128Array( [ 5.0, 6.0, 6.0, 7.0 ] );
	WORK = new Complex128Array( 1 );

	info = zunbdb6( 'column-major', 2, 2, 1, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb6 (row-major): basic complex projection', function t() {
	// 1-column Q stored row-major. The layout matters because Q1/Q2 are interpreted as 2x1 row-major (LD = N = 1).
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;

	Q1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	Q2 = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	X1 = new Complex128Array( [ 3.0, 4.0, 4.0, 5.0 ] );
	X2 = new Complex128Array( [ 5.0, 6.0, 6.0, 7.0 ] );
	WORK = new Complex128Array( 1 );

	info = zunbdb6( 'row-major', 2, 2, 1, X1, 1, X2, 1, Q1, 1, Q2, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
});
