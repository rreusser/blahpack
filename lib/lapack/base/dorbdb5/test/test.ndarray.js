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
import dorbdb5 from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dorbdb5.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
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
	let e, i;

	const out = new Float64Array( LD * cols );
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
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

test( 'dorbdb5.ndarray: basic_4x4_n2', function t() {

	const tc = findCase( 'basic_4x4_n2' );
	const sq2 = 1.0 / Math.sqrt( 2.0 );

	// Q1, Q2: 8x8 column-major (NMAX=8 in Fortran)
	const Q1 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );
	const Q2 = buildQ( 8, 2, [ [ 0, 0, sq2 ], [ 1, 1, sq2 ] ] );

	const X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const X2 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: n_zero', function t() {

	const tc = findCase( 'n_zero' );

	// N=0 → no Q columns; X is unchanged because the first quick-return branch (norm > N*EPS) is satisfied trivially (norm > 0) and dorbdb6 with N=0 is a no-op.
	const Q1 = new Float64Array( 1 );
	const Q2 = new Float64Array( 1 );

	const X1 = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const X2 = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	const WORK = new Float64Array( 1 );

	const info = dorbdb5( 3, 3, 0, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: zero_x_finds_e3_in_x1', function t() {

	const tc = findCase( 'zero_x_finds_e3_in_x1' );

	// Q has columns e_1, e_2 in the X1 partition. X is exactly zero, so the standard-basis search runs: e_1 and e_2 are in range(Q), e_3 is not, so result = e_3 in X1.
	const Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );
	const Q2 = new Float64Array( 8 * 2 );

	const X1 = new Float64Array( 4 );
	const X2 = new Float64Array( 4 );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: zero_x_finds_e_first_in_x2', function t() {

	const tc = findCase( 'zero_x_finds_e_first_in_x2' );

	// m1=2, m2=3, n=2; Q spans the entire X1 partition, so the X1-loop never finds an orthogonal e_i. The X2 search then picks e_1 of X2 = unit vector at X2[0].
	const Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );
	const Q2 = new Float64Array( 8 * 2 );

	const X1 = new Float64Array( 2 );
	const X2 = new Float64Array( 3 );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 2, 3, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: m1_zero', function t() {

	const tc = findCase( 'm1_zero' );

	// m1=0; everything happens in X2 only.
	const Q1 = new Float64Array( 1 ); // unused (m1=0)
	const Q2 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );

	const X1 = new Float64Array( 0 );
	const X2 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 0, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: m2_zero', function t() {

	const tc = findCase( 'm2_zero' );

	// m2=0; everything happens in X1 only.
	const Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );
	const Q2 = new Float64Array( 1 ); // unused (m2=0)

	const X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const X2 = new Float64Array( 0 );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 4, 0, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
});

test( 'dorbdb5.ndarray: stride_2', function t() {

	const tc = findCase( 'stride_2' );

	// Stride 2 — Q1(:,1)=e_1, Q2(:,2)=e_1; X1 strided=[1, _, 2, _, 3, _], X2=[4, _, 5, _, 6, _].
	const Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ] ] );
	const Q2 = buildQ( 8, 2, [ [ 0, 1, 1.0 ] ] );

	const X1 = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	const X2 = new Float64Array( [ 4.0, 0.0, 5.0, 0.0, 6.0, 0.0 ] );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 3, 3, 2, X1, 2, 0, X2, 2, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: m1_m2_n_one', function t() {

	const tc = findCase( 'm1_m2_n_one' );

	const Q1 = buildQ( 8, 1, [ [ 0, 0, 1.0 ] ] );
	const Q2 = new Float64Array( 8 );

	const X1 = new Float64Array( [ 3.0 ] );
	const X2 = new Float64Array( [ 4.0 ] );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 1, 1, 1, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: tiny_x_falls_through_to_basis_search', function t() {

	const tc = findCase( 'tiny_x_falls_through_to_basis_search' );

	// Q has cols e_1, e_2 in X1; X has tiny norm so the first scaled-projection branch is skipped, and the basis search returns e_3 in X1.
	const Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0 ], [ 1, 1, 1.0 ] ] );
	const Q2 = new Float64Array( 8 * 2 );

	const X1 = new Float64Array( [ 1e-300, 1e-300, 0.0 ] );
	const X2 = new Float64Array( 3 );
	const WORK = new Float64Array( 8 );

	const info = dorbdb5( 3, 3, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( X1, tc.X1, 1e-14, 'X1' );
	assertArrayClose( X2, tc.X2, 1e-14, 'X2' );
});

test( 'dorbdb5.ndarray: returns info=0 for trivial m1=0 m2=0', function t() {

	const X1 = new Float64Array( 1 );
	const X2 = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );

	const info = dorbdb5( 0, 0, 0, X1, 1, 0, X2, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dorbdb5.ndarray: nonzero offsets are honored', function t() {

	// X = (3; 4) projected against Q = (1; 0); buffers padded with offsets.
	const Q1 = new Float64Array( [ 99.0, 1.0 ] );
	const Q2 = new Float64Array( [ 99.0, 0.0 ] );
	const X1 = new Float64Array( [ 99.0, 99.0, 3.0 ] );
	const X2 = new Float64Array( [ 99.0, 4.0 ] );
	const WORK = new Float64Array( [ 99.0, 0.0 ] );

	const info = dorbdb5( 1, 1, 1, X1, 1, 2, X2, 1, 1, Q1, 1, 1, 1, Q2, 1, 1, 1, WORK, 1, 1 );
	assert.strictEqual( info, 0, 'info' );

	// dorbdb5 unit-normalizes X then projects onto e_1; (3,4)/5 → (0.6, 0.8); after subtracting the e_1 component (0.6), the residual is (0, 0.8).
	assert.ok( Math.abs( X1[ 2 ] - 0.0 ) < 1e-13, 'X1[2]' );
	assert.ok( Math.abs( X2[ 1 ] - 0.8 ) < 1e-13, 'X2[1]' );
	assert.strictEqual( X1[ 0 ], 99.0, 'X1[0] preserved' );
	assert.strictEqual( X1[ 1 ], 99.0, 'X1[1] preserved' );
	assert.strictEqual( X2[ 0 ], 99.0, 'X2[0] preserved' );
});

test( 'dorbdb5.ndarray: row-major Q layout produces same projection', function t() {
	let WORK, i, j;

	// 4x2 column-major Q.
	const Q1cm = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0 ] );
	const Q2cm = new Float64Array( 8 );
	const Q1rm = new Float64Array( 4 * 2 );
	const Q2rm = new Float64Array( 4 * 2 );
	for ( i = 0; i < 4; i++ ) {
		for ( j = 0; j < 2; j++ ) {
			Q1rm[ ( i * 2 ) + j ] = Q1cm[ i + ( j * 4 ) ];
			Q2rm[ ( i * 2 ) + j ] = Q2cm[ i + ( j * 4 ) ];
		}
	}

	const X1cm = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const X2cm = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	const X1rm = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const X2rm = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
	WORK = new Float64Array( 2 );

	dorbdb5( 4, 4, 2, X1cm, 1, 0, X2cm, 1, 0, Q1cm, 1, 4, 0, Q2cm, 1, 4, 0, WORK, 1, 0 );
	WORK = new Float64Array( 2 );
	dorbdb5( 4, 4, 2, X1rm, 1, 0, X2rm, 1, 0, Q1rm, 2, 1, 0, Q2rm, 2, 1, 0, WORK, 1, 0 );

	assertArrayClose( X1cm, X1rm, 1e-13, 'X1 layout-invariance' );
	assertArrayClose( X2cm, X2rm, 1e-13, 'X2 layout-invariance' );
});

test( 'dorbdb5.ndarray: validation — negative m1 throws', function t() {
	assert.throws( function throws() {
		dorbdb5( -1, 1, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb5.ndarray: validation — negative m2 throws', function t() {
	assert.throws( function throws() {
		dorbdb5( 1, -1, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb5.ndarray: validation — negative N throws', function t() {
	assert.throws( function throws() {
		dorbdb5( 1, 1, -1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb5.ndarray: validation — zero strideX1 throws', function t() {
	assert.throws( function throws() {
		dorbdb5( 1, 1, 1, new Float64Array( 1 ), 0, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'dorbdb5.ndarray: validation — zero strideX2 throws', function t() {
	assert.throws( function throws() {
		dorbdb5( 1, 1, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 0, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});
