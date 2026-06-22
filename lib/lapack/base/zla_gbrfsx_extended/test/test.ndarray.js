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

/* eslint-disable max-len, max-statements, max-lines-per-function, max-lines, no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import zgbtrs from './../../zgbtrs/lib/base.js';
import zlaExt from './../lib/zla_gbrfsx_extended.js';
import zla_gbrfsx_extended from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_gbrfsx_extended.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line.replace( /Infinity/g, '1e309' ) );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture object
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that a single value is close to its expected value.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	if ( !isFinite( expected ) ) {
		assert.ok( !isFinite( actual ) && ( ( actual > 0 ) === ( expected > 0 ) ), msg + ': expected ' + expected + ', got ' + actual );
		return;
	}
	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two numeric arrays are element-wise close.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - failure message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Sets a complex band element in `AB`.
*
* @private
* @param {Complex128Array} AB - banded storage
* @param {integer} LDAB - leading dimension
* @param {integer} ku - super-diagonal count
* @param {integer} i - row index (0-based)
* @param {integer} j - column index (0-based)
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setBand( AB, LDAB, ku, i, j, re, im ) {
	var idx;
	var v;
	v = reinterpret( AB, 0 );
	idx = ( ( ku + i - j ) + ( j * LDAB ) ) * 2;
	v[ idx ] = re;
	v[ idx + 1 ] = im;
}

/**
* Copies a complex banded matrix `AB` into the LU form storage `AFB`.
*
* @private
* @param {Complex128Array} AB - source banded matrix
* @param {Complex128Array} AFB - destination LU storage
* @param {integer} n - order of the matrix
* @param {integer} kl - subdiagonals
* @param {integer} ku - superdiagonals
* @param {integer} LDAB - leading dimension of AB
* @param {integer} LDAFB - leading dimension of AFB
*/
function copyToAFB( AB, AFB, n, kl, ku, LDAB, LDAFB ) {
	var src;
	var dst;
	var av;
	var fv;
	var i;
	var j;
	av = reinterpret( AB, 0 );
	fv = reinterpret( AFB, 0 );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < kl + ku + 1; i++ ) {
			src = ( i + ( j * LDAB ) ) * 2;
			dst = ( ( i + kl ) + ( j * LDAFB ) ) * 2;
			fv[ dst ] = av[ src ];
			fv[ dst + 1 ] = av[ src + 1 ];
		}
	}
}

/**
* Builds a 4x4 tridiagonal complex banded matrix used in multiple tests.
*
* @private
* @returns {Object} object containing `AB`, `AFB`, and size parameters
*/
function buildTridiag4() {
	var LDAFB;
	var LDAB;
	var AFB;
	var AB;
	var KL;
	var KU;
	var N;
	N = 4;
	KL = 1;
	KU = 1;
	LDAB = 6;
	LDAFB = 6;
	AB = new Complex128Array( LDAB * N );
	AFB = new Complex128Array( LDAFB * N );
	setBand( AB, LDAB, KU, 0, 0, 4.0, 1.0 );
	setBand( AB, LDAB, KU, 1, 0, -1.0, 0.5 );
	setBand( AB, LDAB, KU, 0, 1, 0.5, -0.5 );
	setBand( AB, LDAB, KU, 1, 1, 4.0, 1.0 );
	setBand( AB, LDAB, KU, 2, 1, -1.0, 0.5 );
	setBand( AB, LDAB, KU, 1, 2, 0.5, -0.5 );
	setBand( AB, LDAB, KU, 2, 2, 4.0, 1.0 );
	setBand( AB, LDAB, KU, 3, 2, -1.0, 0.5 );
	setBand( AB, LDAB, KU, 2, 3, 0.5, -0.5 );
	setBand( AB, LDAB, KU, 3, 3, 4.0, 1.0 );
	copyToAFB( AB, AFB, N, KL, KU, LDAB, LDAFB );
	return {
		'AB': AB,
		'AFB': AFB,
		'N': N,
		'KL': KL,
		'KU': KU,
		'LDAB': LDAB,
		'LDAFB': LDAFB
	};
}

/**
* Allocates the single-RHS workspace plus trust-initialized error bounds.
*
* @private
* @param {integer} N - problem size
* @returns {Object} workspace object
*/
function allocSingleRHSWorkspace( N ) {
	var ERR_BNDS_NORM;
	var ERR_BNDS_COMP;
	var BERR_OUT;
	var Y_TAIL;
	var AYB;
	var RES;
	var DY;
	var B;
	var C;
	var Y;
	var i;
	B = new Complex128Array( N );
	Y = new Complex128Array( N );
	RES = new Complex128Array( N );
	DY = new Complex128Array( N );
	Y_TAIL = new Complex128Array( N );
	C = new Float64Array( N );
	AYB = new Float64Array( N );
	BERR_OUT = new Float64Array( 1 );
	ERR_BNDS_NORM = new Float64Array( 3 );
	ERR_BNDS_COMP = new Float64Array( 3 );
	for ( i = 0; i < N; i++ ) {
		C[ i ] = 1.0;
	}
	ERR_BNDS_NORM[ 0 ] = 1.0;
	ERR_BNDS_COMP[ 0 ] = 1.0;
	return {
		'B': B,
		'Y': Y,
		'RES': RES,
		'DY': DY,
		'Y_TAIL': Y_TAIL,
		'C': C,
		'AYB': AYB,
		'BERR_OUT': BERR_OUT,
		'ERR_BNDS_NORM': ERR_BNDS_NORM,
		'ERR_BNDS_COMP': ERR_BNDS_COMP
	};
}

/**
* Copies interleaved real/imaginary values into a complex array.
*
* @private
* @param {Complex128Array} arr - destination array
* @param {Array} vals - interleaved values
*/
function setInterleaved( arr, vals ) {
	var v;
	var i;
	v = reinterpret( arr, 0 );
	for ( i = 0; i < vals.length; i++ ) {
		v[ i ] = vals[ i ];
	}
}

/**
* Runs a single-RHS test case against a fixture.
*
* @private
* @param {string} caseName - fixture name
* @param {string} trans - transpose flag
* @param {Array} bvals - interleaved RHS values
* @param {Array} yOverride - optional explicit initial Y
*/
function runSingleRHS( caseName, trans, bvals, yOverride ) {
	var IPIV;
	var tri;
	var tc;
	var ws;
	var yv;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	tc = findCase( caseName );
	IPIV = new Int32Array( tri.N );
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	if ( yOverride ) {
		setInterleaved( ws.Y, yOverride );
	} else {
		setInterleaved( ws.Y, bvals );
		zgbtrs( trans, tri.N, tri.KL, tri.KU, 1, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, ws.Y, 1, tri.N, 0 );
	}
	zla_gbrfsx_extended( 1, trans, tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, false, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 2, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, false );
	yv = reinterpret( ws.Y, 0 );
	assertArrayClose( Array.prototype.slice.call( yv ), tc.y_r, 1e-12, caseName + ':Y' );
	assertArrayClose( Array.prototype.slice.call( ws.BERR_OUT ), tc.berr_out, 1e-12, caseName + ':berr' );
	assertArrayClose( [ ws.ERR_BNDS_NORM[ 0 ], ws.ERR_BNDS_NORM[ 1 ], ws.ERR_BNDS_NORM[ 2 ] ], tc.err_bnds_norm_row1 || tc.err_bnds_norm_j1, 1e-12, caseName + ':err_norm' );
	assertArrayClose( [ ws.ERR_BNDS_COMP[ 0 ], ws.ERR_BNDS_COMP[ 1 ], ws.ERR_BNDS_COMP[ 2 ] ], tc.err_bnds_comp_row1 || tc.err_bnds_comp_j1, 1e-12, caseName + ':err_comp' );
}


// TESTS //

test( 'zla_gbrfsx_extended: tridiag_notrans', function t() {
	var bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	runSingleRHS( 'tridiag_notrans', 'no-transpose', bvals, null );
});

test( 'zla_gbrfsx_extended: tridiag_conjtrans', function t() {
	var bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	runSingleRHS( 'tridiag_conjtrans', 'conjugate-transpose', bvals, null );
});

test( 'zla_gbrfsx_extended: perturbed_y', function t() {
	var bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	var yInit = [ 0.1, 0.0, 0.2, 0.1, 0.3, -0.1, 0.4, 0.05 ];
	runSingleRHS( 'perturbed_y', 'no-transpose', bvals, yInit );
});

test( 'zla_gbrfsx_extended: multi_rhs_colequ', function t() {
	var ERR_BNDS_NORM;
	var ERR_BNDS_COMP;
	var BERR_OUT;
	var Y_TAIL;
	var bvals;
	var NRHS;
	var IPIV;
	var AYB;
	var RES;
	var tri;
	var tc;
	var yv;
	var DY;
	var B;
	var C;
	var N;
	var Y;
	NRHS = 2;
	bvals = [
		1.0,
		0.0,
		2.0,
		1.0,
		3.0,
		-1.0,
		4.0,
		0.5,
		0.0,
		1.0,
		1.0,
		0.0,
		-1.0,
		2.0,
		2.0,
		-1.0
	];
	tc = findCase( 'multi_rhs_colequ' );
	tri = buildTridiag4();
	N = tri.N;
	IPIV = new Int32Array( N );
	ERR_BNDS_NORM = new Float64Array( NRHS * 3 );
	ERR_BNDS_COMP = new Float64Array( NRHS * 3 );
	BERR_OUT = new Float64Array( NRHS );
	C = new Float64Array( [ 1.0, 0.5, 2.0, 1.5 ] );
	AYB = new Float64Array( N );
	Y_TAIL = new Complex128Array( N );
	RES = new Complex128Array( N );
	DY = new Complex128Array( N );
	B = new Complex128Array( N * NRHS );
	Y = new Complex128Array( N * NRHS );
	setInterleaved( B, bvals );
	zgbtrf( N, N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( Y, bvals );
	zgbtrs( 'no-transpose', N, tri.KL, tri.KU, NRHS, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, Y, 1, N, 0 );
	ERR_BNDS_NORM[ 0 ] = 1.0;
	ERR_BNDS_NORM[ 1 ] = 1.0;
	ERR_BNDS_COMP[ 0 ] = 1.0;
	ERR_BNDS_COMP[ 1 ] = 1.0;
	zla_gbrfsx_extended( 1, 'no-transpose', N, tri.KL, tri.KU, NRHS, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, true, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, ERR_BNDS_NORM, 1, NRHS, 0, ERR_BNDS_COMP, 1, NRHS, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, false );
	yv = reinterpret( Y, 0 );
	assertArrayClose( Array.prototype.slice.call( yv ), tc.y_r, 1e-12, 'multi_rhs_colequ:Y' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'multi_rhs_colequ:berr' );
	assertArrayClose( [ ERR_BNDS_NORM[ 0 ], ERR_BNDS_NORM[ 2 ], ERR_BNDS_NORM[ 4 ] ], tc.err_bnds_norm_j1, 1e-12, 'multi_rhs_colequ:norm_j1' );
	assertArrayClose( [ ERR_BNDS_NORM[ 1 ], ERR_BNDS_NORM[ 3 ], ERR_BNDS_NORM[ 5 ] ], tc.err_bnds_norm_j2, 1e-12, 'multi_rhs_colequ:norm_j2' );
	assertArrayClose( [ ERR_BNDS_COMP[ 0 ], ERR_BNDS_COMP[ 2 ], ERR_BNDS_COMP[ 4 ] ], tc.err_bnds_comp_j1, 1e-12, 'multi_rhs_colequ:comp_j1' );
	assertArrayClose( [ ERR_BNDS_COMP[ 1 ], ERR_BNDS_COMP[ 3 ], ERR_BNDS_COMP[ 5 ] ], tc.err_bnds_comp_j2, 1e-12, 'multi_rhs_colequ:comp_j2' );
});

test( 'zla_gbrfsx_extended: one_by_one', function t() {
	var ERR_BNDS_NORM;
	var ERR_BNDS_COMP;
	var BERR_OUT;
	var Y_TAIL;
	var LDAFB;
	var LDAB;
	var IPIV;
	var AYB;
	var AFB;
	var RES;
	var AB;
	var DY;
	var av;
	var fv;
	var bv;
	var yv;
	var tc;
	var B;
	var C;
	var N;
	var Y;
	LDAB = 6;
	LDAFB = 6;
	N = 1;
	tc = findCase( 'one_by_one' );
	AB = new Complex128Array( LDAB * N );
	AFB = new Complex128Array( LDAFB * N );
	IPIV = new Int32Array( N );
	ERR_BNDS_NORM = new Float64Array( 3 );
	ERR_BNDS_COMP = new Float64Array( 3 );
	BERR_OUT = new Float64Array( 1 );
	C = new Float64Array( [ 1.0 ] );
	AYB = new Float64Array( N );
	Y_TAIL = new Complex128Array( N );
	RES = new Complex128Array( N );
	DY = new Complex128Array( N );
	B = new Complex128Array( N );
	Y = new Complex128Array( N );
	av = reinterpret( AB, 0 );
	fv = reinterpret( AFB, 0 );
	bv = reinterpret( B, 0 );
	av[ 0 ] = 3.0;
	av[ 1 ] = 2.0;
	fv[ 0 ] = 3.0;
	fv[ 1 ] = 2.0;
	bv[ 0 ] = 5.0;
	bv[ 1 ] = 1.0;
	zgbtrf( N, N, 0, 0, AFB, 1, LDAFB, 0, IPIV, 1, 0 );
	yv = reinterpret( Y, 0 );
	yv[ 0 ] = 5.0;
	yv[ 1 ] = 1.0;
	zgbtrs( 'no-transpose', N, 0, 0, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0, Y, 1, N, 0 );
	ERR_BNDS_NORM[ 0 ] = 1.0;
	ERR_BNDS_COMP[ 0 ] = 1.0;
	zla_gbrfsx_extended( 1, 'no-transpose', N, 0, 0, 1, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, ERR_BNDS_NORM, 1, 1, 0, ERR_BNDS_COMP, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, false );
	yv = reinterpret( Y, 0 );
	assertArrayClose( [ yv[ 0 ], yv[ 1 ] ], tc.y_r, 1e-12, 'one_by_one:Y' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'one_by_one:berr' );
});

test( 'zla_gbrfsx_extended: ignore_cwise_nnorms0', function t() {
	var bvals;
	var IPIV;
	var tri;
	var tc;
	var ws;
	var yv;
	tc = findCase( 'ignore_cwise_nnorms0' );
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( ws.Y, bvals );
	zgbtrs( 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, ws.Y, 1, tri.N, 0 );
	zla_gbrfsx_extended( 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, false, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 0, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, true );
	yv = reinterpret( ws.Y, 0 );
	assertArrayClose( Array.prototype.slice.call( yv ), tc.y_r, 1e-12, 'ignore_cwise:Y' );
	assertArrayClose( Array.prototype.slice.call( ws.BERR_OUT ), tc.berr_out, 1e-12, 'ignore_cwise:berr' );
});

test( 'zla_gbrfsx_extended: ithresh=1 exit with x_state=WORKING', function t() {
	var bvals;
	var yInit;
	var IPIV;
	var tri;
	var ws;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	yInit = [ 0.1, 0.0, 0.2, 0.1, 0.3, -0.1, 0.4, 0.05 ];
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( ws.Y, yInit );
	zla_gbrfsx_extended( 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, false, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 2, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1.0, 1, 0.5, 0.25, false );
	assert.ok( ws.BERR_OUT[ 0 ] >= 0, 'berr nonneg' );
});

test( 'zla_gbrfsx_extended: tiny rcond forces incr_prec', function t() {
	var bvals;
	var yInit;
	var IPIV;
	var tri;
	var ws;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	yInit = [ 0.15, 0.0, 0.001, 0.0, 0.5, 0.15, 4.0, -0.5 ];
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( ws.Y, yInit );
	zla_gbrfsx_extended( 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, false, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 2, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1e-300, 10, 0.5, 0.25, false );
	assert.ok( ws.BERR_OUT[ 0 ] >= 0, 'berr nonneg' );
});

test( 'zla_gbrfsx_extended: small perturbation grows dxratmax', function t() {
	var bvals;
	var IPIV;
	var tri;
	var ws;
	var yv;
	var i;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( ws.Y, bvals );
	zgbtrs( 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, ws.Y, 1, tri.N, 0 );
	yv = reinterpret( ws.Y, 0 );
	for ( i = 0; i < 8; i++ ) {
		yv[ i ] += ( ( i * 1e-6 ) - 3e-6 );
	}
	zla_gbrfsx_extended( 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, false, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 2, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1.0, 15, 0.9, 1.0, false );
	assert.ok( ws.BERR_OUT[ 0 ] >= 0, 'berr nonneg' );
});

test( 'zla_gbrfsx_extended: zero Y element exercises DZ_Z=HUGEVAL branch', function t() {
	var bvals;
	var IPIV;
	var tri;
	var ws;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	zla_gbrfsx_extended( 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, false, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 2, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, false );
	assert.ok( ws.BERR_OUT[ 0 ] >= 0, 'berr nonneg' );
});

test( 'zla_gbrfsx_extended: colequ with zero scaling triggers normx=0', function t() {
	var bvals;
	var IPIV;
	var tri;
	var ws;
	var i;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	for ( i = 0; i < tri.N; i++ ) {
		ws.C[ i ] = 0.0;
	}
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( ws.Y, bvals );
	zgbtrs( 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, ws.Y, 1, tri.N, 0 );
	zla_gbrfsx_extended( 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.LDAB, 0, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, true, ws.C, 1, 0, ws.B, 1, tri.N, 0, ws.Y, 1, tri.N, 0, ws.BERR_OUT, 1, 0, 2, ws.ERR_BNDS_NORM, 1, 1, 0, ws.ERR_BNDS_COMP, 1, 1, 0, ws.RES, 1, 0, ws.AYB, 1, 0, ws.DY, 1, 0, ws.Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, false );
	assert.ok( ws.BERR_OUT[ 0 ] >= 0, 'berr nonneg' );
});

test( 'zla_gbrfsx_extended: layout wrapper column-major', function t() {
	var bvals;
	var IPIV;
	var tri;
	var ws;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	bvals = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ];
	setInterleaved( ws.B, bvals );
	zgbtrf( tri.N, tri.N, tri.KL, tri.KU, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0 );
	setInterleaved( ws.Y, bvals );
	zgbtrs( 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AFB, 1, tri.LDAFB, 0, IPIV, 1, 0, ws.Y, 1, tri.N, 0 );
	zlaExt( 'column-major', 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, tri.LDAB, tri.AFB, tri.LDAFB, IPIV, 1, 0, false, ws.C, 1, ws.B, tri.N, ws.Y, tri.N, ws.BERR_OUT, 1, 2, ws.ERR_BNDS_NORM, 1, ws.ERR_BNDS_COMP, 1, ws.RES, 1, ws.AYB, 1, ws.DY, 1, ws.Y_TAIL, 1, 1.0, 10, 0.5, 0.25, false );
	assert.ok( ws.BERR_OUT[ 0 ] >= 0, 'berr nonneg' );
});

test( 'zla_gbrfsx_extended: layout wrapper row-major throws on LDAB < N', function t() {
	var IPIV;
	var tri;
	var ws;
	tri = buildTridiag4();
	ws = allocSingleRHSWorkspace( tri.N );
	IPIV = new Int32Array( tri.N );
	assert.throws( function throws() {
		zlaExt( 'row-major', 1, 'no-transpose', tri.N, tri.KL, tri.KU, 1, tri.AB, 1, tri.AFB, tri.LDAFB, IPIV, 1, 0, false, ws.C, 1, ws.B, tri.N, ws.Y, tri.N, ws.BERR_OUT, 1, 2, ws.ERR_BNDS_NORM, 1, ws.ERR_BNDS_COMP, 1, ws.RES, 1, ws.AYB, 1, ws.DY, 1, ws.Y_TAIL, 1, 1.0, 10, 0.5, 0.25, false );
	}, RangeError );
});
