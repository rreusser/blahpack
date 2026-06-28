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
import dorgbr from './../lib/dorgbr.js';


// TESTS //

test( 'dorgbr is a function', function t() {
	assert.strictEqual( typeof dorgbr, 'function', 'is a function' );
});

test( 'dorgbr has expected arity', function t() {
	assert.strictEqual( dorgbr.length, 11, 'has expected arity' );
});

test( 'dorgbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgbr( 'invalid', 'apply-Q', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'dorgbr throws TypeError for invalid vect', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'dorgbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorgbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dorgbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});
