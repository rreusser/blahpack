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

import test from 'node:test';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztplqt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztplqt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parse a single fixture line as JSON.
*
* @private
* @param {string} line - JSON fixture line
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
	return fixture.find( matchName );

	/**
	* Return whether a fixture case matches the requested name.
	*
	* @private
	* @param {Object} t - fixture case
	* @returns {boolean} match result
	*/
	function matchName( t ) {
		return t.name === name;
	}
}

/**
* Build a packed column-major Complex128Array of shape `m`-by-`n` from row-major dense entries.
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @param {Array<Array<Array<number>>>} rows - dense entries laid out row-by-row; each entry is `[re, im]`
* @returns {Complex128Array} packed matrix
*/
function pack( m, n, rows ) {
	var out;
	var v;
	var i;
	var j;
	out = new Complex128Array( m * n );
	v = reinterpret( out, 0 );
	for ( i = 0; i < m; i++ ) {
		for ( j = 0; j < n; j++ ) {
			v[ 2 * ( ( j * m ) + i ) ] = rows[ i ][ j ][ 0 ];
			v[ ( 2 * ( ( j * m ) + i ) ) + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	return out;
}

/**
* Assert that two flat arrays are elementwise close.
*
* @private
* @param {Float64Array} actual - computed values
* @param {Array<number>} expected - reference values
* @param {number} tol - absolute tolerance
* @param {string} msg - context label
*/
function expectClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Run a fixture case: builds A, B inputs, allocates T and WORK, calls ztplqt, asserts results.
*
* @private
* @param {Object} tc - fixture case
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} l - lower-trapezoidal column count
* @param {PositiveInteger} mb - block size
* @param {Array<Array<Array<number>>>} aRows - dense rows of A (M-by-M); each entry is `[re, im]`
* @param {Array<Array<Array<number>>>} bRows - dense rows of B (M-by-N); each entry is `[re, im]`
*/
function runCase( tc, M, N, l, mb, aRows, bRows ) {
	var WORK;
	var info;
	var tol;
	var A;
	var B;
	var T;

	A = pack( M, M, aRows );
	B = pack( M, N, bRows );
	T = new Complex128Array( mb * M );
	WORK = new Complex128Array( mb * M );

	info = ztplqt( M, N, l, mb, A, 1, M, 0, B, 1, M, 0, T, 1, mb, 0, WORK, 1, 0 );

	tol = 1e-12;
	assert.strictEqual( info, tc.INFO, 'INFO' );
	expectClose( reinterpret( A, 0 ), tc.A, tol, 'A' );
	expectClose( reinterpret( B, 0 ), tc.B, tol, 'B' );
	expectClose( reinterpret( T, 0 ), tc.T, tol, 'T' );
}


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ztplqt, 'function', 'is a function' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		ztplqt( -1, 3, 0, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		ztplqt( 3, -1, 0, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is out of range', function t() {
	assert.throws( function bad() {
		ztplqt( 3, 3, 5, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is negative', function t() {
	assert.throws( function bad() {
		ztplqt( 3, 3, -1, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when mb is less than 1', function t() {
	assert.throws( function bad() {
		ztplqt( 3, 3, 0, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when mb exceeds M', function t() {
	assert.throws( function bad() {
		ztplqt( 3, 3, 0, 4, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'm4_n5_l0_mb2_complex: rectangular B, blocked, complex', function t() {
	var tc = findCase( 'm4_n5_l0_mb2_complex' );
	runCase( tc, 4, 5, 0, 2, [
		[ [ 2.0, 0.1 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, -0.2 ], [ 3.0, 0.3 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.1 ], [ 0.75, -0.1 ], [ 4.0, 0.2 ], [ 0.0, 0.0 ] ],
		[ [ 0.1, 0.2 ], [ 0.2, 0.1 ], [ 0.3, -0.3 ], [ 5.0, 0.4 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.05 ], [ 0.05, 0.0 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.4 ], [ 0.6, 0.1 ], [ 0.2, -0.2 ], [ 0.4, 0.3 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, -0.2 ], [ 1.2, 0.3 ], [ 0.9, 0.1 ], [ 0.15, -0.05 ] ],
		[ [ 0.2, 0.1 ], [ 0.3, 0.0 ], [ 0.4, 0.2 ], [ 1.3, -0.4 ], [ 0.6, 0.2 ] ]
	]);
});

test( 'm4_n5_l2_mb2_complex: pentagonal B with l=2, blocked, complex', function t() {
	var tc = findCase( 'm4_n5_l2_mb2_complex' );
	runCase( tc, 4, 5, 2, 2, [
		[ [ 2.0, 0.1 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, -0.2 ], [ 3.0, 0.3 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.1 ], [ 0.75, -0.1 ], [ 4.0, 0.2 ], [ 0.0, 0.0 ] ],
		[ [ 0.1, 0.2 ], [ 0.2, 0.1 ], [ 0.3, -0.3 ], [ 5.0, 0.4 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.05 ], [ 0.0, 0.0 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.4 ], [ 0.6, 0.1 ], [ 0.2, -0.2 ], [ 0.4, 0.3 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, -0.2 ], [ 1.2, 0.3 ], [ 0.9, 0.1 ], [ 0.15, -0.05 ] ],
		[ [ 0.2, 0.1 ], [ 0.3, 0.0 ], [ 0.4, 0.2 ], [ 1.3, -0.4 ], [ 0.6, 0.2 ] ]
	]);
});

test( 'm5_n4_l0_mb2_complex: tall, three blocks (2,2,1), complex', function t() {
	var tc = findCase( 'm5_n4_l0_mb2_complex' );
	runCase( tc, 5, 4, 0, 2, [
		[ [ 2.0, 0.1 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, -0.2 ], [ 3.0, 0.3 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.1 ], [ 0.75, -0.1 ], [ 4.0, 0.2 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.1, 0.2 ], [ 0.2, 0.1 ], [ 0.3, -0.3 ], [ 5.0, 0.4 ], [ 0.0, 0.0 ] ],
		[ [ 0.05, 0.1 ], [ 0.15, -0.1 ], [ 0.25, 0.0 ], [ 0.35, 0.2 ], [ 6.0, -0.3 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.05 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.4 ], [ 0.6, 0.1 ], [ 0.2, -0.2 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, -0.2 ], [ 1.2, 0.3 ], [ 0.9, 0.1 ] ],
		[ [ 0.2, 0.1 ], [ 0.3, 0.0 ], [ 0.4, 0.2 ], [ 1.3, -0.4 ] ],
		[ [ 0.15, 0.05 ], [ 0.25, 0.1 ], [ 0.35, -0.1 ], [ 0.45, 0.2 ] ]
	]);
});

test( 'm5_n5_l5_mb2_complex: B fully lower triangular, complex', function t() {
	var tc = findCase( 'm5_n5_l5_mb2_complex' );
	runCase( tc, 5, 5, 5, 2, [
		[ [ 2.0, 0.1 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, -0.2 ], [ 3.0, 0.3 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.1 ], [ 0.75, -0.1 ], [ 4.0, 0.2 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.1, 0.2 ], [ 0.2, 0.1 ], [ 0.3, -0.3 ], [ 5.0, 0.4 ], [ 0.0, 0.0 ] ],
		[ [ 0.05, 0.1 ], [ 0.15, -0.1 ], [ 0.25, 0.0 ], [ 0.35, 0.2 ], [ 6.0, -0.3 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.4 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, -0.2 ], [ 1.2, 0.3 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.2, 0.1 ], [ 0.3, 0.0 ], [ 0.4, 0.2 ], [ 1.3, -0.4 ], [ 0.0, 0.0 ] ],
		[ [ 0.15, 0.05 ], [ 0.25, 0.1 ], [ 0.35, -0.1 ], [ 0.45, 0.2 ], [ 1.4, 0.3 ] ]
	]);
});

test( 'm3_n4_l3_mb1_complex: mb=1 (purely unblocked behavior per panel), complex', function t() {
	var tc = findCase( 'm3_n4_l3_mb1_complex' );
	runCase( tc, 3, 4, 3, 1, [
		[ [ 2.0, 0.1 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, -0.2 ], [ 3.0, 0.3 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.1 ], [ 0.75, -0.1 ], [ 4.0, 0.2 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.4 ], [ 0.6, 0.1 ], [ 0.0, 0.0 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, -0.2 ], [ 1.2, 0.3 ], [ 0.9, 0.1 ] ]
	]);
});

test( 'm3_n3_l0_mb3_complex: single block (no trailing update), complex', function t() {
	var tc = findCase( 'm3_n3_l0_mb3_complex' );
	runCase( tc, 3, 3, 0, 3, [
		[ [ 2.0, 0.1 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, -0.2 ], [ 3.0, 0.3 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.1 ], [ 0.75, -0.1 ], [ 4.0, 0.2 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.4 ], [ 0.6, 0.1 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, -0.2 ], [ 1.2, 0.3 ] ]
	]);
});

test( 'm_zero: quick return', function t() {
	var info = ztplqt( 0, 3, 0, 1, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 0 );
	var tc = findCase( 'm_zero' );
	assert.strictEqual( info, tc.INFO, 'INFO' );
});

test( 'n_zero: quick return', function t() {
	var info = ztplqt( 3, 0, 0, 2, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 0 );
	var tc = findCase( 'n_zero' );
	assert.strictEqual( info, tc.INFO, 'INFO' );
});

test( 'm6_n4_l0_mb3_real: two equal-sized blocks of size 3, real-valued', function t() {
	var tc = findCase( 'm6_n4_l0_mb3_real' );
	runCase( tc, 6, 4, 0, 3, [
		[ [ 2.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.5, 0.0 ], [ 3.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.25, 0.0 ], [ 0.75, 0.0 ], [ 4.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.1, 0.0 ], [ 0.2, 0.0 ], [ 0.3, 0.0 ], [ 5.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.05, 0.0 ], [ 0.15, 0.0 ], [ 0.25, 0.0 ], [ 0.35, 0.0 ], [ 6.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 0.04, 0.0 ], [ 0.14, 0.0 ], [ 0.24, 0.0 ], [ 0.34, 0.0 ], [ 0.44, 0.0 ], [ 7.0, 0.0 ] ]
	], [
		[ [ 1.0, 0.0 ], [ 0.5, 0.0 ], [ 0.25, 0.0 ], [ 0.1, 0.0 ] ],
		[ [ 0.3, 0.0 ], [ 1.1, 0.0 ], [ 0.6, 0.0 ], [ 0.2, 0.0 ] ],
		[ [ 0.7, 0.0 ], [ 0.4, 0.0 ], [ 1.2, 0.0 ], [ 0.9, 0.0 ] ],
		[ [ 0.2, 0.0 ], [ 0.3, 0.0 ], [ 0.4, 0.0 ], [ 1.3, 0.0 ] ],
		[ [ 0.15, 0.0 ], [ 0.25, 0.0 ], [ 0.35, 0.0 ], [ 0.45, 0.0 ] ],
		[ [ 0.13, 0.0 ], [ 0.23, 0.0 ], [ 0.33, 0.0 ], [ 0.43, 0.0 ] ]
	]);
});
