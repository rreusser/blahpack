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
import zla_syrcond_c from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_syrcond_c.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
* Build the 3x3 complex symmetric test matrix in column-major order.
*
* @private
* @returns {Complex128Array} column-major 3x3 matrix
*/
function buildMatrix() {
	// A(1,1)=(2,1),     A(2,1)=(1,0.5),   A(3,1)=(0.5,-0.5)
	// A(1,2)=(1,0.5),   A(2,2)=(3,-0.5),  A(3,2)=(-0.5,0.25)
	// A(1,3)=(0.5,-0.5),A(2,3)=(-0.5,0.25),A(3,3)=(4,0)
	return new Complex128Array([
		2.0,
		1.0,
		1.0,
		0.5,
		0.5,
		-0.5,
		1.0,
		0.5,
		3.0,
		-0.5,
		-0.5,
		0.25,
		0.5,
		-0.5,
		-0.5,
		0.25,
		4.0,
		0.0
	]);
}

/**
* Run a 3x3 test case against the fixture.
*
* @private
* @param {string} uplo - which triangle
* @param {Float64Array} c - scaling vector
* @param {boolean} capply - apply scaling flag
* @param {string} fixtureName - fixture name
*/
function runCase( uplo, c, capply, fixtureName ) {
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
	info = zsytrf( uplo, N, AF, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, fixtureName + ': zsytrf info' );
	res = zla_syrcond_c( uplo, N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, capply, WORK, 1, 0, RWORK, 1, 0 );
	tc = findCase( fixtureName );
	assertClose( res, tc.result, 1e-12, fixtureName );
}


// TESTS //

test( 'zla_syrcond_c: upper_capply', function t() {
	runCase( 'upper', new Float64Array( [ 1.0, 2.0, 0.5 ] ), true, 'upper_capply' );
});

test( 'zla_syrcond_c: upper_nocapply', function t() {
	runCase( 'upper', new Float64Array( [ 1.0, 2.0, 0.5 ] ), false, 'upper_nocapply' );
});

test( 'zla_syrcond_c: upper_capply_nonuniform', function t() {
	runCase( 'upper', new Float64Array( [ 3.0, 0.1, 2.0 ] ), true, 'upper_capply_nonuniform' );
});

test( 'zla_syrcond_c: lower_capply', function t() {
	runCase( 'lower', new Float64Array( [ 1.0, 2.0, 0.5 ] ), true, 'lower_capply' );
});

test( 'zla_syrcond_c: lower_nocapply', function t() {
	runCase( 'lower', new Float64Array( [ 1.0, 2.0, 0.5 ] ), false, 'lower_nocapply' );
});

test( 'zla_syrcond_c: lower_capply_nonuniform', function t() {
	runCase( 'lower', new Float64Array( [ 3.0, 0.1, 2.0 ] ), true, 'lower_capply_nonuniform' );
});

test( 'zla_syrcond_c: n1_upper', function t() {
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
	tc = findCase( 'n1_upper' );
	res = zla_syrcond_c( 'upper', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assertClose( res, tc.result, 1e-12, 'n1_upper' );
});

test( 'zla_syrcond_c: n0 returns 1', function t() {
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
	res = zla_syrcond_c( 'upper', 0, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( res, 1.0, 'n0' );
});

test( 'zla_syrcond_c: anorm zero returns 0 (upper)', function t() {
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
	res = zla_syrcond_c( 'upper', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( res, 0.0, 'anorm=0 returns 0' );
});

test( 'zla_syrcond_c: anorm zero returns 0 (lower, nocapply)', function t() {
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
	res = zla_syrcond_c( 'lower', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, false, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( res, 0.0, 'anorm=0 returns 0' );
});
