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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunbdb2 from './../lib/zunbdb2.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zunbdb2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
* Build a contiguous P-by-Q complex column-major buffer from interleaved input.
*
* @private
* @param {Array} packed - column-major interleaved values (length `2*P*Q`)
* @param {NonNegativeInteger} P - rows
* @param {NonNegativeInteger} Q - columns
* @returns {Complex128Array} buffer (`P*Q` complex elements)
*/
function packToComplex( packed, P, Q ) {
	var bufv;
	var buf;
	var i;

	buf = new Complex128Array( P * Q );
	bufv = reinterpret( buf, 0 );
	for ( i = 0; i < 2 * P * Q; i++ ) {
		bufv[ i ] = packed[ i ];
	}
	return buf;
}


// TESTS //

test( 'zunbdb2 is a function', function t() {
	assert.strictEqual( typeof zunbdb2, 'function', 'is a function' );
});

test( 'zunbdb2 has expected arity', function t() {
	assert.strictEqual( zunbdb2.length, 20, 'has expected arity' );
});

test( 'zunbdb2 throws TypeError for invalid order', function t() {
	var X = new Complex128Array( 4 );
	var T = new Float64Array( 4 );
	var W = new Complex128Array( 4 );
	assert.throws( function throws() {
		zunbdb2( 'invalid', 2, 0, 0, X, 2, X, 2, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, TypeError );
});

test( 'zunbdb2 throws RangeError for negative M', function t() {
	var X = new Complex128Array( 4 );
	var T = new Float64Array( 4 );
	var W = new Complex128Array( 4 );
	assert.throws( function throws() {
		zunbdb2( 'column-major', -1, 0, 0, X, 1, X, 1, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 throws RangeError when LDX11 < P (column-major)', function t() {
	var X = new Complex128Array( 16 );
	var T = new Float64Array( 16 );
	var W = new Complex128Array( 16 );
	assert.throws( function throws() {
		// P=3, LDX11=1 (< 3)
		zunbdb2( 'column-major', 6, 3, 3, X, 1, X, 3, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 throws RangeError when LDX21 < M-P (column-major)', function t() {
	var X = new Complex128Array( 16 );
	var T = new Float64Array( 16 );
	var W = new Complex128Array( 16 );
	assert.throws( function throws() {
		// M=6, P=3, M-P=3, LDX21=1 (< 3)
		zunbdb2( 'column-major', 6, 3, 3, X, 3, X, 1, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 throws RangeError when LDX11 < Q (row-major)', function t() {
	var X = new Complex128Array( 16 );
	var T = new Float64Array( 16 );
	var W = new Complex128Array( 16 );
	assert.throws( function throws() {
		// Q=3, LDX11=1 (< 3)
		zunbdb2( 'row-major', 6, 3, 3, X, 1, X, 3, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 throws RangeError when LDX21 < Q (row-major)', function t() {
	var X = new Complex128Array( 16 );
	var T = new Float64Array( 16 );
	var W = new Complex128Array( 16 );
	assert.throws( function throws() {
		// Q=3, LDX21=1 (< 3)
		zunbdb2( 'row-major', 6, 3, 3, X, 3, X, 1, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 throws RangeError when Q > M', function t() {
	var X = new Complex128Array( 16 );
	var T = new Float64Array( 16 );
	var W = new Complex128Array( 16 );
	assert.throws( function throws() {
		zunbdb2( 'column-major', 4, 0, 5, X, 1, X, 1, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 throws RangeError when P < 0', function t() {
	var X = new Complex128Array( 16 );
	var T = new Float64Array( 16 );
	var W = new Complex128Array( 16 );
	assert.throws( function throws() {
		zunbdb2( 'column-major', 4, -1, 2, X, 1, X, 1, T, 1, T, 1, W, 1, W, 1, W, 1, W, 1 );
	}, RangeError );
});

test( 'zunbdb2 row-major fixture (m10_p3_q5)', function t() {
	var THETA;
	var TAUP1;
	var TAUP2;
	var TAUQ1;
	var X11rm;
	var X11cm;
	var X21rm;
	var X21cm;
	var WORK;
	var X11r;
	var X21r;
	var info;
	var PHI;
	var tc;
	var M;
	var P;
	var Q;
	var i;
	var j;

	tc = findCase( 'm10_p3_q5' );
	M = 10;
	P = 3;
	Q = 5;

	// Build row-major buffers from the column-major fixture data.
	X11cm = packToComplex( tc.X11in, P, Q );
	X21cm = packToComplex( tc.X21in, M - P, Q );
	X11rm = new Complex128Array( P * Q );
	X21rm = new Complex128Array( ( M - P ) * Q );
	X11r = reinterpret( X11rm, 0 );
	X21r = reinterpret( X21rm, 0 );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			// row-major: row i, col j  ->  i*Q + j
			X11r[ 2 * ( ( i * Q ) + j ) ] = reinterpret( X11cm, 0 )[ 2 * ( i + ( j * P ) ) ];
			X11r[ ( 2 * ( ( i * Q ) + j ) ) + 1 ] = reinterpret( X11cm, 0 )[ ( 2 * ( i + ( j * P ) ) ) + 1 ];
		}
		for ( i = 0; i < M - P; i++ ) {
			X21r[ 2 * ( ( i * Q ) + j ) ] = reinterpret( X21cm, 0 )[ 2 * ( i + ( j * ( M - P ) ) ) ];
			X21r[ ( 2 * ( ( i * Q ) + j ) ) + 1 ] = reinterpret( X21cm, 0 )[ ( 2 * ( i + ( j * ( M - P ) ) ) ) + 1 ];
		}
	}

	THETA = new Float64Array( Q );
	PHI = new Float64Array( Q - 1 );
	TAUP1 = new Complex128Array( P - 1 );
	TAUP2 = new Complex128Array( M - P );
	TAUQ1 = new Complex128Array( Q );
	WORK = new Complex128Array( 100 );

	info = zunbdb2( 'row-major', M, P, Q, X11rm, Q, X21rm, Q, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );

	for ( i = 0; i < Q; i++ ) {
		assert.ok( Math.abs( THETA[ i ] - tc.THETA[ i ] ) < 1e-12, 'THETA[' + i + '] mismatch' );
	}
});

test( 'zunbdb2 column-major fixture (m10_p3_q5)', function t() {
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
	var i;

	tc = findCase( 'm10_p3_q5' );

	// In column-major contiguous form: LDX11 = P = 3, LDX21 = M-P = 7.
	X11 = packToComplex( tc.X11in, 3, 5 );
	X21 = packToComplex( tc.X21in, 7, 5 );

	THETA = new Float64Array( 5 );
	PHI = new Float64Array( 4 );
	TAUP1 = new Complex128Array( 2 );
	TAUP2 = new Complex128Array( 7 );
	TAUQ1 = new Complex128Array( 5 );
	WORK = new Complex128Array( 100 );

	info = zunbdb2( 'column-major', 10, 3, 5, X11, 3, X21, 7, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );

	// Spot-check THETA matches fixture to within tolerance.
	for ( i = 0; i < 5; i++ ) {
		assert.ok( Math.abs( THETA[ i ] - tc.THETA[ i ] ) < 1e-12, 'THETA[' + i + '] mismatch' );
	}
});
