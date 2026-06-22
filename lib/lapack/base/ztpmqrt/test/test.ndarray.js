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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpmqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'ztpmqrt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line into a fixture case.
*
* @private
* @param {string} line - JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
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
* Asserts two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values (Float64Array view)
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Wraps an interleaved real-valued array into a Complex128Array view of the same buffer.
*
* @private
* @param {Array} interleaved - real and imaginary parts laid out as [re0, im0, re1, im1, ...]
* @returns {Complex128Array} Complex128Array backed by `interleaved`
*/
function complexFromInterleaved( interleaved ) {
	return new Complex128Array( ( new Float64Array( interleaved ) ).buffer );
}

/**
* Loads V/T fixtures from a `factors_*` case as Complex128Arrays.
*
* @private
* @param {string} name - case name
* @returns {Object} object with `V` and `T` Complex128Arrays
*/
function loadVT( name ) {
	var tc = findCase( name );
	return {
		'V': complexFromInterleaved( tc.V ),
		'T': complexFromInterleaved( tc.T )
	};
}


// TESTS //

test( 'ztpmqrt: SIDE=left, TRANS=no-transpose (Case A)', function t() {
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 1, 0.1, 2, 0.2, 3, 0.3, 4, 0.4, 5, 0.5, 6, 0.6, 7, 0.7, 8, 0.8, 9, 0.9 ] );
	B = complexFromInterleaved( [ -0.5, 0.4, 0, 0.6, 0.5, 0.8, 1, 1, -1.5, 0.6, -1, 0.8, -0.5, 1, 0, 1.2, -2.5, 0.8, -2, 1, -1.5, 1.2, -1, 1.4 ] );
	vt = loadVT( 'factors_left_A' );
	info = ztpmqrt( 'left', 'no-transpose', 4, 3, 3, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_A' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=conjugate-transpose (Case A)', function t() {
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 1, 0.1, 2, 0.2, 3, 0.3, 4, 0.4, 5, 0.5, 6, 0.6, 7, 0.7, 8, 0.8, 9, 0.9 ] );
	B = complexFromInterleaved( [ -0.5, 0.4, 0, 0.6, 0.5, 0.8, 1, 1, -1.5, 0.6, -1, 0.8, -0.5, 1, 0, 1.2, -2.5, 0.8, -2, 1, -1.5, 1.2, -1, 1.4 ] );
	vt = loadVT( 'factors_left_A' );
	info = ztpmqrt( 'left', 'conjugate-transpose', 4, 3, 3, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_A' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=right, TRANS=no-transpose (Case B)', function t() {
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 2.1, 0.4, 3.1, 0.6, 4.1, 0.8, 2.2, 0.6, 3.2, 0.8, 4.2, 1, 2.3, 0.8, 3.3, 1, 4.3, 1.2, 2.4, 1, 3.4, 1.2, 4.4, 1.4 ] );
	B = complexFromInterleaved( [ 0.5, 0.3, 1, 0.6, 1.5, 0.9, 1.5, 0.6, 2, 1.2, 2.5, 1.8, 2.5, 0.9, 3, 1.8, 3.5, 2.7, 3.5, 1.2, 4, 2.4, 4.5, 3.6 ] );
	vt = loadVT( 'factors_right_B' );
	info = ztpmqrt( 'right', 'no-transpose', 3, 4, 4, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_notrans_B' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=right, TRANS=conjugate-transpose (Case B)', function t() {
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 2.1, 0.4, 3.1, 0.6, 4.1, 0.8, 2.2, 0.6, 3.2, 0.8, 4.2, 1, 2.3, 0.8, 3.3, 1, 4.3, 1.2, 2.4, 1, 3.4, 1.2, 4.4, 1.4 ] );
	B = complexFromInterleaved( [ 0.5, 0.3, 1, 0.6, 1.5, 0.9, 1.5, 0.6, 2, 1.2, 2.5, 1.8, 2.5, 0.9, 3, 1.8, 3.5, 2.7, 3.5, 1.2, 4, 2.4, 4.5, 3.6 ] );
	vt = loadVT( 'factors_right_B' );
	info = ztpmqrt( 'right', 'conjugate-transpose', 3, 4, 4, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_ctrans_B' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=no-transpose blocked (Case C)', function t() {
	var inputs = buildLeftC();
	var WORK = new Complex128Array( 256 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_C' );
	info = ztpmqrt( 'left', 'no-transpose', 8, 6, 6, 3, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, inputs.A, 1, 6, 0, inputs.B, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_C' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-11, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-11, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=conjugate-transpose blocked (Case C)', function t() {
	var inputs = buildLeftC();
	var WORK = new Complex128Array( 256 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_C' );
	info = ztpmqrt( 'left', 'conjugate-transpose', 8, 6, 6, 3, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, inputs.A, 1, 6, 0, inputs.B, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_C' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-11, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-11, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=no-transpose, L=0 (Case D)', function t() {
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 1.5, 0.2, 2.5, 0.3, 3.5, 0.4, 2, 0.3, 3, 0.4, 4, 0.5, 2.5, 0.4, 3.5, 0.5, 4.5, 0.6, 3, 0.5, 4, 0.6, 5, 0.7 ] );
	B = complexFromInterleaved( [ 0, 0.2, -1, 0.4, -2, 0.6, -3, 0.8, -4, 1, 1, 0.4, 0, 0.8, -1, 1.2, -2, 1.6, -3, 2, 2, 0.6, 1, 1.2, 0, 1.8, -1, 2.4, -2, 3, 3, 0.8, 2, 1.6, 1, 2.4, 0, 3.2, -1, 4 ] );
	vt = loadVT( 'factors_left_D' );
	info = ztpmqrt( 'left', 'no-transpose', 5, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=conjugate-transpose, L=0 (Case D)', function t() {
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 1.5, 0.2, 2.5, 0.3, 3.5, 0.4, 2, 0.3, 3, 0.4, 4, 0.5, 2.5, 0.4, 3.5, 0.5, 4.5, 0.6, 3, 0.5, 4, 0.6, 5, 0.7 ] );
	B = complexFromInterleaved( [ 0, 0.2, -1, 0.4, -2, 0.6, -3, 0.8, -4, 1, 1, 0.4, 0, 0.8, -1, 1.2, -2, 1.6, -3, 2, 2, 0.6, 1, 1.2, 0, 1.8, -1, 2.4, -2, 3, 3, 0.8, 2, 1.6, 1, 2.4, 0, 3.2, -1, 4 ] );
	vt = loadVT( 'factors_left_D' );
	info = ztpmqrt( 'left', 'conjugate-transpose', 5, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=right, TRANS=no-transpose, L=0 (Case D)', function t() {
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 1.5, 0.2, 2.5, 0.3, 3.5, 0.4, 2, 0.3, 3, 0.4, 4, 0.5, 2.5, 0.4, 3.5, 0.5, 4.5, 0.6 ] );
	B = complexFromInterleaved( [ 0, 0.2, -1, 0.4, -2, 0.6, 1, 0.4, 0, 0.8, -1, 1.2, 2, 0.6, 1, 1.2, 0, 1.8, 3, 0.8, 2, 1.6, 1, 2.4 ] );
	vt = loadVT( 'factors_left_D' );
	info = ztpmqrt( 'right', 'no-transpose', 3, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_notrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=right, TRANS=conjugate-transpose, L=0 (Case D)', function t() {
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 1.5, 0.2, 2.5, 0.3, 3.5, 0.4, 2, 0.3, 3, 0.4, 4, 0.5, 2.5, 0.4, 3.5, 0.5, 4.5, 0.6 ] );
	B = complexFromInterleaved( [ 0, 0.2, -1, 0.4, -2, 0.6, 1, 0.4, 0, 0.8, -1, 1.2, 2, 0.6, 1, 1.2, 0, 1.8, 3, 0.8, 2, 1.6, 1, 2.4 ] );
	vt = loadVT( 'factors_left_D' );
	info = ztpmqrt( 'right', 'conjugate-transpose', 3, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_ctrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=no-transpose, L=K (Case E, fully triangular V)', function t() {
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 2.3, 0.2, 3.3, 0.3, 4.3, 0.4, 2.6, 0.3, 3.6, 0.4, 4.6, 0.5 ] );
	B = complexFromInterleaved( [ -0.5, 0.2, 0, 0.4, 0.5, 0.6, 0.5, 0.4, 1, 0.8, 1.5, 1.2 ] );
	vt = loadVT( 'factors_left_E' );
	info = ztpmqrt( 'left', 'no-transpose', 3, 2, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_E' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=conjugate-transpose, L=K (Case E)', function t() {
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	var A;
	var B;
	A = complexFromInterleaved( [ 2.3, 0.2, 3.3, 0.3, 4.3, 0.4, 2.6, 0.3, 3.6, 0.4, 4.6, 0.5 ] );
	B = complexFromInterleaved( [ -0.5, 0.2, 0, 0.4, 0.5, 0.6, 0.5, 0.4, 1, 0.8, 1.5, 1.2 ] );
	vt = loadVT( 'factors_left_E' );
	info = ztpmqrt( 'left', 'conjugate-transpose', 3, 2, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, A, 1, 3, 0, B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_E' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=no-transpose, NB=K (Case F: single inner iteration)', function t() {
	var inputs = buildLeftF();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_single' );
	info = ztpmqrt( 'left', 'no-transpose', 5, 4, 4, 2, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, inputs.A, 1, 4, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_F' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: SIDE=left, TRANS=conjugate-transpose, NB=K (Case F)', function t() {
	var inputs = buildLeftF();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_single' );
	info = ztpmqrt( 'left', 'conjugate-transpose', 5, 4, 4, 2, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, inputs.A, 1, 4, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_F' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmqrt: quick return when M=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Complex128Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	Acopy = new Float64Array( reinterpret( A, 0 ) );
	Bcopy = new Float64Array( reinterpret( B, 0 ) );
	info = ztpmqrt( 'left', 'no-transpose', 0, 3, 3, 2, 2, V, 1, 1, 0, T, 1, 2, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), Acopy, 0, 'A unchanged' );
	assertArrayClose( reinterpret( B, 0 ), Bcopy, 0, 'B unchanged' );
});

test( 'ztpmqrt: quick return when N=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Complex128Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	Acopy = new Float64Array( reinterpret( A, 0 ) );
	Bcopy = new Float64Array( reinterpret( B, 0 ) );
	info = ztpmqrt( 'left', 'no-transpose', 4, 0, 3, 2, 2, V, 1, 1, 0, T, 1, 2, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), Acopy, 0, 'A unchanged' );
	assertArrayClose( reinterpret( B, 0 ), Bcopy, 0, 'B unchanged' );
});

test( 'ztpmqrt: quick return when K=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Complex128Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	Acopy = new Float64Array( reinterpret( A, 0 ) );
	Bcopy = new Float64Array( reinterpret( B, 0 ) );
	info = ztpmqrt( 'left', 'no-transpose', 4, 3, 0, 0, 1, V, 1, 1, 0, T, 1, 1, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), Acopy, 0, 'A unchanged' );
	assertArrayClose( reinterpret( B, 0 ), Bcopy, 0, 'B unchanged' );
});


// FUNCTIONS //

/**
* Builds Case C inputs (M=8, N=6, K=6, L=3, NB=3; SIDE='left', blocked) procedurally because the matrices are too large to inline.
*
* @private
* @returns {Object} object with `A` (KxN=6x6) and `B` (MxN=8x6) Complex128Arrays
*/
function buildLeftC() {
	var Aarr = new Float64Array( 2 * 6 * 6 );
	var Barr = new Float64Array( 2 * 8 * 6 );
	var i;
	var j;
	var k;
	for ( j = 0; j < 6; j++ ) {
		for ( i = 0; i < 6; i++ ) {
			k = ( ( j * 6 ) + i ) * 2;
			Aarr[ k ] = Math.sin( ( ( i + 1 ) * 2 ) + ( j + 1 ) );
			Aarr[ k + 1 ] = Math.cos( ( i + 1 ) + ( ( j + 1 ) * 3 ) ) * 0.3;
		}
	}
	for ( j = 0; j < 6; j++ ) {
		for ( i = 0; i < 8; i++ ) {
			k = ( ( j * 8 ) + i ) * 2;
			Barr[ k ] = Math.cos( ( i + 1 ) + ( ( j + 1 ) * 2 ) ) + 0.5;
			Barr[ k + 1 ] = Math.sin( ( ( i + 1 ) * 3 ) + ( j + 1 ) ) * 0.4;
		}
	}
	return {
		'A': new Complex128Array( Aarr.buffer ),
		'B': new Complex128Array( Barr.buffer )
	};
}

/**
* Builds Case F inputs (M=5, N=4, K=4, L=2, NB=4; SIDE='left', single block) procedurally to keep transcendental fills out of the test bodies.
*
* @private
* @returns {Object} object with `A` (KxN=4x4) and `B` (MxN=5x4) Complex128Arrays
*/
function buildLeftF() {
	var Aarr = new Float64Array( 2 * 4 * 4 );
	var Barr = new Float64Array( 2 * 5 * 4 );
	var i;
	var j;
	var k;
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			k = ( ( j * 4 ) + i ) * 2;
			Aarr[ k ] = Math.sin( ( i + 1 ) + ( ( j + 1 ) * 2 ) );
			Aarr[ k + 1 ] = Math.cos( ( ( i + 1 ) * 3 ) + ( j + 1 ) ) * 0.2;
		}
	}
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 5; i++ ) {
			k = ( ( j * 5 ) + i ) * 2;
			Barr[ k ] = Math.cos( ( ( i + 1 ) * 2 ) + ( j + 1 ) ) + 0.3;
			Barr[ k + 1 ] = Math.sin( ( i + 1 ) + ( ( j + 1 ) * 4 ) ) * 0.3;
		}
	}
	return {
		'A': new Complex128Array( Aarr.buffer ),
		'B': new Complex128Array( Barr.buffer )
	};
}
