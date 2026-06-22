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
import dlatsqr from './../lib/dlatsqr.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlatsqr, 'function', 'is a function' );
});

test( 'the function has expected arity', function t() {
	assert.strictEqual( dlatsqr.length, 10, 'has expected arity' );
});

test( 'the function throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		dlatsqr( 'invalid', 2, 2, 1, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'the function throws a RangeError for a negative M', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', -1, 0, 1, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for a negative N', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 2, -1, 1, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError when M < N', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 2, 3, 2, 2, new Float64Array( 6 ), 2, new Float64Array( 6 ), 2, new Float64Array( 6 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 4, 2, 0, 1, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 4, 2, 2, 0, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for nb > N', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 4, 2, 2, 3, new Float64Array( 8 ), 4, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDA too small (column-major)', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 4, 2, 2, 1, new Float64Array( 8 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDA too small (row-major)', function t() {
	assert.throws( function throws() {
		dlatsqr( 'row-major', 4, 2, 2, 1, new Float64Array( 8 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDT < nb (column-major)', function t() {
	assert.throws( function throws() {
		dlatsqr( 'column-major', 4, 2, 2, 2, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function throws a RangeError for LDT < nb (row-major)', function t() {
	assert.throws( function throws() {
		dlatsqr( 'row-major', 4, 2, 2, 2, new Float64Array( 8 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'the function returns 0 for a quick-return case (M=0)', function t() {
	var info = dlatsqr( 'column-major', 0, 0, 1, 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ) );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'the function works in column-major layout for a small TSQR case', function t() {
	var WORK;
	var info;
	var A;
	var T;

	// 4x2 matrix in column-major; mb=8 (>= M) routes to dgeqrt fallback.
	A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 0.5, 1.5, 2.5, 3.5 ] );
	T = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	info = dlatsqr( 'column-major', 4, 2, 8, 2, A, 4, T, 2, WORK );
	assert.strictEqual( info, 0, 'returns 0' );
});
