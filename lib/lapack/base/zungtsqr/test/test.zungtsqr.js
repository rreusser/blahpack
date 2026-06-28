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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatsqr from './../../zlatsqr/lib/base.js';
import zungtsqr from './../lib/zungtsqr.js';


// TESTS //

test( 'zungtsqr is a function', function t() {
	assert.strictEqual( typeof zungtsqr, 'function', 'is a function' );
});

test( 'zungtsqr has expected arity', function t() {
	assert.strictEqual( zungtsqr.length, 11, 'has expected arity' );
});

test( 'zungtsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungtsqr( 'invalid', 4, 2, 3, 2, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, TypeError );
});

test( 'zungtsqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', -1, 2, 3, 2, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', 4, -1, 3, 2, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for N > M', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', 2, 4, 5, 2, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for mb <= N', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', 4, 2, 2, 2, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', 4, 2, 3, 0, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', 4, 2, 3, 2, new Complex128Array( 8 ), 2, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		zungtsqr( 'row-major', 4, 2, 3, 2, new Complex128Array( 8 ), 1, new Complex128Array( 8 ), 2, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr throws RangeError for LDT < min(nb, N)', function t() {
	assert.throws( function throws() {
		zungtsqr( 'column-major', 4, 2, 3, 2, new Complex128Array( 8 ), 4, new Complex128Array( 8 ), 1, new Complex128Array( 16 ), 1 );
	}, RangeError );
});

test( 'zungtsqr column-major wrapper produces an orthonormal Q', function t() {
	var WORK;
	var info;
	var view;
	var dotR;
	var dotI;
	var idx1;
	var idx2;
	var ldc;
	var Av;
	var mb;
	var nb;
	var M;
	var N;
	var A;
	var T;
	var i;
	var j;
	var k;

	M = 4;
	N = 2;
	mb = 3;
	nb = 2;
	A = new Complex128Array( M * N );
	T = new Complex128Array( nb * 2 * N ); // numblk=2, NB=2, cols=numblk*N=4
	Av = reinterpret( A, 0 );

	// Build a simple tall panel.
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx1 = ( ( j * M ) + i ) * 2;
			if ( i === j ) {
				Av[ idx1 ] = 5.0 + j;
			} else {
				Av[ idx1 ] = 1.0 / ( Math.abs( i - j ) + 1 );
				Av[ idx1 + 1 ] = -0.1 * ( i - j );
			}
		}
	}
	WORK = new Complex128Array( N * nb );
	info = zlatsqr( M, N, mb, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'zlatsqr info' );

	WORK = new Complex128Array( ( M + nb ) * N );
	info = zungtsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK, 1 );
	assert.strictEqual( info, 0, 'zungtsqr info' );

	// Verify orthonormality: Q^H * Q = I.
	view = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			dotR = 0.0;
			dotI = 0.0;
			for ( k = 0; k < M; k++ ) {
				idx1 = ( ( i * M ) + k ) * 2;
				idx2 = ( ( j * M ) + k ) * 2;
				dotR += ( ( view[ idx1 ] * view[ idx2 ] ) + ( view[ idx1 + 1 ] * view[ idx2 + 1 ] ) );
				dotI += ( ( view[ idx1 ] * view[ idx2 + 1 ] ) - ( view[ idx1 + 1 ] * view[ idx2 ] ) );
			}
			ldc = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( dotR - ldc ) < 1e-12, 'dotR[' + i + ',' + j + ']: ' + dotR );
			assert.ok( Math.abs( dotI ) < 1e-12, 'dotI[' + i + ',' + j + ']: ' + dotI );
		}
	}
});
