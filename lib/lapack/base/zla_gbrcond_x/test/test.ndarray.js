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

/* eslint-disable camelcase, no-restricted-syntax, max-len, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import zla_gbrcond_x from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( join( fixtureDir, 'zla_gbrcond_x.jsonl' ), 'utf8' ).trim().split( '\n' );
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
* Sets up the 3x3 complex banded test matrix (`KL=1, KU=1`) and factors it.
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

	// Column-major band storage (re, im pairs).
	AB = new Complex128Array([
		// Column 0: [0, 2+1i, 1+0i]
		0.0,
		0.0,
		2.0,
		1.0,
		1.0,
		0.0,

		// Column 1: [3-1i, 5+2i, 4+1i]
		3.0,
		-1.0,
		5.0,
		2.0,
		4.0,
		1.0,

		// Column 2: [6-1i, 8+0i, 0]
		6.0,
		-1.0,
		8.0,
		0.0,
		0.0,
		0.0
	]);

	AFB = new Complex128Array([
		// Column 0: pad + [0, 2+1i, 1+0i]
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		1.0,
		1.0,
		0.0,

		// Column 1: pad + [3-1i, 5+2i, 4+1i]
		0.0,
		0.0,
		3.0,
		-1.0,
		5.0,
		2.0,
		4.0,
		1.0,

		// Column 2: pad + [6-1i, 8+0i, 0]
		0.0,
		0.0,
		6.0,
		-1.0,
		8.0,
		0.0,
		0.0,
		0.0
	]);

	IPIV = new Int32Array( 3 );
	zgbtrf( 3, 3, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

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
* Calls zla_gbrcond_x with a given setup and parameters.
*
* @private
* @param {string} trans - transpose flag
* @param {Object} s - setup object
* @param {Complex128Array} x - scaling vector
* @returns {number} condition number estimate
*/
function callFn( trans, s, x ) {
	var RWORK = new Float64Array( s.N );
	var WORK = new Complex128Array( 2 * s.N );

	return zla_gbrcond_x( trans, s.N, s.KL, s.KU, s.AB, s.sAB1, s.sAB2, 0, s.AFB, s.sAFB1, s.sAFB2, 0, s.IPIV, 1, 0, x, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.equal( typeof zla_gbrcond_x, 'function' );
});

test( 'returns 1.0 when N=0', function t() {
	var result;
	var RWORK;
	var WORK;
	var IPIV;
	var AFB;
	var AB;
	var x;

	RWORK = new Float64Array( 1 );
	WORK = new Complex128Array( 2 );
	IPIV = new Int32Array( 1 );
	AFB = new Complex128Array( 1 );
	AB = new Complex128Array( 1 );
	x = new Complex128Array( 1 );
	result = zla_gbrcond_x( 'no-transpose', 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, x, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 1.0 );
});

test( 'returns 0.0 when ANORM is zero', function t() {
	var result;
	var RWORK;
	var IPIV;
	var WORK;
	var AFB;
	var AB;
	var x;

	// All-zero 3x3 banded matrix → every row sum is zero → early return.
	AB = new Complex128Array( 3 * 3 );
	AFB = new Complex128Array( 4 * 3 );
	IPIV = new Int32Array( 3 );
	x = new Complex128Array([ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ]);
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );

	result = zla_gbrcond_x( 'no-transpose', 3, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, x, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 0.0 );
});

test( 'zla_gbrcond_x: trans_N_wellcond', function t() {
	var result;
	var tc;
	var s;
	var x;

	tc = findCase( 'trans_N_wellcond' );
	s = setup3x3();
	x = new Complex128Array([ 1.0, 0.5, 2.0, -0.5, 3.0, 1.0 ]);
	result = callFn( 'no-transpose', s, x );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'zla_gbrcond_x: trans_C_wellcond', function t() {
	var result;
	var tc;
	var s;
	var x;

	tc = findCase( 'trans_C_wellcond' );
	s = setup3x3();
	x = new Complex128Array([ 1.0, 0.5, 2.0, -0.5, 3.0, 1.0 ]);
	result = callFn( 'conjugate-transpose', s, x );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'zla_gbrcond_x: trans_N_altx', function t() {
	var result;
	var tc;
	var s;
	var x;

	tc = findCase( 'trans_N_altx' );
	s = setup3x3();
	x = new Complex128Array([ 2.0, 0.0, 1.0, 1.0, 0.5, -0.5 ]);
	result = callFn( 'no-transpose', s, x );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'zla_gbrcond_x: trans_C_altx', function t() {
	var result;
	var tc;
	var s;
	var x;

	tc = findCase( 'trans_C_altx' );
	s = setup3x3();
	x = new Complex128Array([ 2.0, 0.0, 1.0, 1.0, 0.5, -0.5 ]);
	result = callFn( 'conjugate-transpose', s, x );
	assertClose( result, tc.result, 1e-10, 'result' );
});

test( 'zla_gbrcond_x: n1_edge', function t() {
	var result;
	var RWORK;
	var IPIV;
	var WORK;
	var AFB;
	var AB;
	var tc;
	var x;

	tc = findCase( 'n1_edge' );
	AB = new Complex128Array([ 5.0, 2.0 ]);
	AFB = new Complex128Array([ 5.0, 2.0 ]);
	IPIV = new Int32Array( 1 );
	x = new Complex128Array([ 2.0, 1.0 ]);
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	zgbtrf( 1, 1, 0, 0, AFB, 1, 1, 0, IPIV, 1, 0 );
	result = zla_gbrcond_x( 'no-transpose', 1, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, x, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, 1e-10, 'result' );
});
