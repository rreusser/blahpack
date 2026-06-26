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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunbdb5 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zunbdb5.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
* Build a column-major complex Q stored as a flat `Complex128Array`.
*
* @private
* @param {NonNegativeInteger} LD - leading dimension (rows of storage, in complex elements)
* @param {NonNegativeInteger} cols - number of columns
* @param {Array} entries - array of `[row, col, re, im]` tuples (0-based)
* @returns {Complex128Array} flat column-major buffer
*/
function buildQ( LD, cols, entries ) {
	var view;
	var out;
	var idx;
	var e;
	var i;

	out = new Complex128Array( LD * cols );
	view = reinterpret( out, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		e = entries[ i ];
		idx = ( e[ 0 ] + ( e[ 1 ] * LD ) ) * 2;
		view[ idx ] = e[ 2 ];
		view[ idx + 1 ] = e[ 3 ];
	}
	return out;
}

/**
* Compare an interleaved Float64 view of a complex array against an expected Float64 array.
*
* @private
* @param {Float64Array} actual - actual values (interleaved real/imag)
* @param {Array} expected - expected values (interleaved real/imag)
* @param {NonNegativeInteger} N - number of doubles to compare
* @param {number} tol - absolute tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, N, tol, msg ) {
	var i;
	for ( i = 0; i < N; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

test( 'zunbdb5.ndarray: basic_4x4_n2', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var sq2;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'basic_4x4_n2' );
	sq2 = 1.0 / Math.sqrt( 2.0 );

	// Q1, Q2: 8x2 column-major (NMAX=8 in Fortran). All entries real (zero imag part).
	Q1 = buildQ( 8, 2, [ [ 0, 0, sq2, 0.0 ], [ 1, 1, sq2, 0.0 ] ] );
	Q2 = buildQ( 8, 2, [ [ 0, 0, sq2, 0.0 ], [ 1, 1, sq2, 0.0 ] ] );

	X1 = new Complex128Array( [ 1.0, 1.0, 2.0, 2.0, 3.0, 3.0, 4.0, 4.0 ] );
	X2 = new Complex128Array( [ 5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0 ] );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 8, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 8, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: n_zero (no Q columns)', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'n_zero' );

	// N=0 → no Q columns; X is unit-normalized through the first branch (norm > N*EPS trivially true) and zunbdb6 with N=0 is a no-op.
	Q1 = new Complex128Array( 1 );
	Q2 = new Complex128Array( 1 );
	X1 = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	X2 = new Complex128Array( [ 4.0, 0.0, 5.0, 0.0, 6.0, 0.0 ] );
	WORK = new Complex128Array( 1 );

	info = zunbdb5( 3, 3, 0, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 6, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 6, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: zero_x_finds_e3_in_x1', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'zero_x_finds_e3_in_x1' );

	// Q has columns e_1, e_2 in the X1 partition. X is exactly zero, so the standard-basis search runs: e_1 and e_2 are in range(Q), e_3 is not, so result = e_3 in X1.
	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0, 0.0 ], [ 1, 1, 1.0, 0.0 ] ] );
	Q2 = new Complex128Array( 8 * 2 );
	X1 = new Complex128Array( 4 );
	X2 = new Complex128Array( 4 );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 4, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 8, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 8, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: zero_x_finds_e_first_in_x2', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'zero_x_finds_e_first_in_x2' );

	// m1=2, m2=3, n=2; Q spans the entire X1 partition. The X1-loop never finds an orthogonal e_i, so the X2 search runs and picks e_1 of X2.
	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0, 0.0 ], [ 1, 1, 1.0, 0.0 ] ] );
	Q2 = new Complex128Array( 8 * 2 );
	X1 = new Complex128Array( 2 );
	X2 = new Complex128Array( 3 );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 2, 3, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 4, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 6, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: m1_zero (top half empty)', function t() {
	var WORK;
	var info;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'm1_zero' );

	// m1=0; entire vector lives in X2.
	Q1 = new Complex128Array( 1 );
	Q2 = buildQ( 8, 2, [ [ 0, 0, 1.0, 0.0 ], [ 1, 1, 1.0, 0.0 ] ] );
	X1 = new Complex128Array( 0 );
	X2 = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 0, 4, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X2v, tc.X2, 8, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: m2_zero (bottom half empty)', function t() {
	var WORK;
	var info;
	var X1v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'm2_zero' );

	// m2=0; entire vector lives in X1.
	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0, 0.0 ], [ 1, 1, 1.0, 0.0 ] ] );
	Q2 = new Complex128Array( 1 );
	X1 = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	X2 = new Complex128Array( 0 );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 4, 0, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 8, 1e-13, 'X1' );
});

test( 'zunbdb5.ndarray: stride_2 (non-unit increments)', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'stride_2' );

	// Stride 2 — Q1(:,1)=e_1, Q2(:,2)=e_1; X1 with complex stride 2: (1,0)_2 = X1[0], (2,0)_2 = X1[2], (3,0)_2 = X1[4].
	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0, 0.0 ] ] );
	Q2 = buildQ( 8, 2, [ [ 0, 1, 1.0, 0.0 ] ] );
	X1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0 ] );
	X2 = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 6.0, 0.0, 0.0, 0.0 ] );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 3, 3, 2, X1, 2, 0, X2, 2, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 12, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 12, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: m1_m2_n_one (all dims = 1)', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'm1_m2_n_one' );

	Q1 = new Complex128Array( [ 1.0, 0.0 ] );
	Q2 = new Complex128Array( [ 0.0, 0.0 ] );
	X1 = new Complex128Array( [ 3.0, 4.0 ] );
	X2 = new Complex128Array( [ 5.0, 6.0 ] );
	WORK = new Complex128Array( 1 );

	info = zunbdb5( 1, 1, 1, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 1, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 2, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 2, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: tiny_x_falls_through_to_basis_search', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'tiny_x_falls_through_to_basis_search' );

	// X has tiny norm so first scaled-projection branch is skipped; basis search returns e_3 in X1.
	Q1 = buildQ( 8, 2, [ [ 0, 0, 1.0, 0.0 ], [ 1, 1, 1.0, 0.0 ] ] );
	Q2 = new Complex128Array( 8 * 2 );
	X1 = new Complex128Array( [ 1e-300, 0.0, 1e-300, 0.0, 0.0, 0.0 ] );
	X2 = new Complex128Array( 3 );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 3, 3, 2, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 6, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 6, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: complex_q_one_col (genuinely complex Q)', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;
	var tc;

	tc = findCase( 'complex_q_one_col' );

	// Q = [(0.5, 0.5); (0.5, -0.5)] (unit length); Q2 = 0. X exercises the conjugate-transpose path.
	Q1 = buildQ( 8, 1, [ [ 0, 0, 0.5, 0.5 ], [ 1, 0, 0.5, -0.5 ] ] );
	Q2 = new Complex128Array( 8 );
	X1 = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	X2 = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0 ] );
	WORK = new Complex128Array( 8 );

	info = zunbdb5( 2, 2, 1, X1, 1, 0, X2, 1, 0, Q1, 1, 8, 0, Q2, 1, 8, 0, WORK, 1, 0 );
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( X1v, tc.X1, 4, 1e-13, 'X1' );
	assertArrayClose( X2v, tc.X2, 4, 1e-13, 'X2' );
});

test( 'zunbdb5.ndarray: returns info=0 for trivial m1=0 m2=0', function t() {
	var WORK;
	var info;
	var X1;
	var X2;

	X1 = new Complex128Array( 1 );
	X2 = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );

	info = zunbdb5( 0, 0, 0, X1, 1, 0, X2, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb5.ndarray: nonzero offsets are honored', function t() {
	var WORK;
	var info;
	var X1v;
	var X2v;
	var Q1;
	var Q2;
	var X1;
	var X2;

	// X = (3+0i; 4+0i) projected against Q = (1+0i; 0+0i); buffers padded with offsets (complex 99+0i sentinels).
	Q1 = new Complex128Array( [ 99.0, 0.0, 1.0, 0.0 ] );
	Q2 = new Complex128Array( [ 99.0, 0.0, 0.0, 0.0 ] );
	X1 = new Complex128Array( [ 99.0, 0.0, 99.0, 0.0, 3.0, 0.0 ] );
	X2 = new Complex128Array( [ 99.0, 0.0, 4.0, 0.0 ] );
	WORK = new Complex128Array( [ 99.0, 0.0, 0.0, 0.0 ] );

	info = zunbdb5( 1, 1, 1, X1, 1, 2, X2, 1, 1, Q1, 1, 1, 1, Q2, 1, 1, 1, WORK, 1, 1 );
	assert.strictEqual( info, 0, 'info' );

	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );

	// zunbdb5 normalizes X to unit length then projects out e_1; (3,4)/5 = (0.6, 0.8); after subtracting the e_1 component (0.6), residual is (0, 0.8).
	assert.ok( Math.abs( X1v[ 4 ] - 0.0 ) < 1e-13, 'X1[2].re' );
	assert.ok( Math.abs( X1v[ 5 ] - 0.0 ) < 1e-13, 'X1[2].im' );
	assert.ok( Math.abs( X2v[ 2 ] - 0.8 ) < 1e-13, 'X2[1].re' );
	assert.ok( Math.abs( X2v[ 3 ] - 0.0 ) < 1e-13, 'X2[1].im' );

	// Sentinels preserved.
	assert.strictEqual( X1v[ 0 ], 99.0, 'X1[0].re preserved' );
	assert.strictEqual( X1v[ 2 ], 99.0, 'X1[1].re preserved' );
	assert.strictEqual( X2v[ 0 ], 99.0, 'X2[0].re preserved' );
});

test( 'zunbdb5.ndarray: row-major Q layout produces same projection', function t() {
	var X1cmv;
	var X1rmv;
	var X2cmv;
	var X2rmv;
	var Q1cm;
	var Q2cm;
	var Q1rm;
	var Q2rm;
	var X1cm;
	var X2cm;
	var X1rm;
	var X2rm;
	var WORK;
	var view;
	var i;
	var j;

	// 4x2 column-major Q: column 0 = e_1, column 1 = e_2 (in X1 partition).
	Q1cm = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	Q2cm = new Complex128Array( 8 );
	Q1rm = new Complex128Array( 4 * 2 );
	Q2rm = new Complex128Array( 4 * 2 );

	// Copy column-major → row-major: Qrm[i*2+j] = Qcm[i + j*4].
	view = reinterpret( Q1cm, 0 );
	for ( i = 0; i < 4; i++ ) {
		for ( j = 0; j < 2; j++ ) {
			reinterpret( Q1rm, 0 )[ ( ( ( i * 2 ) + j ) * 2 ) ] = view[ ( ( i + ( j * 4 ) ) * 2 ) ];
			reinterpret( Q1rm, 0 )[ ( ( ( i * 2 ) + j ) * 2 ) + 1 ] = view[ ( ( i + ( j * 4 ) ) * 2 ) + 1 ];
		}
	}

	X1cm = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	X2cm = new Complex128Array( [ 5.0, 0.0, 6.0, 0.0, 7.0, 0.0, 8.0, 0.0 ] );
	X1rm = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	X2rm = new Complex128Array( [ 5.0, 0.0, 6.0, 0.0, 7.0, 0.0, 8.0, 0.0 ] );
	WORK = new Complex128Array( 2 );

	zunbdb5( 4, 4, 2, X1cm, 1, 0, X2cm, 1, 0, Q1cm, 1, 4, 0, Q2cm, 1, 4, 0, WORK, 1, 0 );
	WORK = new Complex128Array( 2 );
	zunbdb5( 4, 4, 2, X1rm, 1, 0, X2rm, 1, 0, Q1rm, 2, 1, 0, Q2rm, 2, 1, 0, WORK, 1, 0 );

	X1cmv = reinterpret( X1cm, 0 );
	X1rmv = reinterpret( X1rm, 0 );
	X2cmv = reinterpret( X2cm, 0 );
	X2rmv = reinterpret( X2rm, 0 );
	assertArrayClose( X1cmv, X1rmv, 8, 1e-13, 'X1 layout-invariance' );
	assertArrayClose( X2cmv, X2rmv, 8, 1e-13, 'X2 layout-invariance' );
});

test( 'zunbdb5.ndarray: validation — negative m1 throws', function t() {
	assert.throws( function throws() {
		zunbdb5( -1, 1, 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zunbdb5.ndarray: validation — negative m2 throws', function t() {
	assert.throws( function throws() {
		zunbdb5( 1, -1, 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zunbdb5.ndarray: validation — negative N throws', function t() {
	assert.throws( function throws() {
		zunbdb5( 1, 1, -1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zunbdb5.ndarray: validation — zero strideX1 throws', function t() {
	assert.throws( function throws() {
		zunbdb5( 1, 1, 1, new Complex128Array( 1 ), 0, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zunbdb5.ndarray: validation — zero strideX2 throws', function t() {
	assert.throws( function throws() {
		zunbdb5( 1, 1, 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 0, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});
