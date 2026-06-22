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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlaqz2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion label
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
* Builds the initial upper-Hessenberg `A`.
*
* @private
* @param {number} N - matrix order
* @returns {Float64Array} `A` (column-major)
*/
function initA( N ) {
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i <= j + 1 ) {
				A[ i + ( j * N ) ] = 1.0 + ( 0.1 * ( ( i + 1 ) + ( 2 * ( j + 1 ) ) ) ) + ( 0.03 * ( i + 1 ) * ( j + 1 ) );
			}
		}
	}
	return A;
}

/**
* Builds the initial upper-triangular `B`.
*
* @private
* @param {number} N - matrix order
* @returns {Float64Array} `B` (column-major)
*/
function initB( N ) {
	var B = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i <= j ) {
				B[ i + ( j * N ) ] = 2.0 + ( 0.2 * ( j - i ) ) + ( 0.05 * ( j + 1 ) );
			}
		}
	}
	return B;
}

/**
* Builds the N-by-N identity (column-major).
*
* @private
* @param {number} N - matrix order
* @returns {Float64Array} identity
*/
function eye( N ) {
	var M = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		M[ i + ( i * N ) ] = 1.0;
	}
	return M;
}


// CONSTANTS //

var N = 8;
var TOL = 1e-12;


// TESTS //

test( 'dlaqz2: normal_k1_qz (ilq=ilz=true)', function t() {
	var tc = findCase( 'normal_k1_qz' );
	var A = initA( N );
	var B = initB( N );
	var Q = eye( N );
	var Z = eye( N );
	A[ 2 + ( 0 * N ) ] = 0.4;
	A[ 2 + ( 1 * N ) ] = 0.3;
	B[ 1 + ( 0 * N ) ] = 0.5;
	B[ 2 + ( 0 * N ) ] = 0.7;
	B[ 2 + ( 1 * N ) ] = 0.6;
	dlaqz2( true, true, 0, 0, N - 1, N - 1, A, 1, N, 0, B, 1, N, 0, N, 0, Q, 1, N, 0, N, 0, Z, 1, N, 0 );
	assertArrayClose( A, tc.A, TOL, 'A' );
	assertArrayClose( B, tc.B, TOL, 'B' );
	assertArrayClose( Q, tc.Q, TOL, 'Q' );
	assertArrayClose( Z, tc.Z, TOL, 'Z' );
});

test( 'dlaqz2: normal_k2_noqz (ilq=ilz=false)', function t() {
	var tc = findCase( 'normal_k2_noqz' );
	var A = initA( N );
	var B = initB( N );
	var Q = eye( N );
	var Z = eye( N );
	A[ 3 + ( 1 * N ) ] = 0.35;
	A[ 3 + ( 2 * N ) ] = 0.25;
	B[ 2 + ( 1 * N ) ] = 0.45;
	B[ 3 + ( 1 * N ) ] = 0.55;
	B[ 3 + ( 2 * N ) ] = 0.5;
	dlaqz2( false, false, 1, 0, N - 1, N - 1, A, 1, N, 0, B, 1, N, 0, N, 0, Q, 1, N, 0, N, 0, Z, 1, N, 0 );
	assertArrayClose( A, tc.A, TOL, 'A' );
	assertArrayClose( B, tc.B, TOL, 'B' );
	assertArrayClose( Q, tc.Q, TOL, 'Q' );
	assertArrayClose( Z, tc.Z, TOL, 'Z' );
});

test( 'dlaqz2: edge_k3_ihi5 (k+2 == ihi, ilq=ilz=true)', function t() {
	var tc = findCase( 'edge_k3_ihi5' );
	var A = initA( N );
	var B = initB( N );
	var Q = eye( N );
	var Z = eye( N );
	A[ 4 + ( 2 * N ) ] = 0.35;
	A[ 4 + ( 3 * N ) ] = 0.3;
	B[ 3 + ( 2 * N ) ] = 0.4;
	B[ 4 + ( 2 * N ) ] = 0.6;
	B[ 4 + ( 3 * N ) ] = 0.45;
	dlaqz2( true, true, 2, 0, N - 1, 4, A, 1, N, 0, B, 1, N, 0, N, 0, Q, 1, N, 0, N, 0, Z, 1, N, 0 );
	assertArrayClose( A, tc.A, TOL, 'A' );
	assertArrayClose( B, tc.B, TOL, 'B' );
	assertArrayClose( Q, tc.Q, TOL, 'Q' );
	assertArrayClose( Z, tc.Z, TOL, 'Z' );
});

test( 'dlaqz2: normal_narrow_qonly (narrow istopm, ilq=true, ilz=false)', function t() {
	var tc = findCase( 'normal_narrow_qonly' );
	var A = initA( N );
	var B = initB( N );
	var Q = eye( N );
	var Z = eye( N );
	A[ 2 + ( 0 * N ) ] = 0.4;
	A[ 2 + ( 1 * N ) ] = 0.3;
	B[ 1 + ( 0 * N ) ] = 0.5;
	B[ 2 + ( 0 * N ) ] = 0.7;
	B[ 2 + ( 1 * N ) ] = 0.6;
	dlaqz2( true, false, 0, 0, 4, N - 1, A, 1, N, 0, B, 1, N, 0, N, 0, Q, 1, N, 0, N, 0, Z, 1, N, 0 );
	assertArrayClose( A, tc.A, TOL, 'A' );
	assertArrayClose( B, tc.B, TOL, 'B' );
	assertArrayClose( Q, tc.Q, TOL, 'Q' );
	assertArrayClose( Z, tc.Z, TOL, 'Z' );
});
