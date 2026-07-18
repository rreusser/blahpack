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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtzrzf from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dtzrzf.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

const FIXTURE_LDA = 200; // matches NMAX in test_dtzrzf.f90


// FUNCTIONS //

/**
* Locates a fixture record by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture object
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts two scalars are within a relative tolerance.
*
* @private
* @param {number} actual - observed value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Compares two arrays element-wise within a relative tolerance.
*
* @private
* @param {Array} actual - observed array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extracts the meaningful M-by-N column-major block from a buffer with leading dimension `lda`.
*
* @private
* @param {Float64Array} A - buffer
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} lda - leading dimension
* @returns {Float64Array} contiguous M*N column-major slice
*/
function extractBlock( A, M, N, lda ) {
	let i, j;
	const out = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ ( j * M ) + i ] = A[ ( j * lda ) + i ];
		}
	}
	return out;
}

/**
* Builds a fixture-shaped column-major buffer (length lda*N) from a row-major nested array of size M-by-N.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} lda - leading dimension
* @param {Array<Array<number>>} rows - row-major source
* @returns {Float64Array} buffer
*/
function buildSourceA( M, N, lda, rows ) {
	let i, j;
	const A = new Float64Array( lda * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( j * lda ) + i ] = rows[ i ][ j ];
		}
	}
	return A;
}

/**
* Builds the M-by-N upper trapezoidal matrix used by the `large_40x80` fixture.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {NonNegativeInteger} lda - leading dimension
* @returns {Float64Array} buffer
*/
function buildLargeFixtureMatrix( M, N, lda ) {
	let i, j;
	const A = new Float64Array( lda * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( j >= i ) {
				if ( i === j ) {
					A[ ( j * lda ) + i ] = 10.0 + ( i + 1 );
				} else {
					A[ ( j * lda ) + i ] = 1.0 / ( ( j - i ) + 1 );
				}
			}
		}
	}
	return A;
}

/**
* Reconstructs A = R * Z given the factored output of dtzrzf. Returns the reconstructed matrix in row-major order.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @param {Float64Array} A - factored matrix (column-major, leading dim LDA)
* @param {NonNegativeInteger} LDA - leading dimension
* @param {Float64Array} TAU - reflector scalar factors (length M)
* @returns {Float64Array} reconstructed matrix in row-major order (M*N)
*/
function reconstructA( M, N, A, LDA, TAU ) {
	let dot, tau, i, j, k, r;

	const L = N - M;
	const out = new Float64Array( M * N );

	// Initialize `out` with R padded by zero columns.
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			out[ ( i * N ) + j ] = A[ ( j * LDA ) + i ];
		}
	}

	// Apply H(0), H(1), ..., H(M-1) on the right (Z = H(0)*H(1)*...*H(M-1)).
	for ( k = 0; k < M; k++ ) {
		tau = TAU[ k ];
		if ( tau === 0.0 ) {
			continue;
		}
		for ( r = 0; r < M; r++ ) {
			dot = out[ ( r * N ) + k ];
			for ( j = 0; j < L; j++ ) {
				dot += out[ ( r * N ) + M + j ] * A[ ( ( M + j ) * LDA ) + k ];
			}
			out[ ( r * N ) + k ] -= tau * dot;
			for ( j = 0; j < L; j++ ) {
				out[ ( r * N ) + M + j ] -= tau * dot * A[ ( ( M + j ) * LDA ) + k ];
			}
		}
	}
	return out;
}


// TESTS //

test( 'dtzrzf (ndarray): throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtzrzf( -1, 5, new Float64Array( 5 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dtzrzf (ndarray): throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtzrzf( 2, -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dtzrzf (ndarray): throws RangeError for N < M', function t() {
	assert.throws( function throws() {
		dtzrzf( 4, 2, new Float64Array( 8 ), 1, 4, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'dtzrzf: 3x5', function t() {
	const tc = findCase( '3x5' );
	const rows = [
		[ 4.0, 1.0, 2.0, 3.0, 1.0 ],
		[ 0.0, 5.0, 1.0, 2.0, 4.0 ],
		[ 0.0, 0.0, 6.0, 1.0, 2.0 ]
	];
	const A = buildSourceA( 3, 5, FIXTURE_LDA, rows );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 3 * 32 );
	const info = dtzrzf( 3, 5, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 3, 5, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: 4x6', function t() {
	const tc = findCase( '4x6' );
	const rows = [
		[ 5.0, 1.0, 2.0, 3.0, 1.0, 2.0 ],
		[ 0.0, 6.0, 1.0, 2.0, 3.0, 1.0 ],
		[ 0.0, 0.0, 7.0, 1.0, 2.0, 3.0 ],
		[ 0.0, 0.0, 0.0, 8.0, 1.0, 2.0 ]
	];
	const A = buildSourceA( 4, 6, FIXTURE_LDA, rows );
	const TAU = new Float64Array( 4 );
	const WORK = new Float64Array( 4 * 32 );
	const info = dtzrzf( 4, 6, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 4, 6, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: square_3x3 (M = N)', function t() {
	const tc = findCase( 'square_3x3' );
	const rows = [
		[ 3.0, 1.0, 2.0 ],
		[ 0.0, 4.0, 1.0 ],
		[ 0.0, 0.0, 5.0 ]
	];
	const A = buildSourceA( 3, 3, FIXTURE_LDA, rows );
	const TAU = new Float64Array( 3 );
	TAU[ 0 ] = 7.0;
	TAU[ 1 ] = 7.0;
	TAU[ 2 ] = 7.0;
	const WORK = new Float64Array( 3 );
	const info = dtzrzf( 3, 3, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 3, 3, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: m_zero (M = 0 quick return)', function t() {
	const A = new Float64Array( FIXTURE_LDA * 5 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dtzrzf( 0, 5, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dtzrzf: 1x4', function t() {
	const tc = findCase( '1x4' );
	const A = buildSourceA( 1, 4, FIXTURE_LDA, [ [ 3.0, 1.0, 2.0, 1.0 ] ] );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 32 );
	const info = dtzrzf( 1, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 1, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: 2x4', function t() {
	const tc = findCase( '2x4' );
	const rows = [
		[ 2.0, 1.0, 3.0, 1.0 ],
		[ 0.0, 3.0, 1.0, 2.0 ]
	];
	const A = buildSourceA( 2, 4, FIXTURE_LDA, rows );
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 2 * 32 );
	const info = dtzrzf( 2, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 2, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: large_40x80 (still unblocked: M < NX=128)', function t() {
	const tc = findCase( 'large_40x80' );
	const M = 40;
	const N = 80;
	const A = buildLargeFixtureMatrix( M, N, FIXTURE_LDA );
	const TAU = new Float64Array( M );
	const WORK = new Float64Array( M * 32 );
	const info = dtzrzf( M, N, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, M, N, FIXTURE_LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-12, 'TAU' );
});

test( 'dtzrzf: m_n_zero', function t() {
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dtzrzf( 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dtzrzf: square_4x4 (M = N)', function t() {
	const tc = findCase( 'square_4x4' );
	const rows = [
		[ 4.0, 1.0, 2.0, 3.0 ],
		[ 0.0, 5.0, 1.0, 2.0 ],
		[ 0.0, 0.0, 6.0, 1.0 ],
		[ 0.0, 0.0, 0.0, 7.0 ]
	];
	const A = buildSourceA( 4, 4, FIXTURE_LDA, rows );
	const TAU = new Float64Array( 4 );
	TAU[ 0 ] = 9.9;
	TAU[ 1 ] = 9.9;
	TAU[ 2 ] = 9.9;
	TAU[ 3 ] = 9.9;
	const WORK = new Float64Array( 4 );
	const info = dtzrzf( 4, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 4, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: blocked path (M=140, N=200) — verify A = R*Z reconstruction', function t() {
	let orig, i, j;
	const M = 140;
	const N = 200;
	const lda = M;
	const A0 = buildLargeFixtureMatrix( M, N, lda );
	const A = buildLargeFixtureMatrix( M, N, lda );
	const TAU = new Float64Array( M );
	const WORK = new Float64Array( M * 32 );
	const info = dtzrzf( M, N, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	const rec = reconstructA( M, N, A, lda, TAU );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			orig = A0[ ( j * lda ) + i ];
			assertClose( rec[ ( i * N ) + j ], orig, 1e-10, 'recA[' + i + ',' + j + ']' );
		}
	}
});

test( 'dtzrzf: throws RangeError when WORK is undersized (blocked path, M=140)', function t() {
	const TAU = new Float64Array( 140 );
	const A = buildLargeFixtureMatrix( 140, 200, 140 );
	assert.throws( function () {
		dtzrzf( 140, 200, A, 1, 140, 0, TAU, 1, 0, new Float64Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'dtzrzf: row-major small (3x5) — verify A = R*Z reconstruction', function t() {
	let i, j;
	const M = 3;
	const N = 5;
	const lda = N;
	const rows = [
		[ 4.0, 1.0, 2.0, 3.0, 1.0 ],
		[ 0.0, 5.0, 1.0, 2.0, 4.0 ],
		[ 0.0, 0.0, 6.0, 1.0, 2.0 ]
	];
	const A0 = new Float64Array( M * lda );
	const A = new Float64Array( M * lda );
	const TAU = new Float64Array( M );
	const WORK = new Float64Array( M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A0[ ( i * lda ) + j ] = rows[ i ][ j ];
			A[ ( i * lda ) + j ] = rows[ i ][ j ];
		}
	}

	// Row-major: strideA1 = N, strideA2 = 1.
	const info = dtzrzf( M, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );

	// Convert row-major buffer into a column-major view (lda=M) for reconstructA.
	const Acol = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Acol[ ( j * M ) + i ] = A[ ( i * lda ) + j ];
		}
	}
	const rec = reconstructA( M, N, Acol, M, TAU );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assertClose( rec[ ( i * N ) + j ], A0[ ( i * lda ) + j ], 1e-12, 'recA[' + i + ',' + j + ']' );
		}
	}
});
