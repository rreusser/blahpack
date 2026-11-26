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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgesvd from './../lib/dgesvd.js';


// FIXTURES //

// 3x3 row-major matrix used across tests.
const A_DATA = [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 10.0 ];

// Same data, transposed for column-major storage.
const A_DATA_COL = [ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 10.0 ];

// Expected dominant singular value (matches Fortran reference).
const SIGMA1 = 17.4125;


// TESTS //

test( 'dgesvd is a function', function t() {
	assert.strictEqual( typeof dgesvd, 'function', 'is a function' );
});

test( 'dgesvd has expected arity', function t() {
	assert.strictEqual( dgesvd.length, 14, 'has expected arity' );
});

test( 'dgesvd throws TypeError for invalid order', function t() {
	let VT, A, s, U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'invalid', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, TypeError );
});

test( 'dgesvd throws TypeError for invalid jobu', function t() {
	let VT, A, s, U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'invalid', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, TypeError );
});

test( 'dgesvd throws TypeError for invalid jobvt', function t() {
	let VT, A, s, U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'invalid', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, TypeError );
});

test( 'dgesvd throws RangeError for negative M', function t() {
	let VT, A, s, U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'all-rows', -1, 3, A, 3, s, 1, U, 3, VT, 3 );
	}, RangeError );
});

test( 'dgesvd throws RangeError for negative N', function t() {
	let VT, A, s, U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'all-rows', 3, -1, A, 3, s, 1, U, 3, VT, 3 );
	}, RangeError );
});

test( 'dgesvd throws RangeError for LDA below max(1,N) (row-major)', function t() {
	let VT, A, s, U;
	A = new Float64Array( A_DATA );
	s = new Float64Array( 3 );
	U = new Float64Array( 9 );
	VT = new Float64Array( 9 );
	assert.throws( function throws() {
		dgesvd( 'row-major', 'all-columns', 'all-rows', 3, 3, A, 1, s, 1, U, 3, VT, 3 );
	}, RangeError );
});

test( 'dgesvd computes singular values for a 3x3 matrix (row-major, all/all)', function t() {
	const A = new Float64Array( A_DATA );
	const s = new Float64Array( 3 );
	const U = new Float64Array( 9 );
	const VT = new Float64Array( 9 );
	const info = dgesvd( 'row-major', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	assert.strictEqual( info, 0, 'info=0' );
	assert.ok( s[ 0 ] > s[ 1 ] && s[ 1 ] > s[ 2 ], 'singular values descending' );
	assert.ok( Math.abs( s[ 0 ] - SIGMA1 ) < 1e-3, 'first singular value matches expected' );
});

test( 'dgesvd computes singular values for a 3x3 matrix (column-major, all/all)', function t() {
	const A = new Float64Array( A_DATA_COL );
	const s = new Float64Array( 3 );
	const U = new Float64Array( 9 );
	const VT = new Float64Array( 9 );
	const info = dgesvd( 'column-major', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	assert.strictEqual( info, 0, 'info=0' );
	assert.ok( s[ 0 ] > s[ 1 ] && s[ 1 ] > s[ 2 ], 'singular values descending' );
	assert.ok( Math.abs( s[ 0 ] - SIGMA1 ) < 1e-3, 'first singular value matches expected' );
});

test( 'dgesvd accepts jobu=none jobvt=none and skips U/VT', function t() {
	const A = new Float64Array( A_DATA );
	const s = new Float64Array( 3 );
	const U = new Float64Array( 1 );
	const VT = new Float64Array( 1 );
	const info = dgesvd( 'row-major', 'none', 'none', 3, 3, A, 3, s, 1, U, 3, VT, 3 );
	assert.strictEqual( info, 0, 'info=0' );
	assert.ok( s[ 0 ] > 0, 'singular values computed' );
});

test( 'dgesvd allocates the optimal WORK when passed null (70x40, fast QR path), and A = U*S*V^T', function t() {
	const M = 70;
	const N = 40;
	const A = new Float64Array( M * N );
	const A0 = new Float64Array( M * N );
	const s = new Float64Array( N );
	const U = new Float64Array( M * N );
	const VT = new Float64Array( N * N );
	let seed = 7;
	let sum;
	let i;
	let j;
	let k;
	for ( i = 0; i < M * N; i++ ) {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		A[ i ] = ( seed / 2147483648 ) - 0.5;
		A0[ i ] = A[ i ];
	}
	const info = dgesvd( 'column-major', 'economy', 'economy', M, N, A, M, s, 1, U, M, VT, N, null );
	assert.strictEqual( info, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += U[ i + ( k * M ) ] * s[ k ] * VT[ k + ( j * N ) ];
			}
			assert.ok( Math.abs( sum - A0[ i + ( j * M ) ] ) < 1e-12, 'A = U*S*V^T at (' + i + ',' + j + ')' );
		}
	}
});
