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
import dorgbr from './../lib/dorgbr.js';
import dorgbrNd from './../lib/ndarray.js';
import dgebrd from '../../dgebrd/lib/base.js';


// FUNCTIONS //

/**
* Returns an M0-by-N0 column-major matrix reduced by `dgebrd` (reflectors in `A`).
*
* @private
* @param {PositiveInteger} M0 - rows
* @param {PositiveInteger} N0 - columns
* @returns {Object} reduced matrix and scalar factors
*/
function reduce( M0, N0 ) {
	const mn = Math.min( M0, N0 );
	const A = new Float64Array( M0 * N0 );
	const TAUQ = new Float64Array( mn );
	const TAUP = new Float64Array( mn );
	let s = 12345;
	let i;
	for ( i = 0; i < A.length; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		A[ i ] = ( s / 1073741824 ) - 1.0;
	}
	dgebrd( M0, N0, A, 1, M0, 0, new Float64Array( mn ), 1, 0, new Float64Array( Math.max( mn - 1, 1 ) ), 1, 0, TAUQ, 1, 0, TAUP, 1, 0, new Float64Array( 8192 ), 1, 0, 8192 );
	return {
		'A': A,
		'TAUQ': TAUQ,
		'TAUP': TAUP
	};
}

/**
* Forms Q or P^T with the wrapper (WORK = null) and with `ndarray` (explicit WORK) and asserts bit-identical, orthonormal results.
*
* @private
* @param {string} order - layout
* @param {string} vect - `'apply-Q'` or `'apply-P'`
* @param {PositiveInteger} M0 - rows of the matrix reduced by `dgebrd`
* @param {PositiveInteger} N0 - columns of the matrix reduced by `dgebrd`
* @param {NonNegativeInteger} M - rows of the formed matrix
* @param {NonNegativeInteger} N - columns of the formed matrix
* @param {NonNegativeInteger} K - `N0` for `'apply-Q'`, `M0` for `'apply-P'`
*/
function check( order, vect, M0, N0, M, N, K ) {
	const label = order + ' ' + vect + ' M=' + M + ' N=' + N + ' K=' + K;
	const red = reduce( M0, N0 );
	const TAU = ( vect === 'apply-Q' ) ? red.TAUQ : red.TAUP;
	const A1 = new Float64Array( M0 * N0 );
	let info2;
	let info1;
	let LDA;
	let sa1;
	let sa2;
	let sum;
	let A2;
	let p;
	let i;
	let j;
	let k;
	if ( order === 'column-major' ) {
		LDA = M0;
		sa1 = 1;
		sa2 = M0;
	} else {
		LDA = N0;
		sa1 = N0;
		sa2 = 1;
	}
	for ( j = 0; j < N0; j++ ) {
		for ( i = 0; i < M0; i++ ) {
			A1[ ( i * sa1 ) + ( j * sa2 ) ] = red.A[ i + ( j * M0 ) ];
		}
	}
	A2 = new Float64Array( A1 );
	info1 = dorgbr( order, vect, M, N, K, A1, LDA, TAU, 1, null );
	info2 = dorgbrNd( vect, M, N, K, A2, sa1, sa2, 0, TAU, 1, 0, new Float64Array( 8192 ), 1, 0 );
	assert.strictEqual( info1, 0, label + ': info' );
	assert.strictEqual( info2, 0, label + ': ndarray info' );
	for ( i = 0; i < A1.length; i++ ) {
		assert.strictEqual( A1[ i ], A2[ i ], label + ': A[' + i + ']' );
	}
	// Orthonormal columns when M >= N, orthonormal rows otherwise:
	p = Math.min( M, N );
	for ( i = 0; i < p; i++ ) {
		for ( j = 0; j < p; j++ ) {
			sum = 0.0;
			for ( k = 0; k < Math.max( M, N ); k++ ) {
				if ( M >= N ) {
					sum += A1[ ( k * sa1 ) + ( i * sa2 ) ] * A1[ ( k * sa1 ) + ( j * sa2 ) ];
				} else {
					sum += A1[ ( i * sa1 ) + ( k * sa2 ) ] * A1[ ( j * sa1 ) + ( k * sa2 ) ];
				}
			}
			assert.ok( Math.abs( sum - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-13, label + ': orthonormality (' + i + ',' + j + ') = ' + sum );
		}
	}
}


// TESTS //

test( 'dorgbr is a function', function t() {
	assert.strictEqual( typeof dorgbr, 'function', 'is a function' );
});

test( 'dorgbr has expected arity', function t() {
	assert.strictEqual( dorgbr.length, 10, 'has expected arity' );
});

test( 'dorgbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgbr( 'invalid', 'apply-Q', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dorgbr throws TypeError for invalid vect', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dorgbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dorgbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dorgbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dorgbr throws RangeError for invalid N (apply-Q requires N <= M)', function t() {
	assert.throws( function throws() {
		dorgbr( 'column-major', 'apply-Q', 2, 3, 2, new Float64Array( 9 ), 2, new Float64Array( 2 ), 1, null );
	}, RangeError );
});

test( 'dorgbr throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		dorgbr( 'column-major', 'apply-Q', 3, 2, 2, new Float64Array( 9 ), 2, new Float64Array( 2 ), 1, null );
	}, RangeError );
});

test( 'dorgbr throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		dorgbr( 'row-major', 'apply-Q', 3, 2, 2, new Float64Array( 9 ), 1, new Float64Array( 2 ), 1, null );
	}, RangeError );
});

test( 'dorgbr matches ndarray and forms orthonormal factors (both layouts, allocated WORK, every workspace-size branch)', function t() {
	const orders = [ 'column-major', 'row-major' ];
	let o;
	for ( o = 0; o < orders.length; o++ ) {
		// apply-Q, M >= K, K <= NB:
		check( orders[ o ], 'apply-Q', 5, 4, 5, 4, 4 );

		// apply-Q, M >= K, K > NB:
		check( orders[ o ], 'apply-Q', 34, 33, 34, 33, 33 );

		// apply-Q, M < K, 1 < M <= NB+1:
		check( orders[ o ], 'apply-Q', 3, 4, 3, 3, 4 );

		// apply-Q, M < K, M - 1 > NB:
		check( orders[ o ], 'apply-Q', 34, 35, 34, 34, 35 );

		// apply-Q, M < K, M = 1:
		check( orders[ o ], 'apply-Q', 1, 2, 1, 1, 2 );

		// apply-P, K < N, K <= NB:
		check( orders[ o ], 'apply-P', 3, 4, 3, 4, 3 );

		// apply-P, K < N, K > NB:
		check( orders[ o ], 'apply-P', 33, 34, 33, 34, 33 );

		// apply-P, K >= N, 1 < N <= NB+1:
		check( orders[ o ], 'apply-P', 4, 3, 3, 3, 4 );

		// apply-P, K >= N, N - 1 > NB:
		check( orders[ o ], 'apply-P', 35, 34, 34, 34, 35 );

		// apply-P, K >= N, N = 1:
		check( orders[ o ], 'apply-P', 2, 1, 1, 1, 2 );
	}
});
