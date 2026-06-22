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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrfrk from './../lib/zhetrf_rk.js';


// TESTS //

test( 'zhetrf_rk is a function', function t() {
	assert.strictEqual( typeof zhetrfrk, 'function', 'is a function' );
});

test( 'zhetrf_rk has expected arity', function t() {
	assert.strictEqual( zhetrfrk.length, 9, 'has expected arity' );
});

test( 'zhetrf_rk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrfrk( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'zhetrf_rk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrfrk( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, TypeError );
});

test( 'zhetrf_rk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrfrk( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1 );
	}, RangeError );
});

test( 'zhetrf_rk throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zhetrfrk( 'column-major', 'upper', 4, new Complex128Array( 16 ), 2, new Complex128Array( 4 ), 1, new Int32Array( 4 ), 1 );
	}, RangeError );
});

test( 'zhetrf_rk: column-major lower factorization succeeds and N=0 is a quick return', function t() {
	var info;
	var ipiv;
	var A;
	var e;

	A = new Complex128Array( [ 4, 0, 1, -2, 3, 1, 0.5, -0.5, 0, 0, 5, 0, 2, -1, 1, 2, 0, 0, 0, 0, 7, 0, 3, 0, 0, 0, 0, 0, 0, 0, 6, 0 ] );
	e = new Complex128Array( 4 );
	ipiv = new Int32Array( 4 );
	info = zhetrfrk( 'column-major', 'lower', 4, A, 4, e, 1, ipiv, 1 );
	assert.equal( info, 0, 'info=0' );

	// N = 0 quick return
	info = zhetrfrk( 'column-major', 'lower', 0, new Complex128Array( 0 ), 1, new Complex128Array( 0 ), 1, new Int32Array( 0 ), 1 );
	assert.equal( info, 0, 'info=0 for N=0' );
});
