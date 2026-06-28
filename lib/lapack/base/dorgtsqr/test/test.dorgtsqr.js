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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgtsqr from './../lib/dorgtsqr.js';


// TESTS //

test( 'dorgtsqr is a function', function t() {
	assert.strictEqual( typeof dorgtsqr, 'function', 'is a function' );
});

test( 'dorgtsqr has expected arity', function t() {
	assert.strictEqual( dorgtsqr.length, 10, 'has expected arity' );
});

test( 'dorgtsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'invalid', 2, 2, 4, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorgtsqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', -1, 2, 4, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', 2, -1, 4, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for N > M', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', 2, 4, 5, 2, new Float64Array( 16 ), 2, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for mb <= N', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', 4, 2, 2, 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', 4, 2, 4, 0, new Float64Array( 16 ), 4, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', 4, 2, 4, 2, new Float64Array( 16 ), 2, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'row-major', 4, 2, 4, 2, new Float64Array( 16 ), 1, new Float64Array( 16 ), 2, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dorgtsqr throws RangeError for LDT < min(nb,N)', function t() {
	assert.throws( function throws() {
		dorgtsqr( 'column-major', 4, 2, 4, 2, new Float64Array( 16 ), 4, new Float64Array( 16 ), 1, new Float64Array( 16 ) );
	}, RangeError );
});

test( 'dorgtsqr quick return for M=0,N=0 returns 0', function t() {
	var info = dorgtsqr( 'column-major', 0, 0, 4, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	assert.strictEqual( info, 0, 'returns 0' );
});
