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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunmr3 from './../lib/zunmr3.js';


// TESTS //

test( 'zunmr3 is a function', function t() {
	assert.strictEqual( typeof zunmr3, 'function', 'is a function' );
});

test( 'zunmr3 has expected arity', function t() {
	assert.strictEqual( zunmr3.length, 15, 'has expected arity' );
});

test( 'zunmr3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmr3( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zunmr3 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmr3( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zunmr3 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmr3( 'row-major', 'left', 'invalid', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zunmr3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmr3( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zunmr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmr3( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zunmr3 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmr3( 'row-major', 'left', 'no-transpose', 2, 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});
