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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfb_gett from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlarfb_gett.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - line text
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - test case name
* @throws {Error} fixture not found
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
* Asserts that two arrays are numerically close.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Constructs a fresh `T` matrix matching the Fortran `fill_T` helper.
*
* @private
* @param {NonNegativeInteger} K - dimension
* @returns {Complex128Array} `T` as a dense K-by-K matrix (column-major)
*/
function makeT( K ) {
	var T;
	var v;
	var i;
	var j;
	T = new Complex128Array( K * K );
	v = reinterpret( T, 0 );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			v[ 2 * ( i + ( j * K ) ) ] = ( 0.1 * ( ( i + 1 ) + ( j + 1 ) ) ) + 0.5;
			v[ ( 2 * ( i + ( j * K ) ) ) + 1 ] = ( -0.07 * ( ( i + 1 ) - ( j + 1 ) ) ) + 0.1;
		}
	}
	return T;
}

/**
* Constructs a fresh `A` matrix (K-by-N, column-major) matching Fortran `fill_A`.
*
* @private
* @param {NonNegativeInteger} K - row count
* @param {NonNegativeInteger} N - column count
* @returns {Complex128Array} `A`
*/
function makeA( K, N ) {
	var A;
	var v;
	var i;
	var j;
	A = new Complex128Array( K * N );
	v = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			v[ 2 * ( i + ( j * K ) ) ] = ( 0.2 + ( 0.1 * ( i + 1 ) ) ) - ( 0.05 * ( j + 1 ) );
			v[ ( 2 * ( i + ( j * K ) ) ) + 1 ] = ( 0.3 - ( 0.04 * ( i + 1 ) ) ) + ( 0.02 * ( j + 1 ) );
		}
	}
	return A;
}

/**
* Constructs a fresh `B` matrix (M-by-N, column-major) matching Fortran `fill_B`.
*
* @private
* @param {NonNegativeInteger} M - row count
* @param {NonNegativeInteger} N - column count
* @returns {Complex128Array} `B`
*/
function makeB( M, N ) {
	var B;
	var v;
	var i;
	var j;
	B = new Complex128Array( Math.max( M, 1 ) * N );
	v = reinterpret( B, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			v[ 2 * ( i + ( j * Math.max( M, 1 ) ) ) ] = ( -0.1 + ( 0.03 * ( i + 1 ) ) ) + ( 0.07 * ( j + 1 ) );
			v[ ( 2 * ( i + ( j * Math.max( M, 1 ) ) ) ) + 1 ] = ( 0.2 + ( 0.02 * ( i + 1 ) ) ) - ( 0.04 * ( j + 1 ) );
		}
	}
	return B;
}

/**
* Runs the routine for a given case and returns the output A and B (as Float64).
*
* @private
* @param {string} ident - `'identity'` or `'not-identity'`
* @param {NonNegativeInteger} M - rows of B
* @param {NonNegativeInteger} N - columns of A/B
* @param {NonNegativeInteger} K - rows of A
* @returns {Object} `{ A, B }` — Float64Array views of output matrices
*/
function runCase( ident, M, N, K ) {
	var WORK;
	var LDB;
	var LDW;
	var A;
	var B;
	var T;

	T = makeT( K );
	A = makeA( K, N );
	B = makeB( M, N );
	LDB = Math.max( M, 1 );
	LDW = K;
	WORK = new Complex128Array( LDW * Math.max( K, N - K ) );
	zlarfb_gett( ident, M, N, K, T, 1, K, 0, A, 1, K, 0, B, 1, LDB, 0, WORK, 1, LDW, 0 );
	return {
		'A': reinterpret( A, 0 ),
		'B': reinterpret( B, 0 )
	};
}


// TESTS //

test( 'zlarfb_gett: not-identity, N > K', function t() {
	var out;
	var tc;
	tc = findCase( 'notident_nbig' );
	out = runCase( 'not-identity', 4, 5, 3 );
	assertArrayClose( out.A, tc.A, 1e-13, 'A' );
	assertArrayClose( out.B, tc.B, 1e-13, 'B' );
});

test( 'zlarfb_gett: not-identity, N = K', function t() {
	var out;
	var tc;
	tc = findCase( 'notident_nequal' );
	out = runCase( 'not-identity', 4, 3, 3 );
	assertArrayClose( out.A, tc.A, 1e-13, 'A' );
	assertArrayClose( out.B, tc.B, 1e-13, 'B' );
});

test( 'zlarfb_gett: identity, N > K', function t() {
	var out;
	var tc;
	tc = findCase( 'ident_nbig' );
	out = runCase( 'identity', 4, 5, 3 );
	assertArrayClose( out.A, tc.A, 1e-13, 'A' );
	assertArrayClose( out.B, tc.B, 1e-13, 'B' );
});

test( 'zlarfb_gett: identity, N = K', function t() {
	var out;
	var tc;
	tc = findCase( 'ident_nequal' );
	out = runCase( 'identity', 4, 3, 3 );
	assertArrayClose( out.A, tc.A, 1e-13, 'A' );
	assertArrayClose( out.B, tc.B, 1e-13, 'B' );
});

test( 'zlarfb_gett: not-identity, M = 0', function t() {
	var out;
	var tc;
	tc = findCase( 'notident_m0' );
	out = runCase( 'not-identity', 0, 5, 3 );
	assertArrayClose( out.A, tc.A, 1e-13, 'A' );
});

test( 'zlarfb_gett: identity, M = 0', function t() {
	var out;
	var tc;
	tc = findCase( 'ident_m0' );
	out = runCase( 'identity', 0, 5, 3 );
	assertArrayClose( out.A, tc.A, 1e-13, 'A' );
});

test( 'zlarfb_gett: quick return N = 0', function t() {
	var Abefore;
	var WORK;
	var A;
	var B;
	var T;

	T = makeT( 3 );
	A = makeA( 3, 3 );
	B = makeB( 2, 3 );
	Abefore = reinterpret( A, 0 ).slice();
	WORK = new Complex128Array( 9 );
	zlarfb_gett( 'not-identity', 2, 0, 3, T, 1, 3, 0, A, 1, 3, 0, B, 1, 2, 0, WORK, 1, 3, 0 );
	assertArrayClose( reinterpret( A, 0 ), Abefore, 0, 'A unchanged' );
});

test( 'zlarfb_gett: quick return K = 0', function t() {
	var Abefore;
	var WORK;
	var A;
	var B;
	var T;

	T = new Complex128Array( 1 );
	A = makeA( 1, 3 );
	B = makeB( 2, 3 );
	Abefore = reinterpret( A, 0 ).slice();
	WORK = new Complex128Array( 4 );
	zlarfb_gett( 'not-identity', 2, 3, 0, T, 1, 1, 0, A, 1, 1, 0, B, 1, 2, 0, WORK, 1, 1, 0 );
	assertArrayClose( reinterpret( A, 0 ), Abefore, 0, 'A unchanged' );
});
