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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len, max-lines */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/base.js';
import dgbtrs from './../../dgbtrs/lib/base.js';
import dla_gbrfsx_extended from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureText = readFileSync( path.join( fixtureDir, 'dla_gbrfsx_extended.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var fixtureLines = fixtureText.trim().split( '\n' );
var fixture = fixtureLines.map( parseLine );


// FUNCTIONS //

/**
* Parses a fixture JSONL line.
*
* @private
* @param {string} line - JSONL row
* @returns {Object} parsed fixture row
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Looks up a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture row
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
* Asserts numerical closeness within a mixed absolute/relative tolerance.
*
* @private
* @param {number} actual - observed value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (rel err ' + relErr + ')' );
}

/**
* Asserts that two arrays are numerically close element-wise.
*
* @private
* @param {Array} actual - observed array
* @param {Array} expected - expected array
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
* Builds a 4x4 tridiagonal column-major banded system pre-factored with dgbtrf.
*
* @private
* @returns {Object} system data
*/
function buildTridiag() {
	var LDAFB = 4;
	var LDAB = 3;
	var IPIV = new Int32Array( 4 );
	var info;
	var AFB = new Float64Array( LDAFB * 4 );
	var AB = new Float64Array( LDAB * 4 );

	AB[ 1 ] = 4.0;
	AB[ 2 ] = -1.0;
	AB[ 3 ] = 0.5;
	AB[ 4 ] = 4.0;
	AB[ 5 ] = -1.0;
	AB[ 6 ] = 0.5;
	AB[ 7 ] = 4.0;
	AB[ 8 ] = -1.0;
	AB[ 9 ] = 0.5;
	AB[ 10 ] = 4.0;

	AFB[ 1 ] = AB[ 0 ];
	AFB[ 2 ] = AB[ 1 ];
	AFB[ 3 ] = AB[ 2 ];
	AFB[ 5 ] = AB[ 3 ];
	AFB[ 6 ] = AB[ 4 ];
	AFB[ 7 ] = AB[ 5 ];
	AFB[ 9 ] = AB[ 6 ];
	AFB[ 10 ] = AB[ 7 ];
	AFB[ 11 ] = AB[ 8 ];
	AFB[ 13 ] = AB[ 9 ];
	AFB[ 14 ] = AB[ 10 ];

	info = dgbtrf( 4, 4, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgbtrf should succeed' );

	return {
		'AB': AB,
		'AFB': AFB,
		'IPIV': IPIV,
		'N': 4,
		'kl': 1,
		'ku': 1,
		'LDAB': LDAB,
		'LDAFB': LDAFB
	};
}

/**
* Performs an initial LU-solve against a banded system.
*
* @private
* @param {Object} sys - banded system from buildTridiag
* @param {Float64Array} B - right-hand side
* @param {PositiveInteger} nrhs - number of right-hand sides
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @returns {Float64Array} initial iterate
*/
function initialSolve( sys, B, nrhs, trans ) {
	var Y = new Float64Array( B.length );
	var i;
	for ( i = 0; i < B.length; i++ ) {
		Y[ i ] = B[ i ];
	}
	dgbtrs( trans, sys.N, sys.kl, sys.ku, nrhs, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, Y, 1, sys.N, 0 );
	return Y;
}

/**
* Returns a length-3 err-bounds buffer initialized to ones.
*
* @private
* @param {PositiveInteger} nrhs - number of right-hand sides
* @returns {Float64Array} buffer
*/
function makeErrBuf( nrhs ) {
	var buf = new Float64Array( nrhs * 3 );
	var i;
	for ( i = 0; i < buf.length; i++ ) {
		buf[ i ] = 1.0;
	}
	return buf;
}


// TESTS //

test( 'dla_gbrfsx_extended: tridiag_notrans', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var tc;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	tc = findCase( 'tridiag_notrans' );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'berr_out' );
	assertClose( EBN[ nrhs + 0 ], tc.err_norm[ 0 ], 1e-12, 'err_norm' );
	assertClose( EBC[ nrhs + 0 ], tc.err_comp[ 0 ], 1e-12, 'err_comp' );
});

test( 'dla_gbrfsx_extended: tridiag_trans', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var tc;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'transpose' );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	tc = findCase( 'tridiag_trans' );
	info = dla_gbrfsx_extended( 2, 'transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'berr_out' );
});

test( 'dla_gbrfsx_extended: multi_rhs_colequ', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var tc;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 2;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 0.5, 1.5, -1.0, 2.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	C = new Float64Array( [ 1.1, 1.2, 1.3, 1.4 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	tc = findCase( 'multi_rhs_colequ' );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, true, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y1, 1e-13, 'y1' );
	assertArrayClose( Array.prototype.slice.call( Y, N, 2 * N ), tc.y2, 1e-13, 'y2' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'berr_out' );
});

test( 'dla_gbrfsx_extended: ignore_cwise_true', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var tc;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	tc = findCase( 'ignore_cwise_true' );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, true );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
});

test( 'dla_gbrfsx_extended: n_norms_zero', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var tc;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	tc = findCase( 'n_norms_zero' );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 0, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
});

test( 'dla_gbrfsx_extended: perturbed initial iterate exercises refinement', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 0.1;
	Y[ 2 ] -= 0.05;
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assert.ok( BERR_OUT[ 0 ] >= 0, 'berr computed' );
});

test( 'dla_gbrfsx_extended: colequ=true with perturbation covers scaled norm path', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 0.2;
	Y[ 3 ] -= 0.15;
	C = new Float64Array( [ 1.1, 1.2, 1.3, 1.4 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, true, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: huge initial Y runs the full refinement loop', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = new Float64Array( [ 100.0, -50.0, 25.0, -10.0 ] );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.9, 0.5, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: tiny rcond triggers incr_prec via the componentwise guard', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 1e-8;
	Y[ 1 ] -= 1e-8;
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-300, 20, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: ignore_cwise=true path with near-converged Y', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 1e-10;
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, true );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: N=1 trivial system', function t() {
	var BERR_OUT;
	var IPIV;
	var info;
	var AFB;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var AB;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	N = 1;
	AB = new Float64Array( [ 2.0 ] );
	AFB = new Float64Array( [ 2.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	C = new Float64Array( [ 1.0 ] );
	B = new Float64Array( [ 4.0 ] );
	Y = new Float64Array( [ 2.0 ] );
	BERR_OUT = new Float64Array( 1 );
	EBN = makeErrBuf( 1 );
	EBC = makeErrBuf( 1 );
	RES = new Float64Array( 1 );
	AYB = new Float64Array( 1 );
	DY = new Float64Array( 1 );
	YT = new Float64Array( 1 );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assertClose( Y[ 0 ], 2.0, 1e-14, 'Y[0]' );
});

test( 'dla_gbrfsx_extended: Y[0]=0 triggers HUGEVAL guard path', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 0.5, 4.5, 3.5, 3.0 ] );
	Y = new Float64Array( [ 0.0, 1.0, 1.0, 1.0 ] );
	Y[ 1 ] += 0.01;
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: zero B and zero Y takes normx=0 fast path', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( N );
	Y = new Float64Array( N );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: tiny Y with nonzero B forces dz_z transition', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = new Float64Array( [ 1e-6, 1e-6, 1e-6, 1e-6 ] );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: Y=0 with nonzero B hits dx_x=HUGEVAL branch', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = new Float64Array( N );
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: ithresh=1 exits with WORKING x_state', function t() {
	var BERR_OUT;
	var info;
	var nrhs;
	var sys;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	sys = buildTridiag();
	N = sys.N;
	nrhs = 1;
	B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 0.01;
	Y[ 2 ] -= 0.005;
	C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	BERR_OUT = new Float64Array( nrhs );
	EBN = makeErrBuf( nrhs );
	EBC = makeErrBuf( nrhs );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 1, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: nrhs=0 quick return', function t() {
	var BERR_OUT;
	var IPIV;
	var info;
	var AFB;
	var EBN;
	var EBC;
	var AYB;
	var RES;
	var AB;
	var DY;
	var YT;
	var N;
	var B;
	var Y;
	var C;
	N = 4;
	AB = new Float64Array( 12 );
	AFB = new Float64Array( 16 );
	IPIV = new Int32Array( N );
	C = new Float64Array( N );
	B = new Float64Array( N );
	Y = new Float64Array( N );
	BERR_OUT = new Float64Array( 1 );
	EBN = new Float64Array( 3 );
	EBC = new Float64Array( 3 );
	RES = new Float64Array( N );
	AYB = new Float64Array( N );
	DY = new Float64Array( N );
	YT = new Float64Array( N );
	info = dla_gbrfsx_extended( 2, 'no-transpose', N, 1, 1, 0, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});
