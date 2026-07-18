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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytrf from './../../zsytrf/lib/base.js';
import zla_syrcond_x from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zla_syrcond_x.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts relative closeness.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {

	const denom = Math.max( Math.abs( expected ), 1.0 );
	const err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Returns the 3x3 upper-triangle symmetric test matrix (column-major).
*
* @private
* @returns {Complex128Array} matrix
*/
function make3x3Upper() {
	// Columns (re,im): 2+1i,0,0 | 1,3+0.5i,0 | -1i,1+1i,4
	return new Complex128Array([
		2.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		3.0,
		0.5,
		0.0,
		0.0,
		0.0,
		-1.0,
		1.0,
		1.0,
		4.0,
		0.0
	]);
}

/**
* Returns the 3x3 lower-triangle symmetric test matrix (column-major).
*
* @private
* @returns {Complex128Array} matrix
*/
function make3x3Lower() {
	// Columns (re,im): 2+1i,1,-1i | 0,3+0.5i,1+1i | 0,0,4
	return new Complex128Array([
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		3.0,
		0.5,
		1.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		0.0
	]);
}

/**
* Factors a symmetric matrix with zsytrf.
*
* @private
* @param {string} uplo - upper or lower
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - input matrix
* @returns {Object} factor and pivots
*/
function factor( uplo, N, A ) {

	const AF = new Complex128Array( A );
	const IPIV = new Int32Array( N );
	zsytrf( uplo, N, AF, 1, N, 0, IPIV, 1, 0 );
	return {
		'AF': AF,
		'IPIV': IPIV
	};
}


// TESTS //

test( 'zla_syrcond_x: uplo_U_uniform_real', function t() {

	const tc = findCase( 'uplo_U_uniform_real' );
	const N = 3;
	const A = make3x3Upper();
	const f = factor( 'upper', N, A );
	const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const r = zla_syrcond_x( 'upper', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: uplo_U_complex_x', function t() {

	const tc = findCase( 'uplo_U_complex_x' );
	const N = 3;
	const A = make3x3Upper();
	const f = factor( 'upper', N, A );
	const X = new Complex128Array( [ 2, 1, 0.5, -0.5, 3, 2 ] );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const r = zla_syrcond_x( 'upper', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: uplo_L_uniform_real', function t() {

	const tc = findCase( 'uplo_L_uniform_real' );
	const N = 3;
	const A = make3x3Lower();
	const f = factor( 'lower', N, A );
	const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const r = zla_syrcond_x( 'lower', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: uplo_L_complex_x', function t() {

	const tc = findCase( 'uplo_L_complex_x' );
	const N = 3;
	const A = make3x3Lower();
	const f = factor( 'lower', N, A );
	const X = new Complex128Array( [ 2, 1, 0.5, -0.5, 3, 2 ] );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const r = zla_syrcond_x( 'lower', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: n1_uplo_U', function t() {

	const tc = findCase( 'n1_uplo_U' );
	const N = 1;
	const A = new Complex128Array( [ 5, 2 ] );
	const AF = new Complex128Array( [ 5, 2 ] );
	const IPIV = new Int32Array( [ 0 ] );
	const X = new Complex128Array( [ 1, 1 ] );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const r = zla_syrcond_x( 'upper', N, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: n0', function t() {

	const tc = findCase( 'n0' );
	const N = 0;
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const X = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );
	const r = zla_syrcond_x( 'upper', N, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: upper zero matrix returns 0', function t() {

	const N = 2;
	const A = new Complex128Array( 2 * N );
	const AF = new Complex128Array( 2 * N );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const X = new Complex128Array( [ 1, 0, 1, 0 ] );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const r = zla_syrcond_x( 'upper', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( r, 0.0, 'zero matrix -> 0' );
});

test( 'zla_syrcond_x: lower zero matrix returns 0', function t() {

	const N = 2;
	const A = new Complex128Array( 2 * N );
	const AF = new Complex128Array( 2 * N );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const X = new Complex128Array( [ 1, 0, 1, 0 ] );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	const r = zla_syrcond_x( 'lower', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( r, 0.0, 'zero matrix -> 0' );
});
