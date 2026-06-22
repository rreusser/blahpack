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
import Complex64Array from '@stdlib/array/complex64/lib/index.js';
import zlat2c from './../lib/zlat2c.js';


// TESTS //

test( 'zlat2c is a function', function t() {
	assert.strictEqual( typeof zlat2c, 'function', 'is a function' );
});

test( 'zlat2c has expected arity', function t() {
	assert.strictEqual( zlat2c.length, 7, 'has expected arity' );
});

test( 'zlat2c throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlat2c( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Complex64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlat2c throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlat2c( 'column-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Complex64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlat2c throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlat2c( 'column-major', 'upper', -1, new Complex128Array( 4 ), 2, new Complex64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlat2c throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zlat2c( 'column-major', 'upper', 3, new Complex128Array( 9 ), 2, new Complex64Array( 9 ), 3 );
	}, RangeError );
});

test( 'zlat2c throws RangeError for LDSA < max(1,N)', function t() {
	assert.throws( function throws() {
		zlat2c( 'column-major', 'upper', 3, new Complex128Array( 9 ), 3, new Complex64Array( 9 ), 2 );
	}, RangeError );
});

test( 'zlat2c converts a 2x2 upper (column-major)', function t() {
	var info;
	var SA;
	var A;
	A = new Complex128Array( 4 );
	A.set( [ 1.0, 2.0 ], 0 );
	A.set( [ 3.0, 4.0 ], 2 );
	A.set( [ 5.0, 6.0 ], 3 );
	SA = new Complex64Array( 4 );
	info = zlat2c( 'column-major', 'upper', 2, A, 2, SA, 2 );
	assert.equal( info, 0, 'info' );
});

test( 'zlat2c converts a 2x2 lower (row-major)', function t() {
	var info;
	var SA;
	var A;
	A = new Complex128Array( 4 );
	A.set( [ 1.0, 2.0 ], 0 );
	A.set( [ 3.0, 4.0 ], 2 );
	A.set( [ 5.0, 6.0 ], 3 );
	SA = new Complex64Array( 4 );
	info = zlat2c( 'row-major', 'lower', 2, A, 2, SA, 2 );
	assert.equal( info, 0, 'info' );
});
