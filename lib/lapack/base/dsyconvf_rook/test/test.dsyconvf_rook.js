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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconvf_rook from './../lib/dsyconvf_rook.js';


// TESTS //

test( 'dsyconvf_rook is a function', function t() {
	assert.strictEqual( typeof dsyconvf_rook, 'function', 'is a function' );
});

test( 'dsyconvf_rook has expected arity', function t() {
	assert.strictEqual( dsyconvf_rook.length, 11, 'has expected arity' );
});

test( 'dsyconvf_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyconvf_rook( 'invalid', 'upper', 'convert', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyconvf_rook( 'column-major', 'invalid', 'convert', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf_rook throws TypeError for invalid way', function t() {
	assert.throws( function throws() {
		dsyconvf_rook( 'column-major', 'upper', 'nope', 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyconvf_rook( 'column-major', 'upper', 'convert', -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dsyconvf_rook throws RangeError when LDA < max(1,N) in row-major', function t() {
	assert.throws( function throws() {
		dsyconvf_rook( 'row-major', 'upper', 'convert', 3, new Float64Array( 9 ), 1, new Float64Array( 3 ), 1, new Int32Array( 3 ), 1, 0 );
	}, RangeError );
});

test( 'dsyconvf_rook column-major success path', function t() {
	var IPIV;
	var info;
	var A;
	var e;

	A = new Float64Array( [ 4.0, 0.0, 0.0, 0.0, 2.0, 5.0, 0.0, 0.0, 1.0, 3.0, 6.0, 0.0, 0.0, 1.0, 2.0, 7.0 ] );
	e = new Float64Array( 4 );
	IPIV = new Int32Array( [ 0, 1, 2, 3 ] );
	info = dsyconvf_rook( 'column-major', 'upper', 'convert', 4, A, 4, e, 1, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dsyconvf_rook row-major success path', function t() {
	var IPIV;
	var info;
	var A;
	var e;

	A = new Float64Array( [ 4.0, 2.0, 1.0, 0.0, 0.0, 5.0, 3.0, 1.0, 0.0, 0.0, 6.0, 2.0, 0.0, 0.0, 0.0, 7.0 ] );
	e = new Float64Array( 4 );
	IPIV = new Int32Array( [ 0, 1, 2, 3 ] );
	info = dsyconvf_rook( 'row-major', 'lower', 'convert', 4, A, 4, e, 1, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
});
