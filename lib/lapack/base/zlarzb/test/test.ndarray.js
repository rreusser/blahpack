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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarzb from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlarzb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Looks up a fixture test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;

	out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two values are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var denom;
	var err;

	denom = Math.max( Math.abs( expected ), 1.0 );
	err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are approximately equal element-wise.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a K-by-L matrix V (column-major, leading dim K) for the standard test fixture.
*
* @private
* @param {NonNegativeInteger} K - number of rows
* @param {NonNegativeInteger} L - number of columns
* @returns {Complex128Array} V
*/
function buildV( K, L ) {
	var data;
	var idx;
	var Vv;
	var V;
	var i;
	var j;

	// Fortran test values V(i,j) (1-based), indexed as data[row][col]:
	data = [
		[ [ 0.2, 0.1 ], [ -0.1, 0.3 ], [ 0.3, -0.2 ] ],
		[ [ 0.4, -0.3 ], [ 0.5, 0.2 ], [ -0.2, 0.4 ] ]
	];
	V = new Complex128Array( K * L );
	Vv = reinterpret( V, 0 );

	// Column-major: strideV1=1 (row), strideV2=K (col)
	for ( j = 0; j < L; j += 1 ) {
		for ( i = 0; i < K; i += 1 ) {
			idx = ( ( j * K ) + i ) * 2;
			Vv[ idx ] = data[ i ][ j ][ 0 ];
			Vv[ idx + 1 ] = data[ i ][ j ][ 1 ];
		}
	}
	return V;
}

/**
* Builds the K-by-K lower triangular T from the standard test fixture.
*
* @private
* @param {NonNegativeInteger} K - dimension
* @returns {Complex128Array} T
*/
function buildT( K ) {
	var Tv;
	var T;

	// Column-major K-by-K lower triangular with T(1,1)=(0.7,0.1), T(2,1)=(0.3,-0.2), T(2,2)=(0.5,0.3).
	T = new Complex128Array( K * K );
	Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 0.7;
	Tv[ 1 ] = 0.1;
	if ( K >= 2 ) {
		Tv[ 2 ] = 0.3;
		Tv[ 3 ] = -0.2;
		Tv[ 4 + 2 ] = 0.5;
		Tv[ 4 + 3 ] = 0.3;
	}
	return T;
}

/**
* Builds the M-by-N test C matrix with entries `C(i,j)=(i+0.1_j, 0.05_i*j)`. 1-based indices.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Complex128Array} C
*/
function buildC( M, N ) {
	var idx;
	var Cv;
	var C;
	var i;
	var j;

	C = new Complex128Array( M * N );
	Cv = reinterpret( C, 0 );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			idx = ( (j * M) + i ) * 2;
			Cv[ idx ] = ( i + 1 ) + ( 0.1 * ( j + 1 ) );
			Cv[ idx + 1 ] = 0.05 * ( i + 1 ) * ( j + 1 );
		}
	}
	return C;
}


// TESTS //

test( 'zlarzb: SIDE=left, TRANS=no-transpose, M=5 N=4 K=2 L=3', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;

	tc = findCase( 'left_notrans_m5_n4_k2_l3' );
	M = 5;
	N = 4;
	K = 2;
	L = 3;
	V = buildV( K, L );
	T = buildT( K );
	C = buildC( M, N );
	WORK = new Complex128Array( N * K );
	zlarzb( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, N, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: SIDE=left, TRANS=conjugate-transpose, M=5 N=4 K=2 L=3', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;

	tc = findCase( 'left_ctrans_m5_n4_k2_l3' );
	M = 5;
	N = 4;
	K = 2;
	L = 3;
	V = buildV( K, L );
	T = buildT( K );
	C = buildC( M, N );
	WORK = new Complex128Array( N * K );
	zlarzb( 'left', 'conjugate-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, N, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: SIDE=right, TRANS=no-transpose, M=4 N=5 K=2 L=3', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;

	tc = findCase( 'right_notrans_m4_n5_k2_l3' );
	M = 4;
	N = 5;
	K = 2;
	L = 3;
	V = buildV( K, L );
	T = buildT( K );
	C = buildC( M, N );
	WORK = new Complex128Array( M * K );
	zlarzb( 'right', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, M, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: SIDE=right, TRANS=conjugate-transpose, M=4 N=5 K=2 L=3', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;

	tc = findCase( 'right_ctrans_m4_n5_k2_l3' );
	M = 4;
	N = 5;
	K = 2;
	L = 3;
	V = buildV( K, L );
	T = buildT( K );
	C = buildC( M, N );
	WORK = new Complex128Array( M * K );
	zlarzb( 'right', 'conjugate-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, M, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: SIDE=left, TRANS=no-transpose, L=0', function t() {
	var WORK;
	var idx;
	var tc;
	var Cv;
	var Tv;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;
	var i;
	var j;

	tc = findCase( 'left_notrans_l0' );
	M = 4;
	N = 3;
	K = 2;
	L = 0;
	V = new Complex128Array( K * 1 );
	T = new Complex128Array( K * K );
	Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 0.6;
	Tv[ 1 ] = 0.1;
	Tv[ 2 ] = 0.2;
	Tv[ 3 ] = -0.1;
	Tv[ 6 ] = 0.4;
	Tv[ 7 ] = 0.2;
	C = new Complex128Array( M * N );
	Cv = reinterpret( C, 0 );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			idx = ( ( j * M ) + i ) * 2;
			Cv[ idx ] = ( 2 * ( i + 1 ) ) - ( j + 1 );
			Cv[ idx + 1 ] = 0.1 * ( ( i + 1 ) + ( j + 1 ) );
		}
	}
	WORK = new Complex128Array( N * K );
	zlarzb( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, N, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: SIDE=left, TRANS=no-transpose, K=1', function t() {
	var WORK;
	var idx;
	var tc;
	var Cv;
	var Tv;
	var Vv;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;
	var i;
	var j;

	tc = findCase( 'left_notrans_k1' );
	M = 4;
	N = 3;
	K = 1;
	L = 2;
	V = new Complex128Array( K * L );
	Vv = reinterpret( V, 0 );
	Vv[ 0 ] = 0.3;
	Vv[ 1 ] = 0.1;
	Vv[ 2 ] = -0.4;
	Vv[ 3 ] = 0.2;
	T = new Complex128Array( K * K );
	Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 0.8;
	Tv[ 1 ] = -0.1;
	C = new Complex128Array( M * N );
	Cv = reinterpret( C, 0 );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			idx = ( ( j * M ) + i ) * 2;
			Cv[ idx ] = ( 0.5 * ( i + 1 ) ) + ( 0.2 * ( j + 1 ) );
			Cv[ idx + 1 ] = 0.05 * ( i + 1 );
		}
	}
	WORK = new Complex128Array( N * K );
	zlarzb( 'left', 'no-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, N, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: SIDE=right, TRANS=conjugate-transpose, K=1', function t() {
	var WORK;
	var idx;
	var tc;
	var Cv;
	var Tv;
	var Vv;
	var V;
	var T;
	var C;
	var M;
	var N;
	var K;
	var L;
	var i;
	var j;

	tc = findCase( 'right_ctrans_k1' );
	M = 3;
	N = 4;
	K = 1;
	L = 2;
	V = new Complex128Array( K * L );
	Vv = reinterpret( V, 0 );
	Vv[ 0 ] = 0.3;
	Vv[ 1 ] = 0.1;
	Vv[ 2 ] = -0.4;
	Vv[ 3 ] = 0.2;
	T = new Complex128Array( K * K );
	Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 0.8;
	Tv[ 1 ] = -0.1;
	C = new Complex128Array( M * N );
	Cv = reinterpret( C, 0 );
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			idx = ( ( j * M ) + i ) * 2;
			Cv[ idx ] = ( 0.5 * ( i + 1 ) ) + ( 0.2 * ( j + 1 ) );
			Cv[ idx + 1 ] = 0.05 * ( j + 1 );
		}
	}
	WORK = new Complex128Array( M * K );
	zlarzb( 'right', 'conjugate-transpose', 'backward', 'rowwise', M, N, K, L, V, 1, K, 0, T, 1, K, 0, C, 1, M, 0, WORK, 1, M, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'zlarzb: M=0 quick return', function t() {
	var WORK;
	var Cv;
	var V;
	var T;
	var C;

	C = new Complex128Array( 4 );
	Cv = reinterpret( C, 0 );
	Cv[ 0 ] = 1.0;
	Cv[ 1 ] = 2.0;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	zlarzb( 'left', 'no-transpose', 'backward', 'rowwise', 0, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 1, 0, WORK, 1, 1, 0 );
	assert.equal( Cv[ 0 ], 1.0, 'C unchanged after M=0' );
	assert.equal( Cv[ 1 ], 2.0, 'C unchanged after M=0' );
});

test( 'zlarzb: N=0 quick return', function t() {
	var WORK;
	var Cv;
	var V;
	var T;
	var C;

	C = new Complex128Array( 4 );
	Cv = reinterpret( C, 0 );
	Cv[ 0 ] = 3.0;
	Cv[ 1 ] = 4.0;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	zlarzb( 'right', 'conjugate-transpose', 'backward', 'rowwise', 2, 0, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 );
	assert.equal( Cv[ 0 ], 3.0, 'C unchanged after N=0' );
	assert.equal( Cv[ 1 ], 4.0, 'C unchanged after N=0' );
});

test( 'zlarzb: unsupported direct throws TypeError', function t() {
	var WORK;
	var V;
	var T;
	var C;

	C = new Complex128Array( 4 );
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	assert.throws( function badCall() {
		zlarzb( 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 );
	}, TypeError );
});

test( 'zlarzb: unsupported storev throws TypeError', function t() {
	var WORK;
	var V;
	var T;
	var C;

	C = new Complex128Array( 4 );
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	assert.throws( function badCall() {
		zlarzb( 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 );
	}, TypeError );
});
