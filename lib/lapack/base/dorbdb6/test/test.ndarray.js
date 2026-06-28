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

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorbdb6 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dorbdb6.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locate a fixture record by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Builds a column-major Q stored as a flat Float64Array.
*
* @private
* @param {NonNegativeInteger} LD - leading dimension (rows of storage)
* @param {NonNegativeInteger} cols - number of columns
* @param {Array} entries - array of `[row, col, value]` triples (0-based)
* @returns {Float64Array} flat column-major buffer
*/
function buildQ( LD, cols, entries ) {
	var out;
	var e;
	var i;

	out = new Float64Array( LD * cols );
	for ( i = 0; i < entries.length; i++ ) {
		e = entries[ i ];
		out[ e[ 0 ] + (e[ 1 ] * LD) ] = e[ 2 ];
	}
	return out;
}

/**
* Compare two arrays element-wise to within a tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

test( 'dorbdb6.ndarray: basic_4x4_n2', function t() {
	var WORK;
	var info;
	var sq2;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'basic_4x4_n2' );
	sq2 = 1.0 / Math.sqrt( 2.0 );

	// Q1, Q2: 8x8 column-major (NMAX=8 in Fortran)
	Q1 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );
	Q2 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );

	X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	X2 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: n_zero (quick path — N=0)', function t() {
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'n_zero' );

	Q1 = new Float64Array( 64 );
	Q2 = new Float64Array( 64 );
	X1 = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	X2 = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 3, 3, 0, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: m1_zero (top half empty)', function t() {
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'm1_zero' );

	Q1 = new Float64Array( 0 );
	Q2 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );
	X1 = new Float64Array( 0 );
	X2 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 0, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: m2_zero (bottom half empty)', function t() {
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'm2_zero' );

	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );
	Q2 = new Float64Array( 0 );
	X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	X2 = new Float64Array( 0 );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 4, 0, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
});

test( 'dorbdb6.ndarray: x_in_range_truncated_to_zero', function t() {
	var WORK;
	var info;
	var sq2;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'x_in_range_truncated_to_zero' );
	sq2 = 1.0 / Math.sqrt( 2.0 );

	Q1 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );
	Q2 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );
	X1 = new Float64Array( [ sq2, 2.0 * sq2, 0.0, 0.0 ] );
	X2 = new Float64Array( [ sq2, 2.0 * sq2, 0.0, 0.0 ] );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: stride_2 (non-unit increments)', function t() {
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'stride_2' );

	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ] ] );
	Q2 = buildQ( 8, 2, [ [ 0, 1, 1.0 ] ] );
	X1 = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	X2 = new Float64Array( [ 4.0, 0.0, 5.0, 0.0, 6.0, 0.0 ] );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 3, 3, 2, X1, 2, 0, X2, 2, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: m1_m2_n_one (all dims = 1)', function t() {
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'm1_m2_n_one' );

	Q1 = new Float64Array( [ 1.0 ] );
	Q2 = new Float64Array( [ 0.0 ] );
	X1 = new Float64Array( [ 3.0 ] );
	X2 = new Float64Array( [ 4.0 ] );
	WORK = new Float64Array( 1 );

	info = dorbdb6( 1, 1, 1, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: reortho_residual_survives', function t() {
	var WORK;
	var info;
	var sq2;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'reortho_residual_survives' );
	sq2 = 1.0 / Math.sqrt( 2.0 );

	Q1 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );
	Q2 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );
	X1 = new Float64Array( [ sq2, 0.5 * sq2, 0.1, 0.0 ] );
	X2 = new Float64Array( [ sq2, 0.5 * sq2, 0.0, 0.2 ] );
	WORK = new Float64Array( 8 );

	info = dorbdb6( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1, tc.X1, 1e-13, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-13, 'X2' );
});

test( 'dorbdb6.ndarray: validation — negative m1 throws', function t() {
	assert.throws( function throws() {
		dorbdb6( -1, 1, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb6.ndarray: validation — negative m2 throws', function t() {
	assert.throws( function throws() {
		dorbdb6( 1, -1, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb6.ndarray: validation — negative N throws', function t() {
	assert.throws( function throws() {
		dorbdb6( 1, 1, -1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb6.ndarray: validation — zero strideX1 throws', function t() {
	assert.throws( function throws() {
		dorbdb6( 1, 1, 1, new Float64Array( 1 ), 0, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb6.ndarray: validation — zero strideX2 throws', function t() {
	assert.throws( function throws() {
		dorbdb6( 1, 1, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 0, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb6.ndarray: row-major Q layout produces same projection', function t() {
	var Q1cm;
	var Q2cm;
	var Q1rm;
	var Q2rm;
	var X1cm;
	var X2cm;
	var X1rm;
	var X2rm;
	var WORK;
	var i;
	var j;

	Q1cm = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0 ] ); // 4x2 cm
	Q2cm = new Float64Array( 8 );
	Q1rm = new Float64Array( 4 * 2 );
	Q2rm = new Float64Array( 4 * 2 );
	for ( i = 0; i < 4; i++ ) {
		for ( j = 0; j < 2; j++ ) {
			Q1rm[ (i * 2) + j ] = Q1cm[ i + (j * 4) ];
			Q2rm[ (i * 2) + j ] = Q2cm[ i + (j * 4) ];
		}
	}

	X1cm = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	X2cm = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	X1rm = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	X2rm = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	WORK = new Float64Array( 2 );

	dorbdb6( 4, 4, 2, X1cm, 1, 0, X2cm, 1, 0, Q1cm, 1, 4, 0, Q2cm, 1, 4, 0, WORK, 1, 0 );
	WORK = new Float64Array( 2 );
	dorbdb6( 4, 4, 2, X1rm, 1, 0, X2rm, 1, 0, Q1rm, 2, 1, 0, Q2rm, 2, 1, 0, WORK, 1, 0 );

	assertArrayClose( X1cm, X1rm, 1e-13, 'X1 layout-invariance' );
	assertArrayClose( X2cm, X2rm, 1e-13, 'X2 layout-invariance' );
});

test( 'dorbdb6.ndarray: nonzero offsets are honored', function t() {
	var WORK;
	var info;
	var Q1;
	var Q2;
	var X1;
	var X2;

	// X = (3; 4) projected against Q = (1; 0); buffers padded with offsets
	Q1 = new Float64Array( [ 99.0, 1.0 ] );
	Q2 = new Float64Array( [ 99.0, 0.0 ] );
	X1 = new Float64Array( [ 99.0, 99.0, 3.0 ] );
	X2 = new Float64Array( [ 99.0, 4.0 ] );
	WORK = new Float64Array( [ 99.0, 0.0 ] );

	info = dorbdb6( 1, 1, 1, X1, 1, 2, X2, 1, 1, Q1, 1, 1, 1, Q2, 1, 1, 1, WORK, 1, 1 );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( X1[ 2 ] - 0.0 ) < 1e-14, 'X1[2]' );
	assert.ok( Math.abs( X2[ 1 ] - 4.0 ) < 1e-14, 'X2[1]' );
	assert.strictEqual( X1[ 0 ], 99.0, 'X1[0] preserved' );
	assert.strictEqual( X1[ 1 ], 99.0, 'X1[1] preserved' );
	assert.strictEqual( X2[ 0 ], 99.0, 'X2[0] preserved' );
});
