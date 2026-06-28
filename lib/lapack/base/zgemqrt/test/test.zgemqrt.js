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
import zgemqrt from './../lib/zgemqrt.js';


// TESTS //

test( 'zgemqrt is a function', function t() {
	assert.strictEqual( typeof zgemqrt, 'function', 'is a function' );
});

test( 'zgemqrt has expected arity', function t() {
	assert.strictEqual( zgemqrt.length, 15, 'has expected arity' );
});

test( 'zgemqrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgemqrt( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemqrt throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zgemqrt( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemqrt throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgemqrt( 'row-major', 'left', 'invalid', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemqrt throws TypeError for `transpose` (not allowed for unitary)', function t() {
	assert.throws( function throws() {
		zgemqrt( 'row-major', 'left', 'transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemqrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgemqrt( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemqrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgemqrt( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemqrt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zgemqrt( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemqrt throws RangeError for invalid leading dimensions', function t() {
	assert.throws( function badLDV() {
		zgemqrt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 16 ), 2, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
	assert.throws( function badLDT() {
		zgemqrt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 16 ), 4, new Complex128Array( 6 ), 1, new Complex128Array( 16 ), 4, new Complex128Array( 8 ), 1 );
	}, RangeError );
	assert.throws( function badLDC() {
		zgemqrt( 'column-major', 'left', 'no-transpose', 4, 4, 3, 2, new Complex128Array( 16 ), 4, new Complex128Array( 6 ), 2, new Complex128Array( 16 ), 2, new Complex128Array( 8 ), 1 );
	}, RangeError );
});
