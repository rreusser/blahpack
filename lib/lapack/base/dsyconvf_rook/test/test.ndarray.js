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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconvf_rook from './../lib/ndarray.js';
const dsyconvf_rookNdarray = dsyconvf_rook;


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dsyconvf_rook.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locates a named fixture case.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two arrays are elementwise close in absolute value.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Converts a Fortran IPIV vector (1-based) into the JS 0-based convention.
* Positive entries are decremented; negative entries are preserved (bitwise
* NOT convention).
*
* @private
* @param {Array} fipiv - Fortran IPIV
* @returns {Int32Array} JS IPIV
*/
function ipivToJS( fipiv ) {
	let i;
	const out = new Int32Array( fipiv.length );
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out[ i ] = fipiv[ i ] - 1;
		} else {
			out[ i ] = fipiv[ i ];
		}
	}
	return out;
}

/**
* Builds a column-major 5-by-5 matrix with a distinct value at every element of the stored triangle.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @returns {Float64Array} the constructed matrix
*/
function build5x5( uplo ) {
	let i, j;
	const A = new Float64Array( 25 );
	if ( uplo === 'upper' ) {
		for ( j = 0; j < 5; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				A[ i + ( j * 5 ) ] = 1.0 + i + ( j * 5 );
			}
		}
	} else {
		for ( j = 0; j < 5; j++ ) {
			for ( i = j; i < 5; i++ ) {
				A[ i + ( j * 5 ) ] = 1.0 + i + ( j * 5 );
			}
		}
	}
	return A;
}


// TESTS //

test( 'dsyconvf_rook: upper convert (2x2 pivots)', function t() {

	const tc = findCase( 'upper_convert' );
	const A = new Float64Array( tc.a_factored );
	const e = new Float64Array( 4 );
	const IPIV = ipivToJS( tc.ipiv_trf );
	const info = dsyconvf_rook( 'upper', 'convert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'A' );
	assertArrayClose( e, tc.e, 1e-14, 'e' );
});

test( 'dsyconvf_rook: upper revert (round-trip, 2x2 pivots)', function t() {

	const conv = findCase( 'upper_convert' );
	const rev = findCase( 'upper_revert' );
	const A = new Float64Array( conv.a_converted );
	const e = new Float64Array( conv.e );
	const IPIV = ipivToJS( conv.ipiv_trf );
	const info = dsyconvf_rook( 'upper', 'revert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, rev.a_reverted, 1e-14, 'A' );
});

test( 'dsyconvf_rook: lower convert (2x2 pivots)', function t() {

	const tc = findCase( 'lower_convert' );
	const A = new Float64Array( tc.a_factored );
	const e = new Float64Array( 4 );
	const IPIV = ipivToJS( tc.ipiv_trf );
	const info = dsyconvf_rook( 'lower', 'convert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'A' );
	assertArrayClose( e, tc.e, 1e-14, 'e' );
});

test( 'dsyconvf_rook: lower revert (round-trip, 2x2 pivots)', function t() {

	const conv = findCase( 'lower_convert' );
	const rev = findCase( 'lower_revert' );
	const A = new Float64Array( conv.a_converted );
	const e = new Float64Array( conv.e );
	const IPIV = ipivToJS( conv.ipiv_trf );
	const info = dsyconvf_rook( 'lower', 'revert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, rev.a_reverted, 1e-14, 'A' );
});

test( 'dsyconvf_rook: upper convert (all 1x1 pivots)', function t() {

	const tc = findCase( 'upper_1x1_convert' );
	const A = new Float64Array( tc.a_factored );
	const e = new Float64Array( 4 );
	const IPIV = ipivToJS( tc.ipiv_trf );
	const info = dsyconvf_rook( 'upper', 'convert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'A' );
	assertArrayClose( e, tc.e, 1e-14, 'e' );
});

test( 'dsyconvf_rook: upper revert (all 1x1 pivots, round-trip)', function t() {

	const conv = findCase( 'upper_1x1_convert' );
	const rev = findCase( 'upper_1x1_revert' );
	const A = new Float64Array( conv.a_converted );
	const e = new Float64Array( conv.e );
	const IPIV = ipivToJS( conv.ipiv_trf );
	const info = dsyconvf_rook( 'upper', 'revert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, rev.a_reverted, 1e-14, 'A' );
});

test( 'dsyconvf_rook: lower convert (all 1x1 pivots)', function t() {

	const tc = findCase( 'lower_1x1_convert' );
	const A = new Float64Array( tc.a_factored );
	const e = new Float64Array( 4 );
	const IPIV = ipivToJS( tc.ipiv_trf );
	const info = dsyconvf_rook( 'lower', 'convert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a_converted, 1e-14, 'A' );
	assertArrayClose( e, tc.e, 1e-14, 'e' );
});

test( 'dsyconvf_rook: lower revert (all 1x1 pivots, round-trip)', function t() {

	const conv = findCase( 'lower_1x1_convert' );
	const rev = findCase( 'lower_1x1_revert' );
	const A = new Float64Array( conv.a_converted );
	const e = new Float64Array( conv.e );
	const IPIV = ipivToJS( conv.ipiv_trf );
	const info = dsyconvf_rook( 'lower', 'revert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, rev.a_reverted, 1e-14, 'A' );
});

test( 'dsyconvf_rook: N=1 upper', function t() {

	const tc = findCase( 'n1_upper' );
	const A = new Float64Array( [ 5.0 ] );
	const e = new Float64Array( [ 99.0 ] );
	const IPIV = new Int32Array( [ 0 ] );
	const info = dsyconvf_rook( 'upper', 'convert', 1, A, 1, 1, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'A' );
	assertArrayClose( e, tc.e, 1e-14, 'e' );
});

test( 'dsyconvf_rook: N=1 lower', function t() {

	const tc = findCase( 'n1_lower' );
	const A = new Float64Array( [ 3.0 ] );
	const e = new Float64Array( [ 99.0 ] );
	const IPIV = new Int32Array( [ 0 ] );
	const info = dsyconvf_rook( 'lower', 'convert', 1, A, 1, 1, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'A' );
	assertArrayClose( e, tc.e, 1e-14, 'e' );
});

test( 'dsyconvf_rook: N=0 quick return', function t() {
	let info;

	const A = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const IPIV = new Int32Array( 0 );
	info = dsyconvf_rook( 'upper', 'convert', 0, A, 1, 1, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	info = dsyconvf_rook( 'lower', 'revert', 0, A, 1, 1, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dsyconvf_rook: synthetic lower round-trip (all 1x1 pivots with swaps)', function t() {
	let info;

	const A = build5x5( 'lower' );
	const A0 = new Float64Array( A );
	const IPIV = new Int32Array( [ 0, 2, 2, 3, 4 ] );
	const e = new Float64Array( 5 );
	info = dsyconvf_rook( 'lower', 'convert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	info = dsyconvf_rook( 'lower', 'revert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, A0, 1e-14, 'A round-trip' );
});

test( 'dsyconvf_rook: synthetic upper round-trip (all 1x1 pivots with swaps)', function t() {
	let info;

	const A = build5x5( 'upper' );
	const A0 = new Float64Array( A );
	const IPIV = new Int32Array( [ 0, 1, 3, 3, 4 ] );
	const e = new Float64Array( 5 );
	info = dsyconvf_rook( 'upper', 'convert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	info = dsyconvf_rook( 'upper', 'revert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, A0, 1e-14, 'A round-trip' );
});

test( 'dsyconvf_rook: synthetic upper round-trip (2x2 block with real swaps)', function t() {
	let info;

	const A = build5x5( 'upper' );
	const A0 = new Float64Array( A );

	// Upper 2x2 block at rows 2 and 3 (rook encoding: both IPIV[2] and IPIV[3] negative); IPIV[2]=~0=-1 swaps row 2 with row 0; IPIV[3]=~1=-2 swaps row 3 with row 1.
	const IPIV = new Int32Array( [ 0, 1, -1, -2, 4 ] );
	const e = new Float64Array( 5 );
	info = dsyconvf_rook( 'upper', 'convert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	info = dsyconvf_rook( 'upper', 'revert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, A0, 1e-14, 'A round-trip' );
});

test( 'dsyconvf_rook: synthetic lower round-trip (2x2 block with real swaps)', function t() {
	let info;

	const A = build5x5( 'lower' );
	const A0 = new Float64Array( A );

	// Lower 2x2 block at rows 2 and 3 with real interchanges: IPIV[2]=~0=-1 swaps row 2 with row 0; IPIV[3]=~4=-5 swaps row 3 with row 4.
	const IPIV = new Int32Array( [ 0, 1, -1, -5, 4 ] );
	const e = new Float64Array( 5 );
	info = dsyconvf_rook( 'lower', 'convert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	info = dsyconvf_rook( 'lower', 'revert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, A0, 1e-14, 'A round-trip' );
});

test( 'dsyconvf_rook: synthetic upper round-trip (no-op 2x2 block)', function t() {
	let info;

	const A = build5x5( 'upper' );
	const A0 = new Float64Array( A );
	const IPIV = new Int32Array( [ 0, -2, -3, 3, 4 ] );
	const e = new Float64Array( 5 );
	info = dsyconvf_rook( 'upper', 'convert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	info = dsyconvf_rook( 'upper', 'revert', 5, A, 1, 5, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( A, A0, 1e-14, 'A round-trip' );
});

test( 'dsyconvf_rook (ndarray): success path', function t() {

	const A = new Float64Array( [ 4.0, 2.0, 1.0, 0.0, 0.0, 5.0, 3.0, 1.0, 0.0, 0.0, 6.0, 2.0, 0.0, 0.0, 0.0, 7.0 ] );
	const e = new Float64Array( 4 );
	const IPIV = new Int32Array( [ 0, 1, 2, 3 ] );
	const info = dsyconvf_rookNdarray( 'upper', 'convert', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dsyconvf_rook (ndarray): invalid uplo throws', function t() {
	assert.throws( function throws() {
		dsyconvf_rookNdarray( 'nope', 'convert', 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf_rook (ndarray): invalid way throws', function t() {
	assert.throws( function throws() {
		dsyconvf_rookNdarray( 'upper', 'nope', 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dsyconvf_rook (ndarray): negative N throws', function t() {
	assert.throws( function throws() {
		dsyconvf_rookNdarray( 'upper', 'convert', -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});
