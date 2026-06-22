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
import dsytrfAa from './../lib/dsytrf_aa.js';


// TESTS //

test( 'dsytrfAa is a function', function t() {
	assert.strictEqual( typeof dsytrfAa, 'function', 'is a function' );
});

test( 'dsytrfAa has expected arity', function t() {
	assert.strictEqual( dsytrfAa.length, 6, 'has expected arity' );
});

test( 'dsytrfAa throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytrfAa( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dsytrfAa throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytrfAa( 'column-major', 'invalid', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dsytrfAa throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytrfAa( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, RangeError );
});

test( 'dsytrfAa throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dsytrfAa( 'column-major', 'upper', 4, new Float64Array( 16 ), 2, new Int32Array( 4 ) );
	}, RangeError );
});

test( 'dsytrfAa returns 0 for N=0', function t() {
	var info = dsytrfAa( 'column-major', 'lower', 0, new Float64Array( 0 ), 1, new Int32Array( 0 ) );
	assert.equal( info, 0, 'info=0 for N=0' );
});

test( 'dsytrfAa works for N=1 column-major', function t() {
	var ipiv;
	var info;
	var A;

	A = new Float64Array([ 7.0 ]);
	ipiv = new Int32Array( 1 );
	info = dsytrfAa( 'column-major', 'lower', 1, A, 1, ipiv );
	assert.equal( info, 0, 'info=0' );
	assert.equal( ipiv[ 0 ], 0, 'ipiv[0] = 0 (0-based self-pivot)' );
});

test( 'dsytrfAa works for row-major (4x4 lower)', function t() {
	var ipiv;
	var info;
	var A;
	var i;
	var j;

	// Build symmetric matrix in row-major form. Lower triangular must contain the data.

	// A[i,j] for i >= j filled.
	A = new Float64Array( 16 );
	for ( i = 0; i < 4; i++ ) {
		for ( j = 0; j < 4; j++ ) {
			if ( i >= j ) {
				A[ ( i * 4 ) + j ] = ( i === j ) ? ( 4.0 + i ) : 1.0;
			}
		}
	}
	ipiv = new Int32Array( 4 );
	info = dsytrfAa( 'row-major', 'lower', 4, A, 4, ipiv );
	assert.equal( info, 0, 'info=0' );
});
