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
import zlamtsqr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zlamtsqr.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parse a JSON line into a fixture case.
*
* @private
* @param {string} line - JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locate a fixture case by name.
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
* Runs a SIDE='L' fixture-based test case (apply Q or Q^H from the left).
*
* @private
* @param {string} name - fixture case name
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
*/
function runLeft( name, trans ) {
	var WORK;
	var info;
	var view;
	var tc;
	var A;
	var T;
	var C;

	tc = findCase( name );
	A = makeComplex( tc.A ); // M-by-K (column-major, contiguous)
	T = makeComplex( tc.T ); // NB-by-(numblk*K) (column-major, contiguous)
	C = makeComplex( tc.C0 ); // M-by-N (column-major, contiguous)
	WORK = new Complex128Array( tc.N * tc.NB );

	info = zlamtsqr( 'left', trans, tc.M, tc.N, tc.K, tc.MB, tc.NB, A, 1, tc.M, 0, T, 1, tc.LDT, 0, C, 1, tc.M, 0, WORK, 1, 0, WORK.length );

	assert.strictEqual( info, tc.INFO, name + ': INFO' );
	view = reinterpret( C, 0 );
	assertArrayClose( view, tc.C, 1e-12, name + ': C' );
}

/**
* Runs a SIDE='R' fixture-based test case (apply Q or Q^H from the right).
*
* @private
* @param {string} name - fixture case name
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
*/
function runRight( name, trans ) {
	var WORK;
	var info;
	var view;
	var tc;
	var A;
	var T;
	var C;

	tc = findCase( name );
	A = makeComplex( tc.A ); // N-by-K (column-major, contiguous)
	T = makeComplex( tc.T ); // NB-by-(numblk*K) (column-major, contiguous)
	C = makeComplex( tc.C0 ); // M-by-N (column-major, contiguous)
	WORK = new Complex128Array( tc.M * tc.NB );

	info = zlamtsqr( 'right', trans, tc.M, tc.N, tc.K, tc.MB, tc.NB, A, 1, tc.N, 0, T, 1, tc.LDT, 0, C, 1, tc.M, 0, WORK, 1, 0, WORK.length );

	assert.strictEqual( info, tc.INFO, name + ': INFO' );
	view = reinterpret( C, 0 );
	assertArrayClose( view, tc.C, 1e-12, name + ': C' );
}


// TESTS //

test( 'zlamtsqr ndarray is a function', function t() {
	assert.strictEqual( typeof zlamtsqr, 'function', 'is a function' );
});

test( 'zlamtsqr (left, no-transpose) blocked TSQR apply', function t() {
	runLeft( 'left_notrans_blocked', 'no-transpose' );
});

test( 'zlamtsqr (left, conjugate-transpose) blocked TSQR apply', function t() {
	runLeft( 'left_ctrans_blocked', 'conjugate-transpose' );
});

test( 'zlamtsqr (right, no-transpose) blocked TSQR apply', function t() {
	runRight( 'right_notrans_blocked', 'no-transpose' );
});

test( 'zlamtsqr (right, conjugate-transpose) blocked TSQR apply', function t() {
	runRight( 'right_ctrans_blocked', 'conjugate-transpose' );
});

test( 'zlamtsqr (left, no-transpose) MB > M fall-through to zgemqrt', function t() {
	runLeft( 'left_notrans_fallthrough', 'no-transpose' );
});

test( 'zlamtsqr (left, conjugate-transpose) MB > M fall-through to zgemqrt', function t() {
	runLeft( 'left_ctrans_fallthrough', 'conjugate-transpose' );
});

test( 'zlamtsqr (left, no-transpose) KK=0 evenly divides into blocks', function t() {
	runLeft( 'left_notrans_kk0', 'no-transpose' );
});

test( 'zlamtsqr (left, conjugate-transpose) KK=0 evenly divides into blocks', function t() {
	runLeft( 'left_ctrans_kk0', 'conjugate-transpose' );
});

test( 'zlamtsqr (right, no-transpose) KK=0 evenly divides into blocks', function t() {
	runRight( 'right_notrans_kk0', 'no-transpose' );
});

test( 'zlamtsqr (right, conjugate-transpose) KK=0 evenly divides into blocks', function t() {
	runRight( 'right_ctrans_kk0', 'conjugate-transpose' );
});

test( 'zlamtsqr (right, no-transpose) MB > N fall-through to zgemqrt', function t() {
	runRight( 'right_notrans_fallthrough', 'no-transpose' );
});

test( 'zlamtsqr (right, conjugate-transpose) MB > N fall-through to zgemqrt', function t() {
	runRight( 'right_ctrans_fallthrough', 'conjugate-transpose' );
});

test( 'zlamtsqr quick-return: M=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	var C;

	WORK = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	info = zlamtsqr( 'left', 'no-transpose', 0, 4, 0, 4, 2, A, 1, 1, 0, T, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( info, 0, 'M=0 -> info 0' );
});

test( 'zlamtsqr quick-return: N=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	var C;

	WORK = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	info = zlamtsqr( 'left', 'no-transpose', 4, 0, 2, 4, 2, A, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( info, 0, 'N=0 -> info 0' );
});

test( 'zlamtsqr quick-return: K=0', function t() {
	var WORK;
	var info;
	var A;
	var T;
	var C;

	WORK = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	T = new Complex128Array( 1 );
	C = new Complex128Array( 16 );
	info = zlamtsqr( 'left', 'no-transpose', 4, 4, 0, 4, 2, A, 1, 1, 0, T, 1, 1, 0, C, 1, 4, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( info, 0, 'K=0 -> info 0' );
});
