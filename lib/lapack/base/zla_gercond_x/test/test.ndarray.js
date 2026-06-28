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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zla_gercond_x from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_gercond_x.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
var fixture = lines.map( function parse( line ) {
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
* Asserts that two values are close within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;

	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Returns the 3x3 complex test matrix in column-major layout.
*
* @private
* @returns {Complex128Array} matrix A
*/
function make3x3A() {
	return new Complex128Array([
		2.0,
		1.0,
		1.0,
		-1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		3.0,
		0.0,
		1.0,
		-0.5,
		0.0,
		-1.0,
		1.0,
		1.0,
		4.0,
		0.0
	]);
}

/**
* Computes the LU factorization of a fresh copy of A.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - input matrix (column-major)
* @returns {Object} AF and IPIV
*/
function factor( N, A ) {
	var IPIV;
	var AF;

	AF = new Complex128Array( A );
	IPIV = new Int32Array( N );
	zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	return {
		'AF': AF,
		'IPIV': IPIV
	};
}


// TESTS //

test( 'zla_gercond_x: trans_N_uniform_real', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'trans_N_uniform_real' );
	N = 3;
	A = make3x3A();
	f = factor( N, A );
	X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'no-transpose', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_gercond_x: trans_C_uniform_real', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'trans_C_uniform_real' );
	N = 3;
	A = make3x3A();
	f = factor( N, A );
	X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'conjugate-transpose', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_gercond_x: trans_N_complex_x', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'trans_N_complex_x' );
	N = 3;
	A = make3x3A();
	f = factor( N, A );
	X = new Complex128Array( [ 2, 1, 0.5, -0.5, 3, 2 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'no-transpose', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_gercond_x: trans_C_complex_x', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'trans_C_complex_x' );
	N = 3;
	A = make3x3A();
	f = factor( N, A );
	X = new Complex128Array( [ 2, 1, 0.5, -0.5, 3, 2 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'conjugate-transpose', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_gercond_x: n1_trans_N', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var tc;
	var A;
	var X;
	var N;
	var r;

	tc = findCase( 'n1_trans_N' );
	N = 1;
	A = new Complex128Array( [ 5, 2 ] );
	AF = new Complex128Array( [ 5, 2 ] );
	IPIV = new Int32Array( [ 0 ] );
	X = new Complex128Array( [ 1, 1 ] );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	r = zla_gercond_x( 'no-transpose', N, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_gercond_x: n0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var tc;
	var A;
	var X;
	var N;
	var r;

	tc = findCase( 'n0' );
	N = 0;
	A = new Complex128Array( 1 );
	AF = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	X = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	r = zla_gercond_x( 'no-transpose', N, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_gercond_x: zero matrix returns 0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var A;
	var X;
	var N;
	var r;

	N = 2;
	A = new Complex128Array( 2 * N );
	AF = new Complex128Array( 2 * N );
	IPIV = new Int32Array( [ 0, 1 ] );
	X = new Complex128Array( [ 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_gercond_x( 'no-transpose', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( r, 0.0, 'zero matrix -> 0' );
});
