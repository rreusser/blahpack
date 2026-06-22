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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaswlq from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'dlaswlq.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var fixture = fixtureRaw.trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locates a fixture case by name.
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
* Asserts that an actual array is element-wise close to an expected array.
*
* @private
* @param {Float64Array} actual - computed values
* @param {Array<number>} expected - reference values
* @param {number} tol - tolerance (relative for large values, absolute for tiny)
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Builds a column-major Float64Array using a (1-based) fill function matching the Fortran test.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Function} fill - function (i, j) -> value (1-based to match Fortran)
* @returns {Float64Array} column-major flat storage
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
* Computes the number of column blocks `Number_of_row_blocks = ceil((N-M)/(NB-M))`, falling back to `1` when the routine takes the single-call path (`M >= N`, `NB <= M`, or `NB >= N`).
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {PositiveInteger} NB - column block size
* @returns {NonNegativeInteger} number of column blocks (always `>= 1`)
*/
function numBlocks( M, N, NB ) {
	if ( M >= N || NB <= M || NB >= N ) {
		return 1;
	}
	return Math.ceil( ( N - M ) / ( NB - M ) );
}

/**
* Builds a column-major Float64Array from a 2D row-major literal.
*
* @private
* @param {Array<Array<number>>} rows - row-major matrix data
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Float64Array} column-major flat storage
*/
function colmajor( rows, M, N ) {
	var out;
	var i;
	var j;
	out = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ ( j * M ) + i ] = rows[ i ][ j ];
		}
	}
	return out;
}

/**
* Runs dlaswlq on a fixture-defined case and verifies the outputs.
*
* @private
* @param {Object} cfg - case configuration
* @param {string} cfg.name - fixture case name
* @param {NonNegativeInteger} cfg.M - rows
* @param {NonNegativeInteger} cfg.N - columns
* @param {PositiveInteger} cfg.mb - inner block size
* @param {PositiveInteger} cfg.nb - column block size
* @param {Float64Array} cfg.A - prepared column-major input matrix (overwritten)
* @param {number} cfg.tol - comparison tolerance
*/
function runCase( cfg ) {
	var WORK;
	var info;
	var nblk;
	var name;
	var tc;
	var mb;
	var nb;
	var A;
	var M;
	var N;
	var T;
	name = cfg.name;
	M = cfg.M;
	N = cfg.N;
	mb = cfg.mb;
	nb = cfg.nb;
	A = cfg.A;
	tc = findCase( name );
	nblk = numBlocks( M, N, nb );
	T = new Float64Array( mb * M * nblk );
	WORK = new Float64Array( mb * M );
	info = dlaswlq( M, N, mb, nb, A, 1, M, 0, T, 1, mb, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO, name + ' INFO' );
	if ( typeof tc.NUMBLK !== 'undefined' ) {
		assert.strictEqual( nblk, tc.NUMBLK, name + ' NUMBLK' );
	}
	assertArrayClose( A, tc.A, cfg.tol, name + ' A' );
	assertArrayClose( T.subarray( 0, tc.T.length ), tc.T, cfg.tol, name + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaswlq, 'function', 'main export is a function' );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaswlq( -1, 0, 2, 4, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaswlq( 2, -1, 2, 4, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError when N < M', function t() {
	assert.throws( function throws() {
		dlaswlq( 3, 2, 2, 4, new Float64Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 6 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		dlaswlq( 2, 4, 0, 4, new Float64Array( 8 ), 1, 2, 0, new Float64Array( 8 ), 1, 1, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for mb > M (when M > 0)', function t() {
	assert.throws( function throws() {
		dlaswlq( 2, 4, 3, 4, new Float64Array( 8 ), 1, 2, 0, new Float64Array( 12 ), 1, 3, 0, new Float64Array( 6 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for nb < 0', function t() {
	assert.throws( function throws() {
		dlaswlq( 2, 4, 2, -1, new Float64Array( 8 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlaswlq: m=3, n=8, mb=2, nb=4 (basic blocked TSLQ)', function t() {
	runCase({
		'name': 'm3_n8_mb2_nb4',
		'M': 3,
		'N': 8,
		'mb': 2,
		'nb': 4,
		'A': buildA( 3, 8, function fill( i, j ) {
			if ( i === j ) {
				return 4.0 + j;
			}
			return 1.0 / ( Math.abs( i - j ) + 1 );
		}),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=2, n=10, mb=2, nb=4 (N-M divides NB-M evenly)', function t() {
	runCase({
		'name': 'm2_n10_mb2_nb4_evendiv',
		'M': 2,
		'N': 10,
		'mb': 2,
		'nb': 4,
		'A': buildA( 2, 10, function fill( i, j ) {
			if ( i === j ) {
				return 6.0 + j;
			}
			return 1.0 / ( Math.abs( i - j ) + 1 );
		}),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=3, n=4, mb=2, nb=8 (nb >= N -> dgelqt fallback)', function t() {
	runCase({
		'name': 'm3_n4_mb2_nb8_fallthrough',
		'M': 3,
		'N': 4,
		'mb': 2,
		'nb': 8,
		'A': colmajor([
			[ 2.0, 1.0, 3.0, 1.0 ],
			[ 1.0, 4.0, 2.0, 3.0 ],
			[ 3.0, 2.0, 5.0, 1.0 ]
		], 3, 4 ),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=3, n=6, mb=2, nb=3 (nb == M -> dgelqt fallback)', function t() {
	runCase({
		'name': 'm3_n6_mb2_nb3_nbeqm',
		'M': 3,
		'N': 6,
		'mb': 2,
		'nb': 3,
		'A': buildA( 3, 6, function fill( i, j ) {
			if ( i === j ) {
				return 4.0 + j;
			}
			return 1.0 / ( Math.abs( i - j ) + 2 );
		}),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=3, n=12, mb=3, nb=5 (last block triggered, KK > 0)', function t() {
	runCase({
		'name': 'm3_n12_mb3_nb5_lastblock',
		'M': 3,
		'N': 12,
		'mb': 3,
		'nb': 5,
		'A': buildA( 3, 12, function fill( i, j ) {
			if ( i === j ) {
				return 5.0 + ( j * 0.5 );
			}
			return ( ( ( ( i * 7 ) + ( j * 3 ) ) % 11 ) / 5.0 ) + 0.1;
		}),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=4, n=4, mb=2, nb=6 (square M=N -> dgelqt fallback via M>=N)', function t() {
	runCase({
		'name': 'm4_n4_mb2_nb6_square',
		'M': 4,
		'N': 4,
		'mb': 2,
		'nb': 6,
		'A': buildA( 4, 4, function fill( i, j ) {
			if ( i === j ) {
				return 5.0 + j;
			}
			return 0.5 / ( Math.abs( i - j ) + 1 );
		}),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=2, n=9, mb=1, nb=4 (single-reflector inner block size with TSLQ)', function t() {
	runCase({
		'name': 'm2_n9_mb1_nb4',
		'M': 2,
		'N': 9,
		'mb': 1,
		'nb': 4,
		'A': buildA( 2, 9, function fill( i, j ) {
			var v = ( ( ( ( i * 5 ) + ( j * 7 ) ) % 13 ) / 4.0 ) + 0.5;
			if ( i === j ) {
				v += 4.0;
			}
			return v;
		}),
		'tol': 1e-12
	});
});

test( 'dlaswlq: m=4, n=20, mb=4, nb=8 (short and wide blocked TSLQ)', function t() {
	runCase({
		'name': 'm4_n20_mb4_nb8',
		'M': 4,
		'N': 20,
		'mb': 4,
		'nb': 8,
		'A': buildA( 4, 20, function fill( i, j ) {
			var v = ( ( ( ( i * 11 ) + ( j * 5 ) ) % 17 ) / 6.0 ) + 0.2;
			if ( i === j ) {
				v += 6.0;
			}
			return v;
		}),
		'tol': 1e-11
	});
});

test( 'dlaswlq: M=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( 0 );
	T = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dlaswlq( 0, 0, 2, 4, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dlaswlq: M=0, N>0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( 0 );
	T = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dlaswlq( 0, 3, 1, 4, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dlaswlq: works with non-trivial offsets', function t() {
	var oWORK;
	var WORK;
	var info;
	var Aexp;
	var Texp;
	var nblk;
	var oA;
	var oT;
	var mb;
	var nb;
	var tc;
	var A;
	var M;
	var N;
	var T;
	var i;
	var j;
	M = 3;
	N = 8;
	mb = 2;
	nb = 4;
	oA = 5;
	oT = 7;
	oWORK = 3;
	tc = findCase( 'm3_n8_mb2_nb4' );
	nblk = numBlocks( M, N, nb );
	A = new Float64Array( ( M * N ) + oA );
	T = new Float64Array( ( mb * M * nblk ) + oT );
	WORK = new Float64Array( ( mb * M ) + oWORK );

	// Build inputs into A starting at offset.
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ oA + ( j * M ) + i ] = 4.0 + ( j + 1 );
			} else {
				A[ oA + ( j * M ) + i ] = 1.0 / ( Math.abs( ( i + 1 ) - ( j + 1 ) ) + 1 ); // eslint-disable-line max-len
			}
		}
	}
	info = dlaswlq( M, N, mb, nb, A, 1, M, oA, T, 1, mb, oT, WORK, 1, oWORK );
	assert.strictEqual( info, 0, 'INFO' );
	Aexp = tc.A;
	for ( i = 0; i < Aexp.length; i++ ) {
		assert.ok( Math.abs( A[ oA + i ] - Aexp[ i ] ) < 1e-12, 'A[' + i + ']' );
	}
	Texp = tc.T;
	for ( i = 0; i < Texp.length; i++ ) {
		assert.ok( Math.abs( T[ oT + i ] - Texp[ i ] ) < 1e-12, 'T[' + i + ']' );
	}
});
