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
import zunbdb5 from './../lib/zunbdb5.js';


// TESTS //

test( 'zunbdb5 is a function', function t() {
	assert.strictEqual( typeof zunbdb5, 'function', 'is a function' );
});

test( 'zunbdb5 has expected arity', function t() {
	assert.strictEqual( zunbdb5.length, 14, 'has expected arity' );
});

test( 'zunbdb5 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunbdb5( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, TypeError );
});

test( 'zunbdb5 throws RangeError for negative m1', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', -1, 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for negative m2', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', 2, -1, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', 2, 2, -1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for zero strideX1', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', 2, 2, 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for zero strideX2', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', 2, 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for too-small LDQ1 in column-major', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', 4, 2, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for too-small LDQ2 in column-major', function t() {
	assert.throws( function throws() {
		zunbdb5( 'column-major', 2, 4, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for too-small LDQ1 in row-major', function t() {
	assert.throws( function throws() {
		zunbdb5( 'row-major', 2, 2, 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 4, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunbdb5 throws RangeError for too-small LDQ2 in row-major', function t() {
	assert.throws( function throws() {
		zunbdb5( 'row-major', 2, 2, 4, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});
