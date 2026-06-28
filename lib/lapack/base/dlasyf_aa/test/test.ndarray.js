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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasyfAa from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'dlasyf_aa.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var fixture = raw.trim().split( '\n' ).map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Locates a fixture entry by its `name` field.
*
* @private
* @param {string} name - fixture case name
* @returns {Object} fixture entry
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
* Converts the Fortran 1-based IPIV recorded in fixtures to the 0-based convention used by `base.js`.
*
* @private
* @param {Array} fipiv - Fortran 1-based pivot vector
* @returns {Array} 0-based pivot vector
*/
function convertIPIV( fipiv ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

/**
* Converts a typed array to a plain `Array`.
*
* @private
* @param {TypedArray} arr - input typed array
* @returns {Array} converted array
*/
function toArray( arr ) {
	return Array.prototype.slice.call( arr );
}


// TESTS //

test( 'dlasyfAa: lower, first panel, M=6, NB=3', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 4.0;
	A[ 1 ] = 1.0;
	A[ 2 ] = 2.0;
	A[ 3 ] = 0.5;
	A[ 4 ] = -1.0;
	A[ 5 ] = 0.5;
	A[ 7 ] = 5.0;
	A[ 8 ] = 1.5;
	A[ 9 ] = -0.5;
	A[ 10 ] = 1.0;
	A[ 11 ] = 0.5;
	A[ 14 ] = 6.0;
	A[ 15 ] = 2.0;
	A[ 16 ] = 0.5;
	A[ 17 ] = -1.0;
	A[ 21 ] = 7.0;
	A[ 22 ] = 1.0;
	A[ 23 ] = 1.5;
	A[ 28 ] = 8.0;
	A[ 29 ] = 2.0;
	A[ 35 ] = 9.0;
	IPIV = new Int32Array( 6 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 6 );
	dlasyfAa( 'lower', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_j1_first_m6_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, first panel, M=6, NB=3', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 4.0;
	A[ 6 ] = 1.0;
	A[ 7 ] = 5.0;
	A[ 12 ] = 2.0;
	A[ 13 ] = 1.5;
	A[ 14 ] = 6.0;
	A[ 18 ] = 0.5;
	A[ 19 ] = -0.5;
	A[ 20 ] = 2.0;
	A[ 21 ] = 7.0;
	A[ 24 ] = -1.0;
	A[ 25 ] = 1.0;
	A[ 26 ] = 0.5;
	A[ 27 ] = 1.0;
	A[ 28 ] = 8.0;
	A[ 30 ] = 0.5;
	A[ 31 ] = 0.5;
	A[ 32 ] = -1.0;
	A[ 33 ] = 1.5;
	A[ 34 ] = 2.0;
	A[ 35 ] = 9.0;
	IPIV = new Int32Array( 6 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 6 );
	dlasyfAa( 'upper', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_j1_first_m6_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, subsequent panel J1=2, M=5, NB=3', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 0.1;
	A[ 1 ] = 0.2;
	A[ 2 ] = 0.3;
	A[ 3 ] = 0.1;
	A[ 4 ] = 0.2;
	A[ 7 ] = 4.0;
	A[ 8 ] = 1.0;
	A[ 9 ] = 2.0;
	A[ 10 ] = 0.5;
	A[ 11 ] = -1.0;
	A[ 14 ] = 5.0;
	A[ 15 ] = 1.5;
	A[ 16 ] = -0.5;
	A[ 17 ] = 1.0;
	A[ 21 ] = 6.0;
	A[ 22 ] = 2.0;
	A[ 23 ] = 0.5;
	A[ 28 ] = 7.0;
	A[ 29 ] = 1.0;
	A[ 35 ] = 8.0;
	IPIV = new Int32Array( 5 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 5 );
	dlasyfAa( 'lower', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_j1_2_m5_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, subsequent panel J1=2, M=5, NB=3', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 0.1;
	A[ 6 ] = 0.2;
	A[ 7 ] = 4.0;
	A[ 12 ] = 0.3;
	A[ 13 ] = 1.0;
	A[ 14 ] = 5.0;
	A[ 18 ] = 0.1;
	A[ 19 ] = 2.0;
	A[ 20 ] = 1.5;
	A[ 21 ] = 6.0;
	A[ 24 ] = 0.2;
	A[ 25 ] = 0.5;
	A[ 26 ] = -0.5;
	A[ 27 ] = 2.0;
	A[ 28 ] = 7.0;
	A[ 31 ] = -1.0;
	A[ 32 ] = 1.0;
	A[ 33 ] = 0.5;
	A[ 34 ] = 1.0;
	A[ 35 ] = 8.0;
	IPIV = new Int32Array( 5 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 5 );
	dlasyfAa( 'upper', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_j1_2_m5_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, M=4, NB=4 full panel', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 16 );
	A[ 0 ] = 3.0;
	A[ 1 ] = 1.0;
	A[ 2 ] = 2.0;
	A[ 3 ] = 0.5;
	A[ 5 ] = 5.0;
	A[ 6 ] = 1.5;
	A[ 7 ] = -1.0;
	A[ 10 ] = 4.0;
	A[ 11 ] = 1.0;
	A[ 15 ] = 6.0;
	IPIV = new Int32Array( 4 );
	H = new Float64Array( 16 );
	WORK = new Float64Array( 4 );
	dlasyfAa( 'lower', 1, 4, 4, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_m4_nb4_full' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, M=4, NB=4 full panel', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 16 );
	A[ 0 ] = 3.0;
	A[ 4 ] = 1.0;
	A[ 5 ] = 5.0;
	A[ 8 ] = 2.0;
	A[ 9 ] = 1.5;
	A[ 10 ] = 4.0;
	A[ 12 ] = 0.5;
	A[ 13 ] = -1.0;
	A[ 14 ] = 1.0;
	A[ 15 ] = 6.0;
	IPIV = new Int32Array( 4 );
	H = new Float64Array( 16 );
	WORK = new Float64Array( 4 );
	dlasyfAa( 'upper', 1, 4, 4, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_m4_nb4_full' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, M=1', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( [ 7.0 ] );
	IPIV = new Int32Array( 1 );
	H = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	dlasyfAa( 'lower', 1, 1, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_m1_nb1' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, M=1', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( [ 7.0 ] );
	IPIV = new Int32Array( 1 );
	H = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	dlasyfAa( 'upper', 1, 1, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_m1_nb1' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, NB=1, M=4', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 16 );
	A[ 0 ] = 4.0;
	A[ 1 ] = 1.0;
	A[ 2 ] = 2.0;
	A[ 3 ] = 0.5;
	A[ 5 ] = 5.0;
	A[ 6 ] = 1.5;
	A[ 7 ] = -1.0;
	A[ 10 ] = 4.0;
	A[ 11 ] = 1.0;
	A[ 15 ] = 6.0;
	IPIV = new Int32Array( 4 );
	H = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	dlasyfAa( 'lower', 1, 4, 1, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_m4_nb1' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, NB=1, M=4', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 16 );
	A[ 0 ] = 4.0;
	A[ 4 ] = 1.0;
	A[ 5 ] = 5.0;
	A[ 8 ] = 2.0;
	A[ 9 ] = 1.5;
	A[ 10 ] = 4.0;
	A[ 12 ] = 0.5;
	A[ 13 ] = -1.0;
	A[ 14 ] = 1.0;
	A[ 15 ] = 6.0;
	IPIV = new Int32Array( 4 );
	H = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	dlasyfAa( 'upper', 1, 4, 1, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_m4_nb1' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, M=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var H;
	WORK = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	H = new Float64Array( 1 );
	A = new Float64Array( 1 );
	info = dlasyfAa( 'lower', 1, 0, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'M=0 returns 0' );
	assert.equal( A[ 0 ], 0.0, 'M=0 leaves A unchanged' );
});

test( 'dlasyfAa: upper, M=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var H;
	WORK = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	H = new Float64Array( 1 );
	A = new Float64Array( 1 );
	info = dlasyfAa( 'upper', 1, 0, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'M=0 returns 0' );
	assert.equal( A[ 0 ], 0.0, 'M=0 leaves A unchanged' );
});

test( 'dlasyfAa: lower, M=6, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 1.0;
	A[ 1 ] = 0.5;
	A[ 2 ] = 0.3;
	A[ 3 ] = 0.2;
	A[ 4 ] = 9.0;
	A[ 5 ] = 0.4;
	A[ 7 ] = 2.0;
	A[ 8 ] = 0.6;
	A[ 9 ] = 0.4;
	A[ 10 ] = 0.3;
	A[ 11 ] = 8.0;
	A[ 14 ] = 3.0;
	A[ 15 ] = 0.7;
	A[ 16 ] = 0.5;
	A[ 17 ] = 7.0;
	A[ 21 ] = 4.0;
	A[ 22 ] = 0.8;
	A[ 23 ] = 0.6;
	A[ 28 ] = 5.0;
	A[ 29 ] = 0.9;
	A[ 35 ] = 6.0;
	IPIV = new Int32Array( 6 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 6 );
	dlasyfAa( 'lower', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_pivot_m6_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, M=6, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 1.0;
	A[ 6 ] = 0.5;
	A[ 7 ] = 2.0;
	A[ 12 ] = 0.3;
	A[ 13 ] = 0.6;
	A[ 14 ] = 3.0;
	A[ 18 ] = 0.2;
	A[ 19 ] = 0.4;
	A[ 20 ] = 0.7;
	A[ 21 ] = 4.0;
	A[ 24 ] = 9.0;
	A[ 25 ] = 0.3;
	A[ 26 ] = 0.5;
	A[ 27 ] = 0.8;
	A[ 28 ] = 5.0;
	A[ 30 ] = 0.4;
	A[ 31 ] = 8.0;
	A[ 32 ] = 7.0;
	A[ 33 ] = 0.6;
	A[ 34 ] = 0.9;
	A[ 35 ] = 6.0;
	IPIV = new Int32Array( 6 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 6 );
	dlasyfAa( 'upper', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_pivot_m6_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, J1=2, M=5, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 0.1;
	A[ 1 ] = 0.2;
	A[ 2 ] = 0.3;
	A[ 3 ] = 0.1;
	A[ 4 ] = 0.2;
	A[ 7 ] = 1.0;
	A[ 8 ] = 0.5;
	A[ 9 ] = 0.3;
	A[ 10 ] = 9.0;
	A[ 11 ] = 0.2;
	A[ 13 ] = 2.0;
	A[ 14 ] = 0.6;
	A[ 15 ] = 0.4;
	A[ 16 ] = 8.0;
	A[ 20 ] = 3.0;
	A[ 21 ] = 0.7;
	A[ 22 ] = 0.5;
	A[ 27 ] = 4.0;
	A[ 28 ] = 0.8;
	A[ 34 ] = 5.0;
	IPIV = new Int32Array( 5 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 5 );
	dlasyfAa( 'lower', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_pivot_j1_2_m5_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, J1=2, M=5, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 36 );
	A[ 0 ] = 0.1;
	A[ 6 ] = 0.2;
	A[ 7 ] = 1.0;
	A[ 12 ] = 0.3;
	A[ 13 ] = 0.5;
	A[ 14 ] = 2.0;
	A[ 18 ] = 0.1;
	A[ 19 ] = 0.3;
	A[ 20 ] = 0.6;
	A[ 21 ] = 3.0;
	A[ 24 ] = 0.2;
	A[ 25 ] = 9.0;
	A[ 26 ] = 8.0;
	A[ 27 ] = 0.7;
	A[ 28 ] = 4.0;
	A[ 31 ] = 0.2;
	A[ 32 ] = 0.4;
	A[ 33 ] = 0.5;
	A[ 34 ] = 0.8;
	A[ 35 ] = 5.0;
	IPIV = new Int32Array( 5 );
	H = new Float64Array( 18 );
	WORK = new Float64Array( 5 );
	dlasyfAa( 'upper', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_pivot_j1_2_m5_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, M=8, NB=4 pivot at i2=M boundary', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 64 );
	A[ 0 ] = 1.0;
	A[ 1 ] = 0.5;
	A[ 2 ] = 0.3;
	A[ 3 ] = 0.2;
	A[ 4 ] = 0.1;
	A[ 5 ] = 0.15;
	A[ 6 ] = 0.25;
	A[ 7 ] = 9.0;
	A[ 9 ] = 2.0;
	A[ 10 ] = 0.6;
	A[ 11 ] = 0.4;
	A[ 12 ] = 0.2;
	A[ 13 ] = 0.18;
	A[ 14 ] = 0.28;
	A[ 15 ] = 5.0;
	A[ 18 ] = 3.0;
	A[ 19 ] = 0.7;
	A[ 20 ] = 0.3;
	A[ 21 ] = 0.22;
	A[ 22 ] = 0.32;
	A[ 23 ] = 4.0;
	A[ 27 ] = 4.0;
	A[ 28 ] = 0.4;
	A[ 29 ] = 0.26;
	A[ 30 ] = 0.36;
	A[ 31 ] = 3.0;
	A[ 36 ] = 5.0;
	A[ 45 ] = 6.0;
	A[ 54 ] = 7.0;
	A[ 63 ] = 8.0;
	IPIV = new Int32Array( 8 );
	H = new Float64Array( 32 );
	WORK = new Float64Array( 8 );
	dlasyfAa( 'lower', 1, 8, 4, A, 1, 8, 0, IPIV, 1, 0, H, 1, 8, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_pivot_at_m_m8_nb4' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, M=8, NB=4 pivot at i2=M boundary', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 64 );
	A[ 0 ] = 1.0;
	A[ 8 ] = 0.5;
	A[ 9 ] = 2.0;
	A[ 16 ] = 0.3;
	A[ 17 ] = 0.6;
	A[ 18 ] = 3.0;
	A[ 24 ] = 0.2;
	A[ 25 ] = 0.4;
	A[ 26 ] = 0.7;
	A[ 27 ] = 4.0;
	A[ 32 ] = 0.1;
	A[ 33 ] = 0.2;
	A[ 34 ] = 0.3;
	A[ 35 ] = 0.4;
	A[ 36 ] = 5.0;
	A[ 40 ] = 0.15;
	A[ 41 ] = 0.18;
	A[ 42 ] = 0.22;
	A[ 43 ] = 0.26;
	A[ 45 ] = 6.0;
	A[ 48 ] = 0.25;
	A[ 49 ] = 0.28;
	A[ 50 ] = 0.32;
	A[ 51 ] = 0.36;
	A[ 54 ] = 7.0;
	A[ 56 ] = 9.0;
	A[ 57 ] = 5.0;
	A[ 58 ] = 4.0;
	A[ 59 ] = 3.0;
	A[ 63 ] = 8.0;
	IPIV = new Int32Array( 8 );
	H = new Float64Array( 32 );
	WORK = new Float64Array( 8 );
	dlasyfAa( 'upper', 1, 8, 4, A, 1, 8, 0, IPIV, 1, 0, H, 1, 8, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_pivot_at_m_m8_nb4' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, M=7 NB=3 mid-column pivot (i2 < M)', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 49 );
	A[ 0 ] = 1.0;
	A[ 1 ] = 0.5;
	A[ 2 ] = 0.3;
	A[ 3 ] = 9.0;
	A[ 4 ] = 0.2;
	A[ 5 ] = 0.1;
	A[ 6 ] = 0.05;
	A[ 8 ] = 2.0;
	A[ 9 ] = 0.6;
	A[ 10 ] = 0.4;
	A[ 11 ] = 0.3;
	A[ 12 ] = 0.25;
	A[ 13 ] = 0.18;
	A[ 16 ] = 3.0;
	A[ 17 ] = 0.7;
	A[ 18 ] = 0.5;
	A[ 19 ] = 0.4;
	A[ 20 ] = 0.32;
	A[ 24 ] = 4.0;
	A[ 25 ] = 0.8;
	A[ 26 ] = 0.6;
	A[ 27 ] = 0.45;
	A[ 32 ] = 5.0;
	A[ 33 ] = 0.9;
	A[ 34 ] = 0.55;
	A[ 40 ] = 6.0;
	A[ 41 ] = 0.65;
	A[ 48 ] = 7.0;
	IPIV = new Int32Array( 7 );
	H = new Float64Array( 21 );
	H[ 0 ] = 1.0;
	H[ 1 ] = 0.5;
	H[ 2 ] = 0.3;
	H[ 3 ] = 9.0;
	H[ 4 ] = 0.2;
	H[ 5 ] = 0.1;
	H[ 6 ] = 0.05;
	WORK = new Float64Array( 7 );
	dlasyfAa( 'lower', 1, 7, 3, A, 1, 7, 0, IPIV, 1, 0, H, 1, 7, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'lower_pivot_mid_m7_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: upper, M=7 NB=3 mid-column pivot (i2 < M)', function t() {
	var WORK;
	var IPIV;
	var tc;
	var A;
	var H;
	A = new Float64Array( 49 );
	A[ 0 ] = 1.0;
	A[ 7 ] = 0.5;
	A[ 8 ] = 2.0;
	A[ 14 ] = 0.3;
	A[ 15 ] = 0.6;
	A[ 16 ] = 3.0;
	A[ 21 ] = 9.0;
	A[ 22 ] = 0.4;
	A[ 23 ] = 0.7;
	A[ 24 ] = 4.0;
	A[ 28 ] = 0.2;
	A[ 29 ] = 0.3;
	A[ 30 ] = 0.5;
	A[ 31 ] = 0.8;
	A[ 32 ] = 5.0;
	A[ 35 ] = 0.1;
	A[ 36 ] = 0.25;
	A[ 37 ] = 0.4;
	A[ 38 ] = 0.6;
	A[ 39 ] = 0.9;
	A[ 40 ] = 6.0;
	A[ 42 ] = 0.05;
	A[ 43 ] = 0.18;
	A[ 44 ] = 0.32;
	A[ 45 ] = 0.45;
	A[ 46 ] = 0.55;
	A[ 47 ] = 0.65;
	A[ 48 ] = 7.0;
	IPIV = new Int32Array( 7 );
	H = new Float64Array( 21 );
	H[ 0 ] = 1.0;
	H[ 1 ] = 0.5;
	H[ 2 ] = 0.3;
	H[ 3 ] = 9.0;
	H[ 4 ] = 0.2;
	H[ 5 ] = 0.1;
	H[ 6 ] = 0.05;
	WORK = new Float64Array( 7 );
	dlasyfAa( 'upper', 1, 7, 3, A, 1, 7, 0, IPIV, 1, 0, H, 1, 7, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	tc = findCase( 'upper_pivot_mid_m7_nb3' );
	assertArrayClose( toArray( A ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'dlasyfAa: lower, zero pivot triggers dlaset', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var H;
	A = new Float64Array( 25 );
	A[ 0 ] = 1.0;
	A[ 6 ] = 1.0;
	A[ 12 ] = 1.0;
	A[ 18 ] = 1.0;
	A[ 24 ] = 1.0;
	IPIV = new Int32Array( 5 );
	H = new Float64Array( 15 );
	WORK = new Float64Array( 5 );
	info = dlasyfAa( 'lower', 1, 5, 3, A, 1, 5, 0, IPIV, 1, 0, H, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'returns 0' );
});

test( 'dlasyfAa: upper, zero pivot triggers dlaset', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var H;
	A = new Float64Array( 25 );
	A[ 0 ] = 1.0;
	A[ 6 ] = 1.0;
	A[ 12 ] = 1.0;
	A[ 18 ] = 1.0;
	A[ 24 ] = 1.0;
	IPIV = new Int32Array( 5 );
	H = new Float64Array( 15 );
	WORK = new Float64Array( 5 );
	info = dlasyfAa( 'upper', 1, 5, 3, A, 1, 5, 0, IPIV, 1, 0, H, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'returns 0' );
});

test( 'dlasyfAa: throws on invalid uplo', function t() {
	var WORK;
	var IPIV;
	var A;
	var H;
	WORK = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	H = new Float64Array( 1 );
	A = new Float64Array( 1 );
	assert.throws( function fn() {
		dlasyfAa( 'invalid', 1, 1, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});
