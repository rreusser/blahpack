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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm22 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dorm22.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parse );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - line of JSON text
* @returns {Object} parsed object
*/
function parse( line ) {
	return JSON.parse( line );
}

/**
* Finds a named fixture case.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that two floats are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are elementwise close.
*
* @private
* @param {Object} actual - actual array
* @param {Object} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds the banded Q matrix used by the Fortran test (NQ=5, N1=3, N2=2).
*
* @private
* @returns {Float64Array} Q packed column-major, LDQ=5
*/
function buildQ532() {
	var Q = new Float64Array( 5 * 5 );

	// Column 1.
	Q[ 0 ] = 0.5;
	Q[ 1 ] = 0.2;
	Q[ 2 ] = -0.4;
	Q[ 3 ] = 0.6;
	Q[ 4 ] = 0.0;

	// Column 2.
	Q[ 5 ] = -0.3;
	Q[ 6 ] = 0.8;
	Q[ 7 ] = 0.1;
	Q[ 8 ] = -0.2;
	Q[ 9 ] = 1.3;

	// Column 3.
	Q[ 10 ] = 1.1;
	Q[ 11 ] = 0.7;
	Q[ 12 ] = -0.5;
	Q[ 13 ] = 0.3;
	Q[ 14 ] = -0.7;

	// Column 4.
	Q[ 15 ] = 0.0;
	Q[ 16 ] = 0.9;
	Q[ 17 ] = 0.4;
	Q[ 18 ] = -0.1;
	Q[ 19 ] = 0.4;

	// Column 5.
	Q[ 20 ] = 0.0;
	Q[ 21 ] = 0.0;
	Q[ 22 ] = 1.2;
	Q[ 23 ] = 0.5;
	Q[ 24 ] = 0.2;
	return Q;
}

/**
* Builds matrix C as `C(i,j) = (i-2+j)*0.25 + 0.1` (1-based), column-major, LDC=M.
*
* @private
* @param {number} M - rows
* @param {number} N - cols
* @returns {Float64Array} C packed column-major
*/
function buildCAffine( M, N ) {
	var C;
	var i;
	var j;

	C = new Float64Array( M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( ( j - 1 ) * M ) + ( i - 1 ) ] = ( ( i - 2 + j ) * 0.25 ) + 0.1;
		}
	}
	return C;
}


// TESTS //

test( 'dorm22: left, no-transpose', function t() {
	var WORK;
	var info;
	var tc;
	var n1;
	var n2;
	var M;
	var N;
	var Q;
	var C;

	tc = findCase( 'left_notrans' );
	M = 5;
	N = 4;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Float64Array( Math.max( 1, M * N ) );
	info = dorm22( 'left', 'no-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: left, transpose', function t() {
	var WORK;
	var info;
	var tc;
	var n1;
	var n2;
	var M;
	var N;
	var Q;
	var C;

	tc = findCase( 'left_trans' );
	M = 5;
	N = 4;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Float64Array( Math.max( 1, M * N ) );
	info = dorm22( 'left', 'transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: right, no-transpose', function t() {
	var WORK;
	var info;
	var tc;
	var n1;
	var n2;
	var M;
	var N;
	var Q;
	var C;

	tc = findCase( 'right_notrans' );
	M = 4;
	N = 5;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Float64Array( Math.max( 1, M * N ) );
	info = dorm22( 'right', 'no-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: right, transpose', function t() {
	var WORK;
	var info;
	var tc;
	var n1;
	var n2;
	var M;
	var N;
	var Q;
	var C;

	tc = findCase( 'right_trans' );
	M = 4;
	N = 5;
	n1 = 3;
	n2 = 2;
	Q = buildQ532();
	C = buildCAffine( M, N );
	WORK = new Float64Array( Math.max( 1, M * N ) );
	info = dorm22( 'right', 'transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: n1=0 (pure upper-triangular) left no-transpose', function t() {
	var WORK;
	var info;
	var tc;
	var n1;
	var n2;
	var M;
	var N;
	var Q;
	var C;
	var i;
	var j;

	tc = findCase( 'n1_zero_left_notrans' );
	M = 3;
	N = 4;
	n1 = 0;
	n2 = 3;
	Q = new Float64Array( 3 * 3 );
	Q[ 0 ] = 1.0;
	Q[ 3 ] = 0.5;
	Q[ 4 ] = 0.8;
	Q[ 6 ] = -0.2;
	Q[ 7 ] = 0.3;
	Q[ 8 ] = 1.2;
	C = new Float64Array( M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( ( j - 1 ) * M ) + ( i - 1 ) ] = ( i + j ) * 0.3;
		}
	}
	WORK = new Float64Array( Math.max( 1, M * N ) );
	info = dorm22( 'left', 'no-transpose', M, N, n1, n2, Q, 1, 3, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: n2=0 (pure lower-triangular) right transpose', function t() {
	var WORK;
	var info;
	var tc;
	var n1;
	var n2;
	var M;
	var N;
	var Q;
	var C;
	var i;
	var j;

	tc = findCase( 'n2_zero_right_trans' );
	M = 4;
	N = 3;
	n1 = 3;
	n2 = 0;
	Q = new Float64Array( 3 * 3 );
	Q[ 0 ] = 1.0;
	Q[ 1 ] = 0.4;
	Q[ 2 ] = -0.3;
	Q[ 4 ] = 0.9;
	Q[ 5 ] = 0.6;
	Q[ 8 ] = 1.1;
	C = new Float64Array( M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( ( j - 1 ) * M ) + ( i - 1 ) ] = ( ( i - j ) * 0.2 ) + 0.5;
		}
	}
	WORK = new Float64Array( Math.max( 1, M * N ) );
	info = dorm22( 'right', 'transpose', M, N, n1, n2, Q, 1, 3, 0, C, 1, M, 0, WORK, 1, 0, WORK.length );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: M=0 quick return', function t() {
	var WORK;
	var info;
	var Q;
	var C;

	Q = new Float64Array( 1 );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorm22( 'left', 'no-transpose', 0, 4, 0, 0, Q, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, 1 );
	assert.equal( info, 0, 'info' );
});

test( 'dorm22: N=0 quick return', function t() {
	var WORK;
	var info;
	var Q;
	var C;

	Q = new Float64Array( 25 );
	C = new Float64Array( 5 );
	WORK = new Float64Array( 5 );
	info = dorm22( 'left', 'no-transpose', 5, 0, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, WORK, 1, 0, 5 );
	assert.equal( info, 0, 'info' );
});

test( 'dorm22: insufficient lwork returns -12', function t() {
	var WORK;
	var info;
	var Q;
	var C;

	Q = buildQ532();
	C = buildCAffine( 5, 4 );
	WORK = new Float64Array( 2 );

	// With nq = M = 5, nw = 5, lwork = 2 < 5 → -12.
	info = dorm22( 'left', 'no-transpose', 5, 4, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, WORK, 1, 0, 2 );
	assert.equal( info, -12, 'info' );
});
