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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorbdb1 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dorbdb1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

// Match NMAX in test_dorbdb1.f90 — leading dimension of the X11/X21 buffers
var LDX_PAD = 16;


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
* Build an `LDX_PAD`-by-`Q` column-major buffer holding a packed `P`-by-`Q` matrix.
*
* @private
* @param {Array} packed - row-major flattened input (length `P*Q`, column-major)
* @param {NonNegativeInteger} P - number of rows in the source matrix
* @param {NonNegativeInteger} Q - number of columns in the source matrix
* @returns {Float64Array} padded column-major buffer (LDX_PAD-by-Q with the source in the first P rows of each column)
*/
function buildBuffer( packed, P, Q ) {
	var buf;
	var i;
	var j;

	buf = new Float64Array( LDX_PAD * Q );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			buf[ i + ( j * LDX_PAD ) ] = packed[ i + ( j * P ) ];
		}
	}
	return buf;
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

/**
* Pack the leading P-by-Q submatrix from a column-major buffer with leading dimension LDX_PAD into a contiguous P*Q buffer.
*
* @private
* @param {Float64Array} A - source buffer (column-major, LDX_PAD rows)
* @param {NonNegativeInteger} P - number of rows in the submatrix
* @param {NonNegativeInteger} Q - number of columns in the submatrix
* @returns {Array} packed contiguous values
*/
function packMatrix( A, P, Q ) {
	var out;
	var idx;
	var i;
	var j;

	out = [];
	idx = 0;
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			out[ idx ] = A[ i + ( j * LDX_PAD ) ];
			idx += 1;
		}
	}
	return out;
}

/**
* Run a fixture-driven test case end-to-end.
*
* @private
* @param {string} name - test case name (must match a fixture record)
* @param {NonNegativeInteger} M - total rows
* @param {NonNegativeInteger} P - rows in X11
* @param {NonNegativeInteger} Q - columns
* @param {boolean} hasPhi - whether the fixture has a PHI array
*/
function runFixtureCase( name, M, P, Q, hasPhi ) {
	var THETA;
	var TAUP1;
	var TAUP2;
	var TAUQ1;
	var WORK;
	var info;
	var X11;
	var X21;
	var PHI;
	var tc;

	tc = findCase( name );
	X11 = buildBuffer( tc.X11in, P, Q );
	X21 = buildBuffer( tc.X21in, M - P, Q );

	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Float64Array( LDX_PAD );
	TAUP2 = new Float64Array( LDX_PAD );
	TAUQ1 = new Float64Array( LDX_PAD );
	WORK = new Float64Array( LDX_PAD * LDX_PAD );

	info = dorbdb1( M, P, Q, X11, 1, LDX_PAD, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, name + ': info' );

	assertArrayClose( THETA.subarray( 0, Q ), tc.THETA, 1e-13, name + ': THETA' );
	assertArrayClose( TAUP1.subarray( 0, P ), tc.TAUP1, 1e-13, name + ': TAUP1' );
	assertArrayClose( TAUP2.subarray( 0, M - P ), tc.TAUP2, 1e-13, name + ': TAUP2' );
	assertArrayClose( TAUQ1.subarray( 0, Q ), tc.TAUQ1, 1e-13, name + ': TAUQ1' );
	assertArrayClose( packMatrix( X11, P, Q ), tc.X11, 1e-12, name + ': X11' );
	assertArrayClose( packMatrix( X21, M - P, Q ), tc.X21, 1e-12, name + ': X21' );

	if ( hasPhi ) {
		assertArrayClose( PHI.subarray( 0, Q - 1 ), tc.PHI, 1e-13, name + ': PHI' );
	}
}


// TESTS //

test( 'dorbdb1.ndarray: basic_8x4x2', function t() {
	runFixtureCase( 'basic_8x4x2', 8, 4, 2, true );
});

test( 'dorbdb1.ndarray: m10_p5_q3 (3 columns exercises Q1 reflector path twice)', function t() {
	runFixtureCase( 'm10_p5_q3', 10, 5, 3, true );
});

test( 'dorbdb1.ndarray: q1_no_phi (Q=1 — `i < Q-1` branch never taken)', function t() {
	runFixtureCase( 'q1_no_phi', 6, 3, 1, false );
});

test( 'dorbdb1.ndarray: q0_quick_return — loop body never executes', function t() {
	var THETA;
	var TAUP1;
	var TAUP2;
	var TAUQ1;
	var WORK;
	var info;
	var X11;
	var X21;
	var PHI;

	X11 = new Float64Array( LDX_PAD * LDX_PAD );
	X21 = new Float64Array( LDX_PAD * LDX_PAD );
	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Float64Array( LDX_PAD );
	TAUP2 = new Float64Array( LDX_PAD );
	TAUQ1 = new Float64Array( LDX_PAD );
	WORK = new Float64Array( LDX_PAD * LDX_PAD );

	info = dorbdb1( 4, 2, 0, X11, 1, LDX_PAD, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dorbdb1.ndarray: throws RangeError for negative M', function t() {
	var X = new Float64Array( 1 );
	assert.throws( function throws() {
		dorbdb1( -1, 0, 0, X, 1, 1, 0, X, 1, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb1.ndarray: throws RangeError when P < Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb1( 8, 1, 2, X, 1, 4, 0, X, 1, 4, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb1.ndarray: throws RangeError when Q < 0', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb1( 8, 4, -1, X, 1, 4, 0, X, 1, 4, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb1.ndarray: returns info=0 when called with M=Q=0 (degenerate)', function t() {
	var THETA;
	var TAUP1;
	var TAUP2;
	var TAUQ1;
	var WORK;
	var info;
	var X11;
	var X21;
	var PHI;

	X11 = new Float64Array( 1 );
	X21 = new Float64Array( 1 );
	THETA = new Float64Array( 1 );
	PHI = new Float64Array( 1 );
	TAUP1 = new Float64Array( 1 );
	TAUP2 = new Float64Array( 1 );
	TAUQ1 = new Float64Array( 1 );
	WORK = new Float64Array( 1 );

	info = dorbdb1( 0, 0, 0, X11, 1, 1, 0, X21, 1, 1, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});
