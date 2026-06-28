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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunbdb4 from './../lib/zunbdb4.js';


// TESTS //

test( 'zunbdb4 is a function', function t() {
	assert.strictEqual( typeof zunbdb4, 'function', 'is a function' );
});

test( 'zunbdb4 has expected arity', function t() {
	assert.strictEqual( zunbdb4.length, 22, 'has expected arity' );
});

test( 'zunbdb4 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunbdb4( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1 );
	}, TypeError );
});

test( 'zunbdb4 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunbdb4( 'column-major', -1, 0, 0, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError when P < M-Q', function t() {
	assert.throws( function throws() {
		// M=8, Q=4, M-Q=4, P=2 violates P >= M-Q
		zunbdb4( 'column-major', 8, 2, 4, new Complex128Array( 16 ), 8, new Complex128Array( 16 ), 8, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError when M-Q > Q', function t() {
	assert.throws( function throws() {
		// M=4, Q=1, M-Q=3 > Q=1 violates M-Q <= Q
		zunbdb4( 'column-major', 4, 2, 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError when Q > M', function t() {
	assert.throws( function throws() {
		// M=4, P=4, Q=5: Q > M violates Q <= M
		zunbdb4( 'column-major', 4, 4, 5, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Float64Array( 5 ), 1, new Float64Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 5 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX11 (column-major)', function t() {
	assert.throws( function throws() {
		// LDX11=2 < P=4 in column-major layout
		zunbdb4( 'column-major', 8, 4, 6, new Complex128Array( 32 ), 2, new Complex128Array( 32 ), 8, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX21 (column-major)', function t() {
	assert.throws( function throws() {
		// LDX21=1 < M-P=4 in column-major layout
		zunbdb4( 'column-major', 8, 4, 6, new Complex128Array( 32 ), 8, new Complex128Array( 32 ), 1, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX11 (row-major)', function t() {
	assert.throws( function throws() {
		// LDX11=2 < Q=6 in row-major layout
		zunbdb4( 'row-major', 8, 4, 6, new Complex128Array( 32 ), 2, new Complex128Array( 32 ), 6, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 throws RangeError for invalid LDX21 (row-major)', function t() {
	assert.throws( function throws() {
		// LDX21=1 < Q=6 in row-major layout
		zunbdb4( 'row-major', 8, 4, 6, new Complex128Array( 32 ), 6, new Complex128Array( 32 ), 1, new Float64Array( 6 ), 1, new Float64Array( 6 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 6 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zunbdb4 column-major: M=Q=0 degenerate succeeds', function t() {
	var info;
	var X;
	var Y;
	X = new Complex128Array( 1 );
	Y = new Float64Array( 1 );
	info = zunbdb4( 'column-major', 0, 0, 0, X, 1, X, 1, Y, 1, Y, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb4 row-major: M=Q=0 degenerate succeeds', function t() {
	var info;
	var X;
	var Y;
	X = new Complex128Array( 1 );
	Y = new Float64Array( 1 );
	info = zunbdb4( 'row-major', 0, 0, 0, X, 1, X, 1, Y, 1, Y, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	assert.strictEqual( info, 0, 'info' );
});
