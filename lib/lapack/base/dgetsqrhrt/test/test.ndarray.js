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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetsqrhrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dgetsqrhrt.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line into a JS object.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Returns a fixture entry by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i += 1 ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that two scalar values are close in relative error.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are elementwise close.
*
* @private
* @param {Array|Float64Array} actual - actual array
* @param {Array|Float64Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a deterministic input matrix matching the Fortran test program (column-major M-by-N).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {number} k1 - integer coefficient on `i` in sin
* @param {number} k2 - integer coefficient on `j` in sin
* @param {number} sc - scale of cosine term
* @param {number} c1 - integer coefficient on `i` in cos
* @param {number} c2 - integer coefficient on `j` in cos (sign included)
* @param {number} diagBoost - amount added to diagonal entries
* @returns {Float64Array} packed column-major M-by-N matrix
*/
function buildSinCosMatrix( M, N, k1, k2, sc, c1, c2, diagBoost ) {
	var A = new Float64Array( M * N );
	var i;
	var j;
	for ( j = 1; j <= N; j += 1 ) {
		for ( i = 1; i <= M; i += 1 ) {
			A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = Math.sin( ( k1 * i ) + ( k2 * j ) ) + ( sc * Math.cos( ( c1 * i ) + ( c2 * j ) ) );
			if ( i === j ) {
				A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] += diagBoost;
			}
		}
	}
	return A;
}

/**
* Slices the leading `nb2`-by-`tcols` submatrix from a column-major buffer with leading dimension `LDT` into a packed array.
*
* @private
* @param {Float64Array} T - source buffer
* @param {NonNegativeInteger} LDT - leading dimension of `T`
* @param {NonNegativeInteger} nb2 - row count to extract
* @param {NonNegativeInteger} tcols - column count to extract
* @returns {Float64Array} packed `nb2`-by-`tcols` column-major matrix
*/
function packT( T, LDT, nb2, tcols ) {
	var out = new Float64Array( nb2 * tcols );
	var i;
	var j;
	for ( j = 0; j < tcols; j += 1 ) {
		for ( i = 0; i < nb2; i += 1 ) {
			out[ i + ( j * nb2 ) ] = T[ i + ( j * LDT ) ];
		}
	}
	return out;
}

/**
* Returns the column-block count `tcols` after rounding `N` up to a multiple of `nb2local`.
*
* @private
* @param {NonNegativeInteger} N - column count
* @param {NonNegativeInteger} nb2local - block width
* @returns {NonNegativeInteger} rounded-up column count
*/
function tcolsFor( N, nb2local ) {
	return ( ( ( ( N - 1 ) / nb2local ) | 0 ) + 1 ) * nb2local;
}

/**
* Runs a fixture-based test case.
*
* @private
* @param {Object} tc - fixture entry
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} mb1 - TSQR row block size
* @param {NonNegativeInteger} nb1 - TSQR column block size
* @param {NonNegativeInteger} nb2 - HRT block size
* @param {Float64Array} A - input matrix (will be modified in place)
*/
function runFixture( tc, M, N, mb1, nb1, nb2, A ) {
	var nb2local;
	var tcols;
	var WORK;
	var info;
	var T;

	nb2local = Math.min( nb2, N );
	tcols = tcolsFor( N, nb2local );
	T = new Float64Array( nb2local * tcols );
	WORK = new Float64Array( 1024 );
	info = dgetsqrhrt( M, N, mb1, nb1, nb2, A, 1, M, 0, T, 1, nb2local, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'INFO returned 0' );
	assertArrayClose( A, tc.A, 1e-12, 'A' );
	assertArrayClose( packT( T, nb2local, nb2local, tcols ), tc.T, 1e-12, 'T' );
}


// TESTS //

test( 'dgetsqrhrt (ndarray): throws for negative M', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( -1, 0, 1, 1, 1, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt (ndarray): throws for N < 0', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 2, -1, 3, 1, 1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 16 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt (ndarray): throws when M < N', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 2, 3, 4, 1, 1, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 3 ), 1, 1, 0, new Float64Array( 16 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt (ndarray): throws when mb1 <= N (N > 0)', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 4, 3, 3, 2, 2, new Float64Array( 12 ), 1, 4, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 64 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt (ndarray): throws when mb1 < 1', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 4, 3, 0, 2, 2, new Float64Array( 12 ), 1, 4, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 64 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt (ndarray): throws when nb1 < 1', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 4, 3, 4, 0, 2, new Float64Array( 12 ), 1, 4, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 64 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt (ndarray): throws when nb2 < 1', function t() {
	assert.throws( function throws() {
		dgetsqrhrt( 4, 3, 4, 2, 0, new Float64Array( 12 ), 1, 4, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 64 ), 1, 0 );
	}, RangeError );
});

test( 'dgetsqrhrt: m8_n3_mb4_nb1_2_nb2_2 (basic blocked TSQR + HRT)', function t() {
	var tc = findCase( 'm8_n3_mb4_nb1_2_nb2_2' );
	var A = buildSinCosMatrix( 8, 3, 1, 3, 0.5, 2, -1, 4.0 );
	runFixture( tc, 8, 3, 4, 2, 2, A );
});

test( 'dgetsqrhrt: m10_n2_mb4_nb1_2_nb2_1', function t() {
	var tc = findCase( 'm10_n2_mb4_nb1_2_nb2_1' );
	var A = buildSinCosMatrix( 10, 2, 2, 1, 0.3, 1, -2, 6.0 );
	runFixture( tc, 10, 2, 4, 2, 1, A );
});

test( 'dgetsqrhrt: m4_n4_mb6_square (single-block TSQR fall-through)', function t() {
	var tc = findCase( 'm4_n4_mb6_square' );
	var M = 4;
	var N = 4;
	var A = new Float64Array( M * N );
	var i;
	var j;
	for ( j = 1; j <= N; j += 1 ) {
		for ( i = 1; i <= M; i += 1 ) {
			A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = Math.sin( ( i * 3 ) + ( j * 5 ) ) + 0.2;
			if ( i === j ) {
				A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] += 5.0;
			}
		}
	}
	runFixture( tc, M, N, 6, 2, 2, A );
});

test( 'dgetsqrhrt: m12_n3_mb5_nb1_3_nb2_3 (KK > 0 partial trailing block)', function t() {
	var tc = findCase( 'm12_n3_mb5_nb1_3_nb2_3' );
	var A = buildSinCosMatrix( 12, 3, 1, 4, 0.5, 3, -1, 5.0 );
	runFixture( tc, 12, 3, 5, 3, 3, A );
});

test( 'dgetsqrhrt: m20_n5_mb8_nb1_3_nb2_2 (tall and skinny, nb2 < nb1)', function t() {
	var tc = findCase( 'm20_n5_mb8_nb1_3_nb2_2' );
	var A = buildSinCosMatrix( 20, 5, 1, 7, 0.4, 5, -2, 7.0 );
	runFixture( tc, 20, 5, 8, 3, 2, A );
});

test( 'dgetsqrhrt: m1_n1 (smallest non-trivial)', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var T;

	tc = findCase( 'm1_n1' );
	A = new Float64Array( [ 3.5 ] );
	T = new Float64Array( 1 );
	WORK = new Float64Array( 16 );
	info = dgetsqrhrt( 1, 1, 2, 1, 1, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'INFO returned 0' );
	assertArrayClose( A, tc.A, 1e-12, 'A' );
	assertArrayClose( T, tc.T, 1e-12, 'T' );
});

test( 'dgetsqrhrt: m0_n0_quickreturn', function t() {
	var info;
	var tc;

	tc = findCase( 'm0_n0_quickreturn' );
	info = dgetsqrhrt( 0, 0, 1, 1, 1, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.strictEqual( info, tc.INFO, 'INFO matches' );
});

test( 'dgetsqrhrt: m6_n6_mb7_nb1_3_nb2_4 (square N=6 with mb1 just > N)', function t() {
	var tc = findCase( 'm6_n6_mb7_nb1_3_nb2_4' );
	var M = 6;
	var N = 6;
	var A = new Float64Array( M * N );
	var i;
	var j;
	for ( j = 1; j <= N; j += 1 ) {
		for ( i = 1; i <= M; i += 1 ) {
			A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = Math.sin( ( i * 2 ) + ( j * 3 ) ) + 0.3;
			if ( i === j ) {
				A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] += 5.0;
			}
		}
	}
	runFixture( tc, M, N, 7, 3, 4, A );
});

test( 'dgetsqrhrt: A = Q*R round-trip', function t() {
	var numBlocks;
	var nb2local;
	var Aorig;
	var tcols;
	var WORK;
	var info;
	var nb2;
	var jbn;
	var QR;
	var bb;
	var jb;
	var w2;
	var M;
	var N;
	var R;
	var V;
	var A;
	var T;
	var c;
	var i;
	var j;
	var k;
	var s;
	var t;
	var u;
	var w;
	var y;

	M = 10;
	N = 4;
	nb2 = 2;
	nb2local = Math.min( nb2, N );
	tcols = tcolsFor( N, nb2local );
	Aorig = new Float64Array( M * N );
	A = new Float64Array( M * N );
	R = new Float64Array( N * N );
	V = new Float64Array( M * N );
	T = new Float64Array( nb2local * tcols );
	WORK = new Float64Array( 1024 );
	QR = new Float64Array( M * N );
	numBlocks = Math.ceil( N / nb2 );

	// Build a deterministic, well-conditioned input matrix.
	for ( j = 1; j <= N; j += 1 ) {
		for ( i = 1; i <= M; i += 1 ) {
			Aorig[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = Math.cos( ( i * 1.7 ) - ( j * 0.9 ) ) + ( 0.4 * Math.sin( ( i * 0.5 ) + j ) );
			if ( i === j ) {
				Aorig[ ( i - 1 ) + ( ( j - 1 ) * M ) ] += 4.0;
			}
		}
	}
	for ( i = 0; i < M * N; i += 1 ) {
		A[ i ] = Aorig[ i ];
	}
	info = dgetsqrhrt( M, N, 5, 2, nb2, A, 1, M, 0, T, 1, nb2local, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'INFO returned 0' );

	// Reconstruct R (upper triangle of A) and V (strict lower trapezoid with implicit unit diagonal).
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < N; i += 1 ) {
			if ( i <= j ) {
				R[ i + ( j * N ) ] = A[ i + ( j * M ) ];
			}
		}
		for ( i = 0; i < M; i += 1 ) {
			if ( i > j ) {
				V[ i + ( j * M ) ] = A[ i + ( j * M ) ];
			} else if ( i === j ) {
				V[ i + ( j * M ) ] = 1.0;
			}
		}
	}

	// Compute QR = Q * R column by column. For each column c of Aorig: y = R(:, c) padded with zeros to length M, then apply Q from the left as Q = (I - V0 T0 V0^T) * (I - V1 T1 V1^T) * ... in reverse blocked order.
	for ( c = 0; c < N; c += 1 ) {
		y = new Float64Array( M );
		for ( i = 0; i < N; i += 1 ) {
			y[ i ] = R[ i + ( c * N ) ];
		}
		for ( bb = numBlocks - 1; bb >= 0; bb -= 1 ) {
			jb = bb * nb2;
			jbn = Math.min( nb2, N - jb );

			// w = V(jb:M-1, jb:jb+jbn-1)^T * y(jb:M-1)
			w = new Float64Array( jbn );
			for ( k = 0; k < jbn; k += 1 ) {
				s = 0.0;
				for ( i = jb; i < M; i += 1 ) {
					s += V[ i + ( ( jb + k ) * M ) ] * y[ i ];
				}
				w[ k ] = s;
			}

			// w2 := T(:, jb:jb+jbn-1) * w (T is upper triangular jbn-by-jbn within the panel).
			w2 = new Float64Array( jbn );
			for ( i = 0; i < jbn; i += 1 ) {
				t = 0.0;
				for ( k = i; k < jbn; k += 1 ) {
					t += T[ i + ( ( jb + k ) * nb2local ) ] * w[ k ];
				}
				w2[ i ] = t;
			}

			// y(jb:M-1) -= V(jb:M-1, jb:jb+jbn-1) * w2
			for ( i = jb; i < M; i += 1 ) {
				u = 0.0;
				for ( k = 0; k < jbn; k += 1 ) {
					u += V[ i + ( ( jb + k ) * M ) ] * w2[ k ];
				}
				y[ i ] -= u;
			}
		}
		for ( i = 0; i < M; i += 1 ) {
			QR[ i + ( c * M ) ] = y[ i ];
		}
	}
	assertArrayClose( QR, Aorig, 1e-11, 'A = Q*R' );
});
