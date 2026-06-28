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

/* eslint-disable no-restricted-syntax, max-lines, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaic1 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = trim( readFileSync( join( fixtureDir, 'dlaic1.jsonl' ), 'utf8' ) ).split( '\n' );
var fixture = [];
var i;
for ( i = 0; i < lines.length; i++ ) {
	fixture.push( JSON.parse( lines[ i ] ) );
}


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case data
*/
function findCase( name ) {
	var j;
	for ( j = 0; j < fixture.length; j++ ) {
		if ( fixture[ j ].name === name ) {
			return fixture[ j ];
		}
	}
	return null;
}

/**
* Asserts that two values are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ~0, got ' + actual );
		return;
	}
	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaic1, 'function', 'main export is a function' );
});

// --- JOB=1 (largest singular value) ---

test( 'dlaic1: job1_j3_basic', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_j3_basic' );
	var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
	var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dlaic1( 'largest-singular-value', 3, x, 1, 0, 5.0, w, 1, 0, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_j5', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_j5' );
	var x = new Float64Array( [ 0.2, 0.4, 0.5, 0.3, 0.1 ] );
	var w = new Float64Array( [ 1.5, 0.5, 2.0, 1.0, 0.8 ] );
	dlaic1( 'largest-singular-value', 5, x, 1, 0, 3.0, w, 1, 0, 1.5, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_j1', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_j1' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 0.5 ] );
	dlaic1( 'largest-singular-value', 1, x, 1, 0, 2.0, w, 1, 0, 0.3, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_sest0', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_sest0' );
	var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
	var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dlaic1( 'largest-singular-value', 3, x, 1, 0, 0.0, w, 1, 0, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_sest0_zero (all zeros)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_sest0_zero' );
	var x = new Float64Array( [ 0.0 ] );
	var w = new Float64Array( [ 0.0 ] );
	dlaic1( 'largest-singular-value', 1, x, 1, 0, 0.0, w, 1, 0, 0.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_gamma_tiny', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_gamma_tiny' );
	var x = new Float64Array( [ 1.0, 0.0 ] );
	var w = new Float64Array( [ 0.5, 0.3 ] );
	dlaic1( 'largest-singular-value', 2, x, 1, 0, 10.0, w, 1, 0, 1e-20, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_alpha_tiny', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_alpha_tiny' );
	var x = new Float64Array( [ 1e-20, 0.0 ] );
	var w = new Float64Array( [ 1.0, 0.0 ] );
	dlaic1( 'largest-singular-value', 2, x, 1, 0, 10.0, w, 1, 0, 5.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_sest_tiny', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_sest_tiny' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 1e10 ] );
	dlaic1( 'largest-singular-value', 1, x, 1, 0, 1e-20, w, 1, 0, 5.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

// --- JOB=2 (smallest singular value) ---

test( 'dlaic1: job2_j3_basic', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_j3_basic' );
	var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
	var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dlaic1( 'smallest-singular-value', 3, x, 1, 0, 5.0, w, 1, 0, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_j5', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_j5' );
	var x = new Float64Array( [ 0.2, 0.4, 0.5, 0.3, 0.1 ] );
	var w = new Float64Array( [ 1.5, 0.5, 2.0, 1.0, 0.8 ] );
	dlaic1( 'smallest-singular-value', 5, x, 1, 0, 3.0, w, 1, 0, 1.5, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_j1', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_j1' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 0.5 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 2.0, w, 1, 0, 0.3, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_sest0', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_sest0' );
	var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
	var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dlaic1( 'smallest-singular-value', 3, x, 1, 0, 0.0, w, 1, 0, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_sest0_zero (all zeros)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_sest0_zero' );
	var x = new Float64Array( [ 0.0 ] );
	var w = new Float64Array( [ 0.0 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 0.0, w, 1, 0, 0.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_gamma_tiny', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_gamma_tiny' );
	var x = new Float64Array( [ 1.0, 0.0 ] );
	var w = new Float64Array( [ 0.5, 0.3 ] );
	dlaic1( 'smallest-singular-value', 2, x, 1, 0, 10.0, w, 1, 0, 1e-20, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_alpha_tiny', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_alpha_tiny' );
	var x = new Float64Array( [ 1e-20, 0.0 ] );
	var w = new Float64Array( [ 1.0, 0.0 ] );
	dlaic1( 'smallest-singular-value', 2, x, 1, 0, 10.0, w, 1, 0, 5.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_sest_tiny', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_sest_tiny' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 1e10 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 1e-20, w, 1, 0, 5.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

// --- Additional edge case tests for coverage ---

test( 'dlaic1: job1_alpha_tiny_s1gts2 (absgam > absest)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_alpha_tiny_s1gts2' );
	var x = new Float64Array( [ 1e-20 ] );
	var w = new Float64Array( [ 1.0 ] );
	dlaic1( 'largest-singular-value', 1, x, 1, 0, 3.0, w, 1, 0, 10.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_sest_tiny_gam_large', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_sest_tiny_gam_large' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 2.0 ] );
	dlaic1( 'largest-singular-value', 1, x, 1, 0, 1e-20, w, 1, 0, 100.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job1_normal_b_neg', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_normal_b_neg' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 3.0 ] );
	dlaic1( 'largest-singular-value', 1, x, 1, 0, 1.0, w, 1, 0, 3.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_alpha_tiny_s1gts2 (absgam > absest)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_alpha_tiny_s1gts2' );
	var x = new Float64Array( [ 1e-20 ] );
	var w = new Float64Array( [ 1.0 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 3.0, w, 1, 0, 10.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_sest_tiny_gam_large', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_sest_tiny_gam_large' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 2.0 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 1e-20, w, 1, 0, 100.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_normal_test_neg', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_normal_test_neg' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 0.1 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 1.0, w, 1, 0, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: job2_normal_test_neg_b_neg', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_normal_test_neg_b_neg' );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 0.1 ] );
	dlaic1( 'smallest-singular-value', 1, x, 1, 0, 1.0, w, 1, 0, 0.8, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

// --- Stride and offset tests ---

test( 'dlaic1: supports non-unit stride for x and w', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job1_j3_basic' );
	var x = new Float64Array( [ 0.6, 999.0, 0.8, 999.0, 0.0 ] );
	var w = new Float64Array( [ 1.0, 999.0, 2.0, 999.0, 3.0 ] );
	dlaic1( 'largest-singular-value', 3, x, 2, 0, 5.0, w, 2, 0, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: supports offset for x and w', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'job2_j3_basic' );
	var x = new Float64Array( [ 999.0, 999.0, 0.6, 0.8, 0.0 ] );
	var w = new Float64Array( [ 999.0, 1.0, 2.0, 3.0 ] );
	dlaic1( 'smallest-singular-value', 3, x, 1, 2, 5.0, w, 1, 1, 2.0, out );
	assertClose( out[ 0 ], tc.sestpr, 1e-14, 'sestpr' );
	assertClose( out[ 1 ], tc.s, 1e-14, 's' );
	assertClose( out[ 2 ], tc.c, 1e-14, 'c' );
});

test( 'dlaic1: returns the output array', function t() {
	var result;
	var out = new Float64Array( 3 );
	var x = new Float64Array( [ 1.0 ] );
	var w = new Float64Array( [ 0.5 ] );
	result = dlaic1( 'largest-singular-value', 1, x, 1, 0, 2.0, w, 1, 0, 0.3, out );
	assert.equal( result, out );
});
