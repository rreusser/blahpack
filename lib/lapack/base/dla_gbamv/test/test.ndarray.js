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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, require-jsdoc, stdlib/jsdoc-private-annotation, max-statements-per-line */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gbamv from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_gbamv.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Build the column-major band storage for a 4x4 tridiagonal matrix:
//   [  1  -2   0   0 ]
//   [  3   4  -5   0 ]
//   [  0  -6   7   8 ]
//   [  0   0  -9  10 ]
// KL=1, KU=1, LDAB=3.
function tridiagAB() {
	var AB = new Float64Array( 3 * 4 );

	// Col 0 (j=0)
	AB[ 1 ] = 1.0;   // band row 1 = diag
	AB[ 2 ] = 3.0;   // band row 2 = subdiag

	// Col 1 (j=1)
	AB[ 3 ] = -2.0;  // band row 0 = superdiag
	AB[ 4 ] = 4.0;
	AB[ 5 ] = -6.0;

	// Col 2 (j=2)
	AB[ 6 ] = -5.0;
	AB[ 7 ] = 7.0;
	AB[ 8 ] = -9.0;

	// Col 3 (j=3)
	AB[ 9 ] = 8.0;
	AB[ 10 ] = 10.0;
	return AB;
}

// Lower-banded 4x4 with KL=2 KU=0, LDAB=3:
//   [ 1  0  0  0 ]
//   [ 2  3  0  0 ]
//   [ 4  5  6  0 ]
//   [ 0  7  8  9 ]
function lowerAB() {
	var AB = new Float64Array( 3 * 4 );
	AB[ 0 ] = 1.0; AB[ 1 ] = 2.0; AB[ 2 ] = 4.0;
	AB[ 3 ] = 3.0; AB[ 4 ] = 5.0; AB[ 5 ] = 7.0;
	AB[ 6 ] = 6.0; AB[ 7 ] = 8.0;
	AB[ 9 ] = 9.0;
	return AB;
}

// Upper-banded 4x4 with KL=0 KU=2, LDAB=3:
//   [ 1  2  3  0 ]
//   [ 0  4  5  6 ]
//   [ 0  0  7  8 ]
//   [ 0  0  0  9 ]
function upperAB() {
	var AB = new Float64Array( 3 * 4 );
	AB[ 2 ] = 1.0;
	AB[ 4 ] = 2.0; AB[ 5 ] = 4.0;
	AB[ 6 ] = 3.0; AB[ 7 ] = 5.0; AB[ 8 ] = 7.0;
	AB[ 9 ] = 6.0; AB[ 10 ] = 8.0; AB[ 11 ] = 9.0;
	return AB;
}

// Test 1
test( 'dla_gbamv: notrans_kl1_ku1', function t() {
	var tc = findCase( 'notrans_kl1_ku1' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'no-transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 2
test( 'dla_gbamv: trans_kl1_ku1', function t() {
	var tc = findCase( 'trans_kl1_ku1' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 3
test( 'dla_gbamv: notrans_scaled', function t() {
	var tc = findCase( 'notrans_scaled' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0, 4.0 ] );
	dla_gbamv( 'no-transpose', 4, 4, 1, 1, 2.0, AB, 1, 3, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 4
test( 'dla_gbamv: trans_scaled', function t() {
	var tc = findCase( 'trans_scaled' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0, 4.0 ] );
	dla_gbamv( 'transpose', 4, 4, 1, 1, 2.0, AB, 1, 3, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 5
test( 'dla_gbamv: notrans_kl2_ku0', function t() {
	var tc = findCase( 'notrans_kl2_ku0' );
	var AB = lowerAB();
	var x = new Float64Array( [ 1.0, -1.0, 2.0, -2.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'no-transpose', 4, 4, 2, 0, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 6
test( 'dla_gbamv: trans_kl2_ku0', function t() {
	var tc = findCase( 'trans_kl2_ku0' );
	var AB = lowerAB();
	var x = new Float64Array( [ 1.0, -1.0, 2.0, -2.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'transpose', 4, 4, 2, 0, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 7
test( 'dla_gbamv: notrans_kl0_ku2', function t() {
	var tc = findCase( 'notrans_kl0_ku2' );
	var AB = upperAB();
	var x = new Float64Array( [ 1.0, -1.0, 2.0, -2.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'no-transpose', 4, 4, 0, 2, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 8
test( 'dla_gbamv: trans_kl0_ku2', function t() {
	var tc = findCase( 'trans_kl0_ku2' );
	var AB = upperAB();
	var x = new Float64Array( [ 1.0, -1.0, 2.0, -2.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'transpose', 4, 4, 0, 2, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 9
test( 'dla_gbamv: alpha_zero_beta_one', function t() {
	var tc = findCase( 'alpha_zero_beta_one' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( [ 7.0, 8.0, 9.0, 10.0 ] );
	dla_gbamv( 'no-transpose', 4, 4, 1, 1, 0.0, AB, 1, 3, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 10
test( 'dla_gbamv: alpha_zero_beta_two', function t() {
	var tc = findCase( 'alpha_zero_beta_two' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0, 4.0 ] );
	dla_gbamv( 'no-transpose', 4, 4, 1, 1, 0.0, AB, 1, 3, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 11: symbolic zero row (row 0 of A is all zero, y(0)=0 → no perturbation)
test( 'dla_gbamv: symbolic_zero_row', function t() {
	var tc = findCase( 'symbolic_zero_row' );
	var AB = new Float64Array( 3 * 4 );
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( 4 );
	AB[ 2 ] = 3.0;
	AB[ 4 ] = 4.0;
	AB[ 5 ] = -6.0;
	AB[ 6 ] = -5.0;
	AB[ 7 ] = 7.0;
	AB[ 8 ] = -9.0;
	AB[ 9 ] = 8.0;
	AB[ 10 ] = 10.0;
	dla_gbamv( 'no-transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assert.equal( y[ 0 ], 0.0, 'y[0] stays exactly zero (symbolic zero)' );
});

// Test 12: non-unit incx
test( 'dla_gbamv: notrans_incx2', function t() {
	var tc = findCase( 'notrans_incx2' );
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, 0.0, -2.0, 0.0, 3.0, 0.0, -4.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'no-transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 2, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Test 13: negative strides, transpose
test( 'dla_gbamv: trans_negincx_negincy', function t() {
	var tc = findCase( 'trans_negincx_negincy' );
	var AB = tridiagAB();

	// Fortran x = [1,-2,3,-4], strideX=-1 in Fortran uses KX=N=4 (last).

	// Wrapper should pass offsetX = N-1 = 3 (last index) for 0-based.
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	dla_gbamv( 'transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, -1, 3, 1.0, y, -1, 3 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

// Additional tests for coverage: quick returns and alpha=0 non-beta=1
test( 'dla_gbamv: quick return M=0', function t() {
	var AB = new Float64Array( 3 );
	var x = new Float64Array( [ 1.0 ] );
	var y = new Float64Array( [ 99.0 ] );
	dla_gbamv( 'no-transpose', 0, 4, 0, 0, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( y[ 0 ], 99.0, 'y unchanged' );
});

test( 'dla_gbamv: quick return N=0', function t() {
	var AB = new Float64Array( 3 );
	var x = new Float64Array( [ 1.0 ] );
	var y = new Float64Array( [ 99.0 ] );
	dla_gbamv( 'no-transpose', 4, 0, 0, 0, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( y[ 0 ], 99.0, 'y unchanged' );
});

// Transpose with incx!=1 and beta=0
test( 'dla_gbamv: trans_incx2_beta_zero', function t() {
	var expected = [ 7.0, 28.0, 46.0, 28.0 ];
	var AB = tridiagAB();
	var x = new Float64Array( [ 1.0, 0.0, -2.0, 0.0, 3.0, 0.0, -4.0 ] );
	var y = new Float64Array( 4 );
	dla_gbamv( 'transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 2, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, expected, 1e-12, 'y' );
});
