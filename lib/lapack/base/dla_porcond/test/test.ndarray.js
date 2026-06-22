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

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/base.js';
import dla_porcond from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_porcond.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

/*
* 3x3 SPD matrix (column-major):
* [ 4.0, 1.0, 0.5 ]
* [ 1.0, 5.0, 1.0 ]
* [ 0.5, 1.0, 6.0 ]
*/
var A3 = new Float64Array([
	4.0,
	1.0,
	0.5,
	1.0,
	5.0,
	1.0,
	0.5,
	1.0,
	6.0
]);

var C3 = new Float64Array([ 2.0, 1.0, 0.5 ]);


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
* Asserts that two values are close within relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Factors a copy of A and returns the factor.
*
* @private
* @param {Float64Array} A - matrix to factor
* @param {NonNegativeInteger} N - order
* @param {string} uplo - 'upper' or 'lower'
* @returns {Float64Array} factored matrix
*/
function factorA( A, N, uplo ) {
	var AF = new Float64Array( A.length );
	var i;
	for ( i = 0; i < A.length; i++ ) {
		AF[ i ] = A[ i ];
	}
	dpotrf( uplo, N, AF, 1, N, 0 );
	return AF;
}


// TESTS //

test( 'dla_porcond is a function', function t() {
	assert.equal( typeof dla_porcond, 'function' );
});

test( 'UPLO=upper, CMODE=1', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;

	tc = findCase( 'uplo_U_cmode_1' );
	AF = factorA( A3, 3, 'upper' );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );

	result = dla_porcond( 'upper', 3, A3, 1, 3, 0, AF, 1, 3, 0, 1, C3, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'UPLO=lower, CMODE=1', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;

	tc = findCase( 'uplo_L_cmode_1' );
	AF = factorA( A3, 3, 'lower' );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );

	result = dla_porcond( 'lower', 3, A3, 1, 3, 0, AF, 1, 3, 0, 1, C3, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-14, 'result' );
});

/*
* NOTE: cmode=0 tests use wider tolerance because dlacn2 convergence is
* heuristic and idamax tie-breaking differs between JS and Fortran when
* dpotrs produces near-equal values (no C scaling to break symmetry).
* Both estimates are valid lower bounds of the true condition number.
*/
test( 'UPLO=upper, CMODE=0', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;

	tc = findCase( 'uplo_U_cmode_0' );
	AF = factorA( A3, 3, 'upper' );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );

	result = dla_porcond( 'upper', 3, A3, 1, 3, 0, AF, 1, 3, 0, 0, C3, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 0.15, 'result' );
});

test( 'UPLO=lower, CMODE=-1', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;

	tc = findCase( 'uplo_L_cmode_neg1' );
	AF = factorA( A3, 3, 'lower' );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );

	result = dla_porcond( 'lower', 3, A3, 1, 3, 0, AF, 1, 3, 0, -1, C3, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'UPLO=upper, CMODE=-1', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;

	tc = findCase( 'uplo_U_cmode_neg1' );
	AF = factorA( A3, 3, 'upper' );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );

	result = dla_porcond( 'upper', 3, A3, 1, 3, 0, AF, 1, 3, 0, -1, C3, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'UPLO=lower, CMODE=0', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;

	tc = findCase( 'uplo_L_cmode_0' );
	AF = factorA( A3, 3, 'lower' );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );

	result = dla_porcond( 'lower', 3, A3, 1, 3, 0, AF, 1, 3, 0, 0, C3, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 0.15, 'result' );
});

test( 'N=1 edge case', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;
	var A;
	var C;

	tc = findCase( 'n_eq_1' );
	A = new Float64Array([ 9.0 ]);
	AF = new Float64Array([ 3.0 ]); // sqrt(9)
	C = new Float64Array([ 2.0 ]);
	WORK = new Float64Array( 3 );
	IWORK = new Int32Array( 1 );

	result = dla_porcond( 'upper', 1, A, 1, 1, 0, AF, 1, 1, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assertClose( result, tc.result, 1e-14, 'result' );
});

test( 'N=0 edge case', function t() {
	var result;
	var IWORK;
	var WORK;
	var tc;
	var AF;
	var A;
	var C;

	tc = findCase( 'n_eq_0' );
	A = new Float64Array( 0 );
	AF = new Float64Array( 0 );
	C = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	IWORK = new Int32Array( 0 );

	result = dla_porcond( 'upper', 0, A, 1, 1, 0, AF, 1, 1, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result, tc.result );
});
