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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsyconvf from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsyconvf, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zsyconvf.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export returns 0 on quick-return for N=0', function t() {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Complex128Array( 0 );
	E = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	info = zsyconvf( 'column-major', 'upper', 'convert', 0, A, 1, E, 1, IPIV, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'ndarray method returns 0 on quick-return for N=0', function t() {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Complex128Array( 0 );
	E = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	info = zsyconvf.ndarray( 'upper', 'convert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'main export accepts lower uplo and revert way', function t() {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Complex128Array( 4 );
	E = new Complex128Array( 2 );
	IPIV = new Int32Array( [ 0, 1 ] );
	info = zsyconvf( 'column-major', 'lower', 'revert', 2, A, 2, E, 1, IPIV, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns 0' );
});
