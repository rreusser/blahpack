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

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtplqt2 from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dtplqt2.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

/**
* Locates a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
		return fixture.find( function find( t ) {
		return t.name === name;
	} );
}

/**
* Copies a packed column-major M-by-N matrix into an LDA-stride buffer.
*
* @private
* @param {Array} packed - packed values (length M*N)
* @param {integer} M - rows
* @param {integer} N - columns
* @param {integer} LD - leading dimension
* @returns {Float64Array} buffer
*/
function loadMat( packed, M, N, LD ) {
	var out = new Float64Array( LD * Math.max( 1, N ) );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ i + ( j * LD ) ] = packed[ i + ( j * M ) ];
		}
	}
	return out;
}

/**
* Packs a column-major M-by-N submatrix with leading dimension `LD` into a flat array of length `M*N`.
*
* @private
* @param {Float64Array} A - input matrix
* @param {integer} LD - leading dimension
* @param {integer} M - rows
* @param {integer} N - columns
* @returns {Array} packed values
*/
function packMat( A, LD, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ i + ( j * LD ) ] );
		}
	}
	return out;
}

/**
* Asserts two arrays are close within a relative tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var err;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		err = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( err <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Runs a fixture test case.
*
* @private
* @param {string} name - case name
* @param {integer} M - rows
* @param {integer} N - columns
* @param {integer} l - trapezoidal rows
* @param {Array} Ain - packed M-by-M input for `A`
* @param {Array} Bin - packed M-by-N input for `B`
*/
function runCase( name, M, N, l, Ain, Bin ) {
	var info;
	var tc;
	var LD;
	var A;
	var B;
	var T;

	tc = findCase( name );
	LD = 6;
	A = loadMat( Ain, M, M, LD );
	B = loadMat( Bin, M, N, LD );
	T = new Float64Array( LD * Math.max( 1, M ) );

	info = dtplqt2( M, N, l, A, 1, LD, 0, B, 1, LD, 0, T, 1, LD, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( packMat( A, LD, M, M ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( B, LD, M, N ), tc.B, 1e-13, 'B' );
	assertArrayClose( packMat( T, LD, M, M ), tc.T, 1e-13, 'T' );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.equal( typeof dtplqt2, 'function' );
});

test( 'dtplqt2: m3_n4_l0', function t() {
	// M-by-M column-major A (lower triangular)
	var A = [
		2.0,
		0.5,
		0.25,
		0.0,
		3.0,
		0.75,
		0.0,
		0.0,
		4.0
	];

	// M-by-N column-major B (rectangular since l=0)
	var B = [
		1.0,
		0.3,
		0.7,
		0.5,
		1.1,
		0.4,
		0.25,
		0.6,
		1.2,
		0.125,
		0.2,
		0.9
	];
	runCase( 'm3_n4_l0', 3, 4, 0, A, B );
});

test( 'dtplqt2: m3_n4_l3', function t() {
	var A = [
		2.0,
		0.5,
		0.25,
		0.0,
		3.0,
		0.75,
		0.0,
		0.0,
		4.0
	];

	// Last l=3 columns form lower trapezoidal block; col 0 is rectangular.
	var B = [
		1.0,
		0.3,
		0.7,
		0.5,
		1.1,
		0.4,
		0.0,
		0.6,
		1.2,
		0.0,
		0.0,
		0.9
	];
	runCase( 'm3_n4_l3', 3, 4, 3, A, B );
});

test( 'dtplqt2: m3_n3_l2', function t() {
	var A = [
		3.0,
		0.5,
		0.25,
		0.0,
		2.5,
		0.75,
		0.0,
		0.0,
		4.5
	];
	var B = [
		0.9,
		0.2,
		0.6,
		0.0,
		1.3,
		0.4,
		0.0,
		0.0,
		1.1
	];
	runCase( 'm3_n3_l2', 3, 3, 2, A, B );
});

test( 'dtplqt2: m3_n3_l3', function t() {
	var A = [
		2.0,
		0.3,
		0.1,
		0.0,
		3.0,
		0.2,
		0.0,
		0.0,
		4.0
	];
	var B = [
		1.1,
		0.4,
		0.6,
		0.0,
		1.5,
		0.3,
		0.0,
		0.0,
		1.7
	];
	runCase( 'm3_n3_l3', 3, 3, 3, A, B );
});

test( 'dtplqt2: m1_n3_l1', function t() {
	var A = [ 5.0 ];
	var B = [ 1.0, 2.0, 3.0 ];
	runCase( 'm1_n3_l1', 1, 3, 1, A, B );
});

test( 'dtplqt2: m4_n2_l2', function t() {
	var A = [
		2.0,
		0.5,
		0.2,
		0.1,
		0.0,
		3.0,
		0.4,
		0.3,
		0.0,
		0.0,
		2.5,
		0.6,
		0.0,
		0.0,
		0.0,
		3.5
	];
	var B = [
		1.0,
		0.5,
		0.7,
		0.3,
		0.0,
		1.2,
		0.8,
		0.6
	];
	runCase( 'm4_n2_l2', 4, 2, 2, A, B );
});

test( 'dtplqt2: m_zero (quick return)', function t() {
	var info;
	var A;
	var B;
	var T;

	A = new Float64Array( 6 );
	B = new Float64Array( 18 );
	T = new Float64Array( 6 );
	info = dtplqt2( 0, 3, 0, A, 1, 6, 0, B, 1, 6, 0, T, 1, 6, 0 );
	assert.equal( info, 0 );
});

test( 'dtplqt2: n_zero (quick return)', function t() {
	var info;
	var A;
	var B;
	var T;

	A = new Float64Array( 18 );
	B = new Float64Array( 6 );
	T = new Float64Array( 18 );
	info = dtplqt2( 3, 0, 0, A, 1, 6, 0, B, 1, 6, 0, T, 1, 6, 0 );
	assert.equal( info, 0 );
});
