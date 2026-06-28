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

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelqt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'zgelqt.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var lines = raw.trim().split( '\n' );
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL fixture line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed entry
*/
function parseLine( line ) {
	return JSON.parse( line );
}

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
* Asserts element-wise relative closeness for two numeric arrays.
*
* @private
* @param {Float64Array} actual - computed values
* @param {Array<number>} expected - reference values
* @param {NonNegativeInteger} length - number of leading entries to compare
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, length, tol, msg ) {
	var relErr;
	var i;
	for ( i = 0; i < length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Builds a compact `M`-by-`N` column-major Complex128Array from row-major literals (each entry is `[re, im]`).
*
* @private
* @param {Array<Array<Array<number>>>} rows - row-major matrix data of shape `M`-by-`N`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {Complex128Array} column-major flat storage of shape `M`-by-`N`
*/
function colmajor( rows, M, N ) {
	var out;
	var ov;
	var i;
	var j;
	out = new Complex128Array( M * N );
	ov = reinterpret( out, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ov[ 2 * ( ( j * M ) + i ) ] = rows[ i ][ j ][ 0 ];
			ov[ ( 2 * ( ( j * M ) + i ) ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	return out;
}

/**
* Runs `zgelqt` against a fixture case and verifies the resulting `A` and `T` against the full padded fixture buffers.
*
* @private
* @param {string} caseName - fixture case name
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {PositiveInteger} mb - block size
* @param {Array<Array<Array<number>>>} rows - input matrix as row-major literal (entries `[re, im]`)
* @param {number} tol - relative tolerance
*/
function runCase( caseName, M, N, mb, rows, tol ) {
	var WORK;
	var info;
	var tc;
	var k;
	var A;
	var T;
	tc = findCase( caseName );
	k = ( M < N ) ? M : N;
	A = colmajor( rows, M, N );
	T = new Complex128Array( mb * k );
	WORK = new Complex128Array( mb * N );
	info = zgelqt( M, N, mb, A, 1, M, 0, T, 1, mb, 0, WORK, 0 );
	assert.strictEqual( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 2 * M * N, tol, caseName + ' A' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 2 * mb * k, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgelqt, 'function', 'main export is a function' );
});

test( 'zgelqt: M=4, N=6, MB=2 (M < N, multiple panels)', function t() {
	runCase( 'm4_n6_mb2', 4, 6, 2, [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ], [ 0.1, 0.4 ], [ -0.3, 0.2 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ], [ -0.2, -0.4 ], [ 0.5, 0.1 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ], [ 0.1, -0.5 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ], [ 1.1, -0.2 ], [ -0.5, 0.4 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=5, N=7, MB=3 (uneven last block)', function t() {
	runCase( 'm5_n7_mb3', 5, 7, 3, [
		[ [ 5.0, 0.2 ], [ 0.7, -0.4 ], [ 0.3, 0.1 ], [ -0.1, 0.3 ], [ 0.4, -0.5 ], [ 0.2, 0.4 ], [ 0.5, -0.1 ] ],
		[ [ 0.6, -0.2 ], [ 4.5, 0.3 ], [ 0.8, -0.4 ], [ 0.5, 0.1 ], [ -0.3, 0.5 ], [ 0.7, -0.3 ], [ 0.1, 0.2 ] ],
		[ [ 0.3, 0.4 ], [ 0.4, -0.2 ], [ 5.5, 0.5 ], [ 0.9, -0.3 ], [ 0.7, 0.4 ], [ -0.2, -0.1 ], [ 0.4, 0.5 ] ],
		[ [ 0.2, -0.5 ], [ 0.5, 0.1 ], [ 0.6, -0.4 ], [ 4.8, 0.2 ], [ 1.0, -0.5 ], [ 0.3, 0.4 ], [ -0.4, 0.1 ] ],
		[ [ 0.1, 0.3 ], [ 0.3, -0.4 ], [ 0.5, 0.2 ], [ 0.7, -0.1 ], [ 5.2, 0.5 ], [ 0.9, -0.3 ], [ 0.6, 0.4 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=6, N=4, MB=2 (M > N, multiple panels with trailing update)', function t() {
	runCase( 'm6_n4_mb2', 6, 4, 2, [
		[ [ 4.0, 0.1 ], [ 0.5, -0.2 ], [ 0.3, 0.4 ], [ 0.1, -0.3 ] ],
		[ [ 0.5, 0.5 ], [ 3.5, -0.4 ], [ 0.4, 0.2 ], [ 0.2, -0.1 ] ],
		[ [ 0.2, -0.4 ], [ 0.4, 0.3 ], [ 5.0, -0.5 ], [ 0.6, 0.2 ] ],
		[ [ 0.6, 0.4 ], [ 0.3, -0.3 ], [ 0.5, 0.1 ], [ 4.5, -0.2 ] ],
		[ [ 0.1, 0.2 ], [ 0.7, -0.5 ], [ 0.2, 0.3 ], [ 0.5, -0.4 ] ],
		[ [ 0.3, -0.3 ], [ 0.2, 0.4 ], [ 0.6, -0.2 ], [ 0.4, 0.1 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=N=5, MB=2 (square)', function t() {
	runCase( 'm5_n5_mb2', 5, 5, 2, [
		[ [ 5.0, 0.1 ], [ 0.6, -0.2 ], [ 0.3, 0.3 ], [ 0.4, -0.1 ], [ 0.2, 0.4 ] ],
		[ [ 0.5, -0.3 ], [ 4.5, 0.4 ], [ 0.7, -0.2 ], [ 0.2, 0.5 ], [ -0.1, -0.4 ] ],
		[ [ 0.2, 0.5 ], [ 0.4, -0.3 ], [ 5.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ] ],
		[ [ 0.3, -0.1 ], [ 0.5, 0.4 ], [ 0.4, -0.5 ], [ 4.8, 0.3 ], [ 1.0, -0.2 ] ],
		[ [ 0.1, 0.3 ], [ 0.3, -0.4 ], [ 0.5, 0.2 ], [ 0.7, -0.1 ], [ 5.2, 0.5 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=3, N=5, MB=3 (single block; trailing update is skipped)', function t() {
	runCase( 'm3_n5_mb3', 3, 5, 3, [
		[ [ 4.0, 0.2 ], [ 1.0, -0.3 ], [ 0.5, 0.4 ], [ -0.25, 0.1 ], [ 0.75, -0.5 ] ],
		[ [ 0.5, 0.4 ], [ 3.5, -0.2 ], [ 1.2, 0.6 ], [ 0.6, -0.3 ], [ -0.4, 0.2 ] ],
		[ [ 0.3, -0.5 ], [ 0.8, 0.1 ], [ 4.5, -0.3 ], [ 1.1, 0.5 ], [ 0.9, -0.2 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=4, N=6, MB=1 (degenerate one-row panels)', function t() {
	runCase( 'm4_n6_mb1', 4, 6, 1, [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ], [ 0.1, 0.4 ], [ -0.3, 0.2 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ], [ -0.2, -0.4 ], [ 0.5, 0.1 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ], [ 0.1, -0.5 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ], [ 1.1, -0.2 ], [ -0.5, 0.4 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=1, N=4, MB=1 (single row)', function t() {
	runCase( 'm1_n4_mb1', 1, 4, 1, [
		[ [ 2.0, 0.3 ], [ 1.5, -0.4 ], [ 0.5, 0.2 ], [ -1.25, 0.6 ] ]
	], 1e-13 );
});

test( 'zgelqt: M=0 quick return', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	info = zgelqt( 0, 4, 1, A, 1, 1, 0, T, 1, 1, 0, WORK, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgelqt: N=0 quick return', function t() {
	var WORK;
	var info;
	var A;
	var T;
	A = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	info = zgelqt( 4, 0, 1, A, 1, 4, 0, T, 1, 1, 0, WORK, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgelqt: works with non-trivial offsets and strides (column-major)', function t() {
	var offsetA;
	var offsetT;
	var Aview;
	var Tview;
	var WORK;
	var info;
	var rows;
	var Aexp;
	var Texp;
	var LDA;
	var LDT;
	var mb;
	var tc;
	var A;
	var i;
	var j;
	var M;
	var N;
	var T;

	M = 4;
	N = 6;
	mb = 2;
	rows = [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ], [ 0.1, 0.4 ], [ -0.3, 0.2 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ], [ -0.2, -0.4 ], [ 0.5, 0.1 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ], [ 0.1, -0.5 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ], [ 1.1, -0.2 ], [ -0.5, 0.4 ] ]
	];
	tc = findCase( 'm4_n6_mb2' );
	LDA = 7;
	LDT = 5;
	offsetA = 9;
	offsetT = 4;
	A = new Complex128Array( ( LDA * N ) + offsetA );
	T = new Complex128Array( ( LDT * N ) + offsetT );
	WORK = new Complex128Array( mb * N );
	Aview = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aview[ 2 * ( offsetA + ( j * LDA ) + i ) ] = rows[ i ][ j ][ 0 ];
			Aview[ ( 2 * ( offsetA + ( j * LDA ) + i ) ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgelqt( M, N, mb, A, 1, LDA, offsetA, T, 1, LDT, offsetT, WORK, 0 );
	assert.strictEqual( info, 0 );

	// Compare against the compact column-major fixture (M-by-N for A; mb-by-K for T).
	Aview = reinterpret( A, 0 );
	Tview = reinterpret( T, 0 );
	Aexp = tc.A;
	Texp = tc.T;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assert.ok( Math.abs( Aview[ 2 * ( offsetA + ( j * LDA ) + i ) ] - Aexp[ 2 * ( ( j * M ) + i ) ] ) <= 1e-13, 'A[' + i + ',' + j + '] re' ); // eslint-disable-line max-len
			assert.ok( Math.abs( Aview[ ( 2 * ( offsetA + ( j * LDA ) + i ) ) + 1 ] - Aexp[ ( 2 * ( ( j * M ) + i ) ) + 1 ] ) <= 1e-13, 'A[' + i + ',' + j + '] im' ); // eslint-disable-line max-len
		}
	}
	for ( j = 0; j < Math.min( M, N ); j++ ) {
		for ( i = 0; i < mb; i++ ) {
			assert.ok( Math.abs( Tview[ 2 * ( offsetT + ( j * LDT ) + i ) ] - Texp[ 2 * ( ( j * mb ) + i ) ] ) <= 1e-13, 'T[' + i + ',' + j + '] re' ); // eslint-disable-line max-len
			assert.ok( Math.abs( Tview[ ( 2 * ( offsetT + ( j * LDT ) + i ) ) + 1 ] - Texp[ ( 2 * ( ( j * mb ) + i ) ) + 1 ] ) <= 1e-13, 'T[' + i + ',' + j + '] im' ); // eslint-disable-line max-len
		}
	}
});

test( 'zgelqt: works on a row-major matrix layout', function t() {
	var Aview;
	var Tview;
	var WORK;
	var Aexp;
	var Texp;
	var info;
	var rows;
	var mb;
	var tc;
	var A;
	var i;
	var j;
	var k;
	var M;
	var N;
	var T;

	M = 4;
	N = 6;
	mb = 2;
	k = Math.min( M, N );
	rows = [
		[ [ 3.0, 0.1 ], [ 0.6, -0.2 ], [ 0.4, 0.3 ], [ 0.2, -0.1 ], [ 0.1, 0.4 ], [ -0.3, 0.2 ] ],
		[ [ 0.5, -0.3 ], [ 4.0, 0.4 ], [ 0.7, -0.2 ], [ 0.3, 0.5 ], [ -0.2, -0.4 ], [ 0.5, 0.1 ] ],
		[ [ 0.2, 0.5 ], [ 0.5, -0.3 ], [ 3.5, 0.2 ], [ 0.8, -0.4 ], [ 0.6, 0.1 ], [ 0.1, -0.5 ] ],
		[ [ 0.4, -0.1 ], [ 0.3, 0.4 ], [ 0.5, -0.5 ], [ 4.5, 0.3 ], [ 1.1, -0.2 ], [ -0.5, 0.4 ] ]
	];
	tc = findCase( 'm4_n6_mb2' );

	// Row-major: A is M-by-N with strideA1=N, strideA2=1; T is mb-by-K with strideT1=K, strideT2=1.
	A = new Complex128Array( M * N );
	T = new Complex128Array( mb * k );
	WORK = new Complex128Array( mb * N );
	Aview = reinterpret( A, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Aview[ 2 * ( ( i * N ) + j ) ] = rows[ i ][ j ][ 0 ];
			Aview[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	info = zgelqt( M, N, mb, A, N, 1, 0, T, k, 1, 0, WORK, 0 );
	assert.strictEqual( info, 0 );

	// Convert compact column-major fixture (M-by-N for A, mb-by-K for T) to row-major.
	Aview = reinterpret( A, 0 );
	Tview = reinterpret( T, 0 );
	Aexp = new Float64Array( 2 * M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexp[ 2 * ( ( i * N ) + j ) ] = tc.A[ 2 * ( ( j * M ) + i ) ];
			Aexp[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = tc.A[ ( 2 * ( ( j * M ) + i ) ) + 1 ];
		}
	}
	Texp = new Float64Array( 2 * mb * k );
	for ( j = 0; j < k; j++ ) {
		for ( i = 0; i < mb; i++ ) {
			Texp[ 2 * ( ( i * k ) + j ) ] = tc.T[ 2 * ( ( j * mb ) + i ) ];
			Texp[ ( 2 * ( ( i * k ) + j ) ) + 1 ] = tc.T[ ( 2 * ( ( j * mb ) + i ) ) + 1 ];
		}
	}

	for ( i = 0; i < 2 * M * N; i++ ) {
		assert.ok( Math.abs( Aview[ i ] - Aexp[ i ] ) <= 1e-13, 'A[' + i + ']' );
	}
	for ( i = 0; i < 2 * mb * k; i++ ) {
		assert.ok( Math.abs( Tview[ i ] - Texp[ i ] ) <= 1e-13, 'T[' + i + ']' );
	}
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		zgelqt( -1, 3, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 3 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		zgelqt( 3, -1, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 3 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when mb is zero', function t() {
	assert.throws( function bad() {
		zgelqt( 3, 4, 0, new Complex128Array( 12 ), 1, 3, 0, new Complex128Array( 12 ), 1, 1, 0, new Complex128Array( 4 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when mb exceeds min(M,N)', function t() {
	assert.throws( function bad() {
		zgelqt( 3, 4, 4, new Complex128Array( 12 ), 1, 3, 0, new Complex128Array( 16 ), 1, 4, 0, new Complex128Array( 16 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
});
