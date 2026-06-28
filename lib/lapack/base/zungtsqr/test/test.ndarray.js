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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungtsqr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zungtsqr.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line into a fixture case.
*
* @private
* @param {string} line - JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( matchByName );

	/**
	* Whether a candidate case matches the desired name.
	*
	* @private
	* @param {Object} t - candidate case
	* @returns {boolean} true if names match
	*/
	function matchByName( t ) {
		return t.name === name;
	}
}

/**
* Asserts that two doubles are close enough.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var ref;
	var rel;
	var ae;

	ae = Math.abs( expected );
	ref = ( ae > 1.0 ) ? ae : 1.0;
	rel = Math.abs( actual - expected ) / ref;
	assert.ok( rel <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (rel ' + rel + ')' );
}

/**
* Asserts that two flat arrays of doubles are close.
*
* @private
* @param {ArrayLike} actual - actual interleaved values
* @param {ArrayLike} expected - expected interleaved values
* @param {number} tol - relative tolerance
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
* Builds a Complex128Array from an interleaved `[re,im,re,im,...]` flat array.
*
* @private
* @param {Array} flat - interleaved real/imag pairs
* @returns {Complex128Array} complex array of length flat.length/2
*/
function makeComplex( flat ) {
	var view;
	var arr;
	var i;

	arr = new Complex128Array( flat.length / 2 );
	view = reinterpret( arr, 0 );
	for ( i = 0; i < flat.length; i++ ) {
		view[ i ] = flat[ i ];
	}
	return arr;
}

/**
* Runs a fixture-based zungtsqr test case.
*
* @private
* @param {string} name - fixture case name
*/
function runCase( name ) {
	var nbloc;
	var WORK;
	var info;
	var view;
	var tc;
	var A;
	var T;

	tc = findCase( name );
	A = makeComplex( tc.V ); // M-by-N (column-major, contiguous)
	T = makeComplex( tc.T ); // LDT-by-TCOLS (column-major, contiguous)
	nbloc = ( tc.NB < tc.N ) ? tc.NB : tc.N;
	WORK = new Complex128Array( ( tc.M + nbloc ) * tc.N );

	info = zungtsqr( tc.M, tc.N, tc.MB, tc.NB, A, 1, tc.M, 0, T, 1, tc.LDT, 0, WORK, 1, 0 );

	assert.strictEqual( info, tc.INFO, name + ': INFO' );
	view = reinterpret( A, 0 );
	assertArrayClose( view, tc.Q, 1e-12, name + ': Q' );
}


// TESTS //

test( 'zungtsqr ndarray is a function', function t() {
	assert.strictEqual( typeof zungtsqr, 'function', 'is a function' );
});

test( 'zungtsqr basic blocked TSQR (KK > 0 trailing block)', function t() {
	runCase( 'basic_blocked' );
});

test( 'zungtsqr square M=N (single input block)', function t() {
	runCase( 'square_singleblock' );
});

test( 'zungtsqr KK=0 (M-N divides MB-N evenly)', function t() {
	runCase( 'kk0_case' );
});

test( 'zungtsqr tall narrow (NB=1)', function t() {
	runCase( 'tall_narrow_nb1' );
});

test( 'zungtsqr N=1 single column', function t() {
	runCase( 'n_eq_1' );
});

test( 'zungtsqr many small input blocks', function t() {
	runCase( 'many_small_blocks' );
});

test( 'zungtsqr quick-return: M=0', function t() {
	var WORK;
	var info;
	var A;
	var T;

	WORK = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	info = zungtsqr( 0, 0, 4, 2, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'M=0 -> info 0' );
});

test( 'zungtsqr quick-return: N=0', function t() {
	var WORK;
	var info;
	var A;
	var T;

	WORK = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	info = zungtsqr( 8, 0, 4, 2, A, 1, 1, 0, T, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'N=0 -> info 0' );
});

test( 'zungtsqr orthonormality: Q^H * Q = I', function t() {
	var nbloc;
	var WORK;
	var view;
	var dotI;
	var dotR;
	var idxI;
	var idxJ;
	var dot;
	var tc;
	var A;
	var T;
	var i;
	var j;
	var k;

	// Use the basic_blocked fixture and verify Q^H*Q == I directly from JS output.
	tc = findCase( 'basic_blocked' );
	A = makeComplex( tc.V );
	T = makeComplex( tc.T );
	nbloc = ( tc.NB < tc.N ) ? tc.NB : tc.N;
	WORK = new Complex128Array( ( tc.M + nbloc ) * tc.N );
	zungtsqr( tc.M, tc.N, tc.MB, tc.NB, A, 1, tc.M, 0, T, 1, tc.LDT, 0, WORK, 1, 0 );

	view = reinterpret( A, 0 );
	for ( j = 0; j < tc.N; j++ ) {
		for ( i = 0; i < tc.N; i++ ) {
			dotR = 0.0;
			dotI = 0.0;

			// (Q^H * Q)[i,j] = sum_k conj(Q[k,i]) * Q[k,j]
			for ( k = 0; k < tc.M; k++ ) {
				idxI = ( ( i * tc.M ) + k ) * 2; // index into Q[k,i]
				idxJ = ( ( j * tc.M ) + k ) * 2; // index into Q[k,j]

				// conj(Q[k,i]) = (re, -im); Q[k,j] = (Re, Im); product = (re*Re + im*Im) + i*(re*Im - im*Re)
				dotR += ( ( view[ idxI ] * view[ idxJ ] ) + ( view[ idxI + 1 ] * view[ idxJ + 1 ] ) );
				dotI += ( ( view[ idxI ] * view[ idxJ + 1 ] ) - ( view[ idxI + 1 ] * view[ idxJ ] ) );
			}
			dot = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( dotR - dot ) < 1e-12, 'orthonormality real part [' + i + ',' + j + ']: ' + dotR );
			assert.ok( Math.abs( dotI ) < 1e-12, 'orthonormality imag part [' + i + ',' + j + ']: ' + dotI );
		}
	}
});

test( 'zungtsqr custom strides/offsets via ndarray (offsetWork)', function t() {
	var nbloc;
	var WORK;
	var info;
	var view;
	var pad;
	var tc;
	var A;
	var T;

	tc = findCase( 'tall_narrow_nb1' );
	A = makeComplex( tc.V );
	T = makeComplex( tc.T );
	nbloc = ( tc.NB < tc.N ) ? tc.NB : tc.N;
	pad = 7;
	WORK = new Complex128Array( pad + ( ( tc.M + nbloc ) * tc.N ) );

	info = zungtsqr( tc.M, tc.N, tc.MB, tc.NB, A, 1, tc.M, 0, T, 1, tc.LDT, 0, WORK, 1, pad );
	assert.strictEqual( info, 0, 'INFO' );
	view = reinterpret( A, 0 );
	assertArrayClose( view, tc.Q, 1e-12, 'Q (with offsetWork)' );
});
