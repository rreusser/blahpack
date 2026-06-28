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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfAa from './../lib/zlasyf_aa.js';


// TESTS //

test( 'zlasyfAa is a function', function t() {
	assert.strictEqual( typeof zlasyfAa, 'function', 'is a function' );
});

test( 'zlasyfAa has expected arity', function t() {
	assert.strictEqual( zlasyfAa.length, 14, 'has expected arity' );
});

test( 'zlasyfAa throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'invalid', 'upper', 1, 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlasyfAa throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'invalid', 1, 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlasyfAa throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'upper', 1, -1, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zlasyfAa throws RangeError for LDA < max(1,M)', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'upper', 1, 4, 2, new Complex128Array( 16 ), 2, new Int32Array( 4 ), 1, 0, new Complex128Array( 16 ), 4, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlasyfAa throws RangeError for LDH < max(1,M)', function t() {
	assert.throws( function throws() {
		zlasyfAa( 'column-major', 'upper', 1, 4, 2, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, 0, new Complex128Array( 16 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlasyfAa accepts row-major', function t() {
	var info = zlasyfAa( 'row-major', 'lower', 1, 2, 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	assert.equal( info, 0 );
});
