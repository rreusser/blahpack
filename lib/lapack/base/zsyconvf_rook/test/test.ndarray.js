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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-lines, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyconvf_rook from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = readFileSync( path.join( fixtureDir, 'zsyconvf_rook.jsonl' ), 'utf8' );
var fixture = raw.trim().split( '\n' ).map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - raw JSON line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a test case in the fixture by name.
*
* @private
* @param {string} name - case name
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
* Copies a typed array to a plain Array.
*
* @private
* @param {TypedArray} arr - typed array
* @returns {Array} plain array copy
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that a scalar value is within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
* @returns {void}
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise within a relative tolerance.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - message
* @returns {void}
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a Fortran 1-based IPIV array to a JS 0-based Int32Array.
*
* @private
* @param {Array} ipivFortran - Fortran 1-based IPIV values
* @returns {Int32Array} 0-based IPIV encoding
*/
function convertIPIV( ipivFortran ) {
	var out = new Int32Array( ipivFortran.length );
	var i;
	for ( i = 0; i < ipivFortran.length; i++ ) {
		if ( ipivFortran[ i ] >= 0 ) {
			out[ i ] = ipivFortran[ i ] - 1;
		} else {
			// Fortran -p (1-based partner row p) -> JS ~(p-1) = -p (same numeric value)
			out[ i ] = ipivFortran[ i ];
		}
	}
	return out;
}

/**
* Converts a plain array of interleaved re/im pairs to a Complex128Array.
*
* @private
* @param {Array} arr - interleaved doubles
* @returns {Complex128Array} complex array
*/
function toComplexArray( arr ) {
	var out = new Complex128Array( arr.length / 2 );
	var v = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		v[ i ] = arr[ i ];
	}
	return out;
}


// TESTS //

test( 'zsyconvf_rook: upper_convert (all 1x1 pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'upper_convert' );
	N = 4;
	A = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	info = zsyconvf_rook( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: upper_revert (all 1x1 pivots)', function t() {
	var IPIV;
	var info;
	var conv;
	var rev;
	var N;
	var A;
	var E;
	conv = findCase( 'upper_convert' );
	rev = findCase( 'upper_revert' );
	N = 4;
	A = toComplexArray( conv.a_converted );
	IPIV = convertIPIV( conv.ipiv_trf );
	E = toComplexArray( conv.e );
	info = zsyconvf_rook( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: lower_convert (all 1x1 pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'lower_convert' );
	N = 4;
	A = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	info = zsyconvf_rook( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: lower_revert (all 1x1 pivots)', function t() {
	var IPIV;
	var info;
	var conv;
	var rev;
	var N;
	var A;
	var E;
	conv = findCase( 'lower_convert' );
	rev = findCase( 'lower_revert' );
	N = 4;
	A = toComplexArray( conv.a_converted );
	IPIV = convertIPIV( conv.ipiv_trf );
	E = toComplexArray( conv.e );
	info = zsyconvf_rook( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: n1_upper', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var E;
	tc = findCase( 'n1_upper' );
	A = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv );
	E = new Complex128Array( 1 );
	info = zsyconvf_rook( 'upper', 'convert', 1, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: n1_lower', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var E;
	tc = findCase( 'n1_lower' );
	A = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv );
	E = new Complex128Array( 1 );
	info = zsyconvf_rook( 'lower', 'convert', 1, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: upper_2x2_convert (with 2x2 rook pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'upper_2x2_convert' );
	N = 4;
	A = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	info = zsyconvf_rook( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: upper_2x2_revert (with 2x2 rook pivots)', function t() {
	var IPIV;
	var info;
	var conv;
	var rev;
	var N;
	var A;
	var E;
	conv = findCase( 'upper_2x2_convert' );
	rev = findCase( 'upper_2x2_revert' );
	N = 4;
	A = toComplexArray( conv.a_converted );
	IPIV = convertIPIV( conv.ipiv_trf );
	E = toComplexArray( conv.e );
	info = zsyconvf_rook( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: lower_2x2_convert (with 2x2 rook pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'lower_2x2_convert' );
	N = 4;
	A = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	info = zsyconvf_rook( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: lower_2x2_revert (with 2x2 rook pivots)', function t() {
	var IPIV;
	var info;
	var conv;
	var rev;
	var N;
	var A;
	var E;
	conv = findCase( 'lower_2x2_convert' );
	rev = findCase( 'lower_2x2_revert' );
	N = 4;
	A = toComplexArray( conv.a_converted );
	IPIV = convertIPIV( conv.ipiv_trf );
	E = toComplexArray( conv.e );
	info = zsyconvf_rook( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: N=0 quick return', function t() {
	var IPIV;
	var info;
	var A;
	var E;
	A = new Complex128Array( 0 );
	E = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	info = zsyconvf_rook( 'upper', 'convert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'upper convert' );
	info = zsyconvf_rook( 'lower', 'revert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'lower revert' );
});

test( 'zsyconvf_rook: round-trip upper 2x2 convert then revert restores A', function t() {
	var Aorig;
	var IPIV;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'upper_2x2_convert' );
	N = 4;
	A = toComplexArray( tc.a_factored );
	Aorig = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	zsyconvf_rook( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	zsyconvf_rook( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( Aorig, 0 ) ), 1e-14, 'round-trip' );
});

test( 'zsyconvf_rook: round-trip lower 2x2 convert then revert restores A', function t() {
	var Aorig;
	var IPIV;
	var tc;
	var N;
	var A;
	var E;
	tc = findCase( 'lower_2x2_convert' );
	N = 4;
	A = toComplexArray( tc.a_factored );
	Aorig = toComplexArray( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	zsyconvf_rook( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	zsyconvf_rook( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( Aorig, 0 ) ), 1e-14, 'round-trip' );
});
