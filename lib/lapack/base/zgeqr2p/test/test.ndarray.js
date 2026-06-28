/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqr2p from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zgeqr2p.jsonl' );
var lines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zgeqr2p: basic 3x2 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'basic_3x2' );
	a = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 1, 5, 1, 6, 1 ] );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqr2p( 3, 2, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );

	// Verify diagonal of R is real and non-negative
	assert.ok( a.get( 0 ).re >= 0, 'R[0,0] non-negative' );
	assert.equal( a.get( 0 ).im, 0, 'R[0,0] imag zero' );
	assert.ok( a.get( 4 ).re >= 0, 'R[1,1] non-negative' );
	assert.equal( a.get( 4 ).im, 0, 'R[1,1] imag zero' );
});

test( 'zgeqr2p: square 2x2 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'square_2x2' );
	a = new Complex128Array( [ 1, 1, 0, 1, 1, 0, 1, 1 ] );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqr2p( 2, 2, a, 1, 2, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );

	assert.ok( a.get( 0 ).re >= 0, 'R[0,0] non-negative' );
	assert.equal( a.get( 0 ).im, 0, 'R[0,0] imag zero' );
	assert.ok( a.get( 3 ).re >= 0, 'R[1,1] non-negative' );
	assert.equal( a.get( 3 ).im, 0, 'R[1,1] imag zero' );
});

test( 'zgeqr2p: M=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 2 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 2 );
	info = zgeqr2p( 0, 2, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgeqr2p: N=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 6 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 2 );
	info = zgeqr2p( 3, 0, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgeqr2p: 1x1 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'one_by_one' );
	a = new Complex128Array( [ 5, 3 ] );
	tau = new Complex128Array( 1 );
	work = new Complex128Array( 2 );
	info = zgeqr2p( 1, 1, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );

	assert.ok( a.get( 0 ).re >= 0, 'R[0,0] non-negative' );
	assert.equal( a.get( 0 ).im, 0, 'R[0,0] imag zero' );
});

test( 'zgeqr2p: 4x3 tall matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;
	var i;

	tc = findCase( '4x3' );
	a = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5, 1, 0, 1, 0, 4, 2, 2, -0.5, 3, 1, 3, -1, 2, 1, 5, 0, 1, 0.5 ] ); // eslint-disable-line max-len
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 10 );
	info = zgeqr2p( 4, 3, a, 1, 4, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );

	// R diagonal at positions (0,0), (1,1), (2,2) — column-major, LDA=4
	for ( i = 0; i < 3; i++ ) {
		assert.ok( a.get( (i*4) + i ).re >= 0, 'R[i,i] non-negative' );
		assert.equal( a.get( (i*4) + i ).im, 0, 'R[i,i] imag zero' );
	}
});

test( 'zgeqr2p: 3x4 wide matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;
	var i;

	tc = findCase( '3x4' );
	a = new Complex128Array( [ 1, 0.5, 2, -0.5, 3, 0.25, 4, 0, 5, 1, 6, -1, 7, 0.5, 8, 0.25, 9, -0.25, 1, 1, 2, 2, 3, 3 ] ); // eslint-disable-line max-len
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 10 );
	info = zgeqr2p( 3, 4, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );

	// R diagonal at (0,0), (1,1), (2,2) — column-major, LDA=3
	for ( i = 0; i < 3; i++ ) {
		assert.ok( a.get( (i*3) + i ).re >= 0, 'R[i,i] non-negative' );
		assert.equal( a.get( (i*3) + i ).im, 0, 'R[i,i] imag zero' );
	}
});

test( 'zgeqr2p: non-unit strideA1 via offset/stride combo', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	// Same 3x2 data, but written with a leading garbage row (strideA1 kept 1)
	tc = findCase( 'basic_3x2' );
	a = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 1, 5, 1, 6, 1 ] );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqr2p( 3, 2, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
});
