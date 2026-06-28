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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dtpqrt.jsonl' ), 'utf8' ).trim().split( '\n' );
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
* Build a packed column-major matrix of shape `m`-by-`n` from row-major dense entries.
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @param {Array<Array<number>>} rows - dense entries laid out row-by-row
* @returns {Float64Array} packed matrix
*/
function pack( m, n, rows ) {
	var out;
	var i;
	var j;
	out = new Float64Array( m * n );
	for ( i = 0; i < m; i++ ) {
		for ( j = 0; j < n; j++ ) {
			out[ ( j * m ) + i ] = rows[ i ][ j ];
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
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]);
	}
}

/**
* Run a fixture case: builds A, B inputs, allocates T and WORK, calls dtpqrt, asserts results.
*
* @private
* @param {Object} tc - fixture case
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `B` and order of `A`
* @param {NonNegativeInteger} l - upper-trapezoidal row count
* @param {PositiveInteger} nb - block size
* @param {Array<Array<number>>} aRows - dense rows of A (N-by-N)
* @param {Array<Array<number>>} bRows - dense rows of B (M-by-N)
*/
function runCase( tc, M, N, l, nb, aRows, bRows ) {
	var WORK;
	var info;
	var A;
	var B;
	var T;

	A = pack( N, N, aRows );
	B = pack( M, N, bRows );
	T = new Float64Array( nb * N );
	WORK = new Float64Array( nb * N );

	info = dtpqrt( M, N, l, nb, A, 1, N, 0, B, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );

	assert.strictEqual( info, tc.INFO, 'INFO' );
	expectClose( A, tc.A, 1e-12, 'A' );
	expectClose( B, tc.B, 1e-12, 'B' );
	expectClose( T, tc.T, 1e-12, 'T' );
}


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof dtpqrt, 'function', 'is a function' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		dtpqrt( -1, 3, 0, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		dtpqrt( 3, -1, 0, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l exceeds min(M,N)', function t() {
	assert.throws( function bad() {
		dtpqrt( 3, 3, 5, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is negative', function t() {
	assert.throws( function bad() {
		dtpqrt( 3, 3, -1, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when nb is less than 1', function t() {
	assert.throws( function bad() {
		dtpqrt( 3, 3, 0, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when nb exceeds N', function t() {
	assert.throws( function bad() {
		dtpqrt( 3, 3, 0, 4, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 1, 0, new Float64Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'm4_n5_l0_nb2: rectangular B, blocked', function t() {
	var tc = findCase( 'm4_n5_l0_nb2' );
	runCase( tc, 4, 5, 0, 2, [
		[ 2.0, 0.5, 0.25, 0.1, 0.05 ],
		[ 0.0, 3.0, 0.75, 0.2, 0.4 ],
		[ 0.0, 0.0, 4.0, 0.9, 0.15 ],
		[ 0.0, 0.0, 0.0, 5.0, 0.6 ],
		[ 0.0, 0.0, 0.0, 0.0, 6.0 ]
	], [
		[ 1.0, 0.5, 0.25, 0.1, 0.05 ],
		[ 0.3, 1.1, 0.6, 0.2, 0.4 ],
		[ 0.7, 0.4, 1.2, 0.9, 0.15 ],
		[ 0.2, 0.3, 0.4, 1.3, 0.6 ]
	]);
});

test( 'm4_n5_l2_nb2: pentagonal B with l=2, blocked', function t() {
	var tc = findCase( 'm4_n5_l2_nb2' );
	runCase( tc, 4, 5, 2, 2, [
		[ 2.0, 0.5, 0.25, 0.1, 0.05 ],
		[ 0.0, 3.0, 0.75, 0.2, 0.4 ],
		[ 0.0, 0.0, 4.0, 0.9, 0.15 ],
		[ 0.0, 0.0, 0.0, 5.0, 0.6 ],
		[ 0.0, 0.0, 0.0, 0.0, 6.0 ]
	], [
		[ 1.0, 0.5, 0.25, 0.1, 0.05 ],
		[ 0.3, 1.1, 0.6, 0.2, 0.4 ],
		[ 1.2, 0.4, 0.9, 0.3, 0.15 ],
		[ 0.0, 1.3, 0.5, 0.4, 0.6 ]
	]);
});

test( 'm5_n4_l0_nb2: tall, two blocks (2,2)', function t() {
	var tc = findCase( 'm5_n4_l0_nb2' );
	runCase( tc, 5, 4, 0, 2, [
		[ 2.0, 0.5, 0.25, 0.1 ],
		[ 0.0, 3.0, 0.75, 0.2 ],
		[ 0.0, 0.0, 4.0, 0.9 ],
		[ 0.0, 0.0, 0.0, 5.0 ]
	], [
		[ 1.0, 0.5, 0.25, 0.1 ],
		[ 0.3, 1.1, 0.6, 0.2 ],
		[ 0.7, 0.4, 1.2, 0.9 ],
		[ 0.2, 0.3, 0.4, 1.3 ],
		[ 0.15, 0.25, 0.35, 0.45 ]
	]);
});

test( 'm5_n5_l5_nb2: B fully upper triangular', function t() {
	var tc = findCase( 'm5_n5_l5_nb2' );
	runCase( tc, 5, 5, 5, 2, [
		[ 2.0, 0.5, 0.25, 0.1, 0.05 ],
		[ 0.0, 3.0, 0.75, 0.2, 0.4 ],
		[ 0.0, 0.0, 4.0, 0.9, 0.15 ],
		[ 0.0, 0.0, 0.0, 5.0, 0.6 ],
		[ 0.0, 0.0, 0.0, 0.0, 6.0 ]
	], [
		[ 1.0, 0.5, 0.25, 0.1, 0.05 ],
		[ 0.0, 1.1, 0.6, 0.2, 0.4 ],
		[ 0.0, 0.0, 1.2, 0.9, 0.15 ],
		[ 0.0, 0.0, 0.0, 1.3, 0.6 ],
		[ 0.0, 0.0, 0.0, 0.0, 1.4 ]
	]);
});

test( 'm4_n4_l3_nb1: nb=1 (purely unblocked behavior per panel)', function t() {
	var tc = findCase( 'm4_n4_l3_nb1' );
	runCase( tc, 4, 4, 3, 1, [
		[ 2.0, 0.5, 0.25, 0.1 ],
		[ 0.0, 3.0, 0.75, 0.2 ],
		[ 0.0, 0.0, 4.0, 0.9 ],
		[ 0.0, 0.0, 0.0, 5.0 ]
	], [
		[ 1.0, 0.5, 0.25, 0.1 ],
		[ 1.1, 0.6, 0.2, 0.4 ],
		[ 0.0, 1.2, 0.9, 0.3 ],
		[ 0.0, 0.0, 1.3, 0.5 ]
	]);
});

test( 'm3_n3_l0_nb3: single block (no trailing update)', function t() {
	var tc = findCase( 'm3_n3_l0_nb3' );
	runCase( tc, 3, 3, 0, 3, [
		[ 2.0, 0.5, 0.25 ],
		[ 0.0, 3.0, 0.75 ],
		[ 0.0, 0.0, 4.0 ]
	], [
		[ 1.0, 0.5, 0.25 ],
		[ 0.3, 1.1, 0.6 ],
		[ 0.7, 0.4, 1.2 ]
	]);
});

test( 'm_zero: quick return', function t() {
	var info = dtpqrt( 0, 3, 0, 1, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 3 ), 1, 1, 0, new Float64Array( 3 ), 1, 0 );
	var tc = findCase( 'm_zero' );
	assert.strictEqual( info, tc.INFO, 'INFO' );
});

test( 'n_zero: quick return', function t() {
	var info = dtpqrt( 3, 0, 0, 2, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 );
	var tc = findCase( 'n_zero' );
	assert.strictEqual( info, tc.INFO, 'INFO' );
});

test( 'm4_n6_l0_nb3: two equal-sized blocks of size 3', function t() {
	var tc = findCase( 'm4_n6_l0_nb3' );
	runCase( tc, 4, 6, 0, 3, [
		[ 2.0, 0.5, 0.25, 0.1, 0.05, 0.04 ],
		[ 0.0, 3.0, 0.75, 0.2, 0.4, 0.14 ],
		[ 0.0, 0.0, 4.0, 0.9, 0.15, 0.24 ],
		[ 0.0, 0.0, 0.0, 5.0, 0.6, 0.34 ],
		[ 0.0, 0.0, 0.0, 0.0, 6.0, 0.44 ],
		[ 0.0, 0.0, 0.0, 0.0, 0.0, 7.0 ]
	], [
		[ 1.0, 0.5, 0.25, 0.1, 0.05, 0.04 ],
		[ 0.3, 1.1, 0.6, 0.2, 0.4, 0.14 ],
		[ 0.7, 0.4, 1.2, 0.9, 0.15, 0.24 ],
		[ 0.2, 0.3, 0.4, 1.3, 0.6, 0.34 ]
	]);
});
