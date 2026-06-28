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
import dgeqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'dgeqrt.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
* Runs dgeqrt on the given input and verifies the output matches the fixture.
*
* @private
* @param {string} caseName - fixture case name
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {PositiveInteger} nb - block size
* @param {Array<Array<number>>} rows - input matrix as row-major literal
* @param {number} tol - tolerance
*/
function runCase( caseName, M, N, nb, rows, tol ) {
	var WORK;
	var info;
	var tc;
	var A;
	var K;
	var T;
	tc = findCase( caseName );
	K = ( M < N ) ? M : N;
	A = colmajor( rows, M, N );
	T = new Float64Array( nb * K );
	WORK = new Float64Array( nb * N );
	info = dgeqrt( M, N, nb, A, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( A, tc.A, tol, caseName + ' A' );
	assertArrayClose( T, tc.T, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgeqrt, 'function', 'main export is a function' );
});

test( 'dgeqrt: m=4, n=3, nb=2 (blocked tall)', function t() {
	runCase( 'm4_n3_nb2', 4, 3, 2, [
		[ 2.0, 1.0, 3.0 ],
		[ 1.0, 4.0, 2.0 ],
		[ 3.0, 2.0, 5.0 ],
		[ 1.0, 3.0, 1.0 ]
	], 1e-13 );
});

test( 'dgeqrt: m=3, n=3, nb=3 (single block, square)', function t() {
	runCase( 'm3_n3_nb3', 3, 3, 3, [
		[ 4.0, 1.0, 2.0 ],
		[ 1.0, 5.0, 3.0 ],
		[ 2.0, 3.0, 6.0 ]
	], 1e-13 );
});

test( 'dgeqrt: m=5, n=2, nb=1 (single-reflector blocks)', function t() {
	runCase( 'm5_n2_nb1', 5, 2, 1, [
		[ 1.0, 2.0 ],
		[ 3.0, 4.0 ],
		[ 5.0, 6.0 ],
		[ 2.0, 1.0 ],
		[ 4.0, 3.0 ]
	], 1e-13 );
});

test( 'dgeqrt: m=1, n=1, nb=1 (degenerate scalar)', function t() {
	runCase( 'm1_n1_nb1', 1, 1, 1, [ [ 7.5 ] ], 1e-13 );
});

test( 'dgeqrt: m=3, n=1, nb=1 (single column)', function t() {
	runCase( 'm3_n1_nb1', 3, 1, 1, [
		[ 1.0 ],
		[ 2.0 ],
		[ 2.0 ]
	], 1e-13 );
});

test( 'dgeqrt: m=4, n=4, nb=2 (multiple equal blocks)', function t() {
	runCase( 'm4_n4_nb2', 4, 4, 2, [
		[ 2.0, 0.5, 1.0, 0.3 ],
		[ 1.0, 3.0, 0.7, 0.4 ],
		[ 0.5, 0.8, 4.0, 0.6 ],
		[ 0.2, 0.9, 1.2, 5.0 ]
	], 1e-13 );
});

test( 'dgeqrt: m=6, n=4, nb=3 (last block smaller than nb)', function t() {
	var rows;
	var i;
	var j;
	rows = [];
	for ( i = 0; i < 6; i++ ) {
		rows.push( [] );
		for ( j = 0; j < 4; j++ ) {
			if ( i === j ) {
				rows[ i ].push( 5.0 + ( j + 1 ) );
			} else {
				rows[ i ].push( 1.0 / ( Math.abs( i - j ) + 1 ) );
			}
		}
	}
	runCase( 'm6_n4_nb3', 6, 4, 3, rows, 1e-13 );
});

test( 'dgeqrt: m=3, n=5, nb=2 (wide matrix M < N)', function t() {
	runCase( 'm3_n5_nb2', 3, 5, 2, [
		[ 3.0, 1.0, 2.0, 0.5, 0.3 ],
		[ 1.0, 4.0, 0.7, 1.5, 0.4 ],
		[ 0.5, 0.8, 5.0, 0.6, 1.1 ]
	], 1e-13 );
});

test( 'dgeqrt: m=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( 0 );
	T = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dgeqrt( 0, 3, 1, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgeqrt: n=0 quick return', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( 0 );
	T = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dgeqrt( 3, 0, 1, A, 1, 3, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgeqrt: works with non-trivial offsets and strides', function t() {
	var offsetWork;
	var offsetA;
	var offsetT;
	var info;
	var WORK;
	var rows;
	var Aout;
	var Tout;
	var LDA;
	var LDT;
	var nb;
	var tc;
	var M;
	var N;
	var K;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n3_nb2' );
	M = 4;
	N = 3;
	nb = 2;
	K = 3;
	LDA = 7;
	LDT = 4;
	offsetA = 5;
	offsetT = 3;
	offsetWork = 2;
	A = new Float64Array( ( LDA * N ) + offsetA );
	T = new Float64Array( ( LDT * K ) + offsetT );
	WORK = new Float64Array( ( nb * N ) + offsetWork );
	rows = [
		[ 2.0, 1.0, 3.0 ],
		[ 1.0, 4.0, 2.0 ],
		[ 3.0, 2.0, 5.0 ],
		[ 1.0, 3.0, 1.0 ]
	];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ offsetA + ( j * LDA ) + i ] = rows[ i ][ j ];
		}
	}
	info = dgeqrt( M, N, nb, A, 1, LDA, offsetA, T, 1, LDT, offsetT, WORK, 1, offsetWork ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );

	// Pull out the M-by-N region of A.
	Aout = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aout[ ( j * M ) + i ] = A[ offsetA + ( j * LDA ) + i ];
		}
	}
	// Pull out the nb-by-K region of T.
	Tout = new Float64Array( nb * K );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < nb; i++ ) {
			Tout[ ( j * nb ) + i ] = T[ offsetT + ( j * LDT ) + i ];
		}
	}
	assertArrayClose( Aout, tc.A, 1e-13, 'A (with offsets)' );
	assertArrayClose( Tout, tc.T, 1e-13, 'T (with offsets)' );
});

test( 'dgeqrt: works on a row-major matrix layout', function t() {
	var WORK;
	var Aexp;
	var Texp;
	var rows;
	var info;
	var nb;
	var tc;
	var M;
	var N;
	var K;
	var A;
	var T;
	var i;
	var j;

	tc = findCase( 'm4_n3_nb2' );
	rows = [
		[ 2.0, 1.0, 3.0 ],
		[ 1.0, 4.0, 2.0 ],
		[ 3.0, 2.0, 5.0 ],
		[ 1.0, 3.0, 1.0 ]
	];
	M = 4;
	N = 3;
	nb = 2;
	K = 3;
	A = new Float64Array( M * N );
	T = new Float64Array( nb * K );
	WORK = new Float64Array( nb * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ( i * N ) + j ] = rows[ i ][ j ];
		}
	}
	// Row-major: strideA1=N, strideA2=1; T row-major: strideT1=K, strideT2=1.
	info = dgeqrt( M, N, nb, A, N, 1, 0, T, K, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );

	// Convert column-major fixture A/T to row-major for comparison.
	Aexp = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexp[ ( i * N ) + j ] = tc.A[ ( j * M ) + i ];
		}
	}
	Texp = new Float64Array( nb * K );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < nb; i++ ) {
			Texp[ ( i * K ) + j ] = tc.T[ ( j * nb ) + i ];
		}
	}
	assertArrayClose( A, Aexp, 1e-13, 'A (row-major)' );
	assertArrayClose( T, Texp, 1e-13, 'T (row-major)' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		dgeqrt( -1, 3, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 3 ), 1, 1, 0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		dgeqrt( 3, -1, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 3 ), 1, 1, 0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when nb < 1', function t() {
	assert.throws( function bad() {
		dgeqrt( 3, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when nb > min(M,N)', function t() {
	assert.throws( function bad() {
		dgeqrt( 3, 3, 4, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 12 ), 1, 4, 0, new Float64Array( 12 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: nb=min(M,N) accepted at boundary', function t() {
	var info;
	var WORK;
	var A;
	var T;
	A = new Float64Array( [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ] );
	T = new Float64Array( 9 );
	WORK = new Float64Array( 9 );
	info = dgeqrt( 4, 3, 3, A, 1, 4, 0, T, 1, 3, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});
