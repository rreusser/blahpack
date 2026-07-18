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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const raw = readFileSync( path.join( fixtureDir, 'zsyconvf_rook.jsonl' ), 'utf8' );
const fixture = raw.trim().split( '\n' ).map( parseLine );


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
	let i;
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
	const out = [];
	let i;
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	let i;
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
	const out = new Int32Array( ipivFortran.length );
	let i;
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
	const out = new Complex128Array( arr.length / 2 );
	const v = reinterpret( out, 0 );
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		v[ i ] = arr[ i ];
	}
	return out;
}


// TESTS //

test( 'zsyconvf_rook: upper_convert (all 1x1 pivots)', function t() {
	const tc = findCase( 'upper_convert' );
	const N = 4;
	const A = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv_trf );
	const E = new Complex128Array( N );
	const info = zsyconvf_rook( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: upper_revert (all 1x1 pivots)', function t() {
	const conv = findCase( 'upper_convert' );
	const rev = findCase( 'upper_revert' );
	const N = 4;
	const A = toComplexArray( conv.a_converted );
	const IPIV = convertIPIV( conv.ipiv_trf );
	const E = toComplexArray( conv.e );
	const info = zsyconvf_rook( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: lower_convert (all 1x1 pivots)', function t() {
	const tc = findCase( 'lower_convert' );
	const N = 4;
	const A = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv_trf );
	const E = new Complex128Array( N );
	const info = zsyconvf_rook( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: lower_revert (all 1x1 pivots)', function t() {
	const conv = findCase( 'lower_convert' );
	const rev = findCase( 'lower_revert' );
	const N = 4;
	const A = toComplexArray( conv.a_converted );
	const IPIV = convertIPIV( conv.ipiv_trf );
	const E = toComplexArray( conv.e );
	const info = zsyconvf_rook( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: n1_upper', function t() {
	const tc = findCase( 'n1_upper' );
	const A = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv );
	const E = new Complex128Array( 1 );
	const info = zsyconvf_rook( 'upper', 'convert', 1, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: n1_lower', function t() {
	const tc = findCase( 'n1_lower' );
	const A = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv );
	const E = new Complex128Array( 1 );
	const info = zsyconvf_rook( 'lower', 'convert', 1, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: upper_2x2_convert (with 2x2 rook pivots)', function t() {
	const tc = findCase( 'upper_2x2_convert' );
	const N = 4;
	const A = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv_trf );
	const E = new Complex128Array( N );
	const info = zsyconvf_rook( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: upper_2x2_revert (with 2x2 rook pivots)', function t() {
	const conv = findCase( 'upper_2x2_convert' );
	const rev = findCase( 'upper_2x2_revert' );
	const N = 4;
	const A = toComplexArray( conv.a_converted );
	const IPIV = convertIPIV( conv.ipiv_trf );
	const E = toComplexArray( conv.e );
	const info = zsyconvf_rook( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: lower_2x2_convert (with 2x2 rook pivots)', function t() {
	const tc = findCase( 'lower_2x2_convert' );
	const N = 4;
	const A = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv_trf );
	const E = new Complex128Array( N );
	const info = zsyconvf_rook( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf_rook: lower_2x2_revert (with 2x2 rook pivots)', function t() {
	const conv = findCase( 'lower_2x2_convert' );
	const rev = findCase( 'lower_2x2_revert' );
	const N = 4;
	const A = toComplexArray( conv.a_converted );
	const IPIV = convertIPIV( conv.ipiv_trf );
	const E = toComplexArray( conv.e );
	const info = zsyconvf_rook( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), rev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconvf_rook: N=0 quick return', function t() {
	let info;
	const A = new Complex128Array( 0 );
	const E = new Complex128Array( 0 );
	const IPIV = new Int32Array( 0 );
	info = zsyconvf_rook( 'upper', 'convert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'upper convert' );
	info = zsyconvf_rook( 'lower', 'revert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'lower revert' );
});

test( 'zsyconvf_rook: round-trip upper 2x2 convert then revert restores A', function t() {
	const tc = findCase( 'upper_2x2_convert' );
	const N = 4;
	const A = toComplexArray( tc.a_factored );
	const Aorig = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv_trf );
	const E = new Complex128Array( N );
	zsyconvf_rook( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	zsyconvf_rook( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( Aorig, 0 ) ), 1e-14, 'round-trip' );
});

test( 'zsyconvf_rook: round-trip lower 2x2 convert then revert restores A', function t() {
	const tc = findCase( 'lower_2x2_convert' );
	const N = 4;
	const A = toComplexArray( tc.a_factored );
	const Aorig = toComplexArray( tc.a_factored );
	const IPIV = convertIPIV( tc.ipiv_trf );
	const E = new Complex128Array( N );
	zsyconvf_rook( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	zsyconvf_rook( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), toArray( reinterpret( Aorig, 0 ) ), 1e-14, 'round-trip' );
});
