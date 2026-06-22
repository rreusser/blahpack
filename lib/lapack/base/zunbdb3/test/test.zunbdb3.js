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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunbdb3 from './../lib/zunbdb3.js';


// TESTS //

test( 'zunbdb3 is a function', function t() {
	assert.strictEqual( typeof zunbdb3, 'function', 'is a function' );
});

test( 'zunbdb3 has expected arity', function t() {
	assert.strictEqual( zunbdb3.length, 20, 'has expected arity' );
});

test( 'zunbdb3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunbdb3( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1 );
	}, TypeError );
});

test( 'zunbdb3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunbdb3( 'column-major', -1, 0, 0, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 throws RangeError when 2*P < M', function t() {
	assert.throws( function throws() {
		// 2*P=2 < M=8 violates the zunbdb3 partition (M-P > P)
		zunbdb3( 'column-major', 8, 1, 4, new Complex128Array( 16 ), 8, new Complex128Array( 16 ), 8, new Float64Array( 8 ), 1, new Float64Array( 8 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 throws RangeError when Q < M-P', function t() {
	assert.throws( function throws() {
		// Q=1 < M-P=2 violates the column-count constraint
		zunbdb3( 'column-major', 6, 4, 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 throws RangeError for invalid LDX11 (column-major)', function t() {
	assert.throws( function throws() {
		// LDX11=2 < P=5 in column-major layout
		zunbdb3( 'column-major', 8, 5, 4, new Complex128Array( 16 ), 2, new Complex128Array( 16 ), 8, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 throws RangeError for invalid LDX21 (column-major)', function t() {
	assert.throws( function throws() {
		// LDX21=1 < M-P=3 in column-major layout
		zunbdb3( 'column-major', 8, 5, 4, new Complex128Array( 32 ), 8, new Complex128Array( 16 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 throws RangeError for invalid LDX11 (row-major)', function t() {
	assert.throws( function throws() {
		// LDX11=2 < Q=4 in row-major layout
		zunbdb3( 'row-major', 8, 5, 4, new Complex128Array( 16 ), 2, new Complex128Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 throws RangeError for invalid LDX21 (row-major)', function t() {
	assert.throws( function throws() {
		// LDX21=1 < Q=4 in row-major layout
		zunbdb3( 'row-major', 8, 5, 4, new Complex128Array( 32 ), 4, new Complex128Array( 16 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb3 column-major: M=Q=0 degenerate succeeds', function t() {
	var info;
	var X;
	var Y;
	X = new Complex128Array( 1 );
	Y = new Float64Array( 1 );
	info = zunbdb3( 'column-major', 0, 0, 0, X, 1, X, 1, Y, 1, Y, 1, X, 1, X, 1, X, 1, X, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb3 row-major: M=Q=0 degenerate succeeds', function t() {
	var info;
	var X;
	var Y;
	X = new Complex128Array( 1 );
	Y = new Float64Array( 1 );
	info = zunbdb3( 'row-major', 0, 0, 0, X, 1, X, 1, Y, 1, Y, 1, X, 1, X, 1, X, 1, X, 1 );
	assert.strictEqual( info, 0, 'info' );
});
