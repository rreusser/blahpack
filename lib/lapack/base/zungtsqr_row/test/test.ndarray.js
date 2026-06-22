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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-len, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatsqr from './../../zlatsqr/lib/base.js';
import zungtsqr_row from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'zungtsqr_row.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Builds a column-major Complex128Array using a (1-based) fill function matching the Fortran test.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Function} fill - function (i, j) -> [re, im] (1-based to match Fortran)
* @returns {Complex128Array} column-major flat storage
*/
function buildA( M, N, fill ) {
	var view;
	var out;
	var v;
	var i;
	var j;
	out = new Complex128Array( M * N );
	view = reinterpret( out, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			v = fill( i + 1, j + 1 );
			view[ ( ( ( j * M ) + i ) * 2 ) ] = v[ 0 ];
			view[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = v[ 1 ];
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
* Verifies that the columns of `Q` are orthonormal (`Q^H * Q == I_n`) for a column-major M-by-N matrix.
*
* @private
* @param {Complex128Array} Q - column-major M-by-N matrix
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {number} tol - per-element tolerance
* @param {string} msg - assertion message prefix
*/
function assertOrthonormalColumns( Q, M, N, tol, msg ) {
	var expected;
	var view;
	var dotR;
	var dotI;
	var aR;
	var aI;
	var bR;
	var bI;
	var i;
	var j;
	var k;
	view = reinterpret( Q, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			dotR = 0.0;
			dotI = 0.0;
			for ( k = 0; k < M; k++ ) {
				aR = view[ ( ( i * M ) + k ) * 2 ];
				aI = view[ ( ( ( i * M ) + k ) * 2 ) + 1 ];
				bR = view[ ( ( j * M ) + k ) * 2 ];
				bI = view[ ( ( ( j * M ) + k ) * 2 ) + 1 ];

				// Conjugate of column i times column j.
				dotR += ( aR * bR ) + ( aI * bI );
				dotI += ( aR * bI ) - ( aI * bR );
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( dotR - expected ) <= tol, msg + ' Q^H*Q[' + i + ',' + j + '].re: expected ' + expected + ', got ' + dotR );
			assert.ok( Math.abs( dotI ) <= tol, msg + ' Q^H*Q[' + i + ',' + j + '].im: expected 0, got ' + dotI );
		}
	}
}

/**
* Verifies that the columns of `Q` are orthonormal for a row-major M-by-N matrix (column j strided by N in row-major flat storage).
*
* @private
* @param {Complex128Array} Q - row-major M-by-N matrix
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {number} tol - per-element tolerance
* @param {string} msg - assertion message prefix
*/
function assertOrthoColsRow( Q, M, N, tol, msg ) {
	var expected;
	var view;
	var dotR;
	var dotI;
	var aR;
	var aI;
	var bR;
	var bI;
	var i;
	var j;
	var k;
	view = reinterpret( Q, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			dotR = 0.0;
			dotI = 0.0;
			for ( k = 0; k < M; k++ ) {
				aR = view[ ( ( k * N ) + i ) * 2 ];
				aI = view[ ( ( ( k * N ) + i ) * 2 ) + 1 ];
				bR = view[ ( ( k * N ) + j ) * 2 ];
				bI = view[ ( ( ( k * N ) + j ) * 2 ) + 1 ];
				dotR += ( aR * bR ) + ( aI * bI );
				dotI += ( aR * bI ) - ( aI * bR );
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( dotR - expected ) <= tol, msg + ' Q^H*Q[' + i + ',' + j + '].re: expected ' + expected + ', got ' + dotR );
			assert.ok( Math.abs( dotI ) <= tol, msg + ' Q^H*Q[' + i + ',' + j + '].im: expected 0, got ' + dotI );
		}
	}
}

/**
* Runs zungtsqr_row on a fixture-defined case and verifies the outputs.
*
* @private
* @param {Object} cfg - case configuration
*/
function runCase( cfg ) {
	var nbloc;
	var lwork;
	var WORK;
	var info;
	var name;
	var nblk;
	var Av;
	var mb;
	var nb;
	var tc;
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
	T = new Complex128Array( nb * N * nblk );
	WORK = new Complex128Array( nb * N );

	// Build V and T via zlatsqr first.
	zlatsqr( M, N, mb, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );

	// Allocate the WORK buffer required by zungtsqr_row.
	nbloc = ( nb < N ) ? nb : N;
	if ( nbloc > 0 ) {
		lwork = nbloc * Math.max( nbloc, N - nbloc );
	} else {
		lwork = 1;
	}
	WORK = new Complex128Array( Math.max( 1, lwork ) );

	info = zungtsqr_row( M, N, mb, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO, name + ' INFO' );

	Av = reinterpret( A, 0 );
	if ( tc.A.length > 0 ) {
		assertArrayClose( Av.subarray( 0, tc.A.length ), tc.A, cfg.tol, name + ' A' );
		assertOrthonormalColumns( A, M, N, cfg.tol, name + ' orthonormality' );
	}
}

/**
* Builds the A matrix for the m4_n3_mb8_nb2 case.
*
* @private
* @returns {Complex128Array} input matrix
*/
function buildA_m4_n3() {
	var entries;
	var view;
	var idx;
	var A;
	var e;
	var k;
	A = new Complex128Array( 12 );
	view = reinterpret( A, 0 );
	entries = [
		[ 1, 1, 2.0, 0.1 ],
		[ 1, 2, 1.0, -0.2 ],
		[ 1, 3, 3.0, 0.3 ],
		[ 2, 1, 1.0, -0.1 ],
		[ 2, 2, 4.0, 0.2 ],
		[ 2, 3, 2.0, -0.3 ],
		[ 3, 1, 3.0, 0.2 ],
		[ 3, 2, 2.0, 0.1 ],
		[ 3, 3, 5.0, 0.4 ],
		[ 4, 1, 1.0, -0.4 ],
		[ 4, 2, 3.0, -0.2 ],
		[ 4, 3, 1.0, 0.5 ]
	];
	for ( k = 0; k < entries.length; k++ ) {
		e = entries[ k ];
		idx = ( ( ( e[ 1 ] - 1 ) * 4 ) + ( e[ 0 ] - 1 ) ) * 2;
		view[ idx ] = e[ 2 ];
		view[ idx + 1 ] = e[ 3 ];
	}
	return A;
}

/**
* Builds a row-major copy of the column-major A.
*
* @private
* @param {Complex128Array} Acm - column-major source
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - cols
* @returns {Complex128Array} row-major copy
*/
function colToRow( Acm, M, N ) {
	var Acmv;
	var Armv;
	var idxC;
	var idxR;
	var Arm;
	var i;
	var j;
	Arm = new Complex128Array( M * N );
	Acmv = reinterpret( Acm, 0 );
	Armv = reinterpret( Arm, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idxC = ( ( j * M ) + i ) * 2;
			idxR = ( ( i * N ) + j ) * 2;
			Armv[ idxR ] = Acmv[ idxC ];
			Armv[ idxR + 1 ] = Acmv[ idxC + 1 ];
		}
	}
	return Arm;
}

/**
* Transposes a column-major (nb, ncolsT) Complex128Array to row-major (nb, ncolsT) layout.
*
* @private
* @param {Complex128Array} Tcm - column-major source
* @param {PositiveInteger} nbT - number of rows of T
* @param {PositiveInteger} ncolsT - number of columns of T
* @returns {Complex128Array} row-major copy
*/
function colToRowT( Tcm, nbT, ncolsT ) {
	var Trm = new Complex128Array( nbT * ncolsT );
	var Tcv = reinterpret( Tcm, 0 );
	var Trv = reinterpret( Trm, 0 );
	var ii;
	var jj;
	for ( jj = 0; jj < ncolsT; jj++ ) {
		for ( ii = 0; ii < nbT; ii++ ) {
			Trv[ ( ( ii * ncolsT ) + jj ) * 2 ] = Tcv[ ( ( jj * nbT ) + ii ) * 2 ];
			Trv[ ( ( ( ii * ncolsT ) + jj ) * 2 ) + 1 ] = Tcv[ ( ( ( jj * nbT ) + ii ) * 2 ) + 1 ];
		}
	}
	return Trm;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zungtsqr_row, 'function', 'main export is a function' );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungtsqr_row( -1, 0, 1, 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 4, -1, 4, 1, new Complex128Array( 4 ), 1, 4, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError when M < N', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 2, 3, 4, 1, new Complex128Array( 6 ), 1, 2, 0, new Complex128Array( 6 ), 1, 1, 0, new Complex128Array( 6 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for mb < 1', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 4, 2, 0, 1, new Complex128Array( 8 ), 1, 4, 0, new Complex128Array( 4 ), 1, 1, 0, new Complex128Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for nb < 1', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 4, 2, 3, 0, new Complex128Array( 8 ), 1, 4, 0, new Complex128Array( 4 ), 1, 1, 0, new Complex128Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for nb > N (when N > 0)', function t() {
	assert.throws( function throws() {
		zungtsqr_row( 4, 2, 3, 3, new Complex128Array( 8 ), 1, 4, 0, new Complex128Array( 6 ), 1, 3, 0, new Complex128Array( 6 ), 1, 0 );
	}, RangeError );
});

test( 'zungtsqr_row: m=8, n=3, mb=4, nb=2 (bottom-up sweep)', function t() {
	runCase({
		'name': 'm8_n3_mb4_nb2',
		'M': 8,
		'N': 3,
		'mb': 4,
		'nb': 2,
		'A': buildA( 8, 3, function fill( i, j ) {
			if ( i === j ) {
				return [ 4.0 + j, 0.1 * j ];
			}
			return [ 1.0 / ( Math.abs( i - j ) + 1 ), 0.05 * ( i - j ) ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=10, n=2, mb=4, nb=2 (even row-block division)', function t() {
	runCase({
		'name': 'm10_n2_mb4_nb2_evendiv',
		'M': 10,
		'N': 2,
		'mb': 4,
		'nb': 2,
		'A': buildA( 10, 2, function fill( i, j ) {
			if ( i === j ) {
				return [ 6.0 + j, -0.1 * j ];
			}
			return [ 1.0 / ( Math.abs( i - j ) + 1 ), 0.04 * ( i - j ) ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=4, n=3, mb=8, nb=2 (mb > m, top block only)', function t() {
	runCase({
		'name': 'm4_n3_mb8_nb2_topblockonly',
		'M': 4,
		'N': 3,
		'mb': 8,
		'nb': 2,
		'A': buildA_m4_n3(),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=6, n=3, mb=4, nb=2 (smallest blocked, mb=n+1)', function t() {
	runCase({
		'name': 'm6_n3_mb4_nb2',
		'M': 6,
		'N': 3,
		'mb': 4,
		'nb': 2,
		'A': buildA( 6, 3, function fill( i, j ) {
			if ( i === j ) {
				return [ 4.0 + j, 0.05 * j ];
			}
			return [ 1.0 / ( Math.abs( i - j ) + 2 ), 0.03 * ( i - j ) ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=12, n=3, mb=5, nb=3 (NB == N column block)', function t() {
	runCase({
		'name': 'm12_n3_mb5_nb3',
		'M': 12,
		'N': 3,
		'mb': 5,
		'nb': 3,
		'A': buildA( 12, 3, function fill( i, j ) {
			var a;
			var b;
			if ( i === j ) {
				return [ 5.0 + ( j * 0.5 ), 0.1 ];
			}
			a = ( ( ( ( i * 7 ) + ( j * 3 ) ) % 11 ) / 5.0 ) + 0.1;
			b = ( ( ( ( i * 5 ) + ( j * 2 ) ) % 7 ) / 8.0 ) - 0.3;
			return [ a, b ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=4, n=4, mb=6, nb=2 (square, mb > m)', function t() {
	runCase({
		'name': 'm4_n4_mb6_nb2_square',
		'M': 4,
		'N': 4,
		'mb': 6,
		'nb': 2,
		'A': buildA( 4, 4, function fill( i, j ) {
			if ( i === j ) {
				return [ 5.0 + j, 0.2 * j ];
			}
			return [ 0.5 / ( Math.abs( i - j ) + 1 ), 0.05 * ( i + j ) ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=9, n=2, mb=4, nb=1 (single column reflectors)', function t() {
	runCase({
		'name': 'm9_n2_mb4_nb1',
		'M': 9,
		'N': 2,
		'mb': 4,
		'nb': 1,
		'A': buildA( 9, 2, function fill( i, j ) {
			var a;
			var b;
			a = ( ( ( ( i * 5 ) + ( j * 7 ) ) % 13 ) / 4.0 ) + 0.5;
			b = ( ( ( ( i * 3 ) + ( j * 2 ) ) % 5 ) / 6.0 ) - 0.1;
			if ( i === j ) {
				a += 4.0;
			}
			return [ a, b ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=0, n=0 quick return', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zungtsqr_row( 0, 0, 1, 1, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'INFO' );
});

test( 'zungtsqr_row: m=3, n=0 quick return', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Complex128Array( 3 );
	T = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zungtsqr_row( 3, 0, 1, 1, A, 1, 3, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'INFO' );
});

test( 'zungtsqr_row: m=20, n=4, mb=8, nb=4 (tall blocked)', function t() {
	runCase({
		'name': 'm20_n4_mb8_nb4',
		'M': 20,
		'N': 4,
		'mb': 8,
		'nb': 4,
		'A': buildA( 20, 4, function fill( i, j ) {
			var a;
			var b;
			a = ( ( ( ( i * 11 ) + ( j * 5 ) ) % 17 ) / 6.0 ) + 0.2;
			b = ( ( ( ( i * 4 ) + ( j * 9 ) ) % 13 ) / 7.0 ) - 0.2;
			if ( i === j ) {
				a += 6.0;
			}
			return [ a, b ];
		}),
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: m=2, n=2, mb=3, nb=2 (dummy-B branch in top block)', function t() {
	var view;
	var A;
	A = new Complex128Array( 4 );
	view = reinterpret( A, 0 );
	view[ 0 ] = 3.0;
	view[ 1 ] = 0.2; // A(1,1)
	view[ 2 ] = 1.0;
	view[ 3 ] = 0.3; // A(2,1)
	view[ 4 ] = 1.0;
	view[ 5 ] = -0.1; // A(1,2)
	view[ 6 ] = 4.0;
	view[ 7 ] = 0.4; // A(2,2)
	runCase({
		'name': 'm2_n2_mb3_nb2_dummyB',
		'M': 2,
		'N': 2,
		'mb': 3,
		'nb': 2,
		'A': A,
		'tol': 1e-12
	});
});

test( 'zungtsqr_row: row-major layout (M=6, N=3) verifies stride symmetry', function t() {
	var WORK;
	var nblk;
	var Acm;
	var Arm;
	var Tcm;
	var Trm;
	var sa1;
	var sa2;
	var st1;
	var st2;

	// Column-major reference build of A.
	Acm = buildA( 6, 3, function fill( ii, jj ) {
		if ( ii === jj ) {
			return [ 5.0 + jj, 0.1 ];
		}
		return [ 0.4 / ( Math.abs( ii - jj ) + 1 ), 0.02 * ( ii - jj ) ];
	});
	nblk = numBlocks( 6, 3, 4 );
	Tcm = new Complex128Array( 2 * 3 * nblk );
	WORK = new Complex128Array( 2 * 3 );
	zlatsqr( 6, 3, 4, 2, Acm, 1, 6, 0, Tcm, 1, 2, 0, WORK, 1, 0 );

	// Build row-major copies of V and T.
	Arm = colToRow( Acm, 6, 3 );
	Trm = colToRowT( Tcm, 2, 3 * nblk );

	WORK = new Complex128Array( 2 * Math.max( 2, 3 - 2 ) );
	sa1 = 3;
	sa2 = 1;
	st1 = 3 * nblk;
	st2 = 1;
	zungtsqr_row( 6, 3, 4, 2, Arm, sa1, sa2, 0, Trm, st1, st2, 0, WORK, 1, 0 );

	assertOrthoColsRow( Arm, 6, 3, 1e-12, 'row-major' );
});
