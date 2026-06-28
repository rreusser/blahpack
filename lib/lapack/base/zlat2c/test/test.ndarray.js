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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex64Array from '@stdlib/array/complex64/lib/index.js';
import reinterpret64 from '@stdlib/strided/base/reinterpret-complex64/lib/index.js';
import zlat2c from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlat2c.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts two scalars are close in relative error.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var d;
	d = Math.abs( actual - expected );
	relErr = d / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts two flat arrays are element-wise close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
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
* Builds a Complex128Array from a flat interleaved real/imag array.
*
* @private
* @param {Array} vals - flat array of interleaved re/im pairs
* @returns {Complex128Array} complex array
*/
function toComplex128( vals ) {
	var out;
	var i;
	out = new Complex128Array( vals.length / 2 );
	for ( i = 0; i < vals.length; i += 2 ) {
		out.set( [ vals[ i ], vals[ i + 1 ] ], i / 2 );
	}
	return out;
}

/**
* Converts a Complex64Array to a plain array of interleaved re/im values.
*
* @private
* @param {Complex64Array} arr - complex array
* @returns {Array} flat array
*/
function flat64( arr ) {
	var out;
	var v;
	var i;
	v = reinterpret64( arr, 0 );
	out = [];
	for ( i = 0; i < v.length; i++ ) {
		out.push( v[ i ] );
	}
	return out;
}

/**
* Builds the 3x3 test A matrix (values matching Fortran test).
*
* @private
* @returns {Complex128Array} A matrix
*/
function buildA3() {
	var vals;
	var i;
	vals = [];
	for ( i = 1; i <= 9; i++ ) {
		vals.push( i * 1.25, i * 0.5 );
	}
	return toComplex128( vals );
}

/**
* Builds the 4x4 test A matrix (values matching Fortran test).
*
* @private
* @returns {Complex128Array} A matrix
*/
function buildA4() {
	var vals;
	var i;
	vals = [];
	for ( i = 1; i <= 16; i++ ) {
		vals.push( i * 0.5, i * 0.25 );
	}
	return toComplex128( vals );
}


// TESTS //

test( 'zlat2c: upper 3x3', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'upper_3x3' );
	A = buildA3();
	SA = new Complex64Array( 9 );
	info = zlat2c( 'upper', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( flat64( SA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlat2c: lower 3x3', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'lower_3x3' );
	A = buildA3();
	SA = new Complex64Array( 9 );
	info = zlat2c( 'lower', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( flat64( SA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlat2c: n=0 quick return', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'n_zero' );
	A = buildA3();
	SA = new Complex64Array( 9 );
	info = zlat2c( 'upper', 0, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( flat64( SA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlat2c: n=1', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'n_one' );
	A = buildA3();
	SA = new Complex64Array( 9 );
	info = zlat2c( 'upper', 1, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( flat64( SA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlat2c: upper overflow in real part', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'overflow_upper_real' );
	A = new Complex128Array( 9 );
	A.set( [ 1.0, 0.5 ], 0 );
	A.set( [ 1.0e300, 0.0 ], 3 );
	A.set( [ 2.0, 0.0 ], 4 );
	A.set( [ 3.0, 0.0 ], 6 );
	A.set( [ 4.0, 0.0 ], 7 );
	A.set( [ 5.0, 0.0 ], 8 );
	SA = new Complex64Array( 9 );
	info = zlat2c( 'upper', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( info, 1, 'overflow detected' );
});

test( 'zlat2c: upper overflow in imaginary part (negative)', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'overflow_upper_imag' );
	A = new Complex128Array( 9 );
	A.set( [ 1.0, 0.5 ], 0 );
	A.set( [ 0.0, -1.0e300 ], 3 );
	A.set( [ 2.0, 0.0 ], 4 );
	A.set( [ 3.0, 0.0 ], 6 );
	A.set( [ 4.0, 0.0 ], 7 );
	A.set( [ 5.0, 0.0 ], 8 );
	SA = new Complex64Array( 9 );
	info = zlat2c( 'upper', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( info, 1, 'overflow detected' );
});

test( 'zlat2c: lower overflow (negative real)', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'overflow_lower' );
	A = new Complex128Array( 9 );
	A.set( [ 1.0, 0.0 ], 0 );
	A.set( [ -1.0e300, 0.0 ], 1 );
	A.set( [ 2.0, 0.0 ], 2 );
	A.set( [ 3.0, 0.0 ], 4 );
	A.set( [ 4.0, 0.0 ], 5 );
	A.set( [ 5.0, 0.0 ], 8 );
	SA = new Complex64Array( 9 );
	info = zlat2c( 'lower', 3, A, 1, 3, 0, SA, 1, 3, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( info, 1, 'overflow detected' );
});

test( 'zlat2c: lower 4x4', function t() {
	var info;
	var tc;
	var SA;
	var A;
	tc = findCase( 'lower_4x4' );
	A = buildA4();
	SA = new Complex64Array( 16 );
	info = zlat2c( 'lower', 4, A, 1, 4, 0, SA, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( flat64( SA ), tc.sa, 1e-6, 'sa' );
});

test( 'zlat2c: throws TypeError for invalid uplo', function t() {
	var SA;
	var A;
	A = new Complex128Array( 4 );
	SA = new Complex64Array( 4 );
	assert.throws( function throws() {
		zlat2c( 'invalid', 2, A, 1, 2, 0, SA, 1, 2, 0 );
	}, TypeError );
});

test( 'zlat2c: row-major via swapped strides (upper)', function t() {
	var info;
	var vals;
	var SA;
	var A;
	var v;
	var i;
	vals = [];
	for ( i = 1; i <= 9; i++ ) {
		vals.push( i * 1.25, i * 0.5 );
	}
	A = toComplex128( vals );
	SA = new Complex64Array( 9 );
	info = zlat2c( 'upper', 3, A, 3, 1, 0, SA, 3, 1, 0 );
	assert.equal( info, 0, 'info' );
	v = flat64( SA );
	assertClose( v[ 0 ], 1.25, 1e-6, 'sa[0,0].re' );
	assertClose( v[ 1 ], 0.5, 1e-6, 'sa[0,0].im' );
	assertClose( v[ 2 ], 2.5, 1e-6, 'sa[0,1].re' );
	assertClose( v[ 8 ], 6.25, 1e-6, 'sa[1,1].re' );
});
