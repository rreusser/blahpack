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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_gbrcond from './../lib/dla_gbrcond.js';


// TESTS //

test( 'dla_gbrcond is a function', function t() {
	assert.strictEqual( typeof dla_gbrcond, 'function', 'is a function' );
});

test( 'dla_gbrcond has expected arity', function t() {
	assert.strictEqual( dla_gbrcond.length, 20, 'has expected arity' );
});

test( 'dla_gbrcond throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_gbrcond( 'invalid', 'no-transpose', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1, new Float64Array( 2 ), 1, new Float64Array( 10 ), 1, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dla_gbrcond throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dla_gbrcond( 'row-major', 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1, new Float64Array( 2 ), 1, new Float64Array( 10 ), 1, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dla_gbrcond throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_gbrcond( 'row-major', 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1, new Float64Array( 2 ), 1, new Float64Array( 10 ), 1, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});
