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

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_syrcond_x.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
* Asserts relative closeness.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var denom;
	var err;

	denom = Math.max( Math.abs( expected ), 1.0 );
	err = Math.abs( actual - expected ) / denom;
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
	var IPIV;
	var AF;

	AF = new Complex128Array( A );
	IPIV = new Int32Array( N );
	zsytrf( uplo, N, AF, 1, N, 0, IPIV, 1, 0 );
	return {
		'AF': AF,
		'IPIV': IPIV
	};
}


// TESTS //

test( 'zla_syrcond_x: uplo_U_uniform_real', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'uplo_U_uniform_real' );
	N = 3;
	A = make3x3Upper();
	f = factor( 'upper', N, A );
	X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_syrcond_x( 'upper', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: uplo_U_complex_x', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'uplo_U_complex_x' );
	N = 3;
	A = make3x3Upper();
	f = factor( 'upper', N, A );
	X = new Complex128Array( [ 2, 1, 0.5, -0.5, 3, 2 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_syrcond_x( 'upper', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: uplo_L_uniform_real', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'uplo_L_uniform_real' );
	N = 3;
	A = make3x3Lower();
	f = factor( 'lower', N, A );
	X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_syrcond_x( 'lower', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: uplo_L_complex_x', function t() {
	var RWORK;
	var WORK;
	var tc;
	var f;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'uplo_L_complex_x' );
	N = 3;
	A = make3x3Lower();
	f = factor( 'lower', N, A );
	X = new Complex128Array( [ 2, 1, 0.5, -0.5, 3, 2 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_syrcond_x( 'lower', N, A, 1, N, 0, f.AF, 1, N, 0, f.IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: n1_uplo_U', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var tc;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'n1_uplo_U' );
	N = 1;
	A = new Complex128Array( [ 5, 2 ] );
	AF = new Complex128Array( [ 5, 2 ] );
	IPIV = new Int32Array( [ 0 ] );
	X = new Complex128Array( [ 1, 1 ] );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	r = zla_syrcond_x( 'upper', N, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: n0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var tc;
	var N;
	var A;
	var X;
	var r;

	tc = findCase( 'n0' );
	N = 0;
	A = new Complex128Array( 1 );
	AF = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	X = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	r = zla_syrcond_x( 'upper', N, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( r, tc.result, 1e-12, 'result' );
});

test( 'zla_syrcond_x: upper zero matrix returns 0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var N;
	var A;
	var X;
	var r;

	N = 2;
	A = new Complex128Array( 2 * N );
	AF = new Complex128Array( 2 * N );
	IPIV = new Int32Array( [ 0, 1 ] );
	X = new Complex128Array( [ 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_syrcond_x( 'upper', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( r, 0.0, 'zero matrix -> 0' );
});

test( 'zla_syrcond_x: lower zero matrix returns 0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var AF;
	var N;
	var A;
	var X;
	var r;

	N = 2;
	A = new Complex128Array( 2 * N );
	AF = new Complex128Array( 2 * N );
	IPIV = new Int32Array( [ 0, 1 ] );
	X = new Complex128Array( [ 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	r = zla_syrcond_x( 'lower', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( r, 0.0, 'zero matrix -> 0' );
});
