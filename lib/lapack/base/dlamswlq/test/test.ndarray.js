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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamswlq from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'dlamswlq.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
* Builds a column-major Float64Array of size `LD`-by-`cols` from a packed `mr`-by-`cols` source.
*
* @private
* @param {Array} packed - packed source values (length mr*cols)
* @param {NonNegativeInteger} mr - packed row count
* @param {NonNegativeInteger} cols - column count
* @param {NonNegativeInteger} LD - leading dimension of the output buffer
* @returns {Float64Array} column-major buffer of length `LD*cols`
*/
function unpack( packed, mr, cols, LD ) {
	var out;
	var i;
	var j;
	out = new Float64Array( LD * cols );
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < mr; i++ ) {
			out[ ( j * LD ) + i ] = packed[ ( j * mr ) + i ];
		}
	}
	return out;
}

/**
* Extracts the column-major contents of an `LD`-by-`cols` buffer back to packed `mr`-by-`cols` form.
*
* @private
* @param {Float64Array} buf - source buffer
* @param {NonNegativeInteger} mr - row count
* @param {NonNegativeInteger} cols - column count
* @param {NonNegativeInteger} LD - leading dimension of `buf`
* @returns {Float64Array} packed buffer
*/
function pack( buf, mr, cols, LD ) {
	var out;
	var i;
	var j;
	out = new Float64Array( mr * cols );
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < mr; i++ ) {
			out[ ( j * mr ) + i ] = buf[ ( j * LD ) + i ];
		}
	}
	return out;
}

/**
* Builds a column-major `M`-by-`N` matrix using a 1-based fill function (matches Fortran indexing).
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Function} fill - `(i, j) -> value` with 1-based indices
* @returns {Float64Array} column-major buffer
*/
function buildC( M, N, fill ) {
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
* Computes the number of column blocks for a given `(X, K, nb)` SWLQ partition (where `X` is the column count of the factored `K`-by-`X` matrix). When the routine takes the fall-through path (`nb <= K` or `nb >= X`), returns `1` so callers can size `T` accordingly.
*
* @private
* @param {NonNegativeInteger} X - columns of the factored matrix (= order of Q)
* @param {NonNegativeInteger} K - rows (= reflector count)
* @param {PositiveInteger} nb - column block size
* @returns {NonNegativeInteger} number of T blocks
*/
function numBlocks( X, K, nb ) {
	if ( nb <= K || nb >= X ) {
		return 1;
	}
	return Math.ceil( ( X - K ) / ( nb - K ) );
}

/**
* Runs a single-apply test case against the fixture.
*
* @private
* @param {Object} cfg - configuration
* @param {string} cfg.factorName - fixture name with V/T factors
* @param {string} cfg.applyName - fixture name with the expected C
* @param {string} cfg.side - `'left'` or `'right'`
* @param {string} cfg.trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} cfg.Xq - column dimension of the factored matrix (= order of Q)
* @param {NonNegativeInteger} cfg.K - reflector count (rows of the factored matrix)
* @param {PositiveInteger} cfg.mb - compact-WY inner block size
* @param {PositiveInteger} cfg.nb - SWLQ column block size
* @param {NonNegativeInteger} cfg.cM - rows of C
* @param {NonNegativeInteger} cfg.cN - columns of C
* @param {Function} cfg.fill - C fill function (1-based)
* @param {number} cfg.tol - tolerance
*/
function runApplyCase( cfg ) {
	var factor;
	var nblk;
	var work;
	var info;
	var Aco;
	var Tco;
	var Cco;
	var lwk;
	var TC;
	var tc;
	factor = findCase( cfg.factorName );
	nblk = numBlocks( cfg.Xq, cfg.K, cfg.nb );
	TC = nblk * cfg.K;
	Aco = unpack( factor.A, cfg.K, cfg.Xq, cfg.K );
	Tco = unpack( factor.T, cfg.mb, TC, cfg.mb );
	Cco = buildC( cfg.cM, cfg.cN, cfg.fill );
	lwk = ( cfg.side === 'left' ) ? Math.max( 1, cfg.nb ) * cfg.mb : Math.max( 1, cfg.cM ) * cfg.mb;
	work = new Float64Array( lwk );
	info = dlamswlq( cfg.side, cfg.trans, cfg.cM, cfg.cN, cfg.K, cfg.mb, cfg.nb, Aco, 1, cfg.K, 0, Tco, 1, cfg.mb, 0, Cco, 1, cfg.cM, 0, work, 1, 0 );
	tc = findCase( cfg.applyName );
	assert.equal( info, 0, cfg.applyName + ': info' );
	assertArrayClose( pack( Cco, cfg.cM, cfg.cN, cfg.cM ), tc.C, cfg.tol, cfg.applyName + ': C' );
}

/**
* Returns a freshly-allocated dummy buffer of length `n`.
*
* @private
* @param {NonNegativeInteger} n - length
* @returns {Float64Array} buffer
*/
function buf( n ) {
	return new Float64Array( n );
}

/**
* Fill function for case A left-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillAL( i, j ) {
	return Math.sin( i + ( 2 * j ) ) + 0.3;
}

/**
* Fill function for case A right-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillAR( i, j ) {
	return Math.cos( ( 3 * i ) + j ) + ( 0.1 * i );
}

/**
* Fill function for case B left-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillBL( i, j ) {
	return Math.sin( ( 2 * i ) + j ) + 0.5;
}

/**
* Fill function for case B right-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillBR( i, j ) {
	return Math.cos( i + ( 2 * j ) ) + 0.2;
}

/**
* Fill function for case C left-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillCL( i, j ) {
	return Math.sin( ( 5 * i ) + ( 3 * j ) ) + 0.4;
}

/**
* Fill function for case C right-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillCR( i, j ) {
	return Math.cos( ( 2 * i ) + ( 3 * j ) ) + 0.7;
}

/**
* Fill function for case D left-side C matrices.
*
* @private
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} value
*/
function fillDL( i, j ) {
	return Math.sin( i + ( 3 * j ) ) + 0.2;
}


// TESTS //

test( 'dlamswlq (case A): SIDE=L, TRANS=N applies Q*C with K=3, X=8, MB=2, NB=4', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m8_mb2_nb4',
		'applyName': 'A_left_notrans',
		'side': 'left',
		'trans': 'no-transpose',
		'Xq': 8,
		'K': 3,
		'mb': 2,
		'nb': 4,
		'cM': 8,
		'cN': 4,
		'fill': fillAL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case A): SIDE=L, TRANS=T applies Q^T*C', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m8_mb2_nb4',
		'applyName': 'A_left_trans',
		'side': 'left',
		'trans': 'transpose',
		'Xq': 8,
		'K': 3,
		'mb': 2,
		'nb': 4,
		'cM': 8,
		'cN': 4,
		'fill': fillAL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case A): SIDE=R, TRANS=N applies C*Q (5x8 C)', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m8_mb2_nb4',
		'applyName': 'A_right_notrans',
		'side': 'right',
		'trans': 'no-transpose',
		'Xq': 8,
		'K': 3,
		'mb': 2,
		'nb': 4,
		'cM': 5,
		'cN': 8,
		'fill': fillAR,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case A): SIDE=R, TRANS=T applies C*Q^T', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m8_mb2_nb4',
		'applyName': 'A_right_trans',
		'side': 'right',
		'trans': 'transpose',
		'Xq': 8,
		'K': 3,
		'mb': 2,
		'nb': 4,
		'cM': 5,
		'cN': 8,
		'fill': fillAR,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case B): KK > 0 trailing partial block, SIDE=L, TRANS=N', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m12_mb3_nb5',
		'applyName': 'B_left_notrans',
		'side': 'left',
		'trans': 'no-transpose',
		'Xq': 12,
		'K': 3,
		'mb': 3,
		'nb': 5,
		'cM': 12,
		'cN': 2,
		'fill': fillBL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case B): KK > 0, SIDE=L, TRANS=T', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m12_mb3_nb5',
		'applyName': 'B_left_trans',
		'side': 'left',
		'trans': 'transpose',
		'Xq': 12,
		'K': 3,
		'mb': 3,
		'nb': 5,
		'cM': 12,
		'cN': 2,
		'fill': fillBL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case B): KK > 0, SIDE=R, TRANS=N (4x12 C)', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m12_mb3_nb5',
		'applyName': 'B_right_notrans',
		'side': 'right',
		'trans': 'no-transpose',
		'Xq': 12,
		'K': 3,
		'mb': 3,
		'nb': 5,
		'cM': 4,
		'cN': 12,
		'fill': fillBR,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case B): KK > 0, SIDE=R, TRANS=T', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m12_mb3_nb5',
		'applyName': 'B_right_trans',
		'side': 'right',
		'trans': 'transpose',
		'Xq': 12,
		'K': 3,
		'mb': 3,
		'nb': 5,
		'cM': 4,
		'cN': 12,
		'fill': fillBR,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case C): KK == 0 even-divide, SIDE=L, TRANS=N', function t() {
	runApplyCase({
		'factorName': 'factor_k2_m10_mb2_nb4_evendiv',
		'applyName': 'C_left_notrans',
		'side': 'left',
		'trans': 'no-transpose',
		'Xq': 10,
		'K': 2,
		'mb': 2,
		'nb': 4,
		'cM': 10,
		'cN': 3,
		'fill': fillCL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case C): even-divide, SIDE=L, TRANS=T', function t() {
	runApplyCase({
		'factorName': 'factor_k2_m10_mb2_nb4_evendiv',
		'applyName': 'C_left_trans',
		'side': 'left',
		'trans': 'transpose',
		'Xq': 10,
		'K': 2,
		'mb': 2,
		'nb': 4,
		'cM': 10,
		'cN': 3,
		'fill': fillCL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case C): even-divide, SIDE=R, TRANS=N (3x10 C)', function t() {
	runApplyCase({
		'factorName': 'factor_k2_m10_mb2_nb4_evendiv',
		'applyName': 'C_right_notrans',
		'side': 'right',
		'trans': 'no-transpose',
		'Xq': 10,
		'K': 2,
		'mb': 2,
		'nb': 4,
		'cM': 3,
		'cN': 10,
		'fill': fillCR,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case C): even-divide, SIDE=R, TRANS=T', function t() {
	runApplyCase({
		'factorName': 'factor_k2_m10_mb2_nb4_evendiv',
		'applyName': 'C_right_trans',
		'side': 'right',
		'trans': 'transpose',
		'Xq': 10,
		'K': 2,
		'mb': 2,
		'nb': 4,
		'cM': 3,
		'cN': 10,
		'fill': fillCR,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case D): NB >= max(M,N,K) defers to dgemlqt, SIDE=L, TRANS=N', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m5_mb2_nb8_fall',
		'applyName': 'D_left_notrans_fall',
		'side': 'left',
		'trans': 'no-transpose',
		'Xq': 5,
		'K': 3,
		'mb': 2,
		'nb': 8,
		'cM': 5,
		'cN': 4,
		'fill': fillDL,
		'tol': 1e-12
	});
});

test( 'dlamswlq (case D): NB >= max defers to dgemlqt, SIDE=L, TRANS=T', function t() {
	runApplyCase({
		'factorName': 'factor_k3_m5_mb2_nb8_fall',
		'applyName': 'D_left_trans_fall',
		'side': 'left',
		'trans': 'transpose',
		'Xq': 5,
		'K': 3,
		'mb': 2,
		'nb': 8,
		'cM': 5,
		'cN': 4,
		'fill': fillDL,
		'tol': 1e-12
	});
});

test( 'dlamswlq: M=0 quick return', function t() {
	var info = dlamswlq( 'left', 'no-transpose', 0, 4, 0, 1, 1, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	assert.equal( info, 0, 'M=0 returns 0' );
});

test( 'dlamswlq: N=0 quick return', function t() {
	var info = dlamswlq( 'left', 'no-transpose', 4, 0, 0, 1, 1, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	assert.equal( info, 0, 'N=0 returns 0' );
});

test( 'dlamswlq: K=0 quick return', function t() {
	var info = dlamswlq( 'left', 'no-transpose', 4, 4, 0, 1, 1, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	assert.equal( info, 0, 'K=0 returns 0' );
});

test( 'dlamswlq: invalid side throws TypeError', function t() {
	assert.throws( function err() {
		dlamswlq( 'middle', 'no-transpose', 4, 4, 2, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, TypeError );
});

test( 'dlamswlq: invalid trans throws TypeError', function t() {
	assert.throws( function err() {
		dlamswlq( 'left', 'sideways', 4, 4, 2, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, TypeError );
});

test( 'dlamswlq: negative dimensions throw RangeError', function t() {
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', -1, 4, 2, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', 4, -1, 2, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', 4, 4, -1, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
});

test( 'dlamswlq: invalid block sizes throw RangeError', function t() {
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', 4, 4, 2, 0, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', 4, 4, 2, 2, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', 4, 4, 2, 5, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
});

test( 'dlamswlq: K > Q (Q = M for left, N for right) throws RangeError', function t() {
	assert.throws( function err() {
		dlamswlq( 'left', 'no-transpose', 4, 4, 5, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
	assert.throws( function err() {
		dlamswlq( 'right', 'no-transpose', 4, 4, 5, 2, 4, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 4, 0, buf( 16 ), 1, 0 );
	}, RangeError );
});
