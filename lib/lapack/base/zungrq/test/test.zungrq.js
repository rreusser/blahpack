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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungrq from './../lib/zungrq.js';


// TESTS //

test( 'zungrq is a function', function t() {
	assert.strictEqual( typeof zungrq, 'function', 'is a function' );
});

test( 'zungrq has expected arity', function t() {
	assert.strictEqual( zungrq.length, 10, 'has expected arity' );
});

test( 'zungrq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungrq( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zungrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungrq( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zungrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungrq( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zungrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungrq( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});
