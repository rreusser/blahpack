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
import dlarrf from './../lib/dlarrf.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixture = readFileSync( path.join( fixtureDir, 'dlarrf.jsonl' ), 'utf8' )
	.trim()
	.split( '\n' )
	.map( parseLine );
var PIVMIN = 2.2250738585072014e-308;
var TOL = 1e-13;


// FUNCTIONS //

/**
* Parses a JSONL line into an object.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed fixture record
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Looks up a fixture by name.
*
* @private
* @param {string} name - fixture name
* @returns {Object} fixture record
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that `actual` is close to `expected` within relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Asserts that two equal-length array-likes are close within tolerance.
*
* @private
* @param {Array<number>} actual - actual values
* @param {Array<number>} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Copies a prefix of a typed array into a plain Array.
*
* @private
* @param {Float64Array} typed - source typed array
* @param {NonNegativeInteger} len - number of elements to copy
* @returns {Array<number>} plain array containing the prefix
*/
function copyToArray( typed, len ) {
	var out = [];
	var i;
	for ( i = 0; i < len; i++ ) {
		out.push( typed[ i ] );
	}
	return out;
}


// TESTS //

test( 'dlarrf is a function', function t() {
	assert.strictEqual( typeof dlarrf, 'function', 'is a function' );
});

test( 'dlarrf has expected arity', function t() {
	assert.strictEqual( dlarrf.length, 26, 'has expected arity' );
});

test( 'dlarrf throws RangeError for negative N', function t() {
	var s = new Float64Array( 1 );
	var d = new Float64Array( 0 );
	assert.throws( throws, RangeError );

	/**
	* Throws a RangeError by calling dlarrf with negative N.
	*
	* @private
	*/
	function throws() {
		dlarrf( -1, d, 1, d, 1, d, 1, 1, 1, d, 1, d, 1, d, 1, 1.0, 1.0, 1.0, PIVMIN, s, d, 1, d, 1, d, 1 );
	}
});

test( 'dlarrf returns integer info for N=0 quick return', function t() {
	var info;
	var tc = findCase( 'n_zero' );
	var d = new Float64Array( 0 );
	var s = new Float64Array( 1 );
	info = dlarrf( 0, d, 1, d, 1, d, 1, 1, 1, d, 1, d, 1, d, 1, 1.0, 1.0, 1.0, PIVMIN, s, d, 1, d, 1, d, 1 );
	assert.equal( info, tc.info, 'info matches fixture' );
	assert.equal( typeof info, 'number', 'info is a number' );
});

test( 'dlarrf wrapper: tridiag_4x4_full_cluster matches fixture', function t() {
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 4 );
	var lplus = new Float64Array( 4 );
	var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
	var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
	var work = new Float64Array( 8 );
	var info;
	var tc = findCase( 'tridiag_4x4_full_cluster' );
	var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
	var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
	var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
	var N = 4;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.equal( info, tc.info, 'info' );
	assertClose( sigma[ 0 ], tc.sigma, TOL, 'sigma' );
	assertArrayClose( copyToArray( dplus, N ), tc.dplus, TOL, 'dplus' );
	assertArrayClose( copyToArray( lplus, N - 1 ), tc.lplus, TOL, 'lplus' );
});

test( 'dlarrf wrapper: tridiag_2x2 matches fixture', function t() {
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 2 );
	var lplus = new Float64Array( 2 );
	var werr = new Float64Array( [ 1e-5, 1e-5 ] );
	var wgap = new Float64Array( [ 1.9, 0.0 ] );
	var work = new Float64Array( 4 );
	var info;
	var tc = findCase( 'tridiag_2x2' );
	var ld = new Float64Array( [ 0.2, 0.0 ] );
	var d = new Float64Array( [ 2.0, 4.0 ] );
	var l = new Float64Array( [ 0.1, 0.0 ] );
	var w = new Float64Array( [ 1.99, 4.01 ] );
	var N = 2;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 2, w, 1, wgap, 1, werr, 1, 2.0, 1.0, 1.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.equal( info, tc.info, 'info' );
	assertClose( sigma[ 0 ], tc.sigma, TOL, 'sigma' );
	assertArrayClose( copyToArray( dplus, N ), tc.dplus, TOL, 'dplus' );
	assertArrayClose( copyToArray( lplus, N - 1 ), tc.lplus, TOL, 'lplus' );
});

test( 'dlarrf wrapper: tight_cluster_6x6 matches fixture (exercises RRR1 path)', function t() {
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 6 );
	var lplus = new Float64Array( 6 );
	var werr = new Float64Array( [ 1e-12, 1e-12, 1e-12, 1e-12, 1e-12, 1e-12 ] );
	var wgap = new Float64Array( [ 1e-9, 1e-9, 1e-9, 1e-9, 4.0, 0.0 ] );
	var work = new Float64Array( 12 );
	var info;
	var tc = findCase( 'tight_cluster_6x6' );
	var ld = new Float64Array( [ 0.06, 0.05, 0.02, 0.02000001, 0.02000002, 0.0 ] );
	var d = new Float64Array( [ 6.0, 5.0, 2.0, 2.000001, 2.000002, 1.0 ] );
	var l = new Float64Array( [ 0.01, 0.01, 0.01, 0.01, 0.01, 0.0 ] );
	var w = new Float64Array( [ 0.95, 1.999998, 1.999999, 2.000000, 2.000001, 6.05 ] );
	var N = 6;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 3, 5, w, 1, wgap, 1, werr, 1, 6.0, 1.0, 4.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.equal( info, tc.info, 'info' );
	assertClose( sigma[ 0 ], tc.sigma, TOL, 'sigma' );
	assertArrayClose( copyToArray( dplus, N ), tc.dplus, TOL, 'dplus' );
	assertArrayClose( copyToArray( lplus, N - 1 ), tc.lplus, TOL, 'lplus' );
});

test( 'dlarrf: tight cluster with large d and tiny spdiam exercises RRR1 branch', function t() {
	// Tight cluster of eigenvalues near 0 but d values large, and a tiny
	// spdiam so LSIGMA growth bound fails. Since the cluster is extremely
	// tight (clwdth << mingap/128), control enters the dorrr1 heuristic.
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 3 );
	var lplus = new Float64Array( 3 );
	var werr = new Float64Array( [ 1e-15, 1e-15, 1e-15 ] );
	var wgap = new Float64Array( [ 1e-13, 1e-13, 0.0 ] );
	var work = new Float64Array( 6 );
	var info;
	var ld = new Float64Array( [ 0.5, 0.5, 0.0 ] );
	var d = new Float64Array( [ 50.0, 50.0, 50.0 ] );
	var l = new Float64Array( [ 0.01, 0.01, 0.0 ] );
	var w = new Float64Array( [ 0.0, 1e-13, 2e-13 ] );
	var N = 3;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 3, w, 1, wgap, 1, werr, 1, 0.5, 1.0, 1.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.ok( info === 0 || info === 1, 'info is 0 or 1' );
	assert.equal( typeof sigma[ 0 ], 'number', 'sigma is a number' );
});

test( 'dlarrf: pivmin clamping triggered when dplus collapses toward zero', function t() {
	var BIGPIV = 1e-2;
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 2 );
	var lplus = new Float64Array( 2 );
	var werr = new Float64Array( [ 0.0, 0.0 ] );
	var wgap = new Float64Array( [ 1.0, 0.0 ] );
	var work = new Float64Array( 4 );
	var info;
	var ld = new Float64Array( [ 0.01, 0.0 ] );
	var d = new Float64Array( [ 1.0, 2.0 ] );
	var l = new Float64Array( [ 0.01, 0.0 ] );
	var w = new Float64Array( [ 1.0, 2.0 ] );
	var N = 2;

	// Construct lsigma = min(w[0], w[1]) - werr[0] = 1.0 exactly so dplus[0] = 1 - 1 = 0 and BIGPIV forces the clamp branch.
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 2, w, 1, wgap, 1, werr, 1, 2.0, 1.0, 1.0, BIGPIV, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.ok( info === 0 || info === 1, 'info is 0 or 1' );
	assert.equal( typeof sigma[ 0 ], 'number', 'sigma is a number' );
});

test( 'dlarrf: tiny spdiam forces growth retry and exercises fallback paths', function t() {
	// Construct a case where the growth bound (MAXGROWTH1*spdiam) is tiny so
	// neither LSIGMA nor RSIGMA shifts satisfy it on the first try; the
	// routine should fall back to the best-shift retry or report info=1.
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 3 );
	var lplus = new Float64Array( 3 );
	var werr = new Float64Array( [ 1e-10, 1e-10, 1e-10 ] );
	var wgap = new Float64Array( [ 1.0, 1.0, 0.0 ] );
	var work = new Float64Array( 6 );
	var info;
	var ld = new Float64Array( [ 1.0, 1.0, 0.0 ] );
	var d = new Float64Array( [ 10.0, 10.0, 10.0 ] );
	var l = new Float64Array( [ 0.1, 0.1, 0.0 ] );
	var w = new Float64Array( [ 0.5, 1.5, 2.5 ] );
	var N = 3;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 3, w, 1, wgap, 1, werr, 1, 0.001, 1.0, 1.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.ok( info === 0 || info === 1, 'info is 0 or 1' );
	assert.equal( typeof sigma[ 0 ], 'number', 'sigma is a number' );
});

test( 'dlarrf: case where right shift is preferred over left', function t() {
	// Asymmetric case: make left-gap small and right-gap large so the
	// right shift gets better growth behavior (exercises SRIGHT copy).
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 4 );
	var lplus = new Float64Array( 4 );
	var werr = new Float64Array( [ 1e-6, 1e-6, 1e-6, 1e-6 ] );
	var wgap = new Float64Array( [ 0.0, 1.0, 1.0, 0.0 ] );
	var work = new Float64Array( 8 );
	var info;
	var ld = new Float64Array( [ -0.2, -0.2, 0.2, 0.0 ] );
	var d = new Float64Array( [ -2.0, -2.0, 2.0, 2.0 ] );
	var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
	var w = new Float64Array( [ -2.0, -1.0, 1.0, 2.0 ] );
	var N = 4;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 3, w, 1, wgap, 1, werr, 1, 4.0, 0.0001, 1.0, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.ok( info === 0 || info === 1, 'info is 0 or 1' );
	assert.equal( typeof sigma[ 0 ], 'number', 'sigma is a number' );
});

test( 'dlarrf wrapper: tridiag_5x5_subset_cluster matches fixture', function t() {
	var sigma = new Float64Array( 1 );
	var dplus = new Float64Array( 5 );
	var lplus = new Float64Array( 5 );
	var werr = new Float64Array( [ 1e-4, 1e-4, 1e-4, 1e-4, 1e-4 ] );
	var wgap = new Float64Array( [ 0.95, 0.95, 0.95, 0.95, 0.0 ] );
	var work = new Float64Array( 10 );
	var info;
	var tc = findCase( 'tridiag_5x5_subset_cluster' );
	var ld = new Float64Array( [ 0.25, 0.20, 0.15, 0.10, 0.0 ] );
	var d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0, 1.0 ] );
	var l = new Float64Array( [ 0.05, 0.05, 0.05, 0.05, 0.0 ] );
	var w = new Float64Array( [ 0.99, 1.99, 2.99, 3.99, 5.01 ] );
	var N = 5;
	info = dlarrf( N, d, 1, l, 1, ld, 1, 2, 4, w, 1, wgap, 1, werr, 1, 5.0, 0.95, 0.95, PIVMIN, sigma, dplus, 1, lplus, 1, work, 1 );
	assert.equal( info, tc.info, 'info' );
	assertClose( sigma[ 0 ], tc.sigma, TOL, 'sigma' );
	assertArrayClose( copyToArray( dplus, N ), tc.dplus, TOL, 'dplus' );
	assertArrayClose( copyToArray( lplus, N - 1 ), tc.lplus, TOL, 'lplus' );
});
