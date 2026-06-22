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
import dorbdb2 from './../lib/dorbdb2.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dorbdb2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

var LDX_PAD = 16;


// FUNCTIONS //

/**
* Find a fixture by name.
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
* Build an `LDX_PAD`-by-`Q` column-major buffer.
*
* @private
* @param {Array} packed - column-major flattened input (length `P*Q`)
* @param {NonNegativeInteger} P - number of rows in the source matrix
* @param {NonNegativeInteger} Q - number of columns in the source matrix
* @returns {Float64Array} padded column-major buffer
*/
function buildColumnMajor( packed, P, Q ) {
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
* Build a row-major buffer (P rows, Q cols) with leading dimension `LDX_PAD`.
*
* @private
* @param {Array} packed - column-major flattened input (length `P*Q`)
* @param {NonNegativeInteger} P - number of rows in the source matrix
* @param {NonNegativeInteger} Q - number of columns in the source matrix
* @returns {Float64Array} padded row-major buffer
*/
function buildRowMajor( packed, P, Q ) {
	var buf;
	var i;
	var j;

	buf = new Float64Array( P * LDX_PAD );
	for ( j = 0; j < Q; j++ ) {
		for ( i = 0; i < P; i++ ) {
			buf[ ( i * LDX_PAD ) + j ] = packed[ i + ( j * P ) ];
		}
	}
	return buf;
}

/**
* Compare arrays element-wise to within a tolerance.
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

test( 'dorbdb2 is a function', function t() {
	assert.strictEqual( typeof dorbdb2, 'function', 'is a function' );
});

test( 'dorbdb2 has expected arity', function t() {
	assert.strictEqual( dorbdb2.length, 20, 'has expected arity' );
});

test( 'dorbdb2 throws TypeError for invalid order', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'invalid', 8, 2, 2, X, 2, X, 6, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, TypeError );
});

test( 'dorbdb2 throws RangeError for negative M', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'column-major', -1, 0, 0, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 throws RangeError for invalid Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'column-major', 8, 0, -1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 throws RangeError when P > Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'column-major', 10, 4, 2, X, 4, X, 6, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 throws RangeError for column-major LDX11 < P', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'column-major', 8, 2, 2, X, 1, X, 6, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 throws RangeError for column-major LDX21 < M-P', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'column-major', 8, 2, 2, X, 2, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 throws RangeError for row-major LDX11 < Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'row-major', 8, 2, 2, X, 1, X, 2, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 throws RangeError for row-major LDX21 < Q', function t() {
	var X = new Float64Array( 16 );
	assert.throws( function throws() {
		dorbdb2( 'row-major', 8, 2, 2, X, 2, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1, X, 1 );
	}, RangeError );
});

test( 'dorbdb2 column-major end-to-end against the m10_p3_q5 fixture', function t() {
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

	tc = findCase( 'm10_p3_q5' );
	X11 = buildColumnMajor( tc.X11in, 3, 5 );
	X21 = buildColumnMajor( tc.X21in, 7, 5 );

	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Float64Array( LDX_PAD );
	TAUP2 = new Float64Array( LDX_PAD );
	TAUQ1 = new Float64Array( LDX_PAD );
	WORK = new Float64Array( LDX_PAD * LDX_PAD );

	info = dorbdb2( 'column-major', 10, 3, 5, X11, LDX_PAD, X21, LDX_PAD, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( THETA.subarray( 0, 5 ), tc.THETA, 1e-12, 'THETA' );
	assertArrayClose( PHI.subarray( 0, 4 ), tc.PHI, 1e-12, 'PHI' );
});

test( 'dorbdb2 row-major end-to-end against the m10_p3_q5 fixture', function t() {
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

	tc = findCase( 'm10_p3_q5' );

	// Row-major buffers: data laid out as P rows of stride LDX_PAD
	X11 = buildRowMajor( tc.X11in, 3, 5 );
	X21 = buildRowMajor( tc.X21in, 7, 5 );

	THETA = new Float64Array( LDX_PAD );
	PHI = new Float64Array( LDX_PAD );
	TAUP1 = new Float64Array( LDX_PAD );
	TAUP2 = new Float64Array( LDX_PAD );
	TAUQ1 = new Float64Array( LDX_PAD );
	WORK = new Float64Array( LDX_PAD * LDX_PAD );

	info = dorbdb2( 'row-major', 10, 3, 5, X11, LDX_PAD, X21, LDX_PAD, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info' );

	// THETA, PHI, etc. are storage-independent and must match the fixture
	assertArrayClose( THETA.subarray( 0, 5 ), tc.THETA, 1e-12, 'THETA' );
	assertArrayClose( PHI.subarray( 0, 4 ), tc.PHI, 1e-12, 'PHI' );
});
