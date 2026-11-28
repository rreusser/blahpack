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

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm22 from './../lib/ndarray.js';
import base from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dorm22.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( parse );


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
	let i;
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	let i;
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
	const Q = new Float64Array( 5 * 5 );

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
	let i, j;

	const C = new Float64Array( M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( ( j - 1 ) * M ) + ( i - 1 ) ] = ( ( i - 2 + j ) * 0.25 ) + 0.1;
		}
	}
	return C;
}


// TESTS //

test( 'dorm22: left, no-transpose', function t() {

	const tc = findCase( 'left_notrans' );
	const M = 5;
	const N = 4;
	const n1 = 3;
	const n2 = 2;
	const Q = buildQ532();
	const C = buildCAffine( M, N );
	const WORK = new Float64Array( Math.max( 1, M * N ) );
	const info = dorm22( 'left', 'no-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: left, transpose', function t() {

	const tc = findCase( 'left_trans' );
	const M = 5;
	const N = 4;
	const n1 = 3;
	const n2 = 2;
	const Q = buildQ532();
	const C = buildCAffine( M, N );
	const WORK = new Float64Array( Math.max( 1, M * N ) );
	const info = dorm22( 'left', 'transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: right, no-transpose', function t() {

	const tc = findCase( 'right_notrans' );
	const M = 4;
	const N = 5;
	const n1 = 3;
	const n2 = 2;
	const Q = buildQ532();
	const C = buildCAffine( M, N );
	const WORK = new Float64Array( Math.max( 1, M * N ) );
	const info = dorm22( 'right', 'no-transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: right, transpose', function t() {

	const tc = findCase( 'right_trans' );
	const M = 4;
	const N = 5;
	const n1 = 3;
	const n2 = 2;
	const Q = buildQ532();
	const C = buildCAffine( M, N );
	const WORK = new Float64Array( Math.max( 1, M * N ) );
	const info = dorm22( 'right', 'transpose', M, N, n1, n2, Q, 1, 5, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: n1=0 (pure upper-triangular) left no-transpose', function t() {
	let i, j;

	const tc = findCase( 'n1_zero_left_notrans' );
	const M = 3;
	const N = 4;
	const n1 = 0;
	const n2 = 3;
	const Q = new Float64Array( 3 * 3 );
	Q[ 0 ] = 1.0;
	Q[ 3 ] = 0.5;
	Q[ 4 ] = 0.8;
	Q[ 6 ] = -0.2;
	Q[ 7 ] = 0.3;
	Q[ 8 ] = 1.2;
	const C = new Float64Array( M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( ( j - 1 ) * M ) + ( i - 1 ) ] = ( i + j ) * 0.3;
		}
	}
	const WORK = new Float64Array( Math.max( 1, M * N ) );
	const info = dorm22( 'left', 'no-transpose', M, N, n1, n2, Q, 1, 3, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: n2=0 (pure lower-triangular) right transpose', function t() {
	let i, j;

	const tc = findCase( 'n2_zero_right_trans' );
	const M = 4;
	const N = 3;
	const n1 = 3;
	const n2 = 0;
	const Q = new Float64Array( 3 * 3 );
	Q[ 0 ] = 1.0;
	Q[ 1 ] = 0.4;
	Q[ 2 ] = -0.3;
	Q[ 4 ] = 0.9;
	Q[ 5 ] = 0.6;
	Q[ 8 ] = 1.1;
	const C = new Float64Array( M * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			C[ ( ( j - 1 ) * M ) + ( i - 1 ) ] = ( ( i - j ) * 0.2 ) + 0.5;
		}
	}
	const WORK = new Float64Array( Math.max( 1, M * N ) );
	const info = dorm22( 'right', 'transpose', M, N, n1, n2, Q, 1, 3, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( C, tc.c, 1e-13, 'c' );
});

test( 'dorm22: M=0 quick return', function t() {

	const Q = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorm22( 'left', 'no-transpose', 0, 4, 0, 0, Q, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dorm22: N=0 quick return', function t() {

	const Q = new Float64Array( 25 );
	const C = new Float64Array( 5 );
	const WORK = new Float64Array( 5 );
	const info = dorm22( 'left', 'no-transpose', 5, 0, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dorm22: base returns -12 for insufficient lwork', function t() {
	const Q = buildQ532();
	const C = buildCAffine( 5, 4 );
	const WORK = new Float64Array( 2 );

	// NQ = M = 5, NW = 5, LWORK = 2 < 5 means info = -12.
	const info = base( 'left', 'no-transpose', 5, 4, 3, 2, Q, 1, 5, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, -12, 'info' );
});

test( 'dorm22: ndarray rejects WORK shorter than NW = NQ (ticket 0096)', function t() {
	const Q = buildQ532();

	// The old minimum (1) was accepted, and base then returned -12 without touching C:
	assert.throws( function throws() {
		dorm22( 'left', 'no-transpose', 5, 4, 3, 2, Q, 1, 5, 0, buildCAffine( 5, 4 ), 1, 5, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		dorm22( 'left', 'no-transpose', 5, 4, 3, 2, Q, 1, 5, 0, buildCAffine( 5, 4 ), 1, 5, 0, new Float64Array( 4 ), 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		dorm22( 'right', 'transpose', 4, 5, 3, 2, Q, 1, 5, 0, buildCAffine( 4, 5 ), 1, 4, 0, new Float64Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'dorm22: WORK of exactly NW = NQ matches a full workspace (ticket 0096)', function t() {
	const sides = [ [ 'left', 5, 4 ], [ 'right', 4, 5 ] ];
	const transes = [ 'no-transpose', 'transpose' ];
	let small;
	let full;
	let info;
	let C1;
	let C2;
	let s;
	let k;
	for ( s = 0; s < sides.length; s++ ) {
		for ( k = 0; k < transes.length; k++ ) {
			C1 = buildCAffine( sides[ s ][ 1 ], sides[ s ][ 2 ] );
			C2 = buildCAffine( sides[ s ][ 1 ], sides[ s ][ 2 ] );
			small = new Float64Array( 5 );
			full = new Float64Array( 20 );
			info = dorm22( sides[ s ][ 0 ], transes[ k ], sides[ s ][ 1 ], sides[ s ][ 2 ], 3, 2, buildQ532(), 1, 5, 0, C1, 1, sides[ s ][ 1 ], 0, small, 1, 0 );
			assert.equal( info, 0, 'info (small)' );
			info = dorm22( sides[ s ][ 0 ], transes[ k ], sides[ s ][ 1 ], sides[ s ][ 2 ], 3, 2, buildQ532(), 1, 5, 0, C2, 1, sides[ s ][ 1 ], 0, full, 1, 0 );
			assert.equal( info, 0, 'info (full)' );
			assertArrayClose( C1, C2, 1e-14, sides[ s ][ 0 ] + ' ' + transes[ k ] );
		}
	}
});

test( 'dorm22: throws RangeError for negative n2', function t() {
	const Q = buildQ532();
	const C = buildCAffine( 2, 2 );
	const WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		// n1 + n2 === M with n2 < 0 passes the n1 check, so the n2 check fires:
		dorm22( 'left', 'no-transpose', 2, 2, 3, -1, Q, 1, 5, 0, C, 1, 2, 0, WORK, 1, 0 );
	}, RangeError );
});
