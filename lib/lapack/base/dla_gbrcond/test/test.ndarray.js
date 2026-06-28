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

/* eslint-disable camelcase, no-restricted-syntax, max-len, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import dgbtrf from '../../dgbtrf/lib/base.js';
import dla_gbrcond from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( join( fixtureDir, 'dla_gbrcond.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( JSON.parse );


// FUNCTIONS //

/**
* Finds a fixture test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case object
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
* Asserts that two numbers are close within relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var denom;
	var err;

	denom = abs( expected );
	if ( denom < 1.0 ) {
		denom = 1.0;
	}
	err = abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Sets up the 3x3 banded test matrix (KL=1, KU=1) and factors it.
*
* @private
* @returns {Object} test setup
*/
function setup3x3() {
	var LDAFB;
	var LDAB;
	var IPIV;
	var AFB;
	var out;
	var AB;

	LDAB = 3;
	LDAFB = 4;

	AB = new Float64Array([
		0.0,
		2.0,
		1.0,
		3.0,
		5.0,
		4.0,
		6.0,
		8.0,
		0.0
	]);

	AFB = new Float64Array([
		0.0,
		0.0,
		2.0,
		1.0,
		0.0,
		3.0,
		5.0,
		4.0,
		0.0,
		6.0,
		8.0,
		0.0
	]);

	IPIV = new Int32Array( 3 );
	dgbtrf( 3, 3, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

	out = {};
	out.N = 3;
	out.KL = 1;
	out.KU = 1;
	out.AB = AB;
	out.sAB1 = 1;
	out.sAB2 = LDAB;
	out.AFB = AFB;
	out.sAFB1 = 1;
	out.sAFB2 = LDAFB;
	out.IPIV = IPIV;
	return out;
}

/**
* Calls dla_gbrcond with setup and given parameters.
*
* @private
* @param {string} trans - transpose flag
* @param {Object} s - setup object
* @param {integer} cmode - scaling mode
* @param {Float64Array} c - scaling vector
* @returns {number} condition number estimate
*/
function callFn( trans, s, cmode, c ) {
	var IWORK = new Int32Array( s.N );
	var WORK = new Float64Array( 5 * s.N );

	return dla_gbrcond( trans, s.N, s.KL, s.KU, s.AB, s.sAB1, s.sAB2, 0, s.AFB, s.sAFB1, s.sAFB2, 0, s.IPIV, 1, 0, cmode, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.equal( typeof dla_gbrcond, 'function' );
});

test( 'returns 1.0 when N=0', function t() {
	var result;
	var IWORK;
	var WORK;
	var IPIV;
	var AFB;
	var AB;
	var c;

	IWORK = new Int32Array( 1 );
	WORK = new Float64Array( 10 );
	IPIV = new Int32Array( 1 );
	AFB = new Float64Array( 1 );
	AB = new Float64Array( 1 );
	c = new Float64Array( 1 );
	result = dla_gbrcond( 'no-transpose', 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( result, 1.0 );
});

test( 'trans=no-transpose, cmode=1 (well-conditioned)', function t() {
	var result;
	var tc;
	var s;
	var c;

	tc = findCase( 'trans_N_cmode1_wellcond' );
	s = setup3x3();
	c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = callFn( 'no-transpose', s, 1, c );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'trans=transpose, cmode=1 (well-conditioned)', function t() {
	var result;
	var tc;
	var s;
	var c;

	tc = findCase( 'trans_T_cmode1_wellcond' );
	s = setup3x3();
	c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = callFn( 'transpose', s, 1, c );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'trans=no-transpose, cmode=0', function t() {
	var result;
	var tc;
	var s;
	var c;

	tc = findCase( 'trans_N_cmode0' );
	s = setup3x3();
	c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = callFn( 'no-transpose', s, 0, c );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'trans=no-transpose, cmode=-1', function t() {
	var result;
	var tc;
	var s;
	var c;

	tc = findCase( 'trans_N_cmode_neg1' );
	s = setup3x3();
	c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = callFn( 'no-transpose', s, -1, c );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'trans=transpose, cmode=0', function t() {
	var result;
	var tc;
	var s;
	var c;

	tc = findCase( 'trans_T_cmode0' );
	s = setup3x3();
	c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = callFn( 'transpose', s, 0, c );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'trans=transpose, cmode=-1', function t() {
	var result;
	var tc;
	var s;
	var c;

	tc = findCase( 'trans_T_cmode_neg1' );
	s = setup3x3();
	c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	result = callFn( 'transpose', s, -1, c );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'N=1 edge case', function t() {
	var result;
	var IWORK;
	var WORK;
	var IPIV;
	var AFB;
	var AB;
	var tc;
	var c;

	tc = findCase( 'n1_edge' );
	AB = new Float64Array( [ 5.0 ] );
	AFB = new Float64Array( [ 5.0 ] );
	IPIV = new Int32Array( 1 );
	c = new Float64Array( [ 2.0 ] );
	WORK = new Float64Array( 5 );
	IWORK = new Int32Array( 1 );
	dgbtrf( 1, 1, 0, 0, AFB, 1, 1, 0, IPIV, 1, 0 );
	result = dla_gbrcond( 'no-transpose', 1, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	assertClose( result, tc.result, 1e-10, 'result' );
});
