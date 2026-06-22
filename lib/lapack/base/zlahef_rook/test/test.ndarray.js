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

import test from 'node:test';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlahefRook from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_DIR = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var LINES = readFileSync( path.join( FIXTURE_DIR, 'zlahef_rook.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURE = LINES.map( parseLine );


// FUNCTIONS //

/**
* Parses a fixture line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} fixture
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURE.length; i++ ) {
		if ( FIXTURE[ i ].name === name ) {
			return FIXTURE[ i ];
		}
	}
	return null;
}

/**
* Asserts that two arrays of numbers are element-wise close.
*
* @private
* @param {ArrayLike} actual - actual values
* @param {ArrayLike} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol * Math.max( 1.0, Math.abs( expected[ i ] ) ), msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Converts a Fortran 1-based IPIV value to the JS encoding.
*
* @private
* @param {integer} f - Fortran IPIV value (1-based; negative for 2x2 pivots)
* @returns {integer} JS-encoded pivot index
*/
function expectedIpiv( f ) {
	if ( f >= 0 ) {
		return f - 1;
	}
	return f;
}

/**
* Compares the resulting `A`, `info`, `kb`, and `IPIV` against a fixture.
*
* @private
* @param {Complex128Array} A - factored matrix
* @param {Int32Array} IPIV - pivot indices
* @param {Object} result - `{info, kb}` returned by `zlahefRook`
* @param {Object} tc - fixture case
* @param {string} uplo - `'upper'` or `'lower'`
*/
function compareFixture( A, IPIV, result, tc, uplo ) {
	var iStart;
	var iEnd;
	var n;
	var i;
	n = tc.n;
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.kb, tc.kb, 'kb' );
	if ( uplo === 'lower' ) {
		iStart = 0;
		iEnd = result.kb;
	} else {
		iStart = n - result.kb;
		iEnd = n;
	}
	for ( i = iStart; i < iEnd; i++ ) {
		assert.equal( IPIV[ i ], expectedIpiv( tc.ipiv[ i ] ), 'ipiv[' + i + ']' );
	}
}

/**
* Throws-helper for the invalid-uplo test.
*
* @private
*/
function throwsInvalidUplo() {
	zlahefRook( 'invalid', 2, 2, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( 2 ), 1, 0, new Complex128Array( 4 ), 1, 2, 0 );
}


// TESTS //

test( 'zlahef_rook: lower_6x6_nb3', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		// Col 0
		0.01,
		0,
		5,
		-1,
		1,
		1,
		0.5,
		-0.5,
		2,
		0,
		1,
		-1,

		// Col 1
		0,
		0,
		0.02,
		0,
		2,
		-1,
		1,
		1,
		1.5,
		-0.5,
		0,
		-3,

		// Col 2
		0,
		0,
		0,
		0,
		8,
		0,
		3,
		0,
		0,
		2,
		1,
		0,

		// Col 3
		0,
		0,
		0,
		0,
		0,
		0,
		7,
		0,
		1,
		0.5,
		2,
		-2,

		// Col 4
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		0,
		0.5,
		1,

		// Col 5
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		5,
		0
	]);
	IPIV = new Int32Array( 6 );
	W = new Complex128Array( 6 * 3 );
	result = zlahefRook( 'lower', 6, 3, A, 1, 6, 0, IPIV, 1, 0, W, 1, 6, 0 );
	compareFixture( A, IPIV, result, findCase( 'lower_6x6_nb3' ), 'lower' );
});

test( 'zlahef_rook: upper_6x6_nb3', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		// Col 0
		0.01,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 1
		5,
		1,
		0.02,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 2
		1,
		-1,
		2,
		1,
		8,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 3
		0.5,
		0.5,
		1,
		-1,
		3,
		0,
		7,
		0,
		0,
		0,
		0,
		0,

		// Col 4
		2,
		0,
		1.5,
		0.5,
		0,
		-2,
		1,
		-0.5,
		6,
		0,
		0,
		0,

		// Col 5
		1,
		1,
		0,
		3,
		1,
		0,
		2,
		2,
		0.5,
		-1,
		5,
		0
	]);
	IPIV = new Int32Array( 6 );
	W = new Complex128Array( 6 * 3 );
	result = zlahefRook( 'upper', 6, 3, A, 1, 6, 0, IPIV, 1, 0, W, 1, 6, 0 );
	compareFixture( A, IPIV, result, findCase( 'upper_6x6_nb3' ), 'upper' );
});

test( 'zlahef_rook: lower_4x4_full_nb8', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		4,
		0,
		1,
		0.5,
		2,
		-1,
		0.5,
		0.1,
		0,
		0,
		3,
		0,
		0.5,
		-0.2,
		1,
		0.3,
		0,
		0,
		0,
		0,
		5,
		0,
		0.2,
		-0.4,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		0
	]);
	IPIV = new Int32Array( 4 );
	W = new Complex128Array( 4 * 8 );
	result = zlahefRook( 'lower', 4, 8, A, 1, 4, 0, IPIV, 1, 0, W, 1, 4, 0 );
	compareFixture( A, IPIV, result, findCase( 'lower_4x4_full_nb8' ), 'lower' );
});

test( 'zlahef_rook: upper_4x4_full_nb8', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		-0.5,
		3,
		0,
		0,
		0,
		0,
		0,
		2,
		1,
		0.5,
		0.2,
		5,
		0,
		0,
		0,
		0.5,
		-0.1,
		1,
		-0.3,
		0.2,
		0.4,
		6,
		0
	]);
	IPIV = new Int32Array( 4 );
	W = new Complex128Array( 4 * 8 );
	result = zlahefRook( 'upper', 4, 8, A, 1, 4, 0, IPIV, 1, 0, W, 1, 4, 0 );
	compareFixture( A, IPIV, result, findCase( 'upper_4x4_full_nb8' ), 'upper' );
});

test( 'zlahef_rook: lower_5x5_chase_full', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		// Col 0
		0.1,
		0,
		1,
		0.5,
		2,
		-1,
		3,
		0.5,
		4,
		-0.3,

		// Col 1
		0,
		0,
		0.1,
		0,
		5,
		1,
		10,
		-2,
		20,
		1,

		// Col 2
		0,
		0,
		0,
		0,
		0.1,
		0,
		50,
		1,
		100,
		0.5,

		// Col 3
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0,
		500,
		-1,

		// Col 4
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0
	]);
	IPIV = new Int32Array( 5 );
	W = new Complex128Array( 5 * 8 );
	result = zlahefRook( 'lower', 5, 8, A, 1, 5, 0, IPIV, 1, 0, W, 1, 5, 0 );
	compareFixture( A, IPIV, result, findCase( 'lower_5x5_chase_full' ), 'lower' );
});

test( 'zlahef_rook: upper_5x5_chase_full', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		// Col 0
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 1
		1,
		-0.5,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 2
		2,
		1,
		5,
		-1,
		0.1,
		0,
		0,
		0,
		0,
		0,

		// Col 3
		3,
		-0.5,
		10,
		2,
		50,
		-1,
		0.1,
		0,
		0,
		0,

		// Col 4
		4,
		0.3,
		20,
		-1,
		100,
		-0.5,
		500,
		1,
		0.1,
		0
	]);
	IPIV = new Int32Array( 5 );
	W = new Complex128Array( 5 * 8 );
	result = zlahefRook( 'upper', 5, 8, A, 1, 5, 0, IPIV, 1, 0, W, 1, 5, 0 );
	compareFixture( A, IPIV, result, findCase( 'upper_5x5_chase_full' ), 'upper' );
});

test( 'zlahef_rook: lower_5x5_chase_nb3', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		0.1,
		0,
		1,
		0.5,
		2,
		-1,
		3,
		0.5,
		4,
		-0.3,
		0,
		0,
		0.1,
		0,
		5,
		1,
		10,
		-2,
		20,
		1,
		0,
		0,
		0,
		0,
		0.1,
		0,
		50,
		1,
		100,
		0.5,
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0,
		500,
		-1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0
	]);
	IPIV = new Int32Array( 5 );
	W = new Complex128Array( 5 * 3 );
	result = zlahefRook( 'lower', 5, 3, A, 1, 5, 0, IPIV, 1, 0, W, 1, 5, 0 );
	compareFixture( A, IPIV, result, findCase( 'lower_5x5_chase_nb3' ), 'lower' );
});

test( 'zlahef_rook: upper_5x5_chase_nb3', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		-0.5,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		1,
		5,
		-1,
		0.1,
		0,
		0,
		0,
		0,
		0,
		3,
		-0.5,
		10,
		2,
		50,
		-1,
		0.1,
		0,
		0,
		0,
		4,
		0.3,
		20,
		-1,
		100,
		-0.5,
		500,
		1,
		0.1,
		0
	]);
	IPIV = new Int32Array( 5 );
	W = new Complex128Array( 5 * 3 );
	result = zlahefRook( 'upper', 5, 3, A, 1, 5, 0, IPIV, 1, 0, W, 1, 5, 0 );
	compareFixture( A, IPIV, result, findCase( 'upper_5x5_chase_nb3' ), 'upper' );
});

test( 'zlahef_rook: N=0 returns kb=0, info=0', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	W = new Complex128Array( 0 );
	result = zlahefRook( 'lower', 0, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 0, 'kb' );

	result = zlahefRook( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 0, 'kb' );
});

test( 'zlahef_rook: N=1 lower, simple case', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([ 4.0, 0.0 ]);
	IPIV = new Int32Array( 1 );
	W = new Complex128Array( 1 );
	result = zlahefRook( 'lower', 1, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 1, 'kb' );
	assert.equal( IPIV[ 0 ], 0, 'IPIV[0] = 0 (1x1 pivot at row 0)' );
});

test( 'zlahef_rook: N=1 upper, simple case', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([ 4.0, 0.0 ]);
	IPIV = new Int32Array( 1 );
	W = new Complex128Array( 1 );
	result = zlahefRook( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 1, 'kb' );
});

test( 'zlahef_rook: zero diagonal sets info > 0 (lower)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([ 0, 0, 0, 0, 0, 0, 0, 0 ]);
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlahefRook( 'lower', 2, 2, A, 1, 2, 0, IPIV, 1, 0, W, 1, 2, 0 );
	assert.equal( result.info, 1, 'info = 1 (1-based first zero pivot)' );
});

test( 'zlahef_rook: zero diagonal sets info > 0 (upper)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([ 0, 0, 0, 0, 0, 0, 0, 0 ]);
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlahefRook( 'upper', 2, 2, A, 1, 2, 0, IPIV, 1, 0, W, 1, 2, 0 );
	assert.ok( result.info > 0, 'info > 0 for singular matrix' );
});

test( 'zlahef_rook: throws TypeError for invalid uplo', function t() {
	assert.throws( throwsInvalidUplo, TypeError );
});

test( 'zlahef_rook: very small diagonal triggers element-wise division (lower)', function t() {
	var result;
	var IPIV;
	var tiny;
	var A;
	var W;
	tiny = 1e-300;
	A = new Complex128Array([ tiny, 0, 1, 0, 0, 0, 2, 0 ]);
	IPIV = new Int32Array( 2 );
	W = new Complex128Array( 4 );
	result = zlahefRook( 'lower', 2, 8, A, 1, 2, 0, IPIV, 1, 0, W, 1, 2, 0 );
	assert.ok( typeof result.info === 'number', 'returns numeric info' );
	assert.ok( typeof result.kb === 'number', 'returns numeric kb' );
});

test( 'zlahef_rook: nb >= n returns kb = n', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		5,
		0,
		1,
		0.5,
		0.5,
		-0.2,
		0,
		0,
		4,
		0,
		1,
		0.3,
		0,
		0,
		0,
		0,
		6,
		0
	]);
	IPIV = new Int32Array( 3 );
	W = new Complex128Array( 3 * 8 );
	result = zlahefRook( 'lower', 3, 8, A, 1, 3, 0, IPIV, 1, 0, W, 1, 3, 0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.kb, 3, 'kb = N when nb >= N' );
});

test( 'zlahef_rook: upper path with row swaps (KP != KK)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	A = new Complex128Array([
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.2,
		0.1,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0.3,
		-0.1,
		0.4,
		0.2,
		0.1,
		0,
		0,
		0,
		100,
		0,
		0.5,
		-0.1,
		0.6,
		0.2,
		0.1,
		0
	]);
	IPIV = new Int32Array( 4 );
	W = new Complex128Array( 16 );
	result = zlahefRook( 'upper', 4, 8, A, 1, 4, 0, IPIV, 1, 0, W, 1, 4, 0 );
	assert.equal( result.kb, 4, 'kb = N' );
	assert.ok( typeof result.info === 'number', 'info is numeric' );
});
