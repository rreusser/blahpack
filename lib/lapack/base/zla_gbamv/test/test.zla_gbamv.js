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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gbamv from './../lib/zla_gbamv.js';


// TESTS //

test( 'zla_gbamv is a function', function t() {
	assert.strictEqual( typeof zla_gbamv, 'function', 'is a function' );
});

test( 'zla_gbamv has expected arity', function t() {
	assert.strictEqual( zla_gbamv.length, 14, 'has expected arity' );
});

test( 'zla_gbamv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'invalid', 'no-transpose', 2, 2, 0, 0, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, 1.0, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zla_gbamv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'column-major', 'bogus', 2, 2, 0, 0, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, 1.0, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'zla_gbamv throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'column-major', 'no-transpose', -1, 2, 0, 0, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, 1.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zla_gbamv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'column-major', 'no-transpose', 2, -1, 0, 0, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, 1.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zla_gbamv throws RangeError for negative kl', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'column-major', 'no-transpose', 2, 2, -1, 0, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, 1.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zla_gbamv throws RangeError for negative ku', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'column-major', 'no-transpose', 2, 2, 0, -1, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, 1.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'zla_gbamv throws RangeError for LDAB < kl+ku+1', function t() {
	assert.throws( function throws() {
		zla_gbamv( 'column-major', 'no-transpose', 3, 3, 1, 1, 1.0, new Complex128Array( 9 ), 2, new Complex128Array( 3 ), 1, 1.0, new Float64Array( 3 ), 1 );
	}, RangeError );
});
