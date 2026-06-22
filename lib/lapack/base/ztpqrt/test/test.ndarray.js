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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, node/no-sync */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztpqrt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( JSON.parse );


// FUNCTIONS //

/**
* Returns a fixture entry for a case name.
*
* @private
* @param {string} name - case name
* @throws {Error} fixture not found
* @returns {Object} fixture entry
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Build a packed column-major complex matrix of shape `m`-by-`n` from row-major dense complex entries (each entry is `[re, im]`).
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @param {Array<Array<Array<number>>>} rows - dense entries laid out row-by-row
* @returns {Complex128Array} packed matrix (column-major)
*/
function packMatrix( m, n, rows ) {
	var view;
	var out;
	var idx;
	var i;
	var j;
	out = new Complex128Array( m * n );
	view = reinterpret( out, 0 );
	for ( i = 0; i < m; i++ ) {
		for ( j = 0; j < n; j++ ) {
			idx = ( ( j * m ) + i ) * 2;
			view[ idx ] = rows[ i ][ j ][ 0 ];
			view[ idx + 1 ] = rows[ i ][ j ][ 1 ];
		}
	}
	return out;
}

/**
* Asserts approximate scalar equality.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts element-wise approximate array equality.
*
* @private
* @param {*} actual - actual values
* @param {Array<number>} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Run a fixture case: builds A, B inputs, allocates T and WORK, calls ztpqrt, asserts results.
*
* @private
* @param {Object} tc - fixture case
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `B` and order of `A`
* @param {NonNegativeInteger} l - upper-trapezoidal row count
* @param {PositiveInteger} nb - block size
* @param {Array<Array<Array<number>>>} aRows - dense rows of A (N-by-N)
* @param {Array<Array<Array<number>>>} bRows - dense rows of B (M-by-N)
*/
function runCase( tc, M, N, l, nb, aRows, bRows ) {
	var WORK;
	var info;
	var A;
	var B;
	var T;

	A = packMatrix( N, N, aRows );
	B = packMatrix( M, N, bRows );
	T = new Complex128Array( nb * N );
	WORK = new Complex128Array( nb * N );

	info = ztpqrt( M, N, l, nb, A, 1, N, 0, B, 1, M, 0, T, 1, nb, 0, WORK, 1, 0 );

	assert.strictEqual( info, tc.INFO, 'INFO' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
	assertArrayClose( reinterpret( T, 0 ), tc.T, 1e-12, 'T' );
}


// TESTS //

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ztpqrt, 'function', 'is a function' );
});

test( 'ndarray: throws when M is negative', function t() {
	assert.throws( function bad() {
		ztpqrt( -1, 3, 0, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when N is negative', function t() {
	assert.throws( function bad() {
		ztpqrt( 3, -1, 0, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l exceeds min(M,N)', function t() {
	assert.throws( function bad() {
		ztpqrt( 3, 3, 5, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when l is negative', function t() {
	assert.throws( function bad() {
		ztpqrt( 3, 3, -1, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when nb is less than 1', function t() {
	assert.throws( function bad() {
		ztpqrt( 3, 3, 0, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws when nb exceeds N', function t() {
	assert.throws( function bad() {
		ztpqrt( 3, 3, 0, 4, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 9 ), 1, 1, 0, new Complex128Array( 9 ), 1, 0 );
	}, RangeError );
});

test( 'm4_n5_l0_nb2: rectangular B, blocked', function t() {
	var tc = findCase( 'm4_n5_l0_nb2' );
	runCase( tc, 4, 5, 0, 2, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ], [ 0.2, 0.1 ], [ 0.4, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ], [ 0.9, -0.1 ], [ 0.15, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 5.0, 0.0 ], [ 0.6, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 6.0, -0.3 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ], [ 0.2, -0.1 ], [ 0.4, 0.0 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, 0.0 ], [ 1.2, 0.3 ], [ 0.9, -0.2 ], [ 0.15, 0.1 ] ],
		[ [ 0.2, 0.0 ], [ 0.3, -0.1 ], [ 0.4, 0.2 ], [ 1.3, 0.0 ], [ 0.6, -0.1 ] ]
	]);
});

test( 'm4_n5_l2_nb2: pentagonal B with l=2, blocked', function t() {
	var tc = findCase( 'm4_n5_l2_nb2' );
	runCase( tc, 4, 5, 2, 2, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ], [ 0.2, 0.1 ], [ 0.4, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ], [ 0.9, -0.1 ], [ 0.15, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 5.0, 0.0 ], [ 0.6, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 6.0, -0.3 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ], [ 0.2, -0.1 ], [ 0.4, 0.0 ] ],
		[ [ 1.2, 0.4 ], [ 0.4, -0.2 ], [ 0.9, 0.3 ], [ 0.3, 0.1 ], [ 0.15, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 1.3, 0.2 ], [ 0.5, -0.3 ], [ 0.4, 0.0 ], [ 0.6, 0.1 ] ]
	]);
});

test( 'm5_n4_l0_nb2: tall, two blocks (2,2)', function t() {
	var tc = findCase( 'm5_n4_l0_nb2' );
	runCase( tc, 5, 4, 0, 2, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ], [ 0.2, 0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ], [ 0.9, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 5.0, 0.0 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ], [ 0.2, -0.1 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, 0.0 ], [ 1.2, 0.3 ], [ 0.9, -0.2 ] ],
		[ [ 0.2, 0.0 ], [ 0.3, -0.1 ], [ 0.4, 0.2 ], [ 1.3, 0.0 ] ],
		[ [ 0.15, 0.1 ], [ 0.25, -0.2 ], [ 0.35, 0.0 ], [ 0.45, 0.1 ] ]
	]);
});

test( 'm5_n5_l5_nb2: B fully upper triangular', function t() {
	var tc = findCase( 'm5_n5_l5_nb2' );
	runCase( tc, 5, 5, 5, 2, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ], [ 0.2, 0.1 ], [ 0.4, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ], [ 0.9, -0.1 ], [ 0.15, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 5.0, 0.0 ], [ 0.6, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 6.0, -0.3 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ], [ 0.2, -0.1 ], [ 0.4, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 1.2, 0.3 ], [ 0.9, -0.2 ], [ 0.15, 0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 1.3, 0.0 ], [ 0.6, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 1.4, 0.2 ] ]
	]);
});

test( 'm4_n4_l3_nb1: nb=1 (purely unblocked behavior per panel)', function t() {
	var tc = findCase( 'm4_n4_l3_nb1' );
	runCase( tc, 4, 4, 3, 1, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ], [ 0.2, 0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ], [ 0.9, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 5.0, 0.0 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ] ],
		[ [ 1.1, -0.1 ], [ 0.6, 0.0 ], [ 0.2, 0.1 ], [ 0.4, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 1.2, 0.2 ], [ 0.9, -0.3 ], [ 0.3, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 1.3, 0.1 ], [ 0.5, -0.2 ] ]
	]);
});

test( 'm3_n3_l0_nb3: single block (no trailing update)', function t() {
	var tc = findCase( 'm3_n3_l0_nb3' );
	runCase( tc, 3, 3, 0, 3, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, 0.0 ], [ 1.2, 0.3 ] ]
	]);
});

test( 'm_zero: quick return', function t() {
	var info = ztpqrt( 0, 3, 0, 1, new Complex128Array( 9 ), 1, 3, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 3 ), 1, 1, 0, new Complex128Array( 3 ), 1, 0 );
	var tc = findCase( 'm_zero' );
	assert.strictEqual( info, tc.INFO, 'INFO' );
});

test( 'n_zero: quick return', function t() {
	var info = ztpqrt( 3, 0, 0, 2, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 0 );
	var tc = findCase( 'n_zero' );
	assert.strictEqual( info, tc.INFO, 'INFO' );
});

test( 'm4_n6_l0_nb3: two equal-sized blocks of size 3', function t() {
	var tc = findCase( 'm4_n6_l0_nb3' );
	runCase( tc, 4, 6, 0, 3, [
		[ [ 2.0, 0.1 ], [ 0.5, 0.0 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ], [ 0.04, 0.1 ] ],
		[ [ 0.0, 0.0 ], [ 3.0, -0.2 ], [ 0.75, 0.0 ], [ 0.2, 0.1 ], [ 0.4, 0.0 ], [ 0.14, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 4.0, 0.3 ], [ 0.9, -0.1 ], [ 0.15, 0.0 ], [ 0.24, 0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 5.0, 0.0 ], [ 0.6, 0.2 ], [ 0.34, -0.1 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 6.0, -0.3 ], [ 0.44, 0.2 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 7.0, 0.1 ] ]
	], [
		[ [ 1.0, 0.3 ], [ 0.5, 0.2 ], [ 0.25, -0.1 ], [ 0.1, 0.0 ], [ 0.05, 0.2 ], [ 0.04, 0.1 ] ],
		[ [ 0.3, -0.1 ], [ 1.1, 0.0 ], [ 0.6, 0.1 ], [ 0.2, -0.1 ], [ 0.4, 0.0 ], [ 0.14, -0.1 ] ],
		[ [ 0.7, 0.2 ], [ 0.4, 0.0 ], [ 1.2, 0.3 ], [ 0.9, -0.2 ], [ 0.15, 0.1 ], [ 0.24, 0.1 ] ],
		[ [ 0.2, 0.0 ], [ 0.3, -0.1 ], [ 0.4, 0.2 ], [ 1.3, 0.0 ], [ 0.6, -0.1 ], [ 0.34, -0.1 ] ]
	]);
});
