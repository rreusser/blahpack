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
import dgeqrt2 from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const fixtureRaw = readFileSync( path.join( fixtureDir, 'dgeqrt2.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
const fixture = fixtureRaw.trim().split( '\n' ).map( function parse( line ) {
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
	let relErr, i;
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
	let i, j;
	const out = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ ( j * M ) + i ] = rows[ i ][ j ];
		}
	}
	return out;
}

/**
* Runs dgeqrt2 on the given input and verifies the output matches the fixture.
*
* @private
* @param {string} caseName - fixture case name
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Array<Array<number>>} rows - input matrix as row-major literal
* @param {number} tol - tolerance
*/
function runCase( caseName, M, N, rows, tol ) {
	const tc = findCase( caseName );
	const A = colmajor( rows, M, N );
	const T = new Float64Array( N * N );
	const info = dgeqrt2( M, N, A, 1, M, 0, T, 1, N, 0 );
	assert.strictEqual( info, tc.INFO, caseName + ': INFO' );
	assertArrayClose( A, tc.A, tol, caseName + ' A' );
	assertArrayClose( T, tc.T, tol, caseName + ' T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgeqrt2, 'function', 'main export is a function' );
});

test( 'dgeqrt2: m=4, n=3 (tall)', function t() {
	runCase( 'm4_n3', 4, 3, [
		[ 2.0, 1.0, 3.0 ],
		[ 1.0, 4.0, 2.0 ],
		[ 3.0, 2.0, 5.0 ],
		[ 1.0, 3.0, 1.0 ]
	], 1e-13 );
});

test( 'dgeqrt2: m=3, n=3 (square)', function t() {
	runCase( 'm3_n3', 3, 3, [
		[ 4.0, 1.0, 2.0 ],
		[ 1.0, 5.0, 3.0 ],
		[ 2.0, 3.0, 6.0 ]
	], 1e-13 );
});

test( 'dgeqrt2: m=5, n=2 (very tall, only two reflectors)', function t() {
	runCase( 'm5_n2', 5, 2, [
		[ 1.0, 2.0 ],
		[ 3.0, 4.0 ],
		[ 5.0, 6.0 ],
		[ 2.0, 1.0 ],
		[ 4.0, 3.0 ]
	], 1e-13 );
});

test( 'dgeqrt2: m=1, n=1 (degenerate scalar)', function t() {
	runCase( 'm1_n1', 1, 1, [ [ 7.5 ] ], 1e-13 );
});

test( 'dgeqrt2: m=3, n=1 (single column tall)', function t() {
	runCase( 'm3_n1', 3, 1, [
		[ 1.0 ],
		[ 2.0 ],
		[ 2.0 ]
	], 1e-13 );
});

test( 'dgeqrt2: m=4, n=4 (square, larger)', function t() {
	runCase( 'm4_n4', 4, 4, [
		[ 2.0, 0.5, 1.0, 0.3 ],
		[ 1.0, 3.0, 0.7, 0.4 ],
		[ 0.5, 0.8, 4.0, 0.6 ],
		[ 0.2, 0.9, 1.2, 5.0 ]
	], 1e-13 );
});

test( 'dgeqrt2: n=0 quick return', function t() {
	const A = new Float64Array( 0 );
	const T = new Float64Array( 0 );
	const info = dgeqrt2( 4, 0, A, 1, 4, 0, T, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgeqrt2: m=0, n=0 quick return', function t() {
	const A = new Float64Array( 0 );
	const T = new Float64Array( 0 );
	const info = dgeqrt2( 0, 0, A, 1, 1, 0, T, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgeqrt2: works with non-trivial offsets and strides', function t() {
	let i, j;

	const tc = findCase( 'm4_n3' );
	const LDA = 7;
	const LDT = 5;
	const offsetA = 4;
	const offsetT = 2;
	const A = new Float64Array( ( LDA * 3 ) + offsetA );
	const T = new Float64Array( ( LDT * 3 ) + offsetT );
	const rows = [
		[ 2.0, 1.0, 3.0 ],
		[ 1.0, 4.0, 2.0 ],
		[ 3.0, 2.0, 5.0 ],
		[ 1.0, 3.0, 1.0 ]
	];
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			A[ offsetA + ( j * LDA ) + i ] = rows[ i ][ j ];
		}
	}
	const info = dgeqrt2( 4, 3, A, 1, LDA, offsetA, T, 1, LDT, offsetT );
	assert.strictEqual( info, 0 );

	// Pull out the 4x3 result region:
	const Aout = new Float64Array( 12 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			Aout[ ( j * 4 ) + i ] = A[ offsetA + ( j * LDA ) + i ];
		}
	}
	const Tout = new Float64Array( 9 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			Tout[ ( j * 3 ) + i ] = T[ offsetT + ( j * LDT ) + i ];
		}
	}
	assertArrayClose( Aout, tc.A, 1e-13, 'A (with offsets)' );
	assertArrayClose( Tout, tc.T, 1e-13, 'T (with offsets)' );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeqrt2: works on a row-major matrix layout', function t() {
	let i, j;

	const tc = findCase( 'm4_n3' );
	const rows = [
		[ 2.0, 1.0, 3.0 ],
		[ 1.0, 4.0, 2.0 ],
		[ 3.0, 2.0, 5.0 ],
		[ 1.0, 3.0, 1.0 ]
	];
	const M = 4;
	const N = 3;
	const A = new Float64Array( M * N );
	const T = new Float64Array( N * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ( i * N ) + j ] = rows[ i ][ j ];
		}
	}
	const info = dgeqrt2( M, N, A, N, 1, 0, T, N, 1, 0 );
	assert.strictEqual( info, 0 );

	// Convert column-major fixture A/T to row-major for comparison.
	const Aexp = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Aexp[ ( i * N ) + j ] = tc.A[ ( j * M ) + i ];
		}
	}
	const Texp = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Texp[ ( i * N ) + j ] = tc.T[ ( j * N ) + i ];
		}
	}
	assertArrayClose( A, Aexp, 1e-13, 'A (row-major)' );
	assertArrayClose( T, Texp, 1e-13, 'T (row-major)' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		dgeqrt2( -1, 3, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		dgeqrt2( 3, -1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws when M < N', function t() {
	assert.throws( function bad() {
		dgeqrt2( 2, 4, new Float64Array( 8 ), 1, 2, 0, new Float64Array( 16 ), 1, 4, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
