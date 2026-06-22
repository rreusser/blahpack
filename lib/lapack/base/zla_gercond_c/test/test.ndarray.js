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
import zgetrf from './../../zgetrf/lib/base.js';
import zla_gercond_c from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_gercond_c.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locate a fixture case by name.
*
* @private
* @param {string} name - fixture case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Assert two numbers are close to within a relative tolerance.
*
* @private
* @param {number} actual - computed value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - failure message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Build the 3x3 complex test matrix used by the Fortran fixtures in column-major order.
*
* @private
* @returns {Complex128Array} column-major 3x3 matrix
*/
function buildMatrix() {
	return new Complex128Array([
		2.0,
		1.0,
		1.0,
		2.0,
		0.0,
		1.0,
		1.0,
		0.0,
		3.0,
		0.0,
		1.0,
		-1.0,
		0.0,
		-1.0,
		1.0,
		1.0,
		4.0,
		0.0
	]);
}

/**
* Run a 3x3 test case against the fixture.
*
* @private
* @param {string} trans - transpose flag
* @param {Float64Array} c - scaling vector
* @param {boolean} capply - apply scaling flag
* @param {string} fixtureName - fixture name
*/
function runCase( trans, c, capply, fixtureName ) {
	var RWORK;
	var IPIV;
	var WORK;
	var info;
	var res;
	var tc;
	var AF;
	var A;
	var N;
	var i;

	N = 3;
	A = buildMatrix();
	AF = new Complex128Array( A.length );
	IPIV = new Int32Array( N );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	for ( i = 0; i < A.length; i++ ) {
		AF.set( A.get( i ), i );
	}
	info = zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, fixtureName + ': zgetrf info' );
	res = zla_gercond_c( trans, N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, capply, WORK, 1, 0, RWORK, 1, 0 );
	tc = findCase( fixtureName );
	assertClose( res, tc.result, 1e-12, fixtureName );
}


// TESTS //

test( 'zla_gercond_c: trans_N_capply_uniform', function t() {
	runCase( 'no-transpose', new Float64Array( [ 1.0, 1.0, 1.0 ] ), true, 'trans_N_capply_uniform' );
});

test( 'zla_gercond_c: trans_C_capply_uniform', function t() {
	runCase( 'conjugate-transpose', new Float64Array( [ 1.0, 1.0, 1.0 ] ), true, 'trans_C_capply_uniform' );
});

test( 'zla_gercond_c: trans_N_capply_nonuniform', function t() {
	runCase( 'no-transpose', new Float64Array( [ 2.0, 0.5, 3.0 ] ), true, 'trans_N_capply_nonuniform' );
});

test( 'zla_gercond_c: trans_C_capply_nonuniform', function t() {
	runCase( 'conjugate-transpose', new Float64Array( [ 2.0, 0.5, 3.0 ] ), true, 'trans_C_capply_nonuniform' );
});

test( 'zla_gercond_c: trans_N_nocapply', function t() {
	runCase( 'no-transpose', new Float64Array( [ 2.0, 0.5, 3.0 ] ), false, 'trans_N_nocapply' );
});

test( 'zla_gercond_c: trans_C_nocapply', function t() {
	runCase( 'conjugate-transpose', new Float64Array( [ 2.0, 0.5, 3.0 ] ), false, 'trans_C_nocapply' );
});

test( 'zla_gercond_c: n1_trans_N', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var res;
	var tc;
	var AF;
	var A;
	var N;
	var c;

	N = 1;
	A = new Complex128Array( [ 5.0, 2.0 ] );
	AF = new Complex128Array( [ 5.0, 2.0 ] );
	IPIV = new Int32Array( [ 0 ] );
	c = new Float64Array( [ 2.0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	tc = findCase( 'n1_trans_N' );
	res = zla_gercond_c( 'no-transpose', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( res, tc.result, 1e-12, 'n1_trans_N' );
});

test( 'zla_gercond_c: n0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var res;
	var AF;
	var A;
	var c;

	A = new Complex128Array( 1 );
	AF = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	c = new Float64Array( 1 );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	res = zla_gercond_c( 'no-transpose', 0, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( res, 1.0, 'n0' );
});

test( 'zla_gercond_c: anorm zero returns 0', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var res;
	var AF;
	var A;
	var N;
	var c;

	N = 2;
	A = new Complex128Array( 4 );
	AF = new Complex128Array( 4 );
	IPIV = new Int32Array( N );
	c = new Float64Array( [ 1.0, 1.0 ] );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );
	res = zla_gercond_c( 'no-transpose', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( res, 0.0, 'anorm=0 returns 0' );
});
