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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconvf from './../lib/dsyconvf.js';


// TESTS //

test( 'dsyconvf is a function', function t() {
	assert.strictEqual( typeof dsyconvf, 'function', 'is a function' );
});

test( 'dsyconvf has expected arity', function t() {
	assert.strictEqual( dsyconvf.length, 11, 'has expected arity' );
});

test( 'dsyconvf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyconvf( 'invalid', 'upper', 'convert', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyconvf( 'row-major', 'invalid', 'convert', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf throws TypeError for invalid way', function t() {
	assert.throws( function throws() {
		dsyconvf( 'row-major', 'upper', 'bogus', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyconvf( 'row-major', 'upper', 'convert', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dsyconvf throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		dsyconvf( 'column-major', 'upper', 'convert', 4, new Float64Array( 16 ), 2, new Float64Array( 4 ), 1, new Int32Array( 4 ), 1, 0 );
	}, RangeError );
});
