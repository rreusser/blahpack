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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrf from './../../dsytrf/lib/base.js';
import dla_syrcond from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_syrcond.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
var fixture = lines.map( parse );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - input line
* @returns {Object} parsed object
*/
function parse( line ) {
	return JSON.parse( line );
}

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
* Asserts approximate equality.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Returns a symmetric 3x3 matrix stored column-major.
*
* @private
* @returns {Float64Array} matrix data
*/
function getA() {
	return new Float64Array([
		2.0,
		-1.0,
		0.5,
		-1.0,
		3.0,
		-0.5,
		0.5,
		-0.5,
		4.0
	]);
}

/**
* Factors matrix A with dsytrf and returns AF and IPIV.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @returns {Object} factored matrix and pivots
*/
function factorA( uplo ) {
	var info;
	var IPIV;
	var AF;

	IPIV = new Int32Array( 3 );
	AF = new Float64Array( getA() );
	info = dsytrf( uplo, 3, AF, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dsytrf should succeed' );
	return {
		'AF': AF,
		'IPIV': IPIV
	};
}


// TESTS //

test( 'dla_syrcond: UPLO=upper, CMODE=1', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'upper' );
	tc = findCase( 'uplo_U_cmode1' );
	A = getA();
	c = new Float64Array( [ 1.0, 2.0, 0.5 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'upper', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: UPLO=upper, CMODE=0', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'upper' );
	tc = findCase( 'uplo_U_cmode0' );
	A = getA();
	c = new Float64Array( [ 1.0, 2.0, 0.5 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'upper', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, 0, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: UPLO=upper, CMODE=-1', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'upper' );
	tc = findCase( 'uplo_U_cmode_neg1' );
	A = getA();
	c = new Float64Array( [ 1.0, 2.0, 0.5 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'upper', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, -1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: UPLO=lower, CMODE=1', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'lower' );
	tc = findCase( 'uplo_L_cmode1' );
	A = getA();
	c = new Float64Array( [ 1.0, 2.0, 0.5 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'lower', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: UPLO=lower, CMODE=0', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'lower' );
	tc = findCase( 'uplo_L_cmode0' );
	A = getA();
	c = new Float64Array( [ 1.0, 2.0, 0.5 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'lower', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, 0, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: UPLO=lower, CMODE=-1', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'lower' );
	tc = findCase( 'uplo_L_cmode_neg1' );
	A = getA();
	c = new Float64Array( [ 1.0, 2.0, 0.5 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'lower', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, -1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: UPLO=upper, different C vector', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var fact;
	var tc;
	var A;
	var c;

	IWORK = new Int32Array( 3 );
	WORK = new Float64Array( 9 );
	fact = factorA( 'upper' );
	tc = findCase( 'uplo_U_diff_C' );
	A = getA();
	c = new Float64Array( [ 3.0, 0.1, 2.0 ] ); // eslint-disable-line max-len

	rcond = dla_syrcond( 'upper', 3, A, 1, 3, 0, fact.AF, 1, 3, 0, fact.IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dla_syrcond: N=0 returns 1.0', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var IPIV;
	var AF;
	var A;
	var c;

	IWORK = new Int32Array( 1 );
	WORK = new Float64Array( 3 );
	IPIV = new Int32Array( 1 );
	AF = new Float64Array( 1 );
	A = new Float64Array( 1 );
	c = new Float64Array( 1 );

	rcond = dla_syrcond( 'upper', 0, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( rcond, 1.0, 'returns 1.0 for N=0' );
});

test( 'dla_syrcond: N=1 symmetric matrix', function t() {
	var rcond;
	var IWORK;
	var WORK;
	var IPIV;
	var info;
	var AF;
	var A;
	var c;

	IWORK = new Int32Array( 1 );
	WORK = new Float64Array( 3 );
	IPIV = new Int32Array( 1 );
	AF = new Float64Array( [ 5.0 ] );
	A = new Float64Array( [ 5.0 ] );
	c = new Float64Array( [ 2.0 ] );

	// Factor 1x1 matrix:
	info = dsytrf( 'upper', 1, AF, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dsytrf succeeds' );

	rcond = dla_syrcond( 'upper', 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.ok( rcond > 0.0, 'rcond is positive for N=1' );
	assert.ok( rcond <= 1.0, 'rcond is at most 1.0' );
});
