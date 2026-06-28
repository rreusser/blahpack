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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatsqr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'dlatsqr.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
* Computes the number of row blocks `Number_of_row_blocks = ceil((M-N)/(MB-N))`, falling back to `1` when the routine takes the single-call path (`MB <= N` or `MB >= M`).
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {PositiveInteger} MB - row block size
* @returns {NonNegativeInteger} number of row blocks (always `>= 1`)
*/
function numBlocks( M, N, MB ) {
	if ( MB <= N || MB >= M ) {
		return 1;
	}
	return Math.ceil( ( M - N ) / ( MB - N ) );
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
* Runs dlatsqr on a fixture-defined case and verifies the outputs.
*
* @private
* @param {Object} cfg - case configuration
* @param {string} cfg.name - fixture case name
* @param {NonNegativeInteger} cfg.M - rows
* @param {NonNegativeInteger} cfg.N - columns
* @param {PositiveInteger} cfg.mb - row block size
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
	nblk = numBlocks( M, N, mb );
	T = new Float64Array( nb * N * nblk );
	WORK = new Float64Array( nb * N );
	info = dlatsqr( M, N, mb, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO, name + ' INFO' );
	if ( typeof tc.NUMBLK !== 'undefined' ) {
		assert.strictEqual( nblk, tc.NUMBLK, name + ' NUMBLK' );
	}
	assertArrayClose( A, tc.A, cfg.tol, name + ' A' );
	assertArrayClose( T.subarray( 0, tc.T.length ), tc.T, cfg.tol, name + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlatsqr, 'function', 'main export is a function' );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlatsqr( -1, 0, 4, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatsqr( 4, -1, 4, 1, new Float64Array( 4 ), 1, 4, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError when M < N', function t() {
	assert.throws( function throws() {
		dlatsqr( 2, 3, 4, 1, new Float64Array( 6 ), 1, 2, 0, new Float64Array( 6 ), 1, 1, 0, new Float64Array( 6 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		dlatsqr( 4, 2, 0, 1, new Float64Array( 8 ), 1, 4, 0, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		dlatsqr( 4, 2, 2, 0, new Float64Array( 8 ), 1, 4, 0, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for nb > N (when N > 0)', function t() {
	assert.throws( function throws() {
		dlatsqr( 4, 2, 2, 3, new Float64Array( 8 ), 1, 4, 0, new Float64Array( 6 ), 1, 3, 0, new Float64Array( 6 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlatsqr: m=8, n=3, mb=4, nb=2 (basic blocked TSQR)', function t() {
	runCase({
		'name': 'm8_n3_mb4_nb2',
		'M': 8,
		'N': 3,
		'mb': 4,
		'nb': 2,
		'A': buildA( 8, 3, function fill( i, j ) {
			if ( i === j ) {
				return 4.0 + j;
			}
			return 1.0 / ( Math.abs( i - j ) + 1 );
		}),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=10, n=2, mb=4, nb=2 (M-N divides MB-N evenly)', function t() {
	runCase({
		'name': 'm10_n2_mb4_nb2_evendiv',
		'M': 10,
		'N': 2,
		'mb': 4,
		'nb': 2,
		'A': buildA( 10, 2, function fill( i, j ) {
			if ( i === j ) {
				return 6.0 + j;
			}
			return 1.0 / ( Math.abs( i - j ) + 1 );
		}),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=4, n=3, mb=8, nb=2 (mb >= M -> dgeqrt fallback)', function t() {
	runCase({
		'name': 'm4_n3_mb8_nb2_fallthrough',
		'M': 4,
		'N': 3,
		'mb': 8,
		'nb': 2,
		'A': colmajor([
			[ 2.0, 1.0, 3.0 ],
			[ 1.0, 4.0, 2.0 ],
			[ 3.0, 2.0, 5.0 ],
			[ 1.0, 3.0, 1.0 ]
		], 4, 3 ),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=6, n=3, mb=3, nb=2 (mb == N -> dgeqrt fallback)', function t() {
	runCase({
		'name': 'm6_n3_mb3_nb2_mbeqn',
		'M': 6,
		'N': 3,
		'mb': 3,
		'nb': 2,
		'A': buildA( 6, 3, function fill( i, j ) {
			if ( i === j ) {
				return 4.0 + j;
			}
			return 1.0 / ( Math.abs( i - j ) + 2 );
		}),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=12, n=3, mb=5, nb=3 (last block triggered, KK > 0)', function t() {
	runCase({
		'name': 'm12_n3_mb5_nb3_lastblock',
		'M': 12,
		'N': 3,
		'mb': 5,
		'nb': 3,
		'A': buildA( 12, 3, function fill( i, j ) {
			if ( i === j ) {
				return 5.0 + ( j * 0.5 );
			}
			return ( ( ( ( i * 7 ) + ( j * 3 ) ) % 11 ) / 5.0 ) + 0.1;
		}),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=4, n=4, mb=6, nb=2 (square M=N -> dgeqrt fallback via mb>=M)', function t() {
	runCase({
		'name': 'm4_n4_mb6_nb2_square',
		'M': 4,
		'N': 4,
		'mb': 6,
		'nb': 2,
		'A': buildA( 4, 4, function fill( i, j ) {
			if ( i === j ) {
				return 5.0 + j;
			}
			return 0.5 / ( Math.abs( i - j ) + 1 );
		}),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=9, n=2, mb=4, nb=1 (single-reflector block size with TSQR)', function t() {
	runCase({
		'name': 'm9_n2_mb4_nb1',
		'M': 9,
		'N': 2,
		'mb': 4,
		'nb': 1,
		'A': buildA( 9, 2, function fill( i, j ) {
			var v = ( ( ( ( i * 5 ) + ( j * 7 ) ) % 13 ) / 4.0 ) + 0.5;
			if ( i === j ) {
				v += 4.0;
			}
			return v;
		}),
		'tol': 1e-12
	});
});

test( 'dlatsqr: m=20, n=4, mb=8, nb=4 (tall blocked TSQR)', function t() {
	runCase({
		'name': 'm20_n4_mb8_nb4',
		'M': 20,
		'N': 4,
		'mb': 8,
		'nb': 4,
		'A': buildA( 20, 4, function fill( i, j ) {
			var v = ( ( ( ( i * 11 ) + ( j * 5 ) ) % 17 ) / 6.0 ) + 0.2;
			if ( i === j ) {
				v += 6.0;
			}
			return v;
		}),
		'tol': 1e-11
	});
});

test( 'dlatsqr: M=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( 0 );
	T = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dlatsqr( 0, 0, 4, 1, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dlatsqr: N=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( 0 );
	T = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dlatsqr( 3, 0, 4, 1, A, 1, 3, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dlatsqr: works with non-trivial offsets', function t() {
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
	M = 8;
	N = 3;
	mb = 4;
	nb = 2;
	oA = 5;
	oT = 7;
	oWORK = 3;
	tc = findCase( 'm8_n3_mb4_nb2' );
	nblk = numBlocks( M, N, mb );
	A = new Float64Array( ( M * N ) + oA );
	T = new Float64Array( ( nb * N * nblk ) + oT );
	WORK = new Float64Array( ( nb * N ) + oWORK );

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
	info = dlatsqr( M, N, mb, nb, A, 1, M, oA, T, 1, nb, oT, WORK, 1, oWORK );
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
