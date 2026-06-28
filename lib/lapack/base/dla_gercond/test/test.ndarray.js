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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from '../../dgetrf/lib/base.js';
import dla_gercond from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_gercond.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
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
* Asserts that two values are close within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;

	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Sets up the 3x3 test matrix, factorizes it, and returns the components.
*
* @private
* @returns {Object} test matrix components
*/
function setup3x3() {
	var IPIV;
	var AF;
	var A;

	// Column-major 3x3: A = [[2,1,0],[1,3,1],[0,1,4]]
	A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
	AF = new Float64Array( A );
	IPIV = new Int32Array( 3 );
	dgetrf( 3, 3, AF, 1, 3, 0, IPIV, 1, 0 );
	return {
		'A': A,
		'AF': AF,
		'IPIV': IPIV
	};
}

/**
* Runs a test case with the 3x3 matrix.
*
* @private
* @param {string} trans - transpose flag
* @param {integer} cmode - scaling mode
* @param {Float64Array} c - scaling vector
* @param {string} caseName - fixture test case name
*/
function run3x3( trans, cmode, c, caseName ) {
	var result;
	var IWORK;
	var WORK;
	var obj;
	var tc;

	tc = findCase( caseName );
	obj = setup3x3();
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	result = dla_gercond( trans, 3, obj.A, 1, 3, 0, obj.AF, 1, 3, 0, obj.IPIV, 1, 0, cmode, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-10, caseName );
}


// TESTS //

test( 'dla_gercond: trans=no-transpose, cmode=1, uniform C', function t() {
	var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	run3x3( 'no-transpose', 1, c, 'trans_N_cmode1_uniform' );
});

test( 'dla_gercond: trans=transpose, cmode=1, uniform C', function t() {
	var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	run3x3( 'transpose', 1, c, 'trans_T_cmode1_uniform' );
});

test( 'dla_gercond: trans=no-transpose, cmode=1, non-uniform C', function t() {
	var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	run3x3( 'no-transpose', 1, c, 'trans_N_cmode1_nonuniform' );
});

test( 'dla_gercond: trans=transpose, cmode=1, non-uniform C', function t() {
	var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	run3x3( 'transpose', 1, c, 'trans_T_cmode1_nonuniform' );
});

test( 'dla_gercond: trans=no-transpose, cmode=0', function t() {
	var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	run3x3( 'no-transpose', 0, c, 'trans_N_cmode0' );
});

test( 'dla_gercond: trans=transpose, cmode=0', function t() {
	var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	run3x3( 'transpose', 0, c, 'trans_T_cmode0' );
});

test( 'dla_gercond: trans=no-transpose, cmode=-1, non-uniform C', function t() {
	var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	run3x3( 'no-transpose', -1, c, 'trans_N_cmode_neg1' );
});

test( 'dla_gercond: trans=transpose, cmode=-1, non-uniform C', function t() {
	var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
	run3x3( 'transpose', -1, c, 'trans_T_cmode_neg1' );
});

test( 'dla_gercond: N=1 edge case', function t() {
	var result;
	var IWORK;
	var IPIV;
	var WORK;
	var AF;
	var tc;
	var A;
	var c;

	tc = findCase( 'n1_trans_N' );
	A = new Float64Array( [ 5.0 ] );
	AF = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	c = new Float64Array( [ 2.0 ] );
	WORK = new Float64Array( 3 );
	IWORK = new Int32Array( 1 );
	result = dla_gercond( 'no-transpose', 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-10, 'n1_trans_N' );
});

test( 'dla_gercond: N=0 returns 1.0', function t() {
	var result;
	var IWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var c;

	A = new Float64Array( 0 );
	AF = new Float64Array( 0 );
	IPIV = new Int32Array( 0 );
	c = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	IWORK = new Int32Array( 0 );
	result = dla_gercond( 'no-transpose', 0, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result, 1.0, 'N=0 returns 1.0' );
});
