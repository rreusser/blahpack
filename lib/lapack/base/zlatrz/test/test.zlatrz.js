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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatrz from './../lib/zlatrz.js';


// FUNCTIONS //

/**
* Builds the 3-by-5 column-major upper trapezoidal test matrix used in several tests.
*
* @private
* @returns {Complex128Array} fresh matrix
*/
function buildA3x5() {
	var out = new Complex128Array( 15 );
	var av = reinterpret( out, 0 );
	av[ 0 ] = 4.0;
	av[ 1 ] = 0.5;
	av[ 6 ] = 1.0;
	av[ 7 ] = -0.2;
	av[ 8 ] = 5.0;
	av[ 9 ] = 0.3;
	av[ 12 ] = 2.0;
	av[ 13 ] = 0.3;
	av[ 14 ] = 1.0;
	av[ 15 ] = 0.1;
	av[ 16 ] = 6.0;
	av[ 17 ] = 0.4;
	av[ 18 ] = 3.0;
	av[ 19 ] = 0.1;
	av[ 20 ] = 2.0;
	av[ 21 ] = 0.2;
	av[ 22 ] = 1.0;
	av[ 23 ] = -0.2;
	av[ 24 ] = 1.0;
	av[ 25 ] = -0.4;
	av[ 26 ] = 4.0;
	av[ 27 ] = -0.5;
	av[ 28 ] = 2.0;
	av[ 29 ] = 0.6;
	return out;
}

/**
* Permutes a 3-by-5 column-major interleaved array to row-major layout.
*
* @private
* @param {Float64Array} src - column-major interleaved data of length 30
* @returns {Float64Array} row-major interleaved data of length 30
*/
function colToRow3x5( src ) {
	var out;
	var cm;
	var rm;
	var i;
	var j;
	out = new Float64Array( 30 );
	for ( i = 0; i < 3; i++ ) {
		for ( j = 0; j < 5; j++ ) {
			cm = 2 * ( i + ( j * 3 ) );
			rm = 2 * ( ( i * 5 ) + j );
			out[ rm ] = src[ cm ];
			out[ rm + 1 ] = src[ cm + 1 ];
		}
	}
	return out;
}


// TESTS //

test( 'zlatrz is a function', function t() {
	assert.strictEqual( typeof zlatrz, 'function', 'is a function' );
});

test( 'zlatrz has expected arity', function t() {
	assert.strictEqual( zlatrz.length, 10, 'has expected arity' );
});

test( 'zlatrz throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlatrz( 'invalid', 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlatrz throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlatrz( 'row-major', -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zlatrz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatrz( 'row-major', 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zlatrz throws RangeError for LDA < max(1,M) when column-major', function t() {
	assert.throws( function throws() {
		zlatrz( 'column-major', 3, 5, 2, new Complex128Array( 15 ), 2, new Complex128Array( 3 ), 1, new Complex128Array( 3 ), 1 );
	}, RangeError );
});

test( 'zlatrz throws RangeError for LDA < max(1,N) when row-major', function t() {
	assert.throws( function throws() {
		zlatrz( 'row-major', 3, 5, 2, new Complex128Array( 15 ), 3, new Complex128Array( 3 ), 1, new Complex128Array( 3 ), 1 );
	}, RangeError );
});

test( 'zlatrz column-major: 3x5 L=2 reduces A and produces non-zero TAU', function t() {
	var work;
	var TAU;
	var out;
	var sum;
	var tv;
	var av;
	var A;

	work = new Complex128Array( 3 );
	TAU = new Complex128Array( 3 );
	A = buildA3x5();
	av = reinterpret( A, 0 );

	out = zlatrz( 'column-major', 3, 5, 2, A, 3, TAU, 1, work, 1 );
	assert.strictEqual( out, A, 'returns A' );

	// A(0,0) is modified by the elementary reflector:
	assert.notStrictEqual( av[ 0 ], 4.0, 'A(0,0) modified by reflector' );

	// TAU should contain non-zero entries:
	tv = reinterpret( TAU, 0 );
	sum = Math.abs( tv[ 0 ] ) + Math.abs( tv[ 2 ] ) + Math.abs( tv[ 4 ] );
	assert.ok( sum > 0.0, 'TAU is non-zero' );
});

test( 'zlatrz row-major: agrees with column-major on the same matrix', function t() {
	var workCM;
	var workRM;
	var TAUcm;
	var TAUrm;
	var Acm;
	var Arm;
	var tcv;
	var trv;
	var av;
	var cm;
	var rm;
	var rv;
	var i;
	var j;

	workCM = new Complex128Array( 3 );
	workRM = new Complex128Array( 3 );
	TAUcm = new Complex128Array( 3 );
	TAUrm = new Complex128Array( 3 );

	Acm = buildA3x5();
	av = reinterpret( Acm, 0 );

	// Build the row-major equivalent of the same logical matrix:
	Arm = new Complex128Array( 15 );
	rv = reinterpret( Arm, 0 );
	rv.set( colToRow3x5( av ) );

	zlatrz( 'column-major', 3, 5, 2, Acm, 3, TAUcm, 1, workCM, 1 );
	zlatrz( 'row-major', 3, 5, 2, Arm, 5, TAUrm, 1, workRM, 1 );

	// TAU should match between the two layouts:
	tcv = reinterpret( TAUcm, 0 );
	trv = reinterpret( TAUrm, 0 );
	for ( i = 0; i < 6; i++ ) {
		assert.ok( Math.abs( tcv[ i ] - trv[ i ] ) < 1e-12, 'TAU[' + i + '] agrees' );
	}

	// Resulting A entries should agree up to layout permutation:
	for ( i = 0; i < 3; i++ ) {
		for ( j = 0; j < 5; j++ ) {
			cm = 2 * ( i + ( j * 3 ) );
			rm = 2 * ( ( i * 5 ) + j );
			assert.ok( Math.abs( av[ cm ] - rv[ rm ] ) < 1e-12, 'A(' + i + ',' + j + ') re agrees' );
			assert.ok( Math.abs( av[ cm + 1 ] - rv[ rm + 1 ] ) < 1e-12, 'A(' + i + ',' + j + ') im agrees' );
		}
	}
});
