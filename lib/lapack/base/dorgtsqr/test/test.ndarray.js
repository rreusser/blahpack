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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../../dlatsqr/lib/base.js';
import dorgtsqr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'dorgtsqr.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var fixture = fixtureRaw.trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locates a fixture case by name.
*
* @private
* @param {string} name - case name
* @throws {Error} if no case with the given name exists
* @returns {Object} fixture entry
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Asserts two arrays match within an absolute tolerance.
*
* @private
* @param {ArrayLikeObject} actual - actual values
* @param {ArrayLikeObject} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - context message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		if ( Math.abs( actual[ i ] - expected[ i ] ) > tol ) {
			assert.fail( format( '%s[%d]: expected %f, got %f', msg, i, expected[ i ], actual[ i ] ) );
		}
	}
}

/**
* Packs a column-major `LD`-by-`N` buffer into an `M`-by-`N` packed array (drops padding rows).
*
* @private
* @param {Float64Array} buf - source buffer
* @param {NonNegativeInteger} M - row count to copy
* @param {NonNegativeInteger} N - column count
* @param {NonNegativeInteger} LD - leading dimension of `buf`
* @returns {Float64Array} packed buffer of length `M*N`
*/
function pack( buf, M, N, LD ) {
	var out;
	var i;
	var j;
	out = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ ( j * M ) + i ] = buf[ ( j * LD ) + i ];
		}
	}
	return out;
}

/**
* Computes the number of TSQR row blocks for a given (M, N, mb) partition.
*
* @private
* @param {NonNegativeInteger} M - rows of the factored matrix
* @param {NonNegativeInteger} N - columns
* @param {PositiveInteger} mb - row block size
* @returns {NonNegativeInteger} number of T blocks
*/
function numBlocks( M, N, mb ) {
	if ( mb <= N || mb >= M ) {
		return 1;
	}
	return Math.ceil( ( M - N ) / ( mb - N ) );
}

/**
* Computes `Q^T*Q` for the (M-by-N) column-major matrix Q (returned as packed N-by-N column-major).
*
* @private
* @param {Float64Array} Q - column-major buffer
* @param {NonNegativeInteger} M - rows of Q
* @param {NonNegativeInteger} N - columns of Q
* @returns {Float64Array} packed N-by-N column-major Q^T*Q
*/
function gramian( Q, M, N ) {
	var out;
	var sum;
	var i;
	var j;
	var k;
	out = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sum = 0.0;
			for ( k = 0; k < M; k++ ) {
				sum += Q[ ( i * M ) + k ] * Q[ ( j * M ) + k ];
			}
			out[ ( j * N ) + i ] = sum;
		}
	}
	return out;
}

/**
* Builds a column-major `M`-by-`N` matrix using a 1-based fill function.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Function} fill - `(i, j) -> value` with 1-based indices
* @returns {Float64Array} column-major buffer of length `M*N`
*/
function buildA( M, N, fill ) {
	var out;
	var i;
	var j;
	out = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ ( j * M ) + i ] = fill( i + 1, j + 1 );
		}
	}
	return out;
}

/**
* Runs a single fixture case: factors `A` with `dlatsqr`, generates `Q` with `dorgtsqr`, and compares against the recorded `Q` and `Q^T*Q`.
*
* @private
* @param {Object} cfg - configuration
* @param {string} cfg.name - fixture name
* @param {NonNegativeInteger} cfg.M - rows
* @param {NonNegativeInteger} cfg.N - columns
* @param {PositiveInteger} cfg.mb - TSQR row block size
* @param {PositiveInteger} cfg.nb - column block size
* @param {Function} cfg.fill - `(i,j) -> value` with 1-based indices
* @param {number} cfg.tol - tolerance
*/
function runCase( cfg ) {
	var nblocal;
	var nblk;
	var work;
	var info;
	var Aco;
	var Tco;
	var TC;
	var fc;
	var Qp;
	fc = findCase( cfg.name );
	nblk = numBlocks( cfg.M, cfg.N, cfg.mb );
	TC = nblk * cfg.N;
	nblocal = ( cfg.nb < cfg.N ) ? cfg.nb : cfg.N;
	Aco = buildA( cfg.M, cfg.N, cfg.fill );
	Tco = new Float64Array( cfg.nb * TC );

	// Factor A with dlatsqr to populate the reflectors and T factors.
	work = new Float64Array( cfg.nb * cfg.N );
	info = dlatsqr( cfg.M, cfg.N, cfg.mb, cfg.nb, Aco, 1, cfg.M, 0, Tco, 1, cfg.nb, 0, work, 1, 0 );
	assert.equal( info, 0, cfg.name + ': dlatsqr info' );

	// Generate Q in place over A. dorgtsqr requires WORK of at least (M+nblocal)*N doubles. Use the LAPACK formula (M+nb)*N for safety.
	info = dorgtsqr( cfg.M, cfg.N, cfg.mb, nblocal, Aco, 1, cfg.M, 0, Tco, 1, cfg.nb, 0, new Float64Array( ( cfg.M + cfg.nb ) * cfg.N ), 1, 0 );
	assert.equal( info, 0, cfg.name + ': dorgtsqr info' );

	// Compare Q to the Fortran-produced Q.
	Qp = pack( Aco, cfg.M, cfg.N, cfg.M );
	assertArrayClose( Qp, fc.Q, cfg.tol, cfg.name + ': Q' );

	// Verify orthogonality (matches the recorded Q^T*Q).
	assertArrayClose( gramian( Aco, cfg.M, cfg.N ), fc.QtQ, cfg.tol, cfg.name + ': QtQ' );
}

/**
* Fill for test 1 (m8_n3_mb4_nb2): diagonal-dominant 8x3.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fill1( i, j ) {
	if ( i === j ) {
		return 4.0 + j;
	}
	return 1.0 / ( Math.abs( i - j ) + 1 );
}

/**
* Fill for test 2 (m10_n2_mb4_nb2_evendiv): diagonal-dominant 10x2.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fill2( i, j ) {
	if ( i === j ) {
		return 6.0 + j;
	}
	return 1.0 / ( Math.abs( i - j ) + 1 );
}

/**
* Fill for test 4 (m4_n4_mb8_nb2_square): diagonal-dominant 4x4.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fill4( i, j ) {
	if ( i === j ) {
		return 5.0 + j;
	}
	return 0.5 / ( Math.abs( i - j ) + 1 );
}

/**
* Fill for test 5 (m12_n3_mb5_nb3_lastblock): irregular 12x3.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fill5( i, j ) {
	if ( i === j ) {
		return 5.0 + ( j * 0.5 );
	}
	return ( ( ( ( i * 7 ) + ( j * 3 ) ) % 11 ) / 5.0 ) + 0.1;
}

/**
* Fill for test 6 (m9_n2_mb4_nb1): irregular 9x2.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fill6( i, j ) {
	var v = ( ( ( ( i * 5 ) + ( j * 7 ) ) % 13 ) / 4.0 ) + 0.5;
	if ( i === j ) {
		return v + 4.0;
	}
	return v;
}

/**
* Fill for test 7 (m20_n4_mb8_nb4): irregular 20x4.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fill7( i, j ) {
	var v = ( ( ( ( i * 11 ) + ( j * 5 ) ) % 17 ) / 6.0 ) + 0.2;
	if ( i === j ) {
		return v + 6.0;
	}
	return v;
}


// TESTS //

test( 'dorgtsqr: m8_n3_mb4_nb2 — non-trivial TSQR partition', function t() {
	runCase({
		'name': 'm8_n3_mb4_nb2',
		'M': 8,
		'N': 3,
		'mb': 4,
		'nb': 2,
		'fill': fill1,
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m10_n2_mb4_nb2_evendiv — M-N divides evenly', function t() {
	runCase({
		'name': 'm10_n2_mb4_nb2_evendiv',
		'M': 10,
		'N': 2,
		'mb': 4,
		'nb': 2,
		'fill': fill2,
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m4_n3_mb8_nb2_fallthrough — mb >= M (single dgemqrt path)', function t() {
	runCase({
		'name': 'm4_n3_mb8_nb2_fallthrough',
		'M': 4,
		'N': 3,
		'mb': 8,
		'nb': 2,
		'fill': function fill( i, j ) {
			var arr = [
				[ 2.0, 1.0, 3.0 ],
				[ 1.0, 4.0, 2.0 ],
				[ 3.0, 2.0, 5.0 ],
				[ 1.0, 3.0, 1.0 ]
			];
			return arr[ i - 1 ][ j - 1 ];
		},
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m4_n4_mb8_nb2_square — square matrix (M=N)', function t() {
	runCase({
		'name': 'm4_n4_mb8_nb2_square',
		'M': 4,
		'N': 4,
		'mb': 8,
		'nb': 2,
		'fill': fill4,
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m12_n3_mb5_nb3_lastblock — trailing partial block', function t() {
	runCase({
		'name': 'm12_n3_mb5_nb3_lastblock',
		'M': 12,
		'N': 3,
		'mb': 5,
		'nb': 3,
		'fill': fill5,
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m9_n2_mb4_nb1 — nb=1', function t() {
	runCase({
		'name': 'm9_n2_mb4_nb1',
		'M': 9,
		'N': 2,
		'mb': 4,
		'nb': 1,
		'fill': fill6,
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m20_n4_mb8_nb4 — tall and skinny', function t() {
	runCase({
		'name': 'm20_n4_mb8_nb4',
		'M': 20,
		'N': 4,
		'mb': 8,
		'nb': 4,
		'fill': fill7,
		'tol': 1e-12
	});
});

test( 'dorgtsqr: m0_n0_quickreturn — quick return for M=0,N=0', function t() {
	var info;
	var A = new Float64Array( 4 );
	var T = new Float64Array( 4 );
	var W = new Float64Array( 4 );
	info = dorgtsqr( 0, 0, 4, 1, A, 1, 1, 0, T, 1, 1, 0, W, 1, 0 );
	assert.equal( info, 0, 'returns 0' );
});

test( 'dorgtsqr: m5_n0_quickreturn — quick return for N=0', function t() {
	var info;
	var A = new Float64Array( 5 );
	var T = new Float64Array( 4 );
	var W = new Float64Array( 4 );
	info = dorgtsqr( 5, 0, 4, 1, A, 1, 5, 0, T, 1, 1, 0, W, 1, 0 );
	assert.equal( info, 0, 'returns 0' );
});

test( 'dorgtsqr: nb > N — clamped internally so the result still matches', function t() {
	// Factor with nb=N=2 (dlatsqr requirement), then call dorgtsqr with nb > N. Internally `nblocal = min(nb, N) = N`, so the routine still produces the same Q.
	var work;
	var info;
	var Aco;
	var Tco;
	Aco = buildA( 10, 2, fill2 );
	Tco = new Float64Array( 2 * numBlocks( 10, 2, 4 ) * 2 );
	work = new Float64Array( 2 * 2 );
	info = dlatsqr( 10, 2, 4, 2, Aco, 1, 10, 0, Tco, 1, 2, 0, work, 1, 0 );
	assert.equal( info, 0, 'dlatsqr info' );
	info = dorgtsqr( 10, 2, 4, 5, Aco, 1, 10, 0, Tco, 1, 2, 0, new Float64Array( ( 10 + 5 ) * 2 ), 1, 0 );
	assert.equal( info, 0, 'dorgtsqr info' );
	assertArrayClose( pack( Aco, 10, 2, 10 ), findCase( 'm10_n2_mb4_nb2_evendiv' ).Q, 1e-12, 'Q' );
});
