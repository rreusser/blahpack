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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlasyfAa from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'zlasyf_aa.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
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
	var n;
	n = fixture.length;
	for ( i = 0; i < n; i++ ) {
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

/**
* Sets a single complex element of a Float64-pair view.
*
* @private
* @param {Float64Array} view - Float64 interleaved view
* @param {NonNegativeInteger} idx - complex element index
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setEl( view, idx, re, im ) {
	view[ idx * 2 ] = re;
	view[ ( idx * 2 ) + 1 ] = im;
}


// TESTS //

test( 'zlasyfAa: lower, first panel, M=6, NB=3', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 4.0, 0.5 );
	setEl( view, 1, 1.0, -0.3 );
	setEl( view, 2, 2.0, 0.2 );
	setEl( view, 3, 0.5, -0.1 );
	setEl( view, 4, -1.0, 0.4 );
	setEl( view, 5, 0.5, -0.2 );
	setEl( view, 7, 5.0, 0.3 );
	setEl( view, 8, 1.5, -0.4 );
	setEl( view, 9, -0.5, 0.1 );
	setEl( view, 10, 1.0, -0.2 );
	setEl( view, 11, 0.5, 0.3 );
	setEl( view, 14, 6.0, -0.2 );
	setEl( view, 15, 2.0, 0.5 );
	setEl( view, 16, 0.5, -0.3 );
	setEl( view, 17, -1.0, 0.2 );
	setEl( view, 21, 7.0, 0.4 );
	setEl( view, 22, 1.0, -0.1 );
	setEl( view, 23, 1.5, 0.2 );
	setEl( view, 28, 8.0, -0.3 );
	setEl( view, 29, 2.0, 0.1 );
	setEl( view, 35, 9.0, 0.5 );
	IPIV = new Int32Array( 6 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 6 );
	zlasyfAa( 'lower', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'lower_j1_first_m6_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, first panel, M=6, NB=3', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 4.0, 0.5 );
	setEl( view, 6, 1.0, -0.3 );
	setEl( view, 7, 5.0, 0.3 );
	setEl( view, 12, 2.0, 0.2 );
	setEl( view, 13, 1.5, -0.4 );
	setEl( view, 14, 6.0, -0.2 );
	setEl( view, 18, 0.5, -0.1 );
	setEl( view, 19, -0.5, 0.1 );
	setEl( view, 20, 2.0, 0.5 );
	setEl( view, 21, 7.0, 0.4 );
	setEl( view, 24, -1.0, 0.4 );
	setEl( view, 25, 1.0, -0.2 );
	setEl( view, 26, 0.5, -0.3 );
	setEl( view, 27, 1.0, -0.1 );
	setEl( view, 28, 8.0, -0.3 );
	setEl( view, 30, 0.5, -0.2 );
	setEl( view, 31, 0.5, 0.3 );
	setEl( view, 32, -1.0, 0.2 );
	setEl( view, 33, 1.5, 0.2 );
	setEl( view, 34, 2.0, 0.1 );
	setEl( view, 35, 9.0, 0.5 );
	IPIV = new Int32Array( 6 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 6 );
	zlasyfAa( 'upper', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'upper_j1_first_m6_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, subsequent panel J1=2, M=5, NB=3', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 0.1, 0.05 );
	setEl( view, 1, 0.2, -0.05 );
	setEl( view, 2, 0.3, 0.1 );
	setEl( view, 3, 0.1, -0.1 );
	setEl( view, 4, 0.2, 0.2 );
	setEl( view, 7, 4.0, 0.3 );
	setEl( view, 8, 1.0, -0.2 );
	setEl( view, 9, 2.0, 0.1 );
	setEl( view, 10, 0.5, -0.1 );
	setEl( view, 11, -1.0, 0.2 );
	setEl( view, 14, 5.0, -0.3 );
	setEl( view, 15, 1.5, 0.1 );
	setEl( view, 16, -0.5, 0.2 );
	setEl( view, 17, 1.0, -0.1 );
	setEl( view, 21, 6.0, 0.2 );
	setEl( view, 22, 2.0, -0.1 );
	setEl( view, 23, 0.5, 0.3 );
	setEl( view, 28, 7.0, -0.2 );
	setEl( view, 29, 1.0, 0.1 );
	setEl( view, 35, 8.0, 0.5 );
	IPIV = new Int32Array( 5 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 5 );
	zlasyfAa( 'lower', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'lower_j1_2_m5_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, subsequent panel J1=2, M=5, NB=3', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 0.1, 0.05 );
	setEl( view, 6, 0.2, -0.05 );
	setEl( view, 7, 4.0, 0.3 );
	setEl( view, 12, 0.3, 0.1 );
	setEl( view, 13, 1.0, -0.2 );
	setEl( view, 14, 5.0, -0.3 );
	setEl( view, 18, 0.1, -0.1 );
	setEl( view, 19, 2.0, 0.1 );
	setEl( view, 20, 1.5, 0.1 );
	setEl( view, 21, 6.0, 0.2 );
	setEl( view, 24, 0.2, 0.2 );
	setEl( view, 25, 0.5, -0.1 );
	setEl( view, 26, -0.5, 0.2 );
	setEl( view, 27, 2.0, -0.1 );
	setEl( view, 28, 7.0, -0.2 );
	setEl( view, 31, -1.0, 0.2 );
	setEl( view, 32, 1.0, -0.1 );
	setEl( view, 33, 0.5, 0.3 );
	setEl( view, 34, 1.0, 0.1 );
	setEl( view, 35, 8.0, 0.5 );
	IPIV = new Int32Array( 5 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 5 );
	zlasyfAa( 'upper', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'upper_j1_2_m5_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, M=4, NB=4 full panel', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 3.0, 0.2 );
	setEl( view, 1, 1.0, -0.1 );
	setEl( view, 2, 2.0, 0.3 );
	setEl( view, 3, 0.5, -0.2 );
	setEl( view, 5, 5.0, 0.1 );
	setEl( view, 6, 1.5, -0.3 );
	setEl( view, 7, -1.0, 0.4 );
	setEl( view, 10, 4.0, 0.5 );
	setEl( view, 11, 1.0, -0.2 );
	setEl( view, 15, 6.0, -0.1 );
	IPIV = new Int32Array( 4 );
	H = new Complex128Array( 16 );
	WORK = new Complex128Array( 4 );
	zlasyfAa( 'lower', 1, 4, 4, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'lower_m4_nb4_full' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, M=4, NB=4 full panel', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 3.0, 0.2 );
	setEl( view, 4, 1.0, -0.1 );
	setEl( view, 5, 5.0, 0.1 );
	setEl( view, 8, 2.0, 0.3 );
	setEl( view, 9, 1.5, -0.3 );
	setEl( view, 10, 4.0, 0.5 );
	setEl( view, 12, 0.5, -0.2 );
	setEl( view, 13, -1.0, 0.4 );
	setEl( view, 14, 1.0, -0.2 );
	setEl( view, 15, 6.0, -0.1 );
	IPIV = new Int32Array( 4 );
	H = new Complex128Array( 16 );
	WORK = new Complex128Array( 4 );
	zlasyfAa( 'upper', 1, 4, 4, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'upper_m4_nb4_full' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, M=1', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 1 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 7.0, 0.4 );
	IPIV = new Int32Array( 1 );
	H = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	zlasyfAa( 'lower', 1, 1, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 );
	tc = findCase( 'lower_m1_nb1' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, M=1', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 1 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 7.0, 0.4 );
	IPIV = new Int32Array( 1 );
	H = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	zlasyfAa( 'upper', 1, 1, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 );
	tc = findCase( 'upper_m1_nb1' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, NB=1, M=4', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 4.0, 0.2 );
	setEl( view, 1, 1.0, -0.1 );
	setEl( view, 2, 2.0, 0.3 );
	setEl( view, 3, 0.5, -0.2 );
	setEl( view, 5, 5.0, 0.1 );
	setEl( view, 6, 1.5, -0.3 );
	setEl( view, 7, -1.0, 0.4 );
	setEl( view, 10, 4.0, 0.5 );
	setEl( view, 11, 1.0, -0.2 );
	setEl( view, 15, 6.0, -0.1 );
	IPIV = new Int32Array( 4 );
	H = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	zlasyfAa( 'lower', 1, 4, 1, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'lower_m4_nb1' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, NB=1, M=4', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 16 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 4.0, 0.2 );
	setEl( view, 4, 1.0, -0.1 );
	setEl( view, 5, 5.0, 0.1 );
	setEl( view, 8, 2.0, 0.3 );
	setEl( view, 9, 1.5, -0.3 );
	setEl( view, 10, 4.0, 0.5 );
	setEl( view, 12, 0.5, -0.2 );
	setEl( view, 13, -1.0, 0.4 );
	setEl( view, 14, 1.0, -0.2 );
	setEl( view, 15, 6.0, -0.1 );
	IPIV = new Int32Array( 4 );
	H = new Complex128Array( 4 );
	WORK = new Complex128Array( 4 );
	zlasyfAa( 'upper', 1, 4, 1, A, 1, 4, 0, IPIV, 1, 0, H, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'upper_m4_nb1' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, M=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var H;
	WORK = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	H = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	info = zlasyfAa( 'lower', 1, 0, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'M=0 returns 0' );
	assert.equal( reinterpret( A, 0 )[ 0 ], 0.0, 'M=0 leaves A unchanged' );
});

test( 'zlasyfAa: upper, M=0 quick return', function t() {
	var WORK;
	var IPIV;
	var info;
	var A;
	var H;
	WORK = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	H = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	info = zlasyfAa( 'upper', 1, 0, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'M=0 returns 0' );
	assert.equal( reinterpret( A, 0 )[ 0 ], 0.0, 'M=0 leaves A unchanged' );
});

test( 'zlasyfAa: lower, M=6, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.05 );
	setEl( view, 1, 0.5, -0.05 );
	setEl( view, 2, 0.3, 0.02 );
	setEl( view, 3, 0.2, 0.01 );
	setEl( view, 4, 9.0, -0.4 );
	setEl( view, 5, 0.4, 0.03 );
	setEl( view, 7, 2.0, -0.1 );
	setEl( view, 8, 0.6, 0.06 );
	setEl( view, 9, 0.4, -0.04 );
	setEl( view, 10, 0.3, 0.02 );
	setEl( view, 11, 8.0, 0.4 );
	setEl( view, 14, 3.0, 0.2 );
	setEl( view, 15, 0.7, -0.07 );
	setEl( view, 16, 0.5, 0.05 );
	setEl( view, 17, 7.0, -0.3 );
	setEl( view, 21, 4.0, -0.2 );
	setEl( view, 22, 0.8, 0.08 );
	setEl( view, 23, 0.6, -0.06 );
	setEl( view, 28, 5.0, 0.3 );
	setEl( view, 29, 0.9, -0.09 );
	setEl( view, 35, 6.0, -0.4 );
	IPIV = new Int32Array( 6 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 6 );
	zlasyfAa( 'lower', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'lower_pivot_m6_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, M=6, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.05 );
	setEl( view, 6, 0.5, -0.05 );
	setEl( view, 7, 2.0, -0.1 );
	setEl( view, 12, 0.3, 0.02 );
	setEl( view, 13, 0.6, 0.06 );
	setEl( view, 14, 3.0, 0.2 );
	setEl( view, 18, 0.2, 0.01 );
	setEl( view, 19, 0.4, -0.04 );
	setEl( view, 20, 0.7, -0.07 );
	setEl( view, 21, 4.0, -0.2 );
	setEl( view, 24, 9.0, -0.4 );
	setEl( view, 25, 0.3, 0.02 );
	setEl( view, 26, 0.5, 0.05 );
	setEl( view, 27, 0.8, 0.08 );
	setEl( view, 28, 5.0, 0.3 );
	setEl( view, 30, 0.4, 0.03 );
	setEl( view, 31, 8.0, 0.4 );
	setEl( view, 32, 7.0, -0.3 );
	setEl( view, 33, 0.6, -0.06 );
	setEl( view, 34, 0.9, -0.09 );
	setEl( view, 35, 6.0, -0.4 );
	IPIV = new Int32Array( 6 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 6 );
	zlasyfAa( 'upper', 1, 6, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'upper_pivot_m6_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, J1=2, M=5, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 0.1, 0.05 );
	setEl( view, 1, 0.2, -0.05 );
	setEl( view, 2, 0.3, 0.1 );
	setEl( view, 3, 0.1, -0.1 );
	setEl( view, 4, 0.2, 0.2 );
	setEl( view, 7, 1.0, 0.05 );
	setEl( view, 8, 0.5, -0.05 );
	setEl( view, 9, 0.3, 0.02 );
	setEl( view, 10, 9.0, -0.4 );
	setEl( view, 11, 0.2, 0.01 );
	setEl( view, 14, 2.0, -0.1 );
	setEl( view, 15, 0.6, 0.06 );
	setEl( view, 16, 0.4, -0.04 );
	setEl( view, 17, 8.0, 0.4 );
	setEl( view, 21, 3.0, 0.2 );
	setEl( view, 22, 0.7, -0.07 );
	setEl( view, 23, 0.5, 0.05 );
	setEl( view, 28, 4.0, -0.2 );
	setEl( view, 29, 0.8, 0.08 );
	setEl( view, 35, 5.0, 0.3 );
	IPIV = new Int32Array( 5 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 5 );
	zlasyfAa( 'lower', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'lower_pivot_j1_2_m5_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, J1=2, M=5, NB=3 with pivot swaps', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 36 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 0.1, 0.05 );
	setEl( view, 6, 0.2, -0.05 );
	setEl( view, 7, 1.0, 0.05 );
	setEl( view, 12, 0.3, 0.1 );
	setEl( view, 13, 0.5, -0.05 );
	setEl( view, 14, 2.0, -0.1 );
	setEl( view, 18, 0.1, -0.1 );
	setEl( view, 19, 0.3, 0.02 );
	setEl( view, 20, 0.6, 0.06 );
	setEl( view, 21, 3.0, 0.2 );
	setEl( view, 24, 0.2, 0.2 );
	setEl( view, 25, 9.0, -0.4 );
	setEl( view, 26, 8.0, 0.4 );
	setEl( view, 27, 0.7, -0.07 );
	setEl( view, 28, 4.0, -0.2 );
	setEl( view, 31, 0.2, 0.01 );
	setEl( view, 32, 0.4, -0.04 );
	setEl( view, 33, 0.5, 0.05 );
	setEl( view, 34, 0.8, 0.08 );
	setEl( view, 35, 5.0, 0.3 );
	IPIV = new Int32Array( 5 );
	H = new Complex128Array( 18 );
	WORK = new Complex128Array( 5 );
	zlasyfAa( 'upper', 2, 5, 3, A, 1, 6, 0, IPIV, 1, 0, H, 1, 6, 0, WORK, 1, 0 );
	tc = findCase( 'upper_pivot_j1_2_m5_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, M=8, NB=4 pivot at i2=M boundary', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 64 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.05 );
	setEl( view, 1, 0.5, -0.05 );
	setEl( view, 2, 0.3, 0.02 );
	setEl( view, 3, 0.2, 0.01 );
	setEl( view, 4, 0.1, -0.01 );
	setEl( view, 5, 0.15, 0.015 );
	setEl( view, 6, 0.25, -0.025 );
	setEl( view, 7, 9.0, -0.4 );
	setEl( view, 9, 2.0, -0.1 );
	setEl( view, 10, 0.6, 0.06 );
	setEl( view, 11, 0.4, -0.04 );
	setEl( view, 12, 0.2, 0.02 );
	setEl( view, 13, 0.18, -0.018 );
	setEl( view, 14, 0.28, 0.028 );
	setEl( view, 15, 5.0, 0.3 );
	setEl( view, 18, 3.0, 0.2 );
	setEl( view, 19, 0.7, -0.07 );
	setEl( view, 20, 0.3, 0.03 );
	setEl( view, 21, 0.22, -0.022 );
	setEl( view, 22, 0.32, 0.032 );
	setEl( view, 23, 4.0, -0.2 );
	setEl( view, 27, 4.0, 0.4 );
	setEl( view, 28, 0.4, -0.04 );
	setEl( view, 29, 0.26, 0.026 );
	setEl( view, 30, 0.36, -0.036 );
	setEl( view, 31, 3.0, 0.1 );
	setEl( view, 36, 5.0, -0.3 );
	setEl( view, 45, 6.0, 0.2 );
	setEl( view, 54, 7.0, -0.1 );
	setEl( view, 63, 8.0, 0.5 );
	IPIV = new Int32Array( 8 );
	H = new Complex128Array( 32 );
	WORK = new Complex128Array( 8 );
	zlasyfAa( 'lower', 1, 8, 4, A, 1, 8, 0, IPIV, 1, 0, H, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'lower_pivot_at_m_m8_nb4' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, M=8, NB=4 pivot at i2=M boundary', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 64 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.05 );
	setEl( view, 8, 0.5, -0.05 );
	setEl( view, 9, 2.0, -0.1 );
	setEl( view, 16, 0.3, 0.02 );
	setEl( view, 17, 0.6, 0.06 );
	setEl( view, 18, 3.0, 0.2 );
	setEl( view, 24, 0.2, 0.01 );
	setEl( view, 25, 0.4, -0.04 );
	setEl( view, 26, 0.7, -0.07 );
	setEl( view, 27, 4.0, 0.4 );
	setEl( view, 32, 0.1, -0.01 );
	setEl( view, 33, 0.2, 0.02 );
	setEl( view, 34, 0.3, 0.03 );
	setEl( view, 35, 0.4, -0.04 );
	setEl( view, 36, 5.0, -0.3 );
	setEl( view, 40, 0.15, 0.015 );
	setEl( view, 41, 0.18, -0.018 );
	setEl( view, 42, 0.22, -0.022 );
	setEl( view, 43, 0.26, 0.026 );
	setEl( view, 45, 6.0, 0.2 );
	setEl( view, 48, 0.25, -0.025 );
	setEl( view, 49, 0.28, 0.028 );
	setEl( view, 50, 0.32, 0.032 );
	setEl( view, 51, 0.36, -0.036 );
	setEl( view, 54, 7.0, -0.1 );
	setEl( view, 56, 9.0, -0.4 );
	setEl( view, 57, 5.0, 0.3 );
	setEl( view, 58, 4.0, -0.2 );
	setEl( view, 59, 3.0, 0.1 );
	setEl( view, 63, 8.0, 0.5 );
	IPIV = new Int32Array( 8 );
	H = new Complex128Array( 32 );
	WORK = new Complex128Array( 8 );
	zlasyfAa( 'upper', 1, 8, 4, A, 1, 8, 0, IPIV, 1, 0, H, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'upper_pivot_at_m_m8_nb4' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, M=7 NB=3 mid-column pivot (i2 < M)', function t() {
	var hView;
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 49 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.05 );
	setEl( view, 1, 0.5, -0.05 );
	setEl( view, 2, 0.3, 0.02 );
	setEl( view, 3, 9.0, -0.4 );
	setEl( view, 4, 0.2, 0.02 );
	setEl( view, 5, 0.1, -0.01 );
	setEl( view, 6, 0.05, 0.005 );
	setEl( view, 8, 2.0, -0.1 );
	setEl( view, 9, 0.6, 0.06 );
	setEl( view, 10, 0.4, -0.04 );
	setEl( view, 11, 0.3, 0.03 );
	setEl( view, 12, 0.25, -0.025 );
	setEl( view, 13, 0.18, 0.018 );
	setEl( view, 16, 3.0, 0.2 );
	setEl( view, 17, 0.7, -0.07 );
	setEl( view, 18, 0.5, 0.05 );
	setEl( view, 19, 0.4, -0.04 );
	setEl( view, 20, 0.32, 0.032 );
	setEl( view, 24, 4.0, -0.2 );
	setEl( view, 25, 0.8, 0.08 );
	setEl( view, 26, 0.6, -0.06 );
	setEl( view, 27, 0.45, 0.045 );
	setEl( view, 32, 5.0, 0.3 );
	setEl( view, 33, 0.9, -0.09 );
	setEl( view, 34, 0.55, 0.055 );
	setEl( view, 40, 6.0, -0.4 );
	setEl( view, 41, 0.65, 0.065 );
	setEl( view, 48, 7.0, 0.5 );
	IPIV = new Int32Array( 7 );
	H = new Complex128Array( 21 );
	hView = reinterpret( H, 0 );
	setEl( hView, 0, 1.0, 0.05 );
	setEl( hView, 1, 0.5, -0.05 );
	setEl( hView, 2, 0.3, 0.02 );
	setEl( hView, 3, 9.0, -0.4 );
	setEl( hView, 4, 0.2, 0.02 );
	setEl( hView, 5, 0.1, -0.01 );
	setEl( hView, 6, 0.05, 0.005 );
	WORK = new Complex128Array( 7 );
	zlasyfAa( 'lower', 1, 7, 3, A, 1, 7, 0, IPIV, 1, 0, H, 1, 7, 0, WORK, 1, 0 );
	tc = findCase( 'lower_pivot_mid_m7_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, M=7 NB=3 mid-column pivot (i2 < M)', function t() {
	var hView;
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 49 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.05 );
	setEl( view, 7, 0.5, -0.05 );
	setEl( view, 8, 2.0, -0.1 );
	setEl( view, 14, 0.3, 0.02 );
	setEl( view, 15, 0.6, 0.06 );
	setEl( view, 16, 3.0, 0.2 );
	setEl( view, 21, 9.0, -0.4 );
	setEl( view, 22, 0.4, -0.04 );
	setEl( view, 23, 0.7, -0.07 );
	setEl( view, 24, 4.0, -0.2 );
	setEl( view, 28, 0.2, 0.02 );
	setEl( view, 29, 0.3, 0.03 );
	setEl( view, 30, 0.5, 0.05 );
	setEl( view, 31, 0.8, 0.08 );
	setEl( view, 32, 5.0, 0.3 );
	setEl( view, 35, 0.1, -0.01 );
	setEl( view, 36, 0.25, -0.025 );
	setEl( view, 37, 0.4, -0.04 );
	setEl( view, 38, 0.6, -0.06 );
	setEl( view, 39, 0.9, -0.09 );
	setEl( view, 40, 6.0, -0.4 );
	setEl( view, 42, 0.05, 0.005 );
	setEl( view, 43, 0.18, 0.018 );
	setEl( view, 44, 0.32, 0.032 );
	setEl( view, 45, 0.45, 0.045 );
	setEl( view, 46, 0.55, 0.055 );
	setEl( view, 47, 0.65, 0.065 );
	setEl( view, 48, 7.0, 0.5 );
	IPIV = new Int32Array( 7 );
	H = new Complex128Array( 21 );
	hView = reinterpret( H, 0 );
	setEl( hView, 0, 1.0, 0.05 );
	setEl( hView, 1, 0.5, -0.05 );
	setEl( hView, 2, 0.3, 0.02 );
	setEl( hView, 3, 9.0, -0.4 );
	setEl( hView, 4, 0.2, 0.02 );
	setEl( hView, 5, 0.1, -0.01 );
	setEl( hView, 6, 0.05, 0.005 );
	WORK = new Complex128Array( 7 );
	zlasyfAa( 'upper', 1, 7, 3, A, 1, 7, 0, IPIV, 1, 0, H, 1, 7, 0, WORK, 1, 0 );
	tc = findCase( 'upper_pivot_mid_m7_nb3' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: lower, zero pivot triggers zlaset (identity matrix)', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 25 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.0 );
	setEl( view, 6, 1.0, 0.0 );
	setEl( view, 12, 1.0, 0.0 );
	setEl( view, 18, 1.0, 0.0 );
	setEl( view, 24, 1.0, 0.0 );
	IPIV = new Int32Array( 5 );
	H = new Complex128Array( 15 );
	WORK = new Complex128Array( 5 );
	zlasyfAa( 'lower', 1, 5, 3, A, 1, 5, 0, IPIV, 1, 0, H, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'lower_zero_pivot_id5' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: upper, zero pivot triggers zlaset (identity matrix)', function t() {
	var WORK;
	var IPIV;
	var view;
	var tc;
	var A;
	var H;
	A = new Complex128Array( 25 );
	view = reinterpret( A, 0 );
	setEl( view, 0, 1.0, 0.0 );
	setEl( view, 6, 1.0, 0.0 );
	setEl( view, 12, 1.0, 0.0 );
	setEl( view, 18, 1.0, 0.0 );
	setEl( view, 24, 1.0, 0.0 );
	IPIV = new Int32Array( 5 );
	H = new Complex128Array( 15 );
	WORK = new Complex128Array( 5 );
	zlasyfAa( 'upper', 1, 5, 3, A, 1, 5, 0, IPIV, 1, 0, H, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'upper_zero_pivot_id5' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, 1e-12, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'IPIV' );
});

test( 'zlasyfAa: throws on invalid uplo', function t() {
	var WORK;
	var IPIV;
	var A;
	var H;
	WORK = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	H = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	assert.throws( function fn() {
		zlasyfAa( 'invalid', 1, 1, 1, A, 1, 1, 0, IPIV, 1, 0, H, 1, 1, 0, WORK, 1, 0 );
	}, TypeError );
});
