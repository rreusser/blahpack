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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gbamv from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_gbamv.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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

test( 'zla_gbamv: notrans_basic (4x4 band KL=1 KU=2, alpha=1.5 beta=0.5)', function t() {
	var tc = findCase( 'notrans_basic' );
	var AB = new Complex128Array( tc.AB );
	var x = new Complex128Array( tc.x );
	var y = new Float64Array([
		1.0,
		-2.0,
		3.0,
		-0.5
	]);

	// Column-major band storage: strideAB1=1, strideAB2=LDAB=4
	zla_gbamv( 'no-transpose', 4, 4, 1, 2, 1.5, AB, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: trans_basic (4x4 band, alpha=1 beta=1)', function t() {
	var base = findCase( 'notrans_basic' );
	var tc = findCase( 'trans_basic' );
	var AB = new Complex128Array( base.AB );
	var x = new Complex128Array( base.x );
	var y = new Float64Array([
		1.0,
		-2.0,
		3.0,
		-0.5
	]);
	zla_gbamv( 'transpose', 4, 4, 1, 2, 1.0, AB, 1, 4, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: conjtrans_basic (4x4 band, alpha=2 beta=0)', function t() {
	var base = findCase( 'notrans_basic' );
	var tc = findCase( 'conjtrans_basic' );
	var AB = new Complex128Array( base.AB );
	var x = new Complex128Array( base.x );
	var y = new Float64Array([
		0.0,
		0.0,
		0.0,
		0.0
	]);
	zla_gbamv( 'conjugate-transpose', 4, 4, 1, 2, 2.0, AB, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: beta_zero (tri-diagonal, beta=0 wipes y)', function t() {
	var tc = findCase( 'beta_zero' );
	var AB = new Complex128Array([
		0.0,
		0.0,
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
		0.0,
		7.0,
		0.0,
		0.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		99.0,
		99.0,
		99.0
	]);
	zla_gbamv( 'no-transpose', 3, 3, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: beta_one_alpha_zero (quick return path)', function t() {
	var tc = findCase( 'beta_one_alpha_zero' );
	var AB = new Complex128Array( 9 );
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		7.0,
		-3.0,
		2.5
	]);
	zla_gbamv( 'no-transpose', 3, 3, 1, 1, 0.0, AB, 1, 3, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: alpha_beta_scale (complex values, alpha=2 beta=0.5)', function t() {
	var tc = findCase( 'alpha_beta_scale' );
	var AB = new Complex128Array([
		0.0,
		0.0,
		1.0,
		1.0,
		2.0,
		-1.0,
		0.5,
		0.5,
		3.0,
		2.0,
		1.0,
		0.0,
		-1.0,
		2.0,
		2.5,
		-0.5,
		0.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		2.0,
		-1.0,
		1.0,
		0.5,
		0.5
	]);
	var y = new Float64Array([
		2.0,
		-4.0,
		1.0
	]);
	zla_gbamv( 'no-transpose', 3, 3, 1, 1, 2.0, AB, 1, 3, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: neg_incx_incy (INCX=-2, INCY=-2)', function t() {
	var tc = findCase( 'neg_incx_incy' );
	var AB = new Complex128Array([
		0.0,
		0.0,
		1.0,
		1.0,
		2.0,
		0.0,
		0.5,
		0.5,
		3.0,
		0.0,
		1.0,
		-1.0,
		-1.0,
		0.0,
		2.5,
		0.0,
		0.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		1.0,
		0.0,
		0.0,
		-1.0,
		0.5,
		0.0,
		0.0
	]);
	var y = new Float64Array([
		0.1,
		0.0,
		0.2,
		0.0,
		0.3,
		0.0
	]);
	zla_gbamv( 'no-transpose', 3, 3, 1, 1, 1.0, AB, 1, 3, 0, x, -2, 0, 1.0, y, -2, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: rect_mlt_n (M=3, N=4, TRANS=N)', function t() {
	var tc = findCase( 'rect_mlt_n' );
	var AB = new Complex128Array([
		0.0,
		0.0,
		1.0,
		0.5,
		-1.0,
		2.0,
		2.0,
		-1.0,
		0.0,
		1.5,
		1.0,
		1.0,
		3.0,
		1.0,
		1.0,
		-2.0,
		0.0,
		0.0,
		-0.5,
		0.5,
		0.0,
		0.0,
		0.0,
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
		2.0,
		-1.0
	]);
	zla_gbamv( 'no-transpose', 3, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: rect_mgt_n (M=4, N=3, TRANS=T)', function t() {
	var tc = findCase( 'rect_mgt_n' );
	var AB = new Complex128Array([
		0.0,
		0.0,
		1.0,
		0.5,
		-1.0,
		2.0,
		0.0,
		1.0,
		2.0,
		-1.0,
		0.0,
		1.5,
		1.0,
		1.0,
		-1.0,
		0.0,
		3.0,
		1.0,
		1.0,
		-2.0,
		-0.5,
		0.5,
		0.0,
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
		0.0,
		0.0
	]);
	zla_gbamv( 'transpose', 4, 3, 2, 1, 1.0, AB, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: kl_zero_ku_zero (diagonal-only)', function t() {
	var tc = findCase( 'kl_zero_ku_zero' );
	var AB = new Complex128Array([
		2.0,
		1.0,
		-1.0,
		3.0,
		0.5,
		-0.5
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		0.0,
		2.0,
		-1.0,
		1.0
	]);
	var y = new Float64Array([
		1.0,
		-1.0,
		0.5
	]);
	zla_gbamv( 'no-transpose', 3, 3, 0, 0, 1.0, AB, 1, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-12, 'y' );
});

test( 'zla_gbamv: quick return M=0', function t() {
	var AB = new Complex128Array( 4 );
	var x = new Complex128Array( 2 );
	var y = new Float64Array([
		5.0,
		6.0
	]);
	zla_gbamv( 'no-transpose', 0, 2, 0, 0, 1.0, AB, 1, 1, 0, x, 1, 0, 2.0, y, 1, 0 );
	assert.equal( y[ 0 ], 5.0 );
	assert.equal( y[ 1 ], 6.0 );
});

test( 'zla_gbamv: quick return N=0', function t() {
	var AB = new Complex128Array( 4 );
	var x = new Complex128Array( 2 );
	var y = new Float64Array([
		5.0,
		6.0
	]);
	zla_gbamv( 'no-transpose', 2, 0, 0, 0, 1.0, AB, 1, 1, 0, x, 1, 0, 2.0, y, 1, 0 );
	assert.equal( y[ 0 ], 5.0 );
	assert.equal( y[ 1 ], 6.0 );
});

test( 'zla_gbamv: quick return alpha=0 beta=1', function t() {
	var AB = new Complex128Array( 4 );
	var x = new Complex128Array( 2 );
	var y = new Float64Array([
		5.0,
		6.0
	]);
	zla_gbamv( 'no-transpose', 2, 2, 0, 0, 0.0, AB, 1, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
	assert.equal( y[ 0 ], 5.0 );
	assert.equal( y[ 1 ], 6.0 );
});

test( 'zla_gbamv: non-unit stride x + transpose (JX reset quirk)', function t() {
	// Diagonal-only so the inner band loop runs once per row; each row reads x[0] due to the Fortran JX=KX reset per row.
	var AB = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0
	]);
	var x = new Complex128Array([
		2.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.0,
		0.0,
		0.0,
		6.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0,
		0.0
	]);

	// Expected: y[0] = 1*2, y[1] = 2*2, y[2] = 3*2 (each row reads x[0]=2)
	zla_gbamv( 'transpose', 3, 3, 0, 0, 1.0, AB, 1, 1, 0, x, 2, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, [ 2.0, 4.0, 6.0 ], 1e-12, 'y' );
});

test( 'zla_gbamv: y[iy]==0 with beta!=0, notrans, alpha=0 (symb zero)', function t() {
	var AB = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0,
		0.0
	]);
	zla_gbamv( 'no-transpose', 3, 3, 0, 0, 0.0, AB, 1, 1, 0, x, 1, 0, 2.0, y, 1, 0 );
	assert.equal( y[ 0 ], 0.0 );
	assert.equal( y[ 1 ], 0.0 );
	assert.equal( y[ 2 ], 0.0 );
});

test( 'zla_gbamv: y[iy]==0 with beta!=0, trans, alpha=0 (symb zero)', function t() {
	var AB = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		0.0,
		0.0,
		0.0
	]);
	zla_gbamv( 'transpose', 3, 3, 0, 0, 0.0, AB, 1, 1, 0, x, 1, 0, 2.0, y, 1, 0 );
	assert.equal( y[ 0 ], 0.0 );
	assert.equal( y[ 1 ], 0.0 );
	assert.equal( y[ 2 ], 0.0 );
});

test( 'zla_gbamv: transpose with y[iy]<0 beta=1 exercises abs(y)', function t() {
	var AB = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0
	]);
	var x = new Complex128Array([
		1.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	var y = new Float64Array([
		-1.0,
		-2.0,
		-3.0
	]);

	// Expected: y[i] = |y_in| + |a_ii| (+ safe1 perturbation)
	zla_gbamv( 'transpose', 3, 3, 0, 0, 1.0, AB, 1, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
	assert.ok( y[ 0 ] > 1.99 && y[ 0 ] < 2.01 );
	assert.ok( y[ 1 ] > 3.99 && y[ 1 ] < 4.01 );
	assert.ok( y[ 2 ] > 5.99 && y[ 2 ] < 6.01 );
});
