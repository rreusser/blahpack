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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtzrzf from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dtzrzf.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

var FIXTURE_LDA = 200; // matches NMAX in test_dtzrzf.f90


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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	var i;
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
	var out;
	var i;
	var j;
	out = new Float64Array( M * N );
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
	var A;
	var i;
	var j;
	A = new Float64Array( lda * N );
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
	var A;
	var i;
	var j;
	A = new Float64Array( lda * N );
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
	var out;
	var dot;
	var tau;
	var L;
	var i;
	var j;
	var k;
	var r;

	L = N - M;
	out = new Float64Array( M * N );

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
	var rows;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( '3x5' );
	rows = [
		[ 4.0, 1.0, 2.0, 3.0, 1.0 ],
		[ 0.0, 5.0, 1.0, 2.0, 4.0 ],
		[ 0.0, 0.0, 6.0, 1.0, 2.0 ]
	];
	A = buildSourceA( 3, 5, FIXTURE_LDA, rows );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dtzrzf( 3, 5, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 3, 5, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: 4x6', function t() {
	var WORK;
	var info;
	var rows;
	var TAU;
	var tc;
	var A;
	tc = findCase( '4x6' );
	rows = [
		[ 5.0, 1.0, 2.0, 3.0, 1.0, 2.0 ],
		[ 0.0, 6.0, 1.0, 2.0, 3.0, 1.0 ],
		[ 0.0, 0.0, 7.0, 1.0, 2.0, 3.0 ],
		[ 0.0, 0.0, 0.0, 8.0, 1.0, 2.0 ]
	];
	A = buildSourceA( 4, 6, FIXTURE_LDA, rows );
	TAU = new Float64Array( 4 );
	WORK = new Float64Array( 4 * 32 );
	info = dtzrzf( 4, 6, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 4, 6, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: square_3x3 (M = N)', function t() {
	var WORK;
	var info;
	var rows;
	var TAU;
	var tc;
	var A;
	tc = findCase( 'square_3x3' );
	rows = [
		[ 3.0, 1.0, 2.0 ],
		[ 0.0, 4.0, 1.0 ],
		[ 0.0, 0.0, 5.0 ]
	];
	A = buildSourceA( 3, 3, FIXTURE_LDA, rows );
	TAU = new Float64Array( 3 );
	TAU[ 0 ] = 7.0;
	TAU[ 1 ] = 7.0;
	TAU[ 2 ] = 7.0;
	WORK = new Float64Array( 3 );
	info = dtzrzf( 3, 3, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 3, 3, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: m_zero (M = 0 quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	A = new Float64Array( FIXTURE_LDA * 5 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dtzrzf( 0, 5, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dtzrzf: 1x4', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( '1x4' );
	A = buildSourceA( 1, 4, FIXTURE_LDA, [ [ 3.0, 1.0, 2.0, 1.0 ] ] );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 32 );
	info = dtzrzf( 1, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 1, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: 2x4', function t() {
	var WORK;
	var info;
	var rows;
	var TAU;
	var tc;
	var A;
	tc = findCase( '2x4' );
	rows = [
		[ 2.0, 1.0, 3.0, 1.0 ],
		[ 0.0, 3.0, 1.0, 2.0 ]
	];
	A = buildSourceA( 2, 4, FIXTURE_LDA, rows );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 * 32 );
	info = dtzrzf( 2, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 2, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: large_40x80 (still unblocked: M < NX=128)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var M;
	var N;
	tc = findCase( 'large_40x80' );
	M = 40;
	N = 80;
	A = buildLargeFixtureMatrix( M, N, FIXTURE_LDA );
	TAU = new Float64Array( M );
	WORK = new Float64Array( M * 32 );
	info = dtzrzf( M, N, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, M, N, FIXTURE_LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-12, 'TAU' );
});

test( 'dtzrzf: m_n_zero', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dtzrzf( 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dtzrzf: square_4x4 (M = N)', function t() {
	var WORK;
	var info;
	var rows;
	var TAU;
	var tc;
	var A;
	tc = findCase( 'square_4x4' );
	rows = [
		[ 4.0, 1.0, 2.0, 3.0 ],
		[ 0.0, 5.0, 1.0, 2.0 ],
		[ 0.0, 0.0, 6.0, 1.0 ],
		[ 0.0, 0.0, 0.0, 7.0 ]
	];
	A = buildSourceA( 4, 4, FIXTURE_LDA, rows );
	TAU = new Float64Array( 4 );
	TAU[ 0 ] = 9.9;
	TAU[ 1 ] = 9.9;
	TAU[ 2 ] = 9.9;
	TAU[ 3 ] = 9.9;
	WORK = new Float64Array( 4 );
	info = dtzrzf( 4, 4, A, 1, FIXTURE_LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( extractBlock( A, 4, 4, FIXTURE_LDA ), tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
});

test( 'dtzrzf: blocked path (M=140, N=200) — verify A = R*Z reconstruction', function t() {
	var WORK;
	var orig;
	var info;
	var rec;
	var TAU;
	var lda;
	var A0;
	var A;
	var M;
	var N;
	var i;
	var j;
	M = 140;
	N = 200;
	lda = M;
	A0 = buildLargeFixtureMatrix( M, N, lda );
	A = buildLargeFixtureMatrix( M, N, lda );
	TAU = new Float64Array( M );
	WORK = new Float64Array( M * 32 );
	info = dtzrzf( M, N, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	rec = reconstructA( M, N, A, lda, TAU );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			orig = A0[ ( j * lda ) + i ];
			assertClose( rec[ ( i * N ) + j ], orig, 1e-10, 'recA[' + i + ',' + j + ']' );
		}
	}
});

test( 'dtzrzf: throws RangeError when WORK is undersized (blocked path, M=140)', function t() {
	var TAU = new Float64Array( 140 );
	var A = buildLargeFixtureMatrix( 140, 200, 140 );
	assert.throws( function () {
		dtzrzf( 140, 200, A, 1, 140, 0, TAU, 1, 0, new Float64Array( 8 ), 1, 0 );
	}, RangeError );
});

test( 'dtzrzf: row-major small (3x5) — verify A = R*Z reconstruction', function t() {
	var Acol;
	var rows;
	var WORK;
	var info;
	var rec;
	var TAU;
	var lda;
	var A0;
	var A;
	var M;
	var N;
	var i;
	var j;
	M = 3;
	N = 5;
	lda = N;
	rows = [
		[ 4.0, 1.0, 2.0, 3.0, 1.0 ],
		[ 0.0, 5.0, 1.0, 2.0, 4.0 ],
		[ 0.0, 0.0, 6.0, 1.0, 2.0 ]
	];
	A0 = new Float64Array( M * lda );
	A = new Float64Array( M * lda );
	TAU = new Float64Array( M );
	WORK = new Float64Array( M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A0[ ( i * lda ) + j ] = rows[ i ][ j ];
			A[ ( i * lda ) + j ] = rows[ i ][ j ];
		}
	}

	// Row-major: strideA1 = N, strideA2 = 1.
	info = dtzrzf( M, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );

	// Convert row-major buffer into a column-major view (lda=M) for reconstructA.
	Acol = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Acol[ ( j * M ) + i ] = A[ ( i * lda ) + j ];
		}
	}
	rec = reconstructA( M, N, Acol, M, TAU );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assertClose( rec[ ( i * N ) + j ], A0[ ( i * lda ) + j ], 1e-12, 'recA[' + i + ',' + j + ']' );
		}
	}
});
