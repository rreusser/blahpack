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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri2 from './../lib/dsytri2.js';


// TESTS //

test( 'dsytri2 is a function', function t() {
	assert.strictEqual( typeof dsytri2, 'function', 'is a function' );
});

test( 'dsytri2 has expected arity', function t() {
	assert.strictEqual( dsytri2.length, 6, 'has expected arity' );
});

test( 'dsytri2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri2( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dsytri2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri2( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dsytri2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri2( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, RangeError );
});

test( 'dsytri2 throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dsytri2( 'column-major', 'upper', 3, new Float64Array( 9 ), 2, new Int32Array( 3 ) );
	}, RangeError );
});

test( 'dsytri2 returns 0 for N=0 quick return', function t() {
	var info = dsytri2( 'column-major', 'upper', 0, new Float64Array( 1 ), 1, new Int32Array( 0 ) );
	assert.strictEqual( info, 0, 'info is 0' );
});
