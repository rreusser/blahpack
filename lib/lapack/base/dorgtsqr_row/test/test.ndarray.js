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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgtsqr_row from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dorgtsqr_row.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locates a test case in the fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two scalars are close in relative error.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are elementwise close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Computes the optimal LWORK for a given (N, NB).
*
* @private
* @param {NonNegativeInteger} N - matrix column count
* @param {PositiveInteger} NB - column block size
* @returns {NonNegativeInteger} workspace length
*/
function lworkOpt( N, NB ) {
	var nblocal = ( NB < N ) ? NB : N;
	return Math.max( 1, nblocal * Math.max( nblocal, N - nblocal ) );
}

/**
* Returns the count of T columns produced by DLATSQR for given dimensions.
*
* @private
* @param {NonNegativeInteger} M - matrix row count
* @param {NonNegativeInteger} N - matrix column count
* @param {PositiveInteger} MB - row block size
* @returns {NonNegativeInteger} T column count
*/
function tCols( M, N, MB ) {
	var numblk;
	if ( MB >= M ) {
		return N;
	}
	numblk = Math.ceil( ( M - N ) / ( MB - N ) );
	return numblk * N;
}

/**
* Runs a fixture-based test for `dorgtsqr_row`.
*
* @private
* @param {string} name - fixture name
* @param {NonNegativeInteger} M - matrix row count
* @param {NonNegativeInteger} N - matrix column count
* @param {PositiveInteger} MB - row block size
* @param {PositiveInteger} NB - column block size
*/
function runCase( name, M, N, MB, NB ) {
	var tcase;
	var WORK;
	var info;
	var Ain;
	var Tin;
	var tc;
	var A;
	var T;
	var i;

	tcase = findCase( name );

	// Replay the dlatsqr output from the fixture as input to dorgtsqr_row.
	Ain = tcase.Ain;
	Tin = tcase.Tin;
	tc = tCols( M, N, MB );

	// Build column-major buffers with the fixture leading dimensions M (for A) and NB (for T).
	A = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = Ain[ i ];
	}
	T = new Float64Array( NB * tc );
	for ( i = 0; i < NB * tc; i++ ) {
		T[ i ] = Tin[ i ];
	}
	WORK = new Float64Array( lworkOpt( N, NB ) );

	// Column-major: strideA1 = 1, strideA2 = M; strideT1 = 1, strideT2 = NB.
	info = dorgtsqr_row( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, WORK, 1, 0 );
	assert.equal( info, tcase.INFO, name + ': INFO' );
	assertArrayClose( A, tcase.Q, 1e-13, name + ': Q' );
}


// TESTS //

test( 'dorgtsqr_row: m8_n3_mb4_nb2 (multi row-block bottom-up sweep)', function t() {
	runCase( 'm8_n3_mb4_nb2', 8, 3, 4, 2 );
});

test( 'dorgtsqr_row: m10_n2_mb4_nb2_evendiv (M-N divides MB-N evenly)', function t() {
	runCase( 'm10_n2_mb4_nb2_evendiv', 10, 2, 4, 2 );
});

test( 'dorgtsqr_row: m4_n3_mb8_nb2_singleblock (MB > M, only top block)', function t() {
	runCase( 'm4_n3_mb8_nb2_singleblock', 4, 3, 8, 2 );
});

test( 'dorgtsqr_row: m12_n3_mb5_nb3_lastblock (KK > 0, dummy-B branch)', function t() {
	runCase( 'm12_n3_mb5_nb3_lastblock', 12, 3, 5, 3 );
});

test( 'dorgtsqr_row: m4_n4_mb6_nb2_square (square M=N, single row block)', function t() {
	runCase( 'm4_n4_mb6_nb2_square', 4, 4, 6, 2 );
});

test( 'dorgtsqr_row: m9_n2_mb4_nb1 (NB=1, single-reflector panels)', function t() {
	runCase( 'm9_n2_mb4_nb1', 9, 2, 4, 1 );
});

test( 'dorgtsqr_row: m20_n4_mb8_nb4 (tall and skinny)', function t() {
	runCase( 'm20_n4_mb8_nb4', 20, 4, 8, 4 );
});

test( 'dorgtsqr_row: m15_n3_mb6_nb3_singleblock (NB=N, KB_LAST=1)', function t() {
	runCase( 'm15_n3_mb6_nb3_singleblock', 15, 3, 6, 3 );
});

test( 'dorgtsqr_row: m0_n0_quickreturn (M=0, N=0)', function t() {
	var WORK = new Float64Array( 1 );
	var info;
	var A = new Float64Array( 1 );
	var T = new Float64Array( 1 );
	info = dorgtsqr_row( 0, 0, 4, 2, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorgtsqr_row: m5_n0_quickreturn (M>0, N=0)', function t() {
	var WORK = new Float64Array( 1 );
	var info;
	var A = new Float64Array( 5 );
	var T = new Float64Array( 1 );
	info = dorgtsqr_row( 5, 0, 4, 1, A, 1, 5, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorgtsqr_row: orthonormality of Q^T Q = I (m8_n3_mb4_nb2)', function t() {
	var expected;
	var tcase;
	var dot;
	var Q;
	var M;
	var N;
	var i;
	var j;
	var k;

	tcase = findCase( 'm8_n3_mb4_nb2' );
	Q = tcase.Q;
	M = 8;
	N = 3;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			dot = 0.0;
			for ( k = 0; k < M; k++ ) {
				dot += Q[ k + ( i * M ) ] * Q[ k + ( j * M ) ];
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( dot - expected ) < 1e-13, 'Q^T Q[' + i + ',' + j + '] = ' + dot );
		}
	}
});

test( 'dorgtsqr_row: respects offsets (column-major slice)', function t() {
	var tcase;
	var WORK;
	var Aoff;
	var Toff;
	var info;
	var pad;
	var MB;
	var NB;
	var tc;
	var M;
	var N;
	var i;

	M = 8;
	N = 3;
	MB = 4;
	NB = 2;
	pad = 5;
	tcase = findCase( 'm8_n3_mb4_nb2' );
	tc = tCols( M, N, MB );

	Aoff = new Float64Array( ( M * N ) + pad );
	for ( i = 0; i < M * N; i++ ) {
		Aoff[ pad + i ] = tcase.Ain[ i ];
	}
	Toff = new Float64Array( ( NB * tc ) + pad );
	for ( i = 0; i < NB * tc; i++ ) {
		Toff[ pad + i ] = tcase.Tin[ i ];
	}
	WORK = new Float64Array( lworkOpt( N, NB ) );
	info = dorgtsqr_row( M, N, MB, NB, Aoff, 1, M, pad, Toff, 1, NB, pad, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	for ( i = 0; i < M * N; i++ ) {
		assert.ok( Math.abs( Aoff[ pad + i ] - tcase.Q[ i ] ) < 1e-13, 'Q[' + i + ']' );
	}
});
