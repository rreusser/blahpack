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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../../dlatsqr/lib/dlatsqr.js';
import dorgtsqr_row from './../lib/dorgtsqr_row.js';


// TESTS //

test( 'dorgtsqr_row is a function', function t() {
	assert.strictEqual( typeof dorgtsqr_row, 'function', 'is a function' );
});

test( 'dorgtsqr_row has expected arity', function t() {
	assert.strictEqual( dorgtsqr_row.length, 11, 'has expected arity' );
});

test( 'dorgtsqr_row throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgtsqr_row( 'invalid', 4, 3, 8, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorgtsqr_row throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgtsqr_row( 'column-major', -1, 3, 8, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgtsqr_row throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgtsqr_row( 'column-major', 4, -1, 8, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgtsqr_row throws RangeError for LDA < max(1,M) (column-major)', function t() {
	assert.throws( function throws() {
		dorgtsqr_row( 'column-major', 4, 3, 8, 2, new Float64Array( 12 ), 1, new Float64Array( 6 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgtsqr_row throws RangeError for LDT < max(1,nb)', function t() {
	assert.throws( function throws() {
		dorgtsqr_row( 'column-major', 4, 3, 8, 2, new Float64Array( 12 ), 4, new Float64Array( 6 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgtsqr_row throws RangeError for LDA < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		dorgtsqr_row( 'row-major', 4, 3, 8, 2, new Float64Array( 12 ), 1, new Float64Array( 6 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgtsqr_row: column-major round-trip via dlatsqr (m4_n3_mb8_nb2)', function t() {
	var info;
	var dot;
	var MB;
	var NB;
	var W1;
	var W2;
	var M;
	var N;
	var A;
	var T;
	var i;
	var j;
	var k;
	M = 4;
	N = 3;
	MB = 8;
	NB = 2;
	A = new Float64Array( M * N );
	T = new Float64Array( NB * N );
	W1 = new Float64Array( NB * N );
	W2 = new Float64Array( NB * NB );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ i + ( j * M ) ] = ( i === j ) ? ( 4.0 + j ) : ( 1.0 / ( Math.abs( i - j ) + 1 ) );
		}
	}
	dlatsqr( 'column-major', M, N, MB, NB, A, M, T, NB, W1 );
	info = dorgtsqr_row( 'column-major', M, N, MB, NB, A, M, T, NB, W2, 1 );
	assert.equal( info, 0, 'INFO' );

	// Verify Q^T Q = I.
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			dot = 0.0;
			for ( k = 0; k < M; k++ ) {
				dot += A[ k + ( i * M ) ] * A[ k + ( j * M ) ];
			}
			assert.ok( Math.abs( dot - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-13, 'Q^T Q[' + i + ',' + j + ']' );
		}
	}
});
