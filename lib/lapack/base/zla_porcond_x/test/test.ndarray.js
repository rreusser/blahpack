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
import zla_porcond_x from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_porcond_x.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts scalar closeness within a relative tolerance.
*
* @private
* @param {number} actual - value under test
* @param {number} expected - reference value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Builds a Complex128Array from an interleaved numeric array.
*
* @private
* @param {Array<number>} arr - interleaved re/im values
* @returns {Complex128Array} complex array
*/
function toComplex( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

/**
* Runs zla_porcond_x on a fixture case and checks the reciprocal condition.
*
* @private
* @param {Object} tc - fixture test case
* @param {string} uplo - `'upper'` or `'lower'`
* @param {number} N - matrix order
* @param {number} tol - relative tolerance
* @param {string} label - descriptive label
*/
function runCase( tc, uplo, N, tol, label ) {
	var result;
	var RWORK;
	var WORK;
	var AF;
	var A;
	var X;
	A = toComplex( tc.A );
	AF = toComplex( tc.A_factored );
	X = toComplex( tc.x );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	result = zla_porcond_x( uplo, N, A, 1, N, 0, AF, 1, N, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( result, tc.result, tol, label );
}


// TESTS //

test( 'zla_porcond_x: upper_4x4_real_x', function t() {
	var tc = findCase( 'upper_4x4_real_x' );
	runCase( tc, 'upper', 4, 1e-12, 'upper_4x4_real_x' );
});

test( 'zla_porcond_x: upper_4x4_complex_x', function t() {
	var merged;
	var base;
	var tc;
	base = findCase( 'upper_4x4_real_x' );
	tc = findCase( 'upper_4x4_complex_x' );
	merged = {
		'A': base.A,
		'A_factored': base.A_factored,
		'x': tc.x,
		'result': tc.result
	};
	runCase( merged, 'upper', 4, 1e-12, 'upper_4x4_complex_x' );
});

test( 'zla_porcond_x: lower_4x4_real_x', function t() {
	var tc = findCase( 'lower_4x4_real_x' );
	runCase( tc, 'lower', 4, 1e-12, 'lower_4x4_real_x' );
});

test( 'zla_porcond_x: lower_4x4_complex_x', function t() {
	var merged;
	var base;
	var tc;
	base = findCase( 'lower_4x4_real_x' );
	tc = findCase( 'lower_4x4_complex_x' );
	merged = {
		'A': base.A,
		'A_factored': base.A_factored,
		'x': tc.x,
		'result': tc.result
	};
	runCase( merged, 'lower', 4, 1e-12, 'lower_4x4_complex_x' );
});

test( 'zla_porcond_x: n1_upper', function t() {
	var tc = findCase( 'n1_upper' );
	runCase( tc, 'upper', 1, 1e-12, 'n1_upper' );
});

test( 'zla_porcond_x: n1_lower', function t() {
	var tc = findCase( 'n1_upper' );
	runCase( tc, 'lower', 1, 1e-12, 'n1_lower' );
});

test( 'zla_porcond_x: n0 returns 1.0', function t() {
	var result;
	var RWORK;
	var WORK;
	var AF;
	var A;
	var X;
	RWORK = new Float64Array( 0 );
	WORK = new Complex128Array( 0 );
	AF = new Complex128Array( 0 );
	A = new Complex128Array( 0 );
	X = new Complex128Array( 0 );
	result = zla_porcond_x( 'upper', 0, A, 1, 1, 0, AF, 1, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 1.0, 'n0 upper' );
	result = zla_porcond_x( 'lower', 0, A, 1, 1, 0, AF, 1, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 1.0, 'n0 lower' );
});

test( 'zla_porcond_x: anorm=0 returns 0 (zero matrix)', function t() {
	var result;
	var RWORK;
	var WORK;
	var AF;
	var A;
	var N;
	var X;
	N = 3;
	A = new Complex128Array( N * N );
	AF = new Complex128Array( N * N );
	X = toComplex( [ 1, 0, 1, 0, 1, 0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	result = zla_porcond_x( 'upper', N, A, 1, N, 0, AF, 1, N, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 0.0, 'upper zero matrix' );
	result = zla_porcond_x( 'lower', N, A, 1, N, 0, AF, 1, N, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( result, 0.0, 'lower zero matrix' );
});
