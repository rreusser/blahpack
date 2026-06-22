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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztplqt2 from './../lib/ztplqt2.js';


// TESTS //

test( 'ztplqt2 is a function', function t() {
	assert.strictEqual( typeof ztplqt2, 'function', 'is a function' );
});

test( 'ztplqt2 has expected arity', function t() {
	assert.strictEqual( ztplqt2.length, 10, 'has expected arity' );
});

test( 'ztplqt2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztplqt2( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztplqt2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztplqt2( 'column-major', -1, 2, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztplqt2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztplqt2( 'column-major', 2, -1, 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztplqt2 column-major happy path', function t() {
	var info;
	var A;
	var B;
	var T;
	A = new Complex128Array( [ 2.0, 0.1, 0.5, -0.2, 0.0, 0.0, 3.0, 0.3 ] );
	B = new Complex128Array( [ 1.0, 0.4, 0.3, -0.1, 0.5, 0.2, 1.1, 0.3 ] );
	T = new Complex128Array( 4 );
	info = ztplqt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
	assert.strictEqual( info, 0 );
});
