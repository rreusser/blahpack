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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_heamv from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( resolve( fixtureDir, 'zla_heamv.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});

/*
* Hermitian test matrix (column-major, LDA=4):
* A = [  2.0         (1.0,2.0)   (3.0,-1.0) ]
*     [ (1.0,-2.0)    5.0        (0.5, 1.5) ]
*     [ (3.0,1.0)    (0.5,-1.5)   4.0       ]
*/
var A_DATA = new Float64Array([
	2.0,
	0.0,
	1.0,
	-2.0,
	3.0,
	1.0,
	0.0,
	0.0,
	1.0,
	2.0,
	5.0,
	0.0,
	0.5,
	-1.5,
	0.0,
	0.0,
	3.0,
	-1.0,
	0.5,
	1.5,
	4.0,
	0.0,
	0.0,
	0.0
]);

var X_DATA = new Float64Array([
	1.0,
	0.5,
	-2.0,
	1.0,
	3.0,
	-1.0
]);


// FUNCTIONS //

/**
* Locates a named fixture case.
*
* @private
* @param {string} name - case name
* @returns {Object} case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts a scalar is within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are elementwise close.
*
* @private
* @param {Float64Array} actual - actual array
* @param {Array} expected - expected array
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
* Creates a fresh Complex128Array from the Hermitian test matrix data.
*
* @private
* @returns {Complex128Array} complex matrix
*/
function makeA() {
	return new Complex128Array( A_DATA.buffer.slice( 0 ) );
}

/**
* Creates a fresh Complex128Array from the test vector data.
*
* @private
* @returns {Complex128Array} complex vector
*/
function makeX() {
	return new Complex128Array( X_DATA.buffer.slice( 0 ) );
}


// TESTS //

test( 'zla_heamv: upper_basic', function t() {
	var tc = findCase( 'upper_basic' );
	var y = new Float64Array( 3 );
	zla_heamv( 'upper', 3, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: lower_basic', function t() {
	var tc = findCase( 'lower_basic' );
	var y = new Float64Array( 3 );
	zla_heamv( 'lower', 3, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: upper_scaled', function t() {
	var tc = findCase( 'upper_scaled' );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	zla_heamv( 'upper', 3, 2.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: lower_scaled', function t() {
	var tc = findCase( 'lower_scaled' );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	zla_heamv( 'lower', 3, 2.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: quick_return_n_zero', function t() {
	var y = new Float64Array( [ 99.0, 99.0, 99.0 ] );
	zla_heamv( 'upper', 0, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), [ 99.0, 99.0, 99.0 ], 1e-14, 'y' );
});

test( 'zla_heamv: alpha_zero_beta_one', function t() {
	var tc = findCase( 'alpha_zero_beta_one' );
	var y = new Float64Array( [ 7.0, 8.0, 9.0 ] );
	zla_heamv( 'upper', 3, 0.0, makeA(), 1, 4, 0, makeX(), 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: alpha_zero_beta_two', function t() {
	var tc = findCase( 'alpha_zero_beta_two' );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	zla_heamv( 'upper', 3, 0.0, makeA(), 1, 4, 0, makeX(), 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: upper_negincy', function t() {
	var tc = findCase( 'upper_negincy' );
	var y = new Float64Array( [ 10.0, 20.0, 30.0 ] );
	zla_heamv( 'upper', 3, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 1.0, y, -1, 2 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: lower_incx2', function t() {
	var xbig = new Complex128Array( new Float64Array( [ 1.0, 0.5, 0.0, 0.0, -2.0, 1.0, 0.0, 0.0, 3.0, -1.0 ] ).buffer );
	var tc = findCase( 'lower_incx2' );
	var y = new Float64Array( 3 );
	zla_heamv( 'lower', 3, 1.0, makeA(), 1, 4, 0, xbig, 2, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: symbolic_zero_upper', function t() {
	var Azero = new Complex128Array( 16 );
	var xval = new Complex128Array( new Float64Array( [ 1.0, 0.5, 1.0, 0.0, 1.0, 1.0 ] ).buffer );
	var tc = findCase( 'symbolic_zero_upper' );
	var y = new Float64Array( 3 );
	zla_heamv( 'upper', 3, 1.0, Azero, 1, 4, 0, xval, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: symbolic_zero_lower', function t() {
	var Azero = new Complex128Array( 16 );
	var xval = new Complex128Array( new Float64Array( [ 1.0, 0.5, 1.0, 0.0, 1.0, 1.0 ] ).buffer );
	var tc = findCase( 'symbolic_zero_lower' );
	var y = new Float64Array( 3 );
	zla_heamv( 'lower', 3, 1.0, Azero, 1, 4, 0, xval, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: n_one_upper', function t() {
	var tc = findCase( 'n_one_upper' );
	var A1 = new Complex128Array( new Float64Array( [ 4.0, 0.0 ] ).buffer );
	var x1 = new Complex128Array( new Float64Array( [ -2.0, 1.0 ] ).buffer );
	var y = new Float64Array( 1 );
	zla_heamv( 'upper', 1, 1.0, A1, 1, 1, 0, x1, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: n_one_lower', function t() {
	var tc = findCase( 'n_one_lower' );
	var A1 = new Complex128Array( new Float64Array( [ 4.0, 0.0 ] ).buffer );
	var x1 = new Complex128Array( new Float64Array( [ -2.0, 1.0 ] ).buffer );
	var y = new Float64Array( 1 );
	zla_heamv( 'lower', 1, 1.0, A1, 1, 1, 0, x1, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv: upper_negincx_negincy', function t() {
	var tc = findCase( 'upper_negincx_negincy' );
	var y = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	zla_heamv( 'upper', 3, 1.0, makeA(), 1, 4, 0, makeX(), -1, 2, 1.0, y, -1, 2 );
	assertArrayClose( Array.prototype.slice.call( y ), tc.y, 1e-14, 'y' );
});

test( 'zla_heamv throws TypeError for invalid uplo', function t() {
	var y = new Float64Array( 3 );
	assert.throws( function throws() {
		zla_heamv( 'invalid', 3, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.0, y, 1, 0 );
	}, TypeError );
});

test( 'zla_heamv throws RangeError for negative N', function t() {
	var y = new Float64Array( 3 );
	assert.throws( function throws() {
		zla_heamv( 'upper', -1, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.0, y, 1, 0 );
	}, RangeError );
});

test( 'zla_heamv throws RangeError for zero strideX', function t() {
	var y = new Float64Array( 3 );
	assert.throws( function throws() {
		zla_heamv( 'upper', 3, 1.0, makeA(), 1, 4, 0, makeX(), 0, 0, 0.0, y, 1, 0 );
	}, RangeError );
});

test( 'zla_heamv throws RangeError for zero strideY', function t() {
	var y = new Float64Array( 3 );
	assert.throws( function throws() {
		zla_heamv( 'upper', 3, 1.0, makeA(), 1, 4, 0, makeX(), 1, 0, 0.0, y, 0, 0 );
	}, RangeError );
});
