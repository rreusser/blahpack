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
import dtplqt2 from './../lib/dtplqt2.js';


// TESTS //

test( 'dtplqt2 is a function', function t() {
	assert.strictEqual( typeof dtplqt2, 'function', 'is a function' );
});

test( 'dtplqt2 has expected arity', function t() {
	assert.strictEqual( dtplqt2.length, 10, 'has expected arity' );
});

test( 'dtplqt2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtplqt2( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtplqt2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtplqt2( 'column-major', -1, 2, 0, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtplqt2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtplqt2( 'column-major', 2, -1, 0, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtplqt2 column-major happy path', function t() {
	var info;
	var A;
	var B;
	var T;
	A = new Float64Array( [ 2.0, 0.5, 0.0, 3.0 ] );
	B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
	T = new Float64Array( 4 );
	info = dtplqt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
	assert.strictEqual( info, 0 );
});
