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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_geamv from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_geamv.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );

/**
* Parses a JSON line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Locates a named fixture case.
*
* @private
* @param {string} name - case name
* @returns {Object} case
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
* Asserts that two scalars are close.
*
* @private
* @param {number} actual - computed value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {Float64Array} actual - computed values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length >= expected.length, true, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zla_geamv: notrans_basic (3x3, alpha=1.5, beta=0.5)', function t() {
	var tc = findCase( 'notrans_basic' );
	var A = new Complex128Array( tc.A );
	var x = new Complex128Array( tc.x );
	var y = new Float64Array([
		1.0,
		-2.0,
		3.0
	]);
	zla_geamv( 'no-transpose', 3, 3, 1.5, A, 1, 3, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: trans_basic (3x3, alpha=1, beta=1)', function t() {
	var tc = findCase( 'trans_basic' );
	var A = new Complex128Array( tc.A );
	var x = new Complex128Array( tc.x );
	var y = new Float64Array([
		1.0,
		-2.0,
		3.0
	]);
	zla_geamv( 'transpose', 3, 3, 1.0, A, 1, 3, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: conjtrans_basic (3x3, alpha=2, beta=0)', function t() {
	var tc = findCase( 'conjtrans_basic' );
	var A = new Complex128Array( tc.A );
	var x = new Complex128Array( tc.x );
	var y = new Float64Array([
		0.0,
		0.0,
		0.0
	]);
	zla_geamv( 'conjugate-transpose', 3, 3, 2.0, A, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: beta_zero (clears y regardless of input)', function t() {
	var tc = findCase( 'beta_zero' );
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		99.0,
		99.0
	]);
	zla_geamv( 'no-transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: beta_one_alpha_zero (quick return)', function t() {
	var tc = findCase( 'beta_one_alpha_zero' );
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		7.0,
		-3.0
	]);
	zla_geamv( 'no-transpose', 2, 2, 0.0, A, 1, 2, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: alpha_two_beta_half', function t() {
	var tc = findCase( 'alpha_two_beta_half' );

	// A column-major (2x2): col1 = (1,1),(2,-1); col2 = (0.5,0.5),(3,2)
	var A = new Complex128Array([
		1.0,
		1.0,
		2.0,
		-1.0,
		0.5,
		0.5,
		3.0,
		2.0
	]);
	var x = new Complex128Array([
		1.0,
		2.0,
		-1.0,
		1.0
	]);
	var y = new Float64Array([
		2.0,
		-4.0
	]);
	zla_geamv( 'no-transpose', 2, 2, 2.0, A, 1, 2, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: neg_incx_incy (notrans, M=3, N=2, negative strides)', function t() {
	var tc = findCase( 'neg_incx_incy' );

	// A: 3 rows x 2 cols, LDA=3, real entries 1..6
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0,
		5.0,
		0.0,
		6.0,
		0.0
	]);

	// x(1)=1, x(3)=2 with INCX=-2, LENX=N=2 in Fortran; JS offsetX=0 and base starts at kx = 0 - (lenx-1)*(strideX*2)
	var x = new Complex128Array([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		0.0,
		0.0,
		0.0
	]);

	// y has 6 slots, INCY=-2, LENY=M=3, offsetY=0, base starts at iy = 0 - 2*(-2) = 4
	var y = new Float64Array([
		0.1,
		0.0,
		0.2,
		0.0,
		0.3,
		0.0
	]);
	zla_geamv( 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, x, -2, 0, 1.0, y, -2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: rect_mlt_n (M=2 < N=4, notrans)', function t() {
	var tc = findCase( 'rect_mlt_n' );
	var A = new Complex128Array([
		1.0,
		0.5,
		-1.0,
		2.0,
		2.0,
		-1.0,
		0.0,
		1.5,
		3.0,
		1.0,
		1.0,
		-2.0,
		-0.5,
		0.5,
		2.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		1.0,
		0.5,
		-0.5,
		-1.0,
		0.0,
		2.0,
		1.0
	]);
	var y = new Float64Array([
		1.0,
		2.0
	]);
	zla_geamv( 'no-transpose', 2, 4, 1.0, A, 1, 2, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: rect_mgt_n (M=4 > N=2, trans)', function t() {
	var tc = findCase( 'rect_mgt_n' );
	var A = new Complex128Array([
		1.0,
		0.5,
		-1.0,
		2.0,
		0.0,
		0.0,
		2.5,
		-0.5,
		2.0,
		-1.0,
		0.0,
		1.5,
		1.0,
		1.0,
		-1.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		1.0,
		0.5,
		-0.5,
		-1.0,
		0.0,
		2.0,
		1.0
	]);
	var y = new Float64Array([
		0.0,
		0.0
	]);
	zla_geamv( 'transpose', 4, 2, 1.0, A, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: n_zero (quick return)', function t() {
	var tc = findCase( 'n_zero' );
	var A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0
	]);
	var x = new Complex128Array([
		0.0,
		0.0
	]);
	var y = new Float64Array([
		5.0,
		6.0
	]);
	zla_geamv( 'no-transpose', 2, 0, 1.0, A, 1, 2, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'zla_geamv: m_zero (quick return)', function t() {
	var tc = findCase( 'm_zero' );
	var A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0
	]);
	var x = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0
	]);
	var y = new Float64Array([
		5.0
	]);
	zla_geamv( 'no-transpose', 0, 2, 1.0, A, 1, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Additional coverage tests

test( 'zla_geamv: symbolic zero row preserved', function t() {
	// Row 0 of A is all zero, starting y is zero => result y[0] is symbolic zero (no SAFE1 perturbation).
	var A = new Complex128Array([
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0
	]);
	zla_geamv( 'no-transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( y[ 0 ], 0.0, 'y[0] symbolic zero' );
	assertClose( y[ 1 ], 2.0, 1e-14, 'y[1]' );
});

test( 'zla_geamv: transpose symbolic zero column preserved', function t() {
	// Column 0 of A is zero => for trans, y[0] loops over A(:,0) which is all zero.
	var A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0
	]);
	zla_geamv( 'transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( y[ 0 ], 0.0, 'y[0] symbolic zero' );
	assertClose( y[ 1 ], 2.0, 1e-14, 'y[1]' );
});

test( 'zla_geamv: negative y with beta (unit strides, trans)', function t() {
	// Covers the y[iy] < 0 perturbation branch after beta*|y|.
	var A = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0
	]);
	var y = new Float64Array([
		-2.0,
		3.0
	]);
	zla_geamv( 'transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 1.0, y, 1, 0 );

	// Col 0 of A = [(1,0),(0,1)], CABS1 = 1,1. y[0] = 1*|y[0]| + 1*1 + 1*1 = 4

	// Col 1 of A = [(0,1),(1,0)], CABS1 = 1,1. y[1] = 1*3 + 1 + 1 = 5
	assertClose( y[ 0 ], 4.0, 1e-12, 'y[0]' );
	assertClose( y[ 1 ], 5.0, 1e-12, 'y[1]' );
});

test( 'zla_geamv: alpha=0 beta=0.5 (notrans) scales |y| only', function t() {
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		-4.0,
		6.0
	]);
	zla_geamv( 'no-transpose', 2, 2, 0.0, A, 1, 2, 0, x, 1, 0, 0.5, y, 1, 0 );

	// Since alpha=0, inner loop skipped; symbZero=false (y was nonzero), so SAFE1 added (absorbed).
	assertClose( y[ 0 ], 2.0, 1e-12, 'y[0]' );
	assertClose( y[ 1 ], 3.0, 1e-12, 'y[1]' );
});

test( 'zla_geamv: alpha=0 beta=0.5 (trans) scales |y| only', function t() {
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		-4.0,
		6.0
	]);
	zla_geamv( 'transpose', 2, 2, 0.0, A, 1, 2, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertClose( y[ 0 ], 2.0, 1e-12, 'y[0]' );
	assertClose( y[ 1 ], 3.0, 1e-12, 'y[1]' );
});

test( 'zla_geamv: y[iy] already zero with beta != 0 (notrans)', function t() {
	// Hits the "else if (y[iy] === 0.0)" branch where beta is nonzero but y is zero.
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0
	]);
	zla_geamv( 'no-transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 2.0, y, 1, 0 );

	// y[0] = 1+3 = 4, y[1] = 2+4 = 6
	assertClose( y[ 0 ], 4.0, 1e-12, 'y[0]' );
	assertClose( y[ 1 ], 6.0, 1e-12, 'y[1]' );
});

test( 'zla_geamv: y[iy] already zero with beta != 0 (trans)', function t() {
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0
	]);
	zla_geamv( 'transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertClose( y[ 0 ], 3.0, 1e-12, 'y[0]' );
	assertClose( y[ 1 ], 7.0, 1e-12, 'y[1]' );
});

test( 'zla_geamv: conjugate-transpose matches transpose on real x,A', function t() {
	var y1 = new Float64Array([
		0.0,
		0.0
	]);
	var y2 = new Float64Array([
		0.0,
		0.0
	]);
	var A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		4.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0
	]);
	zla_geamv( 'transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y1, 1, 0 );
	zla_geamv( 'conjugate-transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y2, 1, 0 );
	assertArrayClose( y1, y2, 0, 'conj==trans' );
});
