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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_syamv from './../lib/dla_syamv.js';


// TESTS //

test( 'dla_syamv is a function', function t() {
	assert.strictEqual( typeof dla_syamv, 'function', 'is a function' );
});

test( 'dla_syamv has expected arity', function t() {
	assert.strictEqual( dla_syamv.length, 11, 'has expected arity' );
});

test( 'dla_syamv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_syamv( 'invalid', 'upper', 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'dla_syamv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dla_syamv( 'column-major', 'invalid', 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, TypeError );
});

test( 'dla_syamv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_syamv( 'column-major', 'upper', -1, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dla_syamv throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dla_syamv( 'column-major', 'upper', 3, 1.0, new Float64Array( 9 ), 2, new Float64Array( 3 ), 1, 0.0, new Float64Array( 3 ), 1 );
	}, RangeError );
});

test( 'dla_syamv throws RangeError for strideX === 0', function t() {
	assert.throws( function throws() {
		dla_syamv( 'column-major', 'upper', 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 0, 0.0, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dla_syamv throws RangeError for strideY === 0', function t() {
	assert.throws( function throws() {
		dla_syamv( 'column-major', 'upper', 2, 1.0, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, 0.0, new Float64Array( 2 ), 0 );
	}, RangeError );
});

test( 'dla_syamv: row-major basic call returns y', function t() {
	var out;
	var A = new Float64Array( [ 1.0, 2.0, 2.0, 3.0 ] );
	var x = new Float64Array( [ 1.0, -1.0 ] );
	var y = new Float64Array( [ 0.0, 0.0 ] );
	out = dla_syamv( 'row-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
	assert.strictEqual( out, y, 'returns y' );
});
