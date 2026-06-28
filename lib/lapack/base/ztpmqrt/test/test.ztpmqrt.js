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
import ztpmqrt from './../lib/ztpmqrt.js';


// TESTS //

test( 'ztpmqrt is a function', function t() {
	assert.strictEqual( typeof ztpmqrt, 'function', 'is a function' );
});

test( 'ztpmqrt has expected arity', function t() {
	assert.strictEqual( ztpmqrt.length, 18, 'has expected arity' );
});

test( 'ztpmqrt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmqrt throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'invalid', 'no-transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmqrt throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'invalid', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmqrt rejects plain transpose (unitary operator forbids it)', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'transpose', 2, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpmqrt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'no-transpose', -1, 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmqrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'no-transpose', 2, -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmqrt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'no-transpose', 2, 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmqrt throws RangeError for L > K', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 3, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmqrt throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 2, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztpmqrt throws RangeError for nb > K', function t() {
	assert.throws( function throws() {
		ztpmqrt( 'column-major', 'left', 'no-transpose', 2, 2, 2, 2, 3, new Complex128Array( 4 ), 3, new Complex128Array( 6 ), 3, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});
