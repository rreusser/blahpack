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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconvf from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dsyconvf.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync,max-len
var fixture = lines.map( parseLine );

/**
* Parses a single JSONL line into an object.
*
* @private
* @param {string} line - raw JSON text
* @returns {Object} parsed fixture record
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Retrieves a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case fixture
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
* Converts a Fortran 1-based `IPIV` array to the 0-based JS convention (negative values encode 2x2 pivots via bitwise NOT).
*
* @private
* @param {Array} arr - Fortran IPIV array
* @returns {Int32Array} 0-based IPIV array
*/
function toIpiv( arr ) {
	var out;
	var i;
	out = new Int32Array( arr.length );
	for ( i = 0; i < arr.length; i++ ) {
		if ( arr[ i ] >= 0 ) {
			out[ i ] = arr[ i ] - 1;
		} else {
			// Fortran -p => JS ~(p-1) = -p numerically (preserved).
			out[ i ] = arr[ i ];
		}
	}
	return out;
}

/**
* Asserts two numeric arrays are element-wise close within a relative tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
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
* Asserts two integer IPIV arrays (in JS 0-based convention) match exactly.
*
* @private
* @param {Int32Array} actual - actual IPIV
* @param {Array} expectedFortran - expected Fortran 1-based IPIV
* @param {string} msg - message prefix
*/
function assertIpivEqual( actual, expectedFortran, msg ) {
	var expected;
	var i;
	expected = toIpiv( expectedFortran );
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.equal( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dsyconvf: upper_convert (1x1 pivots)', function upperConvert() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'upper_convert' );
	N = 5;
	A = new Float64Array( tc.a_factored );
	E = new Float64Array( N );
	IPIV = toIpiv( tc.ipiv_trf );
	info = dsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( E, tc.e, 1e-14, 'e' );
	assertIpivEqual( IPIV, tc.ipiv_converted, 'ipiv_converted' );
});

test( 'dsyconvf: upper_revert (1x1 pivots)', function upperRevert() {
	var IPIV;
	var info;
	var tcC;
	var tc;
	var N;
	var A;
	var E;
	tcC = findCase( 'upper_convert' );
	tc = findCase( 'upper_revert' );
	N = 5;
	A = new Float64Array( tcC.a_converted );
	E = new Float64Array( tcC.e );
	IPIV = toIpiv( tcC.ipiv_converted );
	info = dsyconvf( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_reverted, 1e-14, 'a_reverted' );
	assertIpivEqual( IPIV, tc.ipiv_reverted, 'ipiv_reverted' );
});

test( 'dsyconvf: lower_convert (1x1 pivots)', function lowerConvert() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'lower_convert' );
	N = 5;
	A = new Float64Array( tc.a_factored );
	E = new Float64Array( N );
	IPIV = toIpiv( tc.ipiv_trf );
	info = dsyconvf( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( E, tc.e, 1e-14, 'e' );
	assertIpivEqual( IPIV, tc.ipiv_converted, 'ipiv_converted' );
});

test( 'dsyconvf: lower_revert (1x1 pivots)', function lowerRevert() {
	var IPIV;
	var info;
	var tcC;
	var tc;
	var N;
	var A;
	var E;
	tcC = findCase( 'lower_convert' );
	tc = findCase( 'lower_revert' );
	N = 5;
	A = new Float64Array( tcC.a_converted );
	E = new Float64Array( tcC.e );
	IPIV = toIpiv( tcC.ipiv_converted );
	info = dsyconvf( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_reverted, 1e-14, 'a_reverted' );
	assertIpivEqual( IPIV, tc.ipiv_reverted, 'ipiv_reverted' );
});

test( 'dsyconvf: n0_upper_convert quick return', function n0UpperConvert() {
	var IPIV;
	var info;
	var A;
	var E;
	A = new Float64Array( [ 1.0 ] );
	E = new Float64Array( [ 42.0 ] );
	IPIV = new Int32Array( [ 7 ] );
	info = dsyconvf( 'upper', 'convert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 1.0, 'A untouched' );
	assert.equal( E[ 0 ], 42.0, 'E untouched' );
	assert.equal( IPIV[ 0 ], 7, 'IPIV untouched' );
});

test( 'dsyconvf: n0_lower_revert quick return', function n0LowerRevert() {
	var IPIV;
	var info;
	var A;
	var E;
	A = new Float64Array( [ 1.0 ] );
	E = new Float64Array( [ 42.0 ] );
	IPIV = new Int32Array( [ 7 ] );
	info = dsyconvf( 'lower', 'revert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 1.0, 'A untouched' );
	assert.equal( E[ 0 ], 42.0, 'E untouched' );
	assert.equal( IPIV[ 0 ], 7, 'IPIV untouched' );
});

test( 'dsyconvf: upper_2x2_convert (2x2 pivot blocks)', function upper2x2Convert() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'upper_2x2_convert' );
	N = 5;
	A = new Float64Array( tc.a_factored );
	E = new Float64Array( N );
	IPIV = toIpiv( tc.ipiv_trf );
	info = dsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( E, tc.e, 1e-14, 'e' );
	assertIpivEqual( IPIV, tc.ipiv_converted, 'ipiv_converted' );
});

test( 'dsyconvf: upper_2x2_revert (2x2 pivot blocks)', function upper2x2Revert() {
	var IPIV;
	var info;
	var tcC;
	var tc;
	var N;
	var A;
	var E;
	tcC = findCase( 'upper_2x2_convert' );
	tc = findCase( 'upper_2x2_revert' );
	N = 5;
	A = new Float64Array( tcC.a_converted );
	E = new Float64Array( tcC.e );
	IPIV = toIpiv( tcC.ipiv_converted );
	info = dsyconvf( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_reverted, 1e-14, 'a_reverted' );
	assertIpivEqual( IPIV, tc.ipiv_reverted, 'ipiv_reverted' );
});

test( 'dsyconvf: lower_2x2_convert (2x2 pivot block at rows 0-1)', function lower2x2Convert() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'lower_2x2_convert' );
	N = 3;
	A = new Float64Array( tc.a_factored );
	E = new Float64Array( N );
	IPIV = toIpiv( tc.ipiv_trf );
	info = dsyconvf( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( E, tc.e, 1e-14, 'e' );
	assertIpivEqual( IPIV, tc.ipiv_converted, 'ipiv_converted' );
});

test( 'dsyconvf: lower_2x2_revert (2x2 pivot block at rows 0-1)', function lower2x2Revert() {
	var IPIV;
	var info;
	var tcC;
	var tc;
	var N;
	var A;
	var E;
	tcC = findCase( 'lower_2x2_convert' );
	tc = findCase( 'lower_2x2_revert' );
	N = 3;
	A = new Float64Array( tcC.a_converted );
	E = new Float64Array( tcC.e );
	IPIV = toIpiv( tcC.ipiv_converted );
	info = dsyconvf( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_reverted, 1e-14, 'a_reverted' );
	assertIpivEqual( IPIV, tc.ipiv_reverted, 'ipiv_reverted' );
});

// Hand-crafted cases that exercise the actual row-swap loops. The fixture-based tests use well-conditioned DSYTRF inputs and therefore produce identity permutations that skip the swap bodies. // eslint-disable-line max-len

test( 'dsyconvf: upper 1x1 convert with explicit swap (ip != i)', function upperConvert1x1Swap() {
	var IPIV;
	var info;
	var N;
	var A;
	var E;
	var k;
	N = 4;
	A = new Float64Array( 16 );
	for ( k = 0; k < 16; k++ ) {
		A[ k ] = k + 1;
	}
	E = new Float64Array( N );
	IPIV = new Int32Array( [ 0, 3, 2, 3 ] );

	// Upper convert perm loop (down): i=3 (1x1 self), i=2 (1x1 self), i=1 (1x1, ip=3, swap cols 2..3).
	info = dsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 9 ], 12 );
	assert.equal( A[ 11 ], 10 );
	assert.equal( A[ 13 ], 16 );
	assert.equal( A[ 15 ], 14 );
});

test( 'dsyconvf: upper 1x1 revert with explicit swap (ip != i)', function upperRevert1x1Swap() {
	var expected;
	var IPIV;
	var info;
	var N;
	var A;
	var E;
	var k;
	N = 4;
	A = new Float64Array( 16 );
	for ( k = 0; k < 16; k++ ) {
		A[ k ] = k + 1;
	}
	expected = new Float64Array( A );
	E = new Float64Array( N );
	IPIV = new Int32Array( [ 0, 3, 2, 3 ] );
	dsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );

	// Revert should restore the original matrix.
	info = dsyconvf( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, expected, 0, 'round-trip' );
});

test( 'dsyconvf: lower 1x1 swap (convert then revert, 4x4)', function lowerSwap1x1() {
	var IPIV;
	var orig;
	var info;
	var N;
	var A;
	var E;
	N = 4;
	A = new Float64Array( [ 1, 10, 20, 30, 0, 2, 21, 31, 0, 0, 3, 32, 0, 0, 0, 4 ] );
	orig = new Float64Array( A );
	E = new Float64Array( N );
	IPIV = new Int32Array( [ 0, 3, 2, 3 ] );
	info = dsyconvf( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	// At i=1, ip=3, swap A[1,0] and A[3,0].
	assert.equal( A[ 1 ], orig[ 3 ] );
	assert.equal( A[ 3 ], orig[ 1 ] );

	info = dsyconvf( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, orig, 0, 'revert restores original' );
});

test( 'dsyconvf: lower 2x2 interchange at position (1,2) with non-trivial pivot', function lowerSwap2x2() {
	var origCol0;
	var IPIV;
	var info;
	var N;
	var A;
	var E;

	// 4x4 lower; 2x2 block at rows (1,2), pivot row 3.
	N = 4;
	A = new Float64Array( [ 1, 10, 20, 30, 0, 2, 21, 31, 0, 0, 3, 32, 0, 0, 0, 4 ] );
	origCol0 = [ A[ 0 ], A[ 1 ], A[ 2 ], A[ 3 ] ];
	E = new Float64Array( N );
	IPIV = new Int32Array( [ 0, ~3, ~3, 3 ] );
	info = dsyconvf( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	// At i=1 in the permutation loop, swap A[2,0] and A[3,0].
	assert.equal( A[ 2 ], origCol0[ 3 ] );
	assert.equal( A[ 3 ], origCol0[ 2 ] );
	assert.equal( IPIV[ 1 ], 1, 'IPIV[1] set to self' );
});

test( 'dsyconvf: stride and offset support', function stridesOffsets() {
	var offsetA;
	var IPIV;
	var info;
	var LDA;
	var N;
	var A;
	var E;
	N = 2;
	LDA = 3;
	offsetA = 1;
	A = new Float64Array( 7 );
	A[ 1 ] = 10;
	A[ 2 ] = 20;
	A[ 4 ] = 30;
	A[ 5 ] = 40;
	E = new Float64Array( [ 0, 0, 0 ] );
	IPIV = new Int32Array( [ -1, -1 ] );
	info = dsyconvf( 'upper', 'convert', N, A, 1, LDA, offsetA, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	// i=1: IPIV[1]<0, 2x2 branch. E[1] = A[0,1] = A[4] = 30. A[4] = 0. E[0] = 0.
	assert.equal( E[ 1 ], 30 );
	assert.equal( A[ 4 ], 0 );
});

test( 'dsyconvf: upper 2x2 convert with explicit swap (ip != i-1)', function upperConvertSwap() {
	var before21;
	var before20;
	var before16;
	var before15;
	var IPIV;
	var info;
	var N;
	var A;
	var E;
	var k;
	N = 5;
	A = new Float64Array( 25 );
	for ( k = 0; k < 25; k++ ) {
		A[ k ] = k + 1;
	}
	E = new Float64Array( N );
	IPIV = new Int32Array( [ 0, ~0, ~0, 3, 4 ] );

	// At i=2: IPIV[2]<0, 2x2 branch. ip = ~IPIV[2] = 0. i-1=1. ip != 1 true. i<N-1 true. Swap row i-1=1 with row 0 in cols 3..4.
	before16 = A[ 16 ];
	before15 = A[ 15 ];
	before21 = A[ 21 ];
	before20 = A[ 20 ];
	info = dsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 16 ], before15 );
	assert.equal( A[ 15 ], before16 );
	assert.equal( A[ 21 ], before20 );
	assert.equal( A[ 20 ], before21 );
});

test( 'dsyconvf: lower revert 2x2 at rows (1,2) triggers swap branch', function lowerRevert2x2Swap() {
	var offsetA;
	var before;
	var IPIV;
	var info;
	var LDA;
	var N;
	var A;
	var E;
	var k;

	// Use a non-zero `offsetA` so that the phantom row index stays inside the backing store and the swap branch can be exercised safely.
	N = 4;
	LDA = 4;
	offsetA = 4;
	A = new Float64Array( 4 + 16 );
	for ( k = 0; k < 16; k++ ) {
		A[ offsetA + k ] = k + 1;
	}

	// After decrement i=1, ip = -IPIV[1] - 2 = -1 - 2 = -3. Pre-seed the phantom slot A[offsetA-3].
	A[ offsetA - 3 ] = 777;
	E = new Float64Array( N );
	IPIV = new Int32Array( [ 0, 1, -1, 3 ] );
	before = new Float64Array( A );
	info = dsyconvf( 'lower', 'revert', N, A, 1, LDA, offsetA, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );

	// Branch executed: A[offsetA + 2*1] (row 2 col 0) and A[offsetA - 3] (phantom) swapped.
	assert.equal( A[ offsetA + 2 ], 777, 'A[2,0] gets phantom value' );
	assert.equal( A[ offsetA - 3 ], before[ offsetA + 2 ], 'phantom slot gets A[2,0]' );
	assert.equal( IPIV[ 2 ], -1 );
});
