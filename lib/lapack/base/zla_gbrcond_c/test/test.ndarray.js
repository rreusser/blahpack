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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import zla_gbrcond_c from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zla_gbrcond_c.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
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
* Asserts that two values are close to each other.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Builds the 3x3 tridiagonal complex band matrix used in the fixtures.
*
* @private
* @returns {Object} object with N, kl, ku, LDAB, LDAFB, AB, AFB, IPIV
*/
function build3x3() {
	const LDAFB = 4;
	const LDAB = 3;
	let i, j;

	const N = 3;
	const AB = new Complex128Array( LDAB * N );
	const AFB = new Complex128Array( LDAFB * N );
	const IPIV = new Int32Array( N );
	const abv = new Float64Array( AB.buffer );
	const afbv = new Float64Array( AFB.buffer );

	// AB column-major layout (row,col) -> index 2*(row + col*LDAB)

	// Col 0: diag (1,0) = 2+1i, sub (2,0) = 1+2i
	abv[ 2 ] = 2.0;
	abv[ 3 ] = 1.0;
	abv[ 4 ] = 1.0;
	abv[ 5 ] = 2.0;

	// Col 1: super (0,1) = 3-1i, diag (1,1) = 5+0i, sub (2,1) = 4-2i
	abv[ 2 * LDAB ] = 3.0;
	abv[ ( 2 * LDAB ) + 1 ] = -1.0;
	abv[ ( 2 * LDAB ) + 2 ] = 5.0;
	abv[ ( 2 * LDAB ) + 3 ] = 0.0;
	abv[ ( 2 * LDAB ) + 4 ] = 4.0;
	abv[ ( 2 * LDAB ) + 5 ] = -2.0;

	// Col 2: super (0,2) = 6+1i, diag (1,2) = 8+3i
	abv[ 4 * LDAB ] = 6.0;
	abv[ ( 4 * LDAB ) + 1 ] = 1.0;
	abv[ ( 4 * LDAB ) + 2 ] = 8.0;
	abv[ ( 4 * LDAB ) + 3 ] = 3.0;

	// AFB has KL=1 extra rows at top; copy AB offset by KL rows
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < LDAB; i++ ) {
			afbv[ 2 * ( ( 1 + i ) + ( j * LDAFB ) ) ] = abv[ 2 * ( i + ( j * LDAB ) ) ];
			afbv[ ( 2 * ( ( 1 + i ) + ( j * LDAFB ) ) ) + 1 ] = abv[ ( 2 * ( i + ( j * LDAB ) ) ) + 1 ];
		}
	}

	zgbtrf( N, N, 1, 1, AFB, 1, LDAFB, 0, IPIV, 1, 0 );

	return {
		'N': N,
		'kl': 1,
		'ku': 1,
		'LDAB': LDAB,
		'LDAFB': LDAFB,
		'AB': AB,
		'AFB': AFB,
		'IPIV': IPIV
	};
}


// TESTS //

test( 'zla_gbrcond_c: trans_N_capply_true', function t() {

	const tc = findCase( 'trans_N_capply_true' );
	const m = build3x3();
	const c = new Float64Array( [ 1.5, 2.0, 3.5 ] );
	const WORK = new Complex128Array( 2 * m.N );
	const RWORK = new Float64Array( m.N );
	const result = zla_gbrcond_c( 'no-transpose', m.N, m.kl, m.ku, m.AB, 1, m.LDAB, 0, m.AFB, 1, m.LDAFB, 0, m.IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, 1e-12, 'result' );
});

test( 'zla_gbrcond_c: trans_C_capply_true', function t() {

	const tc = findCase( 'trans_C_capply_true' );
	const m = build3x3();
	const c = new Float64Array( [ 1.5, 2.0, 3.5 ] );
	const WORK = new Complex128Array( 2 * m.N );
	const RWORK = new Float64Array( m.N );
	const result = zla_gbrcond_c( 'conjugate-transpose', m.N, m.kl, m.ku, m.AB, 1, m.LDAB, 0, m.AFB, 1, m.LDAFB, 0, m.IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, 1e-12, 'result' );
});

test( 'zla_gbrcond_c: trans_N_capply_false', function t() {

	const tc = findCase( 'trans_N_capply_false' );
	const m = build3x3();
	const c = new Float64Array( [ 1.5, 2.0, 3.5 ] );
	const WORK = new Complex128Array( 2 * m.N );
	const RWORK = new Float64Array( m.N );
	const result = zla_gbrcond_c( 'no-transpose', m.N, m.kl, m.ku, m.AB, 1, m.LDAB, 0, m.AFB, 1, m.LDAFB, 0, m.IPIV, 1, 0, c, 1, 0, false, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, 1e-12, 'result' );
});

test( 'zla_gbrcond_c: trans_C_capply_false', function t() {

	const tc = findCase( 'trans_C_capply_false' );
	const m = build3x3();
	const c = new Float64Array( [ 1.5, 2.0, 3.5 ] );
	const WORK = new Complex128Array( 2 * m.N );
	const RWORK = new Float64Array( m.N );
	const result = zla_gbrcond_c( 'conjugate-transpose', m.N, m.kl, m.ku, m.AB, 1, m.LDAB, 0, m.AFB, 1, m.LDAFB, 0, m.IPIV, 1, 0, c, 1, 0, false, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, 1e-12, 'result' );
});

test( 'zla_gbrcond_c: n1_edge', function t() {

	const tc = findCase( 'n1_edge' );
	const AB = new Complex128Array( [ 5.0, 2.0 ] );
	const AFB = new Complex128Array( [ 5.0, 2.0 ] );
	const IPIV = new Int32Array( 1 );
	zgbtrf( 1, 1, 0, 0, AFB, 1, 1, 0, IPIV, 1, 0 );
	const c = new Float64Array( [ 2.0 ] );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const result = zla_gbrcond_c( 'no-transpose', 1, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, 1e-12, 'result' );
});

test( 'zla_gbrcond_c: N=0 quick return', function t() {

	const AB = new Complex128Array( 0 );
	const AFB = new Complex128Array( 0 );
	const IPIV = new Int32Array( 0 );
	const c = new Float64Array( 0 );
	const WORK = new Complex128Array( 0 );
	const RWORK = new Float64Array( 0 );
	const result = zla_gbrcond_c( 'no-transpose', 0, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, c, 1, 0, false, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 1.0 );
});

test( 'zla_gbrcond_c: anorm=0 returns 0', function t() {

	// Zero matrix -> anorm = 0 -> result = 0
	const AB = new Complex128Array( 3 * 2 );
	const AFB = new Complex128Array( 4 * 2 );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const c = new Float64Array( [ 1.0, 1.0 ] );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const result = zla_gbrcond_c( 'no-transpose', 2, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, c, 1, 0, false, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 0.0 );
});
