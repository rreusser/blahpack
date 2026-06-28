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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements */

// MODULES //

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_PATH = resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlatrz.jsonl' );
var RAW = readFileSync( FIXTURE_PATH, 'utf8' ); // eslint-disable-line node/no-sync
var LINES = RAW.trim().split( '\n' );
var FIXTURES = LINES.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed fixture object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Looks up a fixture by name.
*
* @private
* @param {string} name - fixture name
* @returns {Object} fixture
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	return null;
}

/**
* Packs an M-by-N column-major interleaved complex matrix from row-major (i,j) entries.
*
* @private
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {Array} entries - array of [i, j, re, im] entries (1-indexed to match Fortran)
* @returns {Complex128Array} complex matrix (length M*N, column-major)
*/
function buildMatrix( M, N, entries ) {
	var out;
	var v;
	var i;
	var k;
	out = new Complex128Array( M * N );
	v = reinterpret( out, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		// entries are 1-indexed (Fortran style): [row, col, re, im]
		k = ( ( entries[ i ][ 0 ] - 1 ) + ( ( entries[ i ][ 1 ] - 1 ) * M ) ) * 2;
		v[ k ] = entries[ i ][ 2 ];
		v[ k + 1 ] = entries[ i ][ 3 ];
	}
	return out;
}

/**
* Converts a typed array (or array-like) to a plain array.
*
* @private
* @param {Object} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two real arrays agree elementwise within tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var denom;
	var rel;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		denom = Math.max( Math.abs( expected[ i ] ), 1.0 );
		rel = Math.abs( actual[ i ] - expected[ i ] ) / denom;
		assert.ok( rel <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

test( 'ndarray export is a function', function t() {
	assert.strictEqual( typeof ndarray, 'function', 'is a function' );
});

test( 'ndarray: returns A unchanged when M=0', function t() {
	var work;
	var TAU;
	var out;
	var A;
	work = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );
	A = new Complex128Array( 1 );
	out = ndarray( 0, 3, 0, A, 1, 1, 0, TAU, 1, 0, work, 1, 0 );
	assert.strictEqual( out, A, 'returns A' );
});

test( 'ndarray: 3x5 L=2 matches fixture (column-major)', function t() {
	var work;
	var TAU;
	var tc;
	var A;
	work = new Complex128Array( 3 );
	TAU = new Complex128Array( 3 );
	tc = findCase( '3x5_l2' );
	A = buildMatrix( 3, 5, [
		[ 1, 1, 4.0, 0.5 ],
		[ 1, 2, 1.0, -0.2 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 1, 4, 3.0, 0.1 ],
		[ 1, 5, 1.0, -0.4 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 2, 3, 1.0, 0.1 ],
		[ 2, 4, 2.0, 0.2 ],
		[ 2, 5, 4.0, -0.5 ],
		[ 3, 3, 6.0, 0.4 ],
		[ 3, 4, 1.0, -0.2 ],
		[ 3, 5, 2.0, 0.6 ]
	]);
	ndarray( 3, 5, 2, A, 1, 3, 0, TAU, 1, 0, work, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: 4x6 L=2 matches fixture (column-major)', function t() {
	var work;
	var TAU;
	var tc;
	var A;
	work = new Complex128Array( 4 );
	TAU = new Complex128Array( 4 );
	tc = findCase( '4x6_l2' );
	A = buildMatrix( 4, 6, [
		[ 1, 1, 5.0, 0.1 ],
		[ 1, 2, 1.0, -0.3 ],
		[ 1, 3, 2.0, 0.5 ],
		[ 1, 4, 3.0, 0.2 ],
		[ 1, 5, 1.0, 0.4 ],
		[ 1, 6, 2.0, -0.1 ],
		[ 2, 2, 6.0, -0.2 ],
		[ 2, 3, 1.0, 0.3 ],
		[ 2, 4, 2.0, -0.4 ],
		[ 2, 5, 3.0, 0.1 ],
		[ 2, 6, 1.0, -0.3 ],
		[ 3, 3, 7.0, 0.4 ],
		[ 3, 4, 1.0, 0.2 ],
		[ 3, 5, 2.0, -0.5 ],
		[ 3, 6, 3.0, 0.3 ],
		[ 4, 4, 8.0, -0.1 ],
		[ 4, 5, 1.0, 0.6 ],
		[ 4, 6, 2.0, 0.2 ]
	]);
	ndarray( 4, 6, 2, A, 1, 4, 0, TAU, 1, 0, work, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: square 3x3 (M == N) leaves A unchanged and zeros TAU', function t() {
	var work;
	var TAU;
	var tv;
	var tc;
	var A;
	var i;
	work = new Complex128Array( 3 );
	TAU = new Complex128Array( 3 );
	tv = reinterpret( TAU, 0 );
	tc = findCase( 'square_3x3' );
	A = buildMatrix( 3, 3, [
		[ 1, 1, 3.0, 0.5 ],
		[ 1, 2, 1.0, -0.2 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 2, 2, 4.0, 0.1 ],
		[ 2, 3, 1.0, 0.4 ],
		[ 3, 3, 5.0, -0.2 ]
	]);

	// Seed TAU with sentinels so we can verify it is zeroed:
	for ( i = 0; i < 6; i++ ) {
		tv[ i ] = 7.0;
	}
	ndarray( 3, 3, 0, A, 1, 3, 0, TAU, 1, 0, work, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-14, 'TAU' );
});

test( 'ndarray: 1x3 L=2 matches fixture (single row)', function t() {
	var work;
	var TAU;
	var tc;
	var A;
	work = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );
	tc = findCase( '1x3_l2' );
	A = buildMatrix( 1, 3, [
		[ 1, 1, 3.0, 0.7 ],
		[ 1, 2, 1.0, -0.4 ],
		[ 1, 3, 2.0, 0.5 ]
	]);
	ndarray( 1, 3, 2, A, 1, 1, 0, TAU, 1, 0, work, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: 2x4 L=2 matches fixture', function t() {
	var work;
	var TAU;
	var tc;
	var A;
	work = new Complex128Array( 2 );
	TAU = new Complex128Array( 2 );
	tc = findCase( '2x4_l2' );
	A = buildMatrix( 2, 4, [
		[ 1, 1, 2.0, 0.2 ],
		[ 1, 2, 1.0, -0.1 ],
		[ 1, 3, 3.0, 0.4 ],
		[ 1, 4, 1.0, -0.3 ],
		[ 2, 2, 3.0, 0.3 ],
		[ 2, 3, 1.0, -0.2 ],
		[ 2, 4, 2.0, 0.5 ]
	]);
	ndarray( 2, 4, 2, A, 1, 2, 0, TAU, 1, 0, work, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: 3x7 L=4 matches fixture (large L)', function t() {
	var work;
	var TAU;
	var tc;
	var A;
	work = new Complex128Array( 3 );
	TAU = new Complex128Array( 3 );
	tc = findCase( '3x7_l4' );
	A = buildMatrix( 3, 7, [
		[ 1, 1, 4.0, 0.2 ],
		[ 1, 2, 1.0, -0.1 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 1, 4, 1.0, -0.4 ],
		[ 1, 5, 2.0, 0.5 ],
		[ 1, 6, 3.0, -0.2 ],
		[ 1, 7, 1.0, 0.4 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 2, 3, 1.0, -0.2 ],
		[ 2, 4, 2.0, 0.1 ],
		[ 2, 5, 1.0, -0.3 ],
		[ 2, 6, 3.0, 0.4 ],
		[ 2, 7, 2.0, -0.1 ],
		[ 3, 3, 6.0, 0.4 ],
		[ 3, 4, 1.0, -0.5 ],
		[ 3, 5, 3.0, 0.2 ],
		[ 3, 6, 2.0, -0.3 ],
		[ 3, 7, 4.0, 0.6 ]
	]);
	ndarray( 3, 7, 4, A, 1, 3, 0, TAU, 1, 0, work, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( TAU, 0 ) ), tc.TAU, 1e-13, 'TAU' );
});

test( 'ndarray: honors non-zero offsets for A, TAU, and work', function t() {
	var work;
	var TAU;
	var tc;
	var tv;
	var wv;
	var av;
	var A;

	tc = findCase( '3x5_l2' );

	// Allocate buffers with one-element prefixes filled with sentinel values:
	A = new Complex128Array( 1 + ( 3 * 5 ) );
	av = reinterpret( A, 0 );
	av[ 0 ] = 99.0;
	av[ 1 ] = -99.0;
	A.set( buildMatrix( 3, 5, [
		[ 1, 1, 4.0, 0.5 ],
		[ 1, 2, 1.0, -0.2 ],
		[ 1, 3, 2.0, 0.3 ],
		[ 1, 4, 3.0, 0.1 ],
		[ 1, 5, 1.0, -0.4 ],
		[ 2, 2, 5.0, 0.3 ],
		[ 2, 3, 1.0, 0.1 ],
		[ 2, 4, 2.0, 0.2 ],
		[ 2, 5, 4.0, -0.5 ],
		[ 3, 3, 6.0, 0.4 ],
		[ 3, 4, 1.0, -0.2 ],
		[ 3, 5, 2.0, 0.6 ]
	]), 1 );

	TAU = new Complex128Array( 4 );
	tv = reinterpret( TAU, 0 );
	tv[ 0 ] = 11.0;
	tv[ 1 ] = -11.0;

	work = new Complex128Array( 5 );
	wv = reinterpret( work, 0 );
	wv[ 0 ] = 33.0;
	wv[ 1 ] = -33.0;

	ndarray( 3, 5, 2, A, 1, 3, 1, TAU, 1, 1, work, 1, 1 );

	// Verify sentinels untouched:
	assert.strictEqual( av[ 0 ], 99.0, 'A head re' );
	assert.strictEqual( av[ 1 ], -99.0, 'A head im' );
	assert.strictEqual( tv[ 0 ], 11.0, 'TAU head re' );
	assert.strictEqual( tv[ 1 ], -11.0, 'TAU head im' );

	// Verify body and TAU values match fixture:
	assertArrayClose( toArray( av ).slice( 2, 2 + ( 2 * 15 ) ), tc.A, 1e-13, 'A body' );
	assertArrayClose( toArray( tv ).slice( 2, 2 + ( 2 * 3 ) ), tc.TAU, 1e-13, 'TAU body' );
});
