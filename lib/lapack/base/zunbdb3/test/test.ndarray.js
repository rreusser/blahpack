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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunbdb3 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zunbdb3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

// Match NMAX in test_zunbdb3.f90 — leading dimension of the X11/X21 buffers
var LDX_PAD = 16;


// FUNCTIONS //

/**
* Locates a fixture record by name.
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
* Builds an `LDX_PAD`-by-`Q` column-major Complex128Array buffer holding a packed `P`-by-`Q` complex matrix.
*
* @private
* @param {Array} packedInterleaved - interleaved `[re,im,re,im,...]` values from the fixture (length `2*P*Q`)
* @param {NonNegativeInteger} P - number of rows in the source matrix
* @param {NonNegativeInteger} Q - number of columns in the source matrix
* @returns {Complex128Array} padded column-major buffer
*/
function buildBuffer( packedInterleaved, P, Q ) {
	var srcIdx;
	var dstIdx;
	var buf;
	var bv;
	var i;
	var j;

	buf = new Complex128Array( LDX_PAD * Q );
	bv = reinterpret( buf, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			srcIdx = 2 * ( i + ( j * P ) );
			dstIdx = 2 * ( i + ( j * LDX_PAD ) );
			bv[ dstIdx ] = packedInterleaved[ srcIdx ];
			bv[ dstIdx + 1 ] = packedInterleaved[ srcIdx + 1 ];
		}
	}
	return buf;
}

/**
* Packs the leading `P`-by-`Q` complex submatrix from a column-major Complex128Array (leading dim `LDX_PAD`) into an interleaved `[re,im,...]` Array of length `2*P*Q`.
*
* @private
* @param {Complex128Array} A - source buffer (column-major, `LDX_PAD` rows)
* @param {NonNegativeInteger} P - number of rows in the submatrix
* @param {NonNegativeInteger} Q - number of columns in the submatrix
* @returns {Array} packed interleaved values (length `2*P*Q`)
*/
function packMatrix( A, P, Q ) {
	var srcIdx;
	var dstIdx;
	var out;
	var av;
	var i;
	var j;

	av = reinterpret( A, 0 );
	out = [];
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			srcIdx = 2 * ( i + ( j * LDX_PAD ) );
			dstIdx = 2 * ( i + ( j * P ) );
			out[ dstIdx ] = av[ srcIdx ];
			out[ dstIdx + 1 ] = av[ srcIdx + 1 ];
		}
	}
	return out;
}

/**
* Packs the leading `N` complex elements of a Complex128Array into an interleaved `[re,im,...]` Array of length `2*N`.
*
* @private
* @param {Complex128Array} v - source vector
* @param {NonNegativeInteger} N - number of complex elements
* @returns {Array} packed interleaved values
*/
function packVector( v, N ) {
	var out;
	var av;
	var i;

	av = reinterpret( v, 0 );
	out = [];
	for ( i = 0; i < 2 * N; i++ ) {
		out[ i ] = av[ i ];
	}
	return out;
}

/**
* Compares two arrays element-wise to within a tolerance.
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
* Runs a fixture-driven test case end-to-end.
*
* @private
* @param {string} name - test case name (must match a fixture record)
* @param {NonNegativeInteger} M - total rows
* @param {NonNegativeInteger} P - rows in `X11`
* @param {NonNegativeInteger} Q - columns
* @param {boolean} hasPhi - whether the fixture has a `PHI` array
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
	TAUP1 = new Complex128Array( LDX_PAD );
	TAUP2 = new Complex128Array( LDX_PAD );
	TAUQ1 = new Complex128Array( LDX_PAD );
	WORK = new Complex128Array( LDX_PAD * LDX_PAD );

	info = zunbdb3( M, P, Q, X11, 1, LDX_PAD, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, name + ': info' );

	assertArrayClose( THETA.subarray( 0, Q ), tc.THETA, 1e-12, name + ': THETA' );
	assertArrayClose( packVector( TAUP1, P ), tc.TAUP1, 1e-12, name + ': TAUP1' );
	assertArrayClose( packVector( TAUP2, M - P ), tc.TAUP2, 1e-12, name + ': TAUP2' );
	assertArrayClose( packVector( TAUQ1, Q ), tc.TAUQ1, 1e-12, name + ': TAUQ1' );
	assertArrayClose( packMatrix( X11, P, Q ), tc.X11, 1e-10, name + ': X11' );
	assertArrayClose( packMatrix( X21, M - P, Q ), tc.X21, 1e-10, name + ': X21' );

	if ( hasPhi ) {
		assertArrayClose( PHI.subarray( 0, M - P - 1 ), tc.PHI, 1e-12, name + ': PHI' );
	}
}


// TESTS //

test( 'zunbdb3.ndarray: basic_8x5x4 (both loops, i<M-P PHI branch)', function t() {
	runFixtureCase( 'basic_8x5x4', 8, 5, 4, true );
});

test( 'zunbdb3.ndarray: m10_p6_q5 (two iterations of second loop)', function t() {
	runFixtureCase( 'm10_p6_q5', 10, 6, 5, true );
});

test( 'zunbdb3.ndarray: q_eq_mmp (Q=M-P, second loop empty)', function t() {
	runFixtureCase( 'q_eq_mmp', 8, 5, 3, true );
});

test( 'zunbdb3.ndarray: mp_eq_1 (M-P=1 — i<M-P PHI branch never taken)', function t() {
	runFixtureCase( 'mp_eq_1', 4, 3, 2, false );
});

test( 'zunbdb3.ndarray: q0_quick_return — loop body never executes', function t() {
	var THETA;
	var TAUP1;
	var TAUP2;
	var TAUQ1;
	var WORK;
	var info;
	var X11;
	var X21;
	var PHI;

	X11 = new Complex128Array( LDX_PAD * LDX_PAD );
	X21 = new Complex128Array( LDX_PAD * LDX_PAD );
	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Complex128Array( LDX_PAD );
	TAUP2 = new Complex128Array( LDX_PAD );
	TAUQ1 = new Complex128Array( LDX_PAD );
	WORK = new Complex128Array( LDX_PAD * LDX_PAD );

	info = zunbdb3( 2, 2, 0, X11, 1, LDX_PAD, 0, X21, 1, LDX_PAD, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunbdb3.ndarray: throws RangeError for negative M', function t() {
	var X = new Complex128Array( 1 );
	var Y = new Float64Array( 1 );
	assert.throws( function throws() {
		zunbdb3( -1, 0, 0, X, 1, 1, 0, X, 1, 1, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb3.ndarray: throws RangeError when 2*P < M', function t() {
	var X = new Complex128Array( 16 );
	var Y = new Float64Array( 16 );
	assert.throws( function throws() {
		// 2*P=2 < M=8 violates the zunbdb3 partition (M-P > P)
		zunbdb3( 8, 1, 4, X, 1, 4, 0, X, 1, 4, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb3.ndarray: throws RangeError when Q < M-P', function t() {
	var X = new Complex128Array( 16 );
	var Y = new Float64Array( 16 );
	assert.throws( function throws() {
		// Q=1 < M-P=2 violates the column-count constraint
		zunbdb3( 6, 4, 1, X, 1, 4, 0, X, 1, 4, 0, Y, 1, 0, Y, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0, X, 1, 0 );
	}, RangeError );
});

test( 'zunbdb3.ndarray: returns info=0 when called with M=Q=0 (degenerate)', function t() {
	var THETA;
	var TAUP1;
	var TAUP2;
	var TAUQ1;
	var WORK;
	var info;
	var X11;
	var X21;
	var PHI;

	X11 = new Complex128Array( 1 );
	X21 = new Complex128Array( 1 );
	THETA = new Float64Array( 1 );
	PHI = new Float64Array( 1 );
	TAUP1 = new Complex128Array( 1 );
	TAUP2 = new Complex128Array( 1 );
	TAUQ1 = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );

	info = zunbdb3( 0, 0, 0, X11, 1, 1, 0, X21, 1, 1, 0, THETA, 1, 0, PHI, 1, 0, TAUP1, 1, 0, TAUP2, 1, 0, TAUQ1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});
