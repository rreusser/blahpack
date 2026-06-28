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
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_geamv from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_geamv.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});

// The fixture matrix A is column-major with LDA=4, so strideA1=1, strideA2=4.
var A3 = new Float64Array( [ 1.0, -4.0, 7.0, 0.0, -2.0, 5.0, -8.0, 0.0, 3.0, -6.0, 9.0, 0.0 ] );


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
* @param {Float64Array} actual - computed array
* @param {Array} expected - expected array
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

test( 'dla_geamv: notrans_basic (alpha=1, beta=0)', function t() {
	var tc = findCase( 'notrans_basic' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_geamv( 'no-transpose', 3, 3, 1.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: trans_basic (alpha=1, beta=0)', function t() {
	var tc = findCase( 'trans_basic' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_geamv( 'transpose', 3, 3, 1.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: notrans_scaled (alpha=2, beta=0.5)', function t() {
	var tc = findCase( 'notrans_scaled' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	dla_geamv( 'no-transpose', 3, 3, 2.0, A3, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: trans_scaled (alpha=2, beta=0.5)', function t() {
	var tc = findCase( 'trans_scaled' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	dla_geamv( 'transpose', 3, 3, 2.0, A3, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: quick_return_n_zero', function t() {
	var tc = findCase( 'quick_return_n_zero' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 99.0, 99.0, 99.0 ] );
	dla_geamv( 'no-transpose', 3, 0, 1.0, A3, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: alpha_zero_beta_one (quick return)', function t() {
	var tc = findCase( 'alpha_zero_beta_one' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 7.0, 8.0, 9.0 ] );
	dla_geamv( 'no-transpose', 3, 3, 0.0, A3, 1, 4, 0, x, 1, 0, 1.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: alpha_zero_beta_two', function t() {
	var tc = findCase( 'alpha_zero_beta_two' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ -1.0, 2.0, -3.0 ] );
	dla_geamv( 'no-transpose', 3, 3, 0.0, A3, 1, 4, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: notrans_negincy (beta=1)', function t() {
	// strideY=-1 with leny=3; caller-supplied offsetY = leny - 1 = 2.
	var tc = findCase( 'notrans_negincy' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 10.0, 20.0, 30.0 ] );
	dla_geamv( 'no-transpose', 3, 3, 1.0, A3, 1, 4, 0, x, 1, 0, 1.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: notrans_incx2 (non-unit x stride)', function t() {
	var tc = findCase( 'notrans_incx2' );
	var A = new Float64Array( [ 1.0, 3.0, 5.0, 0.0, 2.0, 4.0, 6.0, 0.0 ] );
	var x = new Float64Array( [ 2.0, 0.0, -3.0 ] );
	var y = new Float64Array( [ 0.0, 0.0, 0.0 ] );
	dla_geamv( 'no-transpose', 3, 2, 1.0, A, 1, 4, 0, x, 2, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: trans_negincx_negincy', function t() {
	// strideX=-1, offsetX = lenx-1 = 2; strideY=-1, offsetY = leny-1 = 2.
	var tc = findCase( 'trans_negincx_negincy' );
	var x = new Float64Array( [ 1.0, -2.0, 3.0 ] );
	var y = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	dla_geamv( 'transpose', 3, 3, 1.0, A3, 1, 4, 0, x, -1, 2, 1.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dla_geamv: symbolic_zero_row', function t() {
	// Row 0 of A is all zero, starting y is zero, so y[0] must remain exactly zero.
	var tc = findCase( 'symbolic_zero_row' );
	var A = new Float64Array( [ 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var y = new Float64Array( [ 0.0, 0.0 ] );
	dla_geamv( 'no-transpose', 2, 2, 1.0, A, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
	assert.equal( y[ 0 ], 0.0, 'symbolic zero preserved' );
});

test( 'dla_geamv: notrans with beta=0 and nonzero y initial', function t() {
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var y = new Float64Array( [ 999.0, 999.0 ] );
	dla_geamv( 'no-transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );

	// Exact: y[0] = |1|+|3| = 4; y[1] = |2|+|4| = 6. SAFE1 perturbation absorbed.
	assertClose( y[ 0 ], 4.0, 1e-14, 'y[0]' );
	assertClose( y[ 1 ], 6.0, 1e-14, 'y[1]' );
});

test( 'dla_geamv: transpose with beta=0 starting from zero y', function t() {
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var y = new Float64Array( [ 0.0, 0.0 ] );
	dla_geamv( 'transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );

	// y[0] = |1|*1 + |2|*1 = 3; y[1] = |3|*1 + |4|*1 = 7
	assertClose( y[ 0 ], 3.0, 1e-14, 'y[0]' );
	assertClose( y[ 1 ], 7.0, 1e-14, 'y[1]' );
});

test( 'dla_geamv: alpha=0, beta=0.5 scales |y|', function t() {
	// Covers the alpha=0 skip plus beta scaling on the no-trans path (not a quick return).
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var y = new Float64Array( [ -4.0, 6.0 ] );
	dla_geamv( 'no-transpose', 2, 2, 0.0, A, 1, 2, 0, x, 1, 0, 0.5, y, 1, 0 );

	// beta*|y| => [0.5*4, 0.5*6] = [2, 3].
	assertClose( y[ 0 ], 2.0, 1e-14, 'y[0]' );
	assertClose( y[ 1 ], 3.0, 1e-14, 'y[1]' );
});

test( 'dla_geamv: transpose alpha=0, beta=0.5', function t() {
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var y = new Float64Array( [ -4.0, 6.0 ] );
	dla_geamv( 'transpose', 2, 2, 0.0, A, 1, 2, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertClose( y[ 0 ], 2.0, 1e-14, 'y[0]' );
	assertClose( y[ 1 ], 3.0, 1e-14, 'y[1]' );
});

test( 'dla_geamv.ndarray throws for invalid trans', function t() {
	assert.throws( function throws() {
		dla_geamv( 'bogus', 2, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dla_geamv.ndarray throws for negative M', function t() {
	assert.throws( function throws() {
		dla_geamv( 'no-transpose', -1, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dla_geamv.ndarray throws for negative N', function t() {
	assert.throws( function throws() {
		dla_geamv( 'no-transpose', 2, -1, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dla_geamv.ndarray throws for zero strideX', function t() {
	assert.throws( function throws() {
		dla_geamv( 'no-transpose', 2, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 0, 0, 0.0, new Float64Array( 2 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dla_geamv.ndarray throws for zero strideY', function t() {
	assert.throws( function throws() {
		dla_geamv( 'no-transpose', 2, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 0, 0 );
	}, /invalid argument/ );
});

test( 'dla_geamv: transpose symbolic zero column', function t() {
	// Column of A^T accessed when looping transpose: A(:,1) is zero column.
	var A = new Float64Array( [ 0.0, 0.0, 1.0, 1.0 ] );
	var x = new Float64Array( [ 1.0, 1.0 ] );
	var y = new Float64Array( [ 0.0, 0.0 ] );
	dla_geamv( 'transpose', 2, 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );

	// y[0] = |A(0,0)|+|A(1,0)| = 0+0 = 0 (symbolic zero), y[1] = 1+1 = 2
	assert.equal( y[ 0 ], 0.0, 'symbolic zero preserved' );
	assertClose( y[ 1 ], 2.0, 1e-14, 'y[1]' );
});
