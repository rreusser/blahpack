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
import dtpqrt from './../lib/dtpqrt.js';


// TESTS //

test( 'dtpqrt is a function', function t() {
	assert.strictEqual( typeof dtpqrt, 'function', 'is a function' );
});

test( 'dtpqrt has expected arity', function t() {
	assert.strictEqual( dtpqrt.length, 12, 'has expected arity' );
});

test( 'dtpqrt throws TypeError for invalid order', function t() {
	assert.throws( function bad() {
		dtpqrt( 'invalid', 2, 2, 0, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpqrt throws RangeError for negative M', function t() {
	assert.throws( function bad() {
		dtpqrt( 'column-major', -1, 2, 0, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError for negative N', function t() {
	assert.throws( function bad() {
		dtpqrt( 'column-major', 2, -1, 0, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError when l is out of range', function t() {
	assert.throws( function bad() {
		dtpqrt( 'column-major', 2, 2, 5, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError when nb < 1', function t() {
	assert.throws( function bad() {
		dtpqrt( 'column-major', 2, 2, 0, 0, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError when LDA is too small', function t() {
	// A is N-by-N (square), so LDA >= N for both layouts
	assert.throws( function bad() {
		dtpqrt( 'column-major', 3, 3, 0, 1, new Float64Array( 9 ), 1, new Float64Array( 9 ), 3, new Float64Array( 3 ), 1, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError when LDB is too small (column-major)', function t() {
	// LDB >= M for column-major
	assert.throws( function bad() {
		dtpqrt( 'column-major', 3, 3, 0, 1, new Float64Array( 9 ), 3, new Float64Array( 9 ), 1, new Float64Array( 3 ), 1, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError when LDB is too small (row-major)', function t() {
	// LDB >= N for row-major
	assert.throws( function bad() {
		dtpqrt( 'row-major', 3, 3, 0, 1, new Float64Array( 9 ), 3, new Float64Array( 9 ), 1, new Float64Array( 3 ), 1, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dtpqrt throws RangeError when LDT < nb (column-major)', function t() {
	assert.throws( function bad() {
		dtpqrt( 'column-major', 3, 3, 0, 2, new Float64Array( 9 ), 3, new Float64Array( 9 ), 3, new Float64Array( 6 ), 1, new Float64Array( 6 ) );
	}, RangeError );
});

test( 'dtpqrt: column-major dispatch', function t() {
	var info;
	var A;
	var B;
	var T;
	var W;
	A = new Float64Array( [ 2.0, 0.0, 0.0, 0.5, 3.0, 0.0, 0.25, 0.75, 4.0 ] );  // 3x3 col-major upper
	B = new Float64Array( [ 1.0, 0.3, 0.7, 0.2, 0.5, 1.1, 0.4, 0.3, 0.25, 0.6, 1.2, 0.4 ] );  // 4x3 col-major
	T = new Float64Array( 2 * 3 );
	W = new Float64Array( 2 * 3 );
	info = dtpqrt( 'column-major', 4, 3, 0, 2, A, 3, B, 4, T, 2, W );
	assert.strictEqual( info, 0, 'INFO=0' );
});

test( 'dtpqrt: row-major dispatch', function t() {
	var info;
	var A;
	var B;
	var T;
	var W;

	// Row-major 3x3 upper for A
	A = new Float64Array( [ 2.0, 0.5, 0.25, 0.0, 3.0, 0.75, 0.0, 0.0, 4.0 ] );  // 3x3 row-major upper
	B = new Float64Array( [ 1.0, 0.5, 0.25, 0.3, 1.1, 0.6, 0.7, 0.4, 1.2, 0.2, 0.3, 0.4 ] );  // 4x3 row-major
	T = new Float64Array( 2 * 3 );
	W = new Float64Array( 2 * 3 );
	info = dtpqrt( 'row-major', 4, 3, 0, 2, A, 3, B, 3, T, 3, W );
	assert.strictEqual( info, 0, 'INFO=0' );
});
