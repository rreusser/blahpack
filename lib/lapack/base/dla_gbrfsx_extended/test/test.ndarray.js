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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const fixtureText = readFileSync( path.join( fixtureDir, 'dla_gbrfsx_extended.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
const fixtureLines = fixtureText.trim().split( '\n' );
const fixture = fixtureLines.map( parseLine );


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
	let i;
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
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = Math.abs( actual - expected ) / denom;
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
	let i;
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
	const LDAFB = 4;
	const LDAB = 3;
	const IPIV = new Int32Array( 4 );
	const AFB = new Float64Array( LDAFB * 4 );
	const AB = new Float64Array( LDAB * 4 );

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

	const info = dgbtrf( 4, 4, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0 );
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
	const Y = new Float64Array( B.length );
	let i;
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
	const buf = new Float64Array( nrhs * 3 );
	let i;
	for ( i = 0; i < buf.length; i++ ) {
		buf[ i ] = 1.0;
	}
	return buf;
}


// TESTS //

test( 'dla_gbrfsx_extended: tridiag_notrans', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const tc = findCase( 'tridiag_notrans' );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'berr_out' );
	assertClose( EBN[ nrhs + 0 ], tc.err_norm[ 0 ], 1e-12, 'err_norm' );
	assertClose( EBC[ nrhs + 0 ], tc.err_comp[ 0 ], 1e-12, 'err_comp' );
});

test( 'dla_gbrfsx_extended: tridiag_trans', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'transpose' );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const tc = findCase( 'tridiag_trans' );
	const info = dla_gbrfsx_extended( 2, 'transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'berr_out' );
});

test( 'dla_gbrfsx_extended: multi_rhs_colequ', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 2;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 0.5, 1.5, -1.0, 2.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	const C = new Float64Array( [ 1.1, 1.2, 1.3, 1.4 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const tc = findCase( 'multi_rhs_colequ' );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, true, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y1, 1e-13, 'y1' );
	assertArrayClose( Array.prototype.slice.call( Y, N, 2 * N ), tc.y2, 1e-13, 'y2' );
	assertArrayClose( Array.prototype.slice.call( BERR_OUT ), tc.berr_out, 1e-12, 'berr_out' );
});

test( 'dla_gbrfsx_extended: ignore_cwise_true', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const tc = findCase( 'ignore_cwise_true' );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, true );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
});

test( 'dla_gbrfsx_extended: n_norms_zero', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const tc = findCase( 'n_norms_zero' );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 0, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, tc.info );
	assertArrayClose( Array.prototype.slice.call( Y, 0, N ), tc.y, 1e-13, 'y' );
});

test( 'dla_gbrfsx_extended: perturbed initial iterate exercises refinement', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 0.1;
	Y[ 2 ] -= 0.05;
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assert.ok( BERR_OUT[ 0 ] >= 0, 'berr computed' );
});

test( 'dla_gbrfsx_extended: colequ=true with perturbation covers scaled norm path', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 0.2;
	Y[ 3 ] -= 0.15;
	const C = new Float64Array( [ 1.1, 1.2, 1.3, 1.4 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, true, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: huge initial Y runs the full refinement loop', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = new Float64Array( [ 100.0, -50.0, 25.0, -10.0 ] );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.9, 0.5, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: tiny rcond triggers incr_prec via the componentwise guard', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 1e-8;
	Y[ 1 ] -= 1e-8;
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-300, 20, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: ignore_cwise=true path with near-converged Y', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 1e-10;
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, true );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: N=1 trivial system', function t() {
	const N = 1;
	const AB = new Float64Array( [ 2.0 ] );
	const AFB = new Float64Array( [ 2.0 ] );
	const IPIV = new Int32Array( [ 0 ] );
	const C = new Float64Array( [ 1.0 ] );
	const B = new Float64Array( [ 4.0 ] );
	const Y = new Float64Array( [ 2.0 ] );
	const BERR_OUT = new Float64Array( 1 );
	const EBN = makeErrBuf( 1 );
	const EBC = makeErrBuf( 1 );
	const RES = new Float64Array( 1 );
	const AYB = new Float64Array( 1 );
	const DY = new Float64Array( 1 );
	const YT = new Float64Array( 1 );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assertClose( Y[ 0 ], 2.0, 1e-14, 'Y[0]' );
});

test( 'dla_gbrfsx_extended: Y[0]=0 triggers HUGEVAL guard path', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 0.5, 4.5, 3.5, 3.0 ] );
	const Y = new Float64Array( [ 0.0, 1.0, 1.0, 1.0 ] );
	Y[ 1 ] += 0.01;
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: zero B and zero Y takes normx=0 fast path', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( N );
	const Y = new Float64Array( N );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: tiny Y with nonzero B forces dz_z transition', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = new Float64Array( [ 1e-6, 1e-6, 1e-6, 1e-6 ] );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: Y=0 with nonzero B hits dx_x=HUGEVAL branch', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = new Float64Array( N );
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: ithresh=1 exits with WORKING x_state', function t() {
	const sys = buildTridiag();
	const N = sys.N;
	const nrhs = 1;
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const Y = initialSolve( sys, B, nrhs, 'no-transpose' );
	Y[ 0 ] += 0.01;
	Y[ 2 ] -= 0.005;
	const C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const BERR_OUT = new Float64Array( nrhs );
	const EBN = makeErrBuf( nrhs );
	const EBC = makeErrBuf( nrhs );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, sys.kl, sys.ku, nrhs, sys.AB, 1, sys.LDAB, 0, sys.AFB, 1, sys.LDAFB, 0, sys.IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, nrhs, 0, EBC, 1, nrhs, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 1, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: nrhs=0 quick return', function t() {
	const N = 4;
	const AB = new Float64Array( 12 );
	const AFB = new Float64Array( 16 );
	const IPIV = new Int32Array( N );
	const C = new Float64Array( N );
	const B = new Float64Array( N );
	const Y = new Float64Array( N );
	const BERR_OUT = new Float64Array( 1 );
	const EBN = new Float64Array( 3 );
	const EBC = new Float64Array( 3 );
	const RES = new Float64Array( N );
	const AYB = new Float64Array( N );
	const DY = new Float64Array( N );
	const YT = new Float64Array( N );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', N, 1, 1, 0, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
});

test( 'dla_gbrfsx_extended: normwise bound is frozen when x converges before the componentwise loop stops', function t() {
	// A = I (kl = ku = 0), b = [1, 1e-17], initial y = [1, 0.9e-17]. Iteration 1: dy = b - y, so dx_x = |dy_2| <= eps (x converges, final_dx_x = dx_x) while dz_z = |dy_2|/|y_2| ~ 0.11 keeps the componentwise state working. Iteration 2: dy ~ 0, z converges and the loop exits. The reported normwise bound must be the dx_x of iteration 1, not the (smaller) dx_x of the last iteration:
	const AB = new Float64Array( [ 1.0, 1.0 ] );
	const AFB = new Float64Array( [ 1.0, 1.0 ] );
	const IPIV = new Int32Array( 2 );
	dgbtrf( 2, 2, 0, 0, AFB, 1, 1, 0, IPIV, 1, 0 );
	const B = new Float64Array( [ 1.0, 1e-17 ] );
	const Y = new Float64Array( [ 1.0, 0.9e-17 ] );
	const expected = B[ 1 ] - Y[ 1 ];
	const EBN = new Float64Array( 3 );
	const EBC = new Float64Array( 3 );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', 2, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, false, new Float64Array( 2 ), 1, 0, B, 1, 2, 0, Y, 1, 2, 0, new Float64Array( 1 ), 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, 1.0, 10, 0.5, 0.25, false );
	assert.equal( info, 0 );
	assert.equal( Y[ 1 ], 1e-17 );
	assert.equal( EBN[ 1 ], expected );
	assert.equal( EBC[ 1 ], 0.0 );
});

test( 'dla_gbrfsx_extended: relative update between DLAMCH(E) and DLAMCH(P) does not count as converged (ticket 0089)', function t() {
	// Reference: EPS = DLAMCH('Epsilon') = 2^-53 and x converges when DX_X <= EPS. A = [1], a deliberately inexact factor AFB = [1.5], b = 1 + 2^-52 and y = 1: iteration 1 gives RES = 2^-52 and DY = 2^-52/1.5, so DX_X ~ 0.67*2^-52 lies in (2^-53, 2^-52]. The reference keeps refining: Y becomes 1 + 2^-52, iteration 2 gives DY = 0 and the normwise bound is 0. With EPS = 2^-52, iteration 1 would already converge, leaving Y = 1 and the bound at 0.67*2^-52. Expected values are the output of the reference Fortran DLA_GBRFSX_EXTENDED (with the plain DGBMV fallback for the XBLAS calls) for these inputs.
	const AB = new Float64Array( [ 1.0 ] );
	const AFB = new Float64Array( [ 1.5 ] );
	const IPIV = new Int32Array( 1 );
	dgbtrf( 1, 1, 0, 0, AFB, 1, 1, 0, IPIV, 1, 0 );
	const B = new Float64Array( [ 1.0 + Math.pow( 2.0, -52 ) ] );
	const Y = new Float64Array( [ 1.0 ] );
	const EBN = new Float64Array( [ -1.0, -1.0, -1.0 ] );
	const EBC = new Float64Array( [ -1.0, -1.0, -1.0 ] );
	const BERR = new Float64Array( 1 );
	const info = dla_gbrfsx_extended( 2, 'no-transpose', 1, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, false, new Float64Array( 1 ), 1, 0, B, 1, 1, 0, Y, 1, 1, 0, BERR, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 1.0, 10, 0.5, 0.25, true );
	assert.equal( info, 0 );
	assert.equal( Y[ 0 ], 1.0000000000000002 );
	assert.equal( EBN[ 1 ], 0.0 );
	assert.equal( EBC[ 1 ], 0.0 );
	assert.equal( BERR[ 0 ], 2.225073858507201e-308 );
});
