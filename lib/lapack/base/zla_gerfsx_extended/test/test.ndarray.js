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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, max-lines, max-lines-per-function, max-statements */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zgetrs from './../../zgetrs/lib/base.js';
import zla_gerfsx_extended from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_gerfsx_extended.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parse );

// Matrix A used in the notrans and conjtrans cases (column-major):
var A_NOTRANS_DATA = [
	4.0,
	1.0,
	1.0,
	0.0,
	0.5,
	0.2,
	1.0,
	-0.5,
	3.0,
	0.5,
	0.2,
	0.1,
	0.3,
	0.1,
	0.4,
	-0.2,
	2.5,
	0.3
];
var B_NOTRANS_DATA = [
	1.0,
	0.5,
	2.0,
	-0.5,
	0.5,
	1.0
];


// FUNCTIONS //

/**
* Parses a single JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed fixture
*/
function parse( line ) {
	return JSON.parse( line );
}

/**
* Finds a test fixture by name.
*
* @private
* @param {string} name - fixture case name
* @returns {Object} matching fixture object
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
* Asserts that two scalar values are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} atol - absolute tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, atol, msg ) {
	var scale = Math.max( Math.abs( expected ), 1.0 );
	var diff = Math.abs( actual - expected );
	assert.ok( diff <= atol * scale, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are elementwise close.
*
* @private
* @param {ArrayLikeObject} actual - actual values
* @param {ArrayLikeObject} expected - expected values
* @param {number} atol - absolute tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, atol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], atol, msg + '[' + i + ']' );
	}
}

/**
* Reinterprets a Complex128Array as a plain Array for comparison.
*
* @private
* @param {Complex128Array} z - complex array
* @returns {Array} plain array of interleaved `[re, im]` pairs
*/
function toArr( z ) {
	var out = [];
	var v = reinterpret( z, 0 );
	var i;
	for ( i = 0; i < v.length; i++ ) {
		out.push( v[ i ] );
	}
	return out;
}

/**
* Factorizes `A` and computes the initial solution `Y = op(A)^{-1} * B`.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - coefficient matrix
* @param {Complex128Array} B - right-hand side
* @param {string} trans - transpose option
* @returns {Object} object containing `AF`, `IPIV`, and `Y`
*/
function factorAndSolve( N, A, B, trans ) {
	var IPIV;
	var afv;
	var AF;
	var av;
	var bv;
	var yv;
	var Y;
	var i;

	IPIV = new Int32Array( N );
	AF = new Complex128Array( N * N );
	Y = new Complex128Array( N );
	afv = reinterpret( AF, 0 );
	av = reinterpret( A, 0 );
	bv = reinterpret( B, 0 );
	yv = reinterpret( Y, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		afv[ i ] = av[ i ];
	}
	for ( i = 0; i < 2 * N; i++ ) {
		yv[ i ] = bv[ i ];
	}
	zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	zgetrs( trans, N, 1, AF, 1, N, 0, IPIV, 1, 0, Y, 1, N, 0 );
	return {
		'AF': AF,
		'IPIV': IPIV,
		'Y': Y
	};
}

/**
* Runs `zla_gerfsx_extended` for a single-RHS 3x3 case with the shared A matrix.
*
* @private
* @param {string} trans - transpose option
* @param {boolean} colequ - whether to use column equilibration
* @param {integer} n_norms - number of error bounds
* @param {number} rcond - reciprocal condition estimate
* @param {integer} ithresh - maximum refinement iterations
* @param {boolean} ignore_cwise - whether to ignore componentwise
* @param {Complex128Array} [Ypre] - optional pre-initialized Y (defaults to solve result)
* @returns {Object} object with `Y`, `BERR_OUT`, `ERRS_N`, `ERRS_C`, and `info`
*/
function runCase( trans, colequ, n_norms, rcond, ithresh, ignore_cwise, Ypre ) {
	var BERR_OUT;
	var Y_TAIL;
	var ERRS_C;
	var ERRS_N;
	var info;
	var AYB;
	var RES;
	var DY;
	var fs;
	var A;
	var B;
	var C;
	var Y;

	A = new Complex128Array( A_NOTRANS_DATA );
	B = new Complex128Array( B_NOTRANS_DATA );
	fs = factorAndSolve( 3, A, B, trans );
	C = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( 1 );
	ERRS_N = new Float64Array( 3 );
	ERRS_C = new Float64Array( 3 );
	RES = new Complex128Array( 3 );
	AYB = new Float64Array( 3 );
	DY = new Complex128Array( 3 );
	Y_TAIL = new Complex128Array( 3 );
	Y = Ypre || fs.Y;
	info = zla_gerfsx_extended( 2, trans, 3, 1, A, 1, 3, 0, fs.AF, 1, 3, 0, fs.IPIV, 1, 0, colequ, C, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, BERR_OUT, 1, 0, n_norms, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, rcond, ithresh, 0.5, 0.25, ignore_cwise );
	return {
		'Y': Y,
		'BERR_OUT': BERR_OUT,
		'ERRS_N': ERRS_N,
		'ERRS_C': ERRS_C,
		'info': info
	};
}


// TESTS //

test( 'zla_gerfsx_extended: exports a function', function t() {
	assert.equal( typeof zla_gerfsx_extended, 'function' );
});

test( 'zla_gerfsx_extended: notrans_basic', function t() {
	var tc = findCase( 'notrans_basic' );
	var r = runCase( 'no-transpose', true, 2, 1e-3, 10, false, null );
	assert.equal( r.info, 0 );
	assertArrayClose( toArr( r.Y ), tc.Y, 1e-13, 'Y' );
	assertArrayClose( r.BERR_OUT, tc.BERR_OUT, 1e-12, 'BERR_OUT' );
	assertArrayClose( r.ERRS_N, tc.ERRS_N, 1e-12, 'ERRS_N' );
	assertArrayClose( r.ERRS_C, tc.ERRS_C, 1e-12, 'ERRS_C' );
});

test( 'zla_gerfsx_extended: conjtrans_basic', function t() {
	var tc = findCase( 'conjtrans_basic' );
	var r = runCase( 'conjugate-transpose', false, 2, 1e-3, 10, false, null );
	assert.equal( r.info, 0 );
	assertArrayClose( toArr( r.Y ), tc.Y, 1e-13, 'Y' );
	assertArrayClose( r.BERR_OUT, tc.BERR_OUT, 1e-12, 'BERR_OUT' );
	assertArrayClose( r.ERRS_N, tc.ERRS_N, 1e-12, 'ERRS_N' );
	assertArrayClose( r.ERRS_C, tc.ERRS_C, 1e-12, 'ERRS_C' );
});

test( 'zla_gerfsx_extended: no_equ (2x2, N_NORMS=1)', function t() {
	var BERR_OUT;
	var Y_TAIL;
	var ERRS_C;
	var ERRS_N;
	var info;
	var AYB;
	var RES;
	var DY;
	var fs;
	var tc;
	var A;
	var B;
	var C;

	A = new Complex128Array([
		2.0,
		0.5,
		0.5,
		0.1,
		0.3,
		-0.1,
		3.0,
		0.2
	]);
	B = new Complex128Array([
		1.0,
		0.0,
		0.5,
		1.0
	]);
	tc = findCase( 'no_equ' );
	fs = factorAndSolve( 2, A, B, 'no-transpose' );
	C = new Float64Array( [ 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( 1 );
	ERRS_N = new Float64Array( 3 );
	ERRS_C = new Float64Array( 3 );
	RES = new Complex128Array( 2 );
	AYB = new Float64Array( 2 );
	DY = new Complex128Array( 2 );
	Y_TAIL = new Complex128Array( 2 );
	info = zla_gerfsx_extended( 2, 'no-transpose', 2, 1, A, 1, 2, 0, fs.AF, 1, 2, 0, fs.IPIV, 1, 0, false, C, 1, 0, B, 1, 2, 0, fs.Y, 1, 2, 0, BERR_OUT, 1, 0, 1, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assertArrayClose( toArr( fs.Y ), tc.Y, 1e-13, 'Y' );
	assertArrayClose( BERR_OUT, tc.BERR_OUT, 1e-12, 'BERR_OUT' );
	assertArrayClose( ERRS_N, tc.ERRS_N, 1e-12, 'ERRS_N' );

	// N_NORMS = 1 → ERRS_C is never written; slot 2 should remain zero.
	assert.equal( ERRS_C[ 1 ], 0.0, 'ERRS_C slot 2 untouched' );
});

test( 'zla_gerfsx_extended: n_zero (quick return)', function t() {
	var BERR_OUT = new Float64Array( [ 42.0 ] );
	var ERRS_N = new Float64Array( [ 99.0, 99.0, 99.0 ] );
	var ERRS_C = new Float64Array( [ 88.0, 88.0, 88.0 ] );
	var info = zla_gerfsx_extended( 2, 'no-transpose', 0, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, false, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, BERR_OUT, 1, 0, 2, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, 1e-3, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assert.equal( BERR_OUT[ 0 ], 42.0 );
	assert.equal( ERRS_N[ 0 ], 99.0 );
	assert.equal( ERRS_C[ 0 ], 88.0 );
});

test( 'zla_gerfsx_extended: ignore_cwise', function t() {
	var tc = findCase( 'ignore_cwise' );
	var r = runCase( 'no-transpose', true, 1, 1e-3, 10, true, null );
	assert.equal( r.info, 0 );
	assertArrayClose( toArr( r.Y ), tc.Y, 1e-13, 'Y' );
	assertArrayClose( r.BERR_OUT, tc.BERR_OUT, 1e-12, 'BERR_OUT' );
	assertArrayClose( r.ERRS_N, tc.ERRS_N, 1e-12, 'ERRS_N' );
});

test( 'zla_gerfsx_extended: rcond=0 triggers precision promotion', function t() {
	var r = runCase( 'no-transpose', true, 2, 0.0, 10, false, null );
	assert.equal( r.info, 0 );
});

test( 'zla_gerfsx_extended: ithresh=1 single-iteration', function t() {
	var r = runCase( 'no-transpose', true, 2, 1e-3, 1, false, null );
	assert.equal( r.info, 0 );
});

test( 'zla_gerfsx_extended: yk=0 with nonzero dyk', function t() {
	var fs;
	var fv;
	var A;
	var B;
	var r;

	A = new Complex128Array( A_NOTRANS_DATA );
	B = new Complex128Array( B_NOTRANS_DATA );
	fs = factorAndSolve( 3, A, B, 'no-transpose' );
	fv = reinterpret( fs.Y, 0 );
	fv[ 0 ] = 0.0;
	fv[ 1 ] = 0.0;
	r = runCase( 'no-transpose', true, 2, 1e-3, 10, false, fs.Y );
	assert.equal( r.info, 0 );
});

test( 'zla_gerfsx_extended: transpose trans_type', function t() {
	var r = runCase( 'transpose', true, 2, 1e-3, 10, false, null );
	assert.equal( r.info, 0 );
});

test( 'zla_gerfsx_extended: rcond=0 ithresh=100 forces EXTRA_Y path', function t() {
	// rcond=0 makes `incr_prec` always set, driving y_prec_state to EXTRA_Y
	// quickly so subsequent iterations exercise the `zla_wwaddw` update
	// path and the `x_state === EXTRA_Y` transition branches.
	var r = runCase( 'no-transpose', true, 2, 0.0, 100, false, null );
	assert.equal( r.info, 0 );
});

test( 'zla_gerfsx_extended: large rthresh forces NOPROG state', function t() {
	var BERR_OUT;
	var Y_TAIL;
	var ERRS_C;
	var ERRS_N;
	var info;
	var AYB;
	var RES;
	var DY;
	var fs;
	var A;
	var B;
	var C;

	// Very large rthresh (well above 1.0) prevents progress being detected, so the dxrat > rthresh branch is effectively never taken and we stay in WORKING. Together with a very small dz_ub, this forces the Z_STATE unstable/working oscillation branches.
	BERR_OUT = new Float64Array( 1 );
	ERRS_C = new Float64Array( 3 );
	ERRS_N = new Float64Array( 3 );
	Y_TAIL = new Complex128Array( 3 );
	AYB = new Float64Array( 3 );
	DY = new Complex128Array( 3 );
	RES = new Complex128Array( 3 );
	C = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	A = new Complex128Array( A_NOTRANS_DATA );
	B = new Complex128Array( B_NOTRANS_DATA );
	fs = factorAndSolve( 3, A, B, 'no-transpose' );
	info = zla_gerfsx_extended( 2, 'no-transpose', 3, 1, A, 1, 3, 0, fs.AF, 1, 3, 0, fs.IPIV, 1, 0, false, C, 1, 0, B, 1, 3, 0, fs.Y, 1, 3, 0, BERR_OUT, 1, 0, 2, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 0.0, 100, 2.0, 1e-18, false );
	assert.equal( info, 0 );
});

test( 'zla_gerfsx_extended: zero Y triggers HUGEVAL dx_x branch', function t() {
	var BERR_OUT;
	var Y_TAIL;
	var ERRS_C;
	var ERRS_N;
	var info;
	var AYB;
	var RES;
	var DY;
	var fs;
	var yv;
	var A;
	var B;
	var C;
	var i;

	// Force Y := 0 so that yk = 0 for all i and dyk > 0, causing `dz_z = HUGEVAL` and `normx = 0` to hit the `normdx !== 0` branch.
	BERR_OUT = new Float64Array( 1 );
	ERRS_C = new Float64Array( 3 );
	ERRS_N = new Float64Array( 3 );
	Y_TAIL = new Complex128Array( 3 );
	AYB = new Float64Array( 3 );
	DY = new Complex128Array( 3 );
	RES = new Complex128Array( 3 );
	C = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	A = new Complex128Array( A_NOTRANS_DATA );
	B = new Complex128Array( B_NOTRANS_DATA );
	fs = factorAndSolve( 3, A, B, 'no-transpose' );
	yv = reinterpret( fs.Y, 0 );
	for ( i = 0; i < 6; i++ ) {
		yv[ i ] = 0.0;
	}
	info = zla_gerfsx_extended( 2, 'no-transpose', 3, 1, A, 1, 3, 0, fs.AF, 1, 3, 0, fs.IPIV, 1, 0, false, C, 1, 0, B, 1, 3, 0, fs.Y, 1, 3, 0, BERR_OUT, 1, 0, 2, ERRS_N, 1, 1, 0, ERRS_C, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1e-3, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'zla_gerfsx_extended: nrhs=2 multi-rhs', function t() {
	var BERR_OUT;
	var Y_TAIL;
	var ERRS_C;
	var ERRS_N;
	var info;
	var fs1;
	var AYB;
	var RES;
	var DY;
	var tc;
	var fv;
	var yv;
	var A;
	var B;
	var C;
	var Y;
	var i;

	BERR_OUT = new Float64Array( 2 );
	ERRS_C = new Float64Array( 2 * 3 );
	ERRS_N = new Float64Array( 2 * 3 );
	Y_TAIL = new Complex128Array( 3 );
	tc = findCase( 'notrans_basic' );
	A = new Complex128Array( A_NOTRANS_DATA );
	B = new Complex128Array([
		1.0,
		0.5,
		2.0,
		-0.5,
		0.5,
		1.0,
		1.0,
		0.5,
		2.0,
		-0.5,
		0.5,
		1.0
	]);
	fs1 = factorAndSolve( 3, A, new Complex128Array( B_NOTRANS_DATA ), 'no-transpose' );
	Y = new Complex128Array( 6 );
	yv = reinterpret( Y, 0 );
	fv = reinterpret( fs1.Y, 0 );
	AYB = new Float64Array( 3 );
	DY = new Complex128Array( 3 );
	RES = new Complex128Array( 3 );
	C = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	for ( i = 0; i < 6; i++ ) {
		yv[ i ] = fv[ i ];
		yv[ 6 + i ] = fv[ i ];
	}
	info = zla_gerfsx_extended( 2, 'no-transpose', 3, 2, A, 1, 3, 0, fs1.AF, 1, 3, 0, fs1.IPIV, 1, 0, true, C, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, BERR_OUT, 1, 0, 2, ERRS_N, 1, 2, 0, ERRS_C, 1, 2, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1e-3, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assertClose( BERR_OUT[ 0 ], tc.BERR_OUT[ 0 ], 1e-12, 'BERR_OUT[0]' );
	assertClose( BERR_OUT[ 1 ], tc.BERR_OUT[ 0 ], 1e-12, 'BERR_OUT[1]' );
});
