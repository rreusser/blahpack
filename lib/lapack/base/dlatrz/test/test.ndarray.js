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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrz from './../lib/ndarray.js';
var ndarrayFn = dlatrz;


// FIXTURES //

var FIXTURE_DIR = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var LINES = readFileSync( path.join( FIXTURE_DIR, 'dlatrz.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var FIXTURE = LINES.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture test case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return FIXTURE.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input
* @returns {Array} output
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
* Packs a column-major matrix with leading dimension `lda` into a contiguous M-by-N array.
*
* @private
* @param {Float64Array} A - input matrix
* @param {integer} lda - leading dimension
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @returns {Array<number>} packed column-major data
*/
function pack( A, lda, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ ( j * lda ) + i ] );
		}
	}
	return out;
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual
* @param {number} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array<number>} actual - actual
* @param {Array<number>} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a column-major Float64 matrix of size `M x N` with leading dimension `lda` from packed values.
*
* @private
* @param {Array<number>} packed - column-major packed values
* @param {integer} lda - leading dimension
* @param {integer} M - rows
* @param {integer} N - cols
* @returns {Float64Array} output
*/
function buildA( packed, lda, M, N ) {
	var A = new Float64Array( lda * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( j * lda ) + i ] = packed[ ( j * M ) + i ];
		}
	}
	return A;
}


// TESTS //

test( 'dlatrz: 3x5 with l=2', function t() {
	var expected;
	var input;
	var WORK;
	var TAU;
	var lda;
	var A;

	expected = findCase( '3x5_l2' );
	lda = 8;
	input = [
		4.0,
		0.0,
		0.0,
		1.0,
		5.0,
		0.0,
		2.0,
		1.0,
		6.0,
		3.0,
		2.0,
		1.0,
		1.0,
		4.0,
		2.0
	];
	A = buildA( input, lda, 3, 5 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	dlatrz( 3, 5, 2, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assertArrayClose( pack( A, lda, 3, 5 ), expected.A, 1e-13, 'A' );
	assertArrayClose( toArray( TAU ), expected.TAU, 1e-13, 'TAU' );
});

test( 'dlatrz: 4x6 with l=2', function t() {
	var expected;
	var input;
	var WORK;
	var TAU;
	var lda;
	var A;

	expected = findCase( '4x6_l2' );
	lda = 8;
	input = [
		5.0,
		0.0,
		0.0,
		0.0,
		1.0,
		6.0,
		0.0,
		0.0,
		2.0,
		1.0,
		7.0,
		0.0,
		3.0,
		2.0,
		1.0,
		8.0,
		1.0,
		3.0,
		2.0,
		1.0,
		2.0,
		1.0,
		3.0,
		2.0
	];
	A = buildA( input, lda, 4, 6 );
	TAU = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	dlatrz( 4, 6, 2, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assertArrayClose( pack( A, lda, 4, 6 ), expected.A, 1e-13, 'A' );
	assertArrayClose( toArray( TAU ), expected.TAU, 1e-13, 'TAU' );
});

test( 'dlatrz: square 3x3 (M === N, TAU set to zero)', function t() {
	var expected;
	var input;
	var WORK;
	var TAU;
	var lda;
	var A;

	expected = findCase( 'square_3x3' );
	lda = 8;
	input = [
		3.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		2.0,
		1.0,
		5.0
	];
	A = buildA( input, lda, 3, 3 );
	TAU = new Float64Array([ 7.0, 7.0, 7.0 ]);
	WORK = new Float64Array( 3 );
	dlatrz( 3, 3, 0, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assertArrayClose( pack( A, lda, 3, 3 ), expected.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), expected.TAU, 1e-14, 'TAU' );
});

test( 'dlatrz: M=0 quick return', function t() {
	var WORK = new Float64Array( 1 );
	var TAU = new Float64Array([ 9.0 ]);
	var A = new Float64Array( 8 * 3 );
	dlatrz( 0, 3, 3, A, 1, 8, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( TAU[ 0 ], 9.0, 'TAU untouched' );
});

test( 'dlatrz: 1x3 with l=2', function t() {
	var expected;
	var WORK;
	var TAU;
	var lda;
	var input;
	var A;

	expected = findCase( '1x3_l2' );
	lda = 8;
	input = [
		3.0,
		1.0,
		2.0
	];
	A = buildA( input, lda, 1, 3 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	dlatrz( 1, 3, 2, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assertArrayClose( pack( A, lda, 1, 3 ), expected.A, 1e-14, 'A' );
	assertArrayClose( toArray( TAU ), expected.TAU, 1e-14, 'TAU' );
});

test( 'dlatrz: 2x4 with l=2', function t() {
	var expected;
	var input;
	var WORK;
	var TAU;
	var lda;
	var A;

	expected = findCase( '2x4_l2' );
	lda = 8;
	input = [
		2.0,
		0.0,
		1.0,
		3.0,
		3.0,
		1.0,
		1.0,
		2.0
	];
	A = buildA( input, lda, 2, 4 );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	dlatrz( 2, 4, 2, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assertArrayClose( pack( A, lda, 2, 4 ), expected.A, 1e-13, 'A' );
	assertArrayClose( toArray( TAU ), expected.TAU, 1e-13, 'TAU' );
});

test( 'dlatrz: ndarray wrapper signature', function t() {
	var expected;
	var input;
	var WORK;
	var TAU;
	var lda;
	var A;

	expected = findCase( '3x5_l2' );
	lda = 8;
	input = [
		4.0,
		0.0,
		0.0,
		1.0,
		5.0,
		0.0,
		2.0,
		1.0,
		6.0,
		3.0,
		2.0,
		1.0,
		1.0,
		4.0,
		2.0
	];
	A = buildA( input, lda, 3, 5 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	ndarrayFn( 3, 5, 2, A, 1, lda, 0, TAU, 1, 0, WORK, 1, 0 );
	assertArrayClose( pack( A, lda, 3, 5 ), expected.A, 1e-13, 'A' );
	assertArrayClose( toArray( TAU ), expected.TAU, 1e-13, 'TAU' );
});

test( 'dlatrz: non-zero offsets and row-major layout', function t() {
	var expected;
	var outPacked;
	var offsetA;
	var input;
	var WORK;
	var TAU;
	var sa1;
	var sa2;
	var A;
	var i;
	var j;

	expected = findCase( '3x5_l2' );
	sa1 = 5;
	sa2 = 1;
	offsetA = 2;
	A = new Float64Array( offsetA + ( 3 * sa1 ) );
	input = [
		4.0,
		0.0,
		0.0,
		1.0,
		5.0,
		0.0,
		2.0,
		1.0,
		6.0,
		3.0,
		2.0,
		1.0,
		1.0,
		4.0,
		2.0
	];
	for ( j = 0; j < 5; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ offsetA + ( i * sa1 ) + ( j * sa2 ) ] = input[ ( j * 3 ) + i ];
		}
	}
	TAU = new Float64Array( 4 );
	WORK = new Float64Array( 3 );
	dlatrz( 3, 5, 2, A, sa1, sa2, offsetA, TAU, 1, 1, WORK, 1, 0 );
	outPacked = [];
	for ( j = 0; j < 5; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			outPacked.push( A[ offsetA + ( i * sa1 ) + ( j * sa2 ) ] );
		}
	}
	assertArrayClose( outPacked, expected.A, 1e-13, 'A' );
	assertArrayClose( [ TAU[ 1 ], TAU[ 2 ], TAU[ 3 ] ], expected.TAU, 1e-13, 'TAU' );
});

test( 'dlatrz: ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});
