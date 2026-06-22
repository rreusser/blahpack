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
import dorbdb2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dorbdb2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

// Match NMAX in test_dorbdb2.f90 — leading dimension of the X11/X21 buffers
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
* @param {Array} packed - column-major flattened input (length `P*Q`)
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
* @param {boolean} hasTaup1 - whether the fixture has a TAUP1 array
*/
function runFixtureCase( name, M, P, Q, hasPhi, hasTaup1 ) {
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

	info = dorbdb2( M, P, Q, X11, 1, LDX_PAD, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, name + ': info' );

	assertArrayClose( THETA.subarray( 0, Q ), tc.THETA, 1e-12, name + ': THETA' );
	assertArrayClose( TAUP2.subarray( 0, M - P ), tc.TAUP2, 1e-12, name + ': TAUP2' );
	assertArrayClose( TAUQ1.subarray( 0, Q ), tc.TAUQ1, 1e-12, name + ': TAUQ1' );
	assertArrayClose( packMatrix( X11, P, Q ), tc.X11, 1e-11, name + ': X11' );
	assertArrayClose( packMatrix( X21, M - P, Q ), tc.X21, 1e-11, name + ': X21' );

	if ( hasPhi ) {
		assertArrayClose( PHI.subarray( 0, Q - 1 ), tc.PHI, 1e-12, name + ': PHI' );
	}
	if ( hasTaup1 ) {
		assertArrayClose( TAUP1.subarray( 0, P - 1 ), tc.TAUP1, 1e-12, name + ': TAUP1' );
	}
}


// TESTS //

test( 'dorbdb2.ndarray: m10_p3_q5 (full coverage of both loops + i<P-1 branch)', function t() {
	runFixtureCase( 'm10_p3_q5', 10, 3, 5, true, true );
});

test( 'dorbdb2.ndarray: m12_p4_q6 (larger case)', function t() {
	runFixtureCase( 'm12_p4_q6', 12, 4, 6, true, true );
});

test( 'dorbdb2.ndarray: p1_no_taup1 (P=1 — i<P-1 branch never taken)', function t() {
	// P=1: only one iteration of the outer loop, and the inner i<P-1 branch never fires (so TAUP1 unset)
	runFixtureCase( 'p1_no_taup1', 6, 1, 2, true, false );
});

test( 'dorbdb2.ndarray: p_eq_q (P=Q — second loop runs zero times)', function t() {
	runFixtureCase( 'p_eq_q', 8, 2, 2, true, true );
});

test( 'dorbdb2.ndarray: p0_only_second_loop (P=0 — first loop never runs; only second loop runs)', function t() {
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

	tc = findCase( 'p0_only_second_loop' );
	X11 = new Float64Array( 1 );
	X21 = buildBuffer( tc.X21in, 6, 3 );

	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Float64Array( LDX_PAD );
	TAUP2 = new Float64Array( LDX_PAD );
	TAUQ1 = new Float64Array( LDX_PAD );
	WORK = new Float64Array( LDX_PAD * LDX_PAD );

	info = dorbdb2( 6, 0, 3, X11, 1, 1, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( TAUP2.subarray( 0, 3 ), tc.TAUP2, 1e-12, 'p0: TAUP2' );
	assertArrayClose( packMatrix( X21, 6, 3 ), tc.X21, 1e-11, 'p0: X21' );
});

test( 'dorbdb2.ndarray: q0_quick_return — both loops never execute', function t() {
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
	X21 = new Float64Array( LDX_PAD * LDX_PAD );
	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Float64Array( LDX_PAD );
	TAUP2 = new Float64Array( LDX_PAD );
	TAUQ1 = new Float64Array( LDX_PAD );
	WORK = new Float64Array( LDX_PAD * LDX_PAD );

	info = dorbdb2( 4, 0, 0, X11, 1, 1, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dorbdb2.ndarray: throws RangeError for negative M', function t() {
	var X = new Float64Array( 1 );
	assert.throws( function throws() {
		dorbdb2( -1, 0, 0, X, 1, 1, 0, X, 1, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb2.ndarray: throws RangeError when P > M-P', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		// M=4, P=3: M-P = 1, P > M-P
		dorbdb2( 4, 3, 1, X, 1, 4, 0, X, 1, 4, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb2.ndarray: throws RangeError when P > Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		// M=10, P=4, Q=2: P > Q
		dorbdb2( 10, 4, 2, X, 1, 4, 0, X, 1, 4, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb2.ndarray: throws RangeError when P > M-Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		// M=8, P=4, Q=5: M-Q = 3, P > M-Q
		dorbdb2( 8, 4, 5, X, 1, 4, 0, X, 1, 4, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'dorbdb2.ndarray: throws RangeError when Q < 0', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 8, 0, -1, X, 1, 4, 0, X, 1, 4, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});
