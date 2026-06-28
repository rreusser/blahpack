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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, node/no-sync */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqr2p from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dgeqr2p.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( parseLine );


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
* Finds a fixture entry by name.
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
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
* @throws {Error} length mismatch or element out of tolerance
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	if ( actual.length !== expected.length ) {
		throw new Error( format( '%s: length mismatch (actual=%d, expected=%d)', msg, actual.length, expected.length ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		if ( relErr > tol ) {
			throw new Error( format( '%s[%d]: expected %f, got %f', msg, i, expected[ i ], actual[ i ] ) );
		}
	}
}


// TESTS //

test( 'dgeqr2p: 3x2', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '3x2' );
	A = new Float64Array( [ 1, 3, 5, 2, 4, 6 ] );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p( 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );

	// R diagonal must be non-negative:
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 4 ] >= 0, 'R[1,1] non-negative' );
});

test( 'dgeqr2p: 2x2', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '2x2' );
	A = new Float64Array( [ 4, 3, 1, 2 ] );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p( 2, 2, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 3 ] >= 0, 'R[1,1] non-negative' );
});

test( 'dgeqr2p: n_zero', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( 'n_zero' );
	A = new Float64Array( 2 );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p( 2, 0, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeqr2p: m_zero', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( 'm_zero' );
	A = new Float64Array( 2 );
	TAU = new Float64Array( 2 );
	WORK = new Float64Array( 2 );
	info = dgeqr2p( 0, 2, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeqr2p: 4x3', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '4x3' );
	A = new Float64Array( [ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = dgeqr2p( 4, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 5 ] >= 0, 'R[1,1] non-negative' );
	assert.ok( A[ 10 ] >= 0, 'R[2,2] non-negative' );
});

test( 'dgeqr2p: 3x4', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( '3x4' );
	A = new Float64Array( [ 1, 5, 9, 2, 6, 1, 3, 7, 2, 4, 8, 3 ] );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 4 );
	info = dgeqr2p( 3, 4, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-13, 'TAU' );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 4 ] >= 0, 'R[1,1] non-negative' );
	assert.ok( A[ 8 ] >= 0, 'R[2,2] non-negative' );
});
