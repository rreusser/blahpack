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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_syamv from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_syamv.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});

// Fortran stores the 3x3 symmetric matrix column-major in A(4,4) with LDA=4; column-major flattening uses strideA1=1, strideA2=4.
var A3 = new Float64Array( [ 1.0, -2.0, 3.0, 0.0, -2.0, 5.0, -6.0, 0.0, 3.0, -6.0, 9.0, 0.0 ] );


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


// TESTS //

test( 'dla_syamv: upper_basic (alpha=1, beta=0)', function t() {
	var tc = findCase( 'upper_basic' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_syamv( 'upper', 3, 1.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: lower_basic (alpha=1, beta=0)', function t() {
	var tc = findCase( 'lower_basic' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_syamv( 'lower', 3, 1.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: upper_scaled (alpha=2, beta=0.5)', function t() {
	var tc = findCase( 'upper_scaled' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	dla_syamv( 'upper', 3, 2.0, A3, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: lower_scaled (alpha=2, beta=0.5)', function t() {
	var tc = findCase( 'lower_scaled' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	dla_syamv( 'lower', 3, 2.0, A3, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: quick return n=0', function t() {
	var tc = findCase( 'quick_return_n_zero' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 99.0, 99.0, 99.0 ] );
	dla_syamv( 'upper', 0, 1.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: alpha=0, beta=1 quick return', function t() {
	var tc = findCase( 'alpha_zero_beta_one' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 7.0, 8.0, 9.0 ] );
	dla_syamv( 'upper', 3, 0.0, A3, 1, 4, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: alpha=0, beta=2 (scale |y| only)', function t() {
	var tc = findCase( 'alpha_zero_beta_two' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	dla_syamv( 'upper', 3, 0.0, A3, 1, 4, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: upper with negative incy', function t() {
	var tc = findCase( 'upper_negincy' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 10.0, 20.0, 30.0 ] );

	// With strideY=-1, offsetY=2 (start at last element, walk backward).
	dla_syamv( 'upper', 3, 1.0, A3, 1, 4, 0, x, 1, 0, 1.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: lower with non-unit incx=2', function t() {
	var tc = findCase( 'lower_incx2' );

	// x with stride 2: [1, *, -2, *, 3]
	var x = new Float64Array( [ 1.0, 0.0, -2.0, 0.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_syamv( 'lower', 3, 1.0, A3, 1, 4, 0, x, 2, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: upper with negative incx and negative incy', function t() {
	var tc = findCase( 'upper_negincx_negincy' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 1.0, 2.0, 3.0 ] );

	// strideX=-1 offsetX=2, strideY=-1 offsetY=2
	dla_syamv( 'upper', 3, 1.0, A3, 1, 4, 0, x, -1, 2, 1.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: symbolic zero upper (zero matrix, zero y)', function t() {
	var tc = findCase( 'symbolic_zero_upper' );
	var Az = new Float64Array( 12 ); // all zeros
	var x = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_syamv( 'upper', 3, 1.0, Az, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );

	// Must remain exactly zero (no perturbation).
	assert.equal( y[ 0 ], 0.0, 'y[0] is exactly zero' );
	assert.equal( y[ 1 ], 0.0, 'y[1] is exactly zero' );
	assert.equal( y[ 2 ], 0.0, 'y[2] is exactly zero' );
});

test( 'dla_syamv: symbolic zero lower (zero matrix, zero y)', function t() {
	var tc = findCase( 'symbolic_zero_lower' );
	var Az = new Float64Array( 12 );
	var x = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_syamv( 'lower', 3, 1.0, Az, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assert.equal( y[ 0 ], 0.0, 'y[0] is exactly zero' );
});

test( 'dla_syamv: n=1 upper', function t() {
	var tc = findCase( 'n_one_upper' );
	var A1 = new Float64Array( [ 4.0, 0.0, 0.0, 0.0 ] );
	var x = new Float64Array( [ -2.0 ] );
	var y = new Float64Array( [ 0.0 ] );
	dla_syamv( 'upper', 1, 1.0, A1, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv: n=1 lower', function t() {
	var tc = findCase( 'n_one_lower' );
	var A1 = new Float64Array( [ 4.0, 0.0, 0.0, 0.0 ] );
	var x = new Float64Array( [ -2.0 ] );
	var y = new Float64Array( [ 0.0 ] );
	dla_syamv( 'lower', 1, 1.0, A1, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_syamv (ndarray): throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dla_syamv( 'invalid', 3, 1.0, A3, 1, 4, 0, new Float64Array( 3 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 );
	}, TypeError );
});

test( 'dla_syamv (ndarray): throws RangeError for N < 0', function t() {
	assert.throws( function throws() {
		dla_syamv( 'upper', -1, 1.0, A3, 1, 4, 0, new Float64Array( 3 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 );
	}, RangeError );
});

test( 'dla_syamv (ndarray): throws RangeError for strideX === 0', function t() {
	assert.throws( function throws() {
		dla_syamv( 'upper', 3, 1.0, A3, 1, 4, 0, new Float64Array( 3 ), 0, 0, 0.0, new Float64Array( 3 ), 1, 0 );
	}, RangeError );
});

test( 'dla_syamv (ndarray): throws RangeError for strideY === 0', function t() {
	assert.throws( function throws() {
		dla_syamv( 'upper', 3, 1.0, A3, 1, 4, 0, new Float64Array( 3 ), 1, 0, 0.0, new Float64Array( 3 ), 0, 0 );
	}, RangeError );
});

test( 'dla_syamv: symbolic zero retained with nonzero |A| but zero x and zero y (beta=0)', function t() {
	// When alpha=0 and beta=0, and y=0, entry stays symbolically zero.
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_syamv( 'upper', 3, 0.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( y[ 0 ], 0.0, 'y[0] is exactly zero' );
	assert.equal( y[ 1 ], 0.0, 'y[1] is exactly zero' );
	assert.equal( y[ 2 ], 0.0, 'y[2] is exactly zero' );
});
