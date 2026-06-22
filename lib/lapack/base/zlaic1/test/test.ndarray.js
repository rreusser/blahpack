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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaic1 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlaic1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two scalars are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;

	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are approximately equal.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a Float64Array to a regular array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;

	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Runs a single zlaic1 test case.
*
* @private
* @param {string} caseName - fixture name
* @param {string} job - job string
* @param {number} j - vector length
* @param {Array} xVals - interleaved re/im for x
* @param {Array} wVals - interleaved re/im for w
* @param {number} sest - singular value estimate
* @param {number} gammaR - real part of gamma
* @param {number} gammaI - imaginary part of gamma
*/
function runCase( caseName, job, j, xVals, wVals, sest, gammaR, gammaI ) { // eslint-disable-line max-params
	var sestpr;
	var gamma;
	var tc;
	var sv;
	var cv;
	var x;
	var w;

	tc = findCase( caseName );
	x = new Complex128Array( xVals );
	w = new Complex128Array( wVals );
	gamma = new Complex128( gammaR, gammaI );
	sestpr = new Float64Array( 1 );
	sv = new Float64Array( 2 );
	cv = new Float64Array( 2 );

	zlaic1( job, j, x, 1, 0, sest, w, 1, 0, gamma, sestpr, sv, cv );

	assertClose( sestpr[ 0 ], tc.sestpr, 1e-14, caseName + ' sestpr' );
	assertArrayClose( toArray( sv ), tc.s, 1e-14, caseName + ' s' );
	assertArrayClose( toArray( cv ), tc.c, 1e-14, caseName + ' c' );
}


// TESTS //

test( 'zlaic1: job1_n3_normal', function t() {
	runCase( 'job1_n3_normal', 'largest-singular-value', 3, [ 0.6, 0.1, 0.5, -0.2, 0.4, 0.3 ], [ 0.3, 0.4, 0.7, -0.1, 0.2, 0.5 ], 2.5, 1.0, 0.5 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_n3_normal', function t() {
	runCase( 'job2_n3_normal', 'smallest-singular-value', 3, [ 0.6, 0.1, 0.5, -0.2, 0.4, 0.3 ], [ 0.3, 0.4, 0.7, -0.1, 0.2, 0.5 ], 2.5, 1.0, 0.5 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_sest0', function t() {
	runCase( 'job1_sest0', 'largest-singular-value', 2, [ 0.7, 0.0, 0.0, 0.7 ], [ 1.0, 0.0, 0.0, 1.0 ], 0.0, 0.5, 0.3 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_sest0', function t() {
	runCase( 'job2_sest0', 'smallest-singular-value', 2, [ 0.7, 0.0, 0.0, 0.7 ], [ 1.0, 0.0, 0.0, 1.0 ], 0.0, 0.5, 0.3 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_n1', function t() {
	runCase( 'job1_n1', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 0.5, 0.5 ], 3.0, 2.0, -1.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_n1', function t() {
	runCase( 'job2_n1', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 0.5, 0.5 ], 3.0, 2.0, -1.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_sest0_zero', function t() {
	runCase( 'job1_sest0_zero', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 0.0, 0.0 ], 0.0, 0.0, 0.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_sest0_zero', function t() {
	runCase( 'job2_sest0_zero', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 0.0, 0.0 ], 0.0, 0.0, 0.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_small_gamma', function t() {
	runCase( 'job1_small_gamma', 'largest-singular-value', 2, [ 0.6, 0.1, 0.5, -0.2 ], [ 0.3, 0.4, 0.7, -0.1 ], 1.0e10, 1.0e-20, 0.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_small_gamma', function t() {
	runCase( 'job2_small_gamma', 'smallest-singular-value', 2, [ 0.6, 0.1, 0.5, -0.2 ], [ 0.3, 0.4, 0.7, -0.1 ], 1.0e10, 1.0e-20, 0.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_small_alpha', function t() {
	runCase( 'job1_small_alpha', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0e-20, 0.0 ], 1.0e10, 5.0, 3.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_small_alpha', function t() {
	runCase( 'job2_small_alpha', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0e-20, 0.0 ], 1.0e10, 5.0, 3.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_tiny_sest', function t() {
	runCase( 'job1_tiny_sest', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 3.0, 4.0 ], 1.0e-20, 2.0, 1.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_tiny_sest', function t() {
	runCase( 'job2_tiny_sest', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 3.0, 4.0 ], 1.0e-20, 2.0, 1.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_small_alpha_s1_gt_s2', function t() {
	runCase( 'job1_small_alpha_s1_gt_s2', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0e-20, 0.0 ], 1.0, 5.0, 3.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_tiny_sest_s1_gt_s2', function t() {
	runCase( 'job1_tiny_sest_s1_gt_s2', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0, 0.0 ], 1.0e-20, 5.0, 3.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_small_alpha_s1_gt_s2', function t() {
	runCase( 'job2_small_alpha_s1_gt_s2', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0e-20, 0.0 ], 1.0, 5.0, 3.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_tiny_sest_s1_gt_s2', function t() {
	runCase( 'job2_tiny_sest_s1_gt_s2', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0, 0.0 ], 1.0e-20, 5.0, 3.0 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_normal_test_neg', function t() {
	runCase( 'job2_normal_test_neg', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 0.3, 0.1 ], 1.0, 2.0, 1.5 ); // eslint-disable-line max-len
});

test( 'zlaic1: job1_normal_b_neg', function t() {
	runCase( 'job1_normal_b_neg', 'largest-singular-value', 1, [ 1.0, 0.0 ], [ 2.0, 1.0 ], 1.0, 2.0, 1.5 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_normal_test_pos', function t() {
	runCase( 'job2_normal_test_pos', 'smallest-singular-value', 2, [ 0.8, 0.1, 0.3, -0.1 ], [ 0.5, 0.2, 0.4, -0.3 ], 5.0, 1.0, 0.5 ); // eslint-disable-line max-len
});

test( 'zlaic1: job2_normal_test_neg_b_neg', function t() {
	runCase( 'job2_normal_test_neg_b_neg', 'smallest-singular-value', 1, [ 1.0, 0.0 ], [ 1.0, 0.0 ], 10.0, 6.0, 5.291502622 ); // eslint-disable-line max-len
});
