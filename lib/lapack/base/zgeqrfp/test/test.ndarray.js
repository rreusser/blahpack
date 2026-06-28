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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqrfp from './../lib/ndarray.js';


// FIXTURES //

import fixtureBasic4x3 from './fixtures/basic_4x3.json' with { type: 'json' };
import fixtureSquare3x3 from './fixtures/square_3x3.json' with { type: 'json' };
import fixtureMZero from './fixtures/m_zero.json' with { type: 'json' };
import fixtureNZero from './fixtures/n_zero.json' with { type: 'json' };
import fixtureWide3x4 from './fixtures/wide_3x4.json' with { type: 'json' };
import fixtureLarge40x35 from './fixtures/large_40x35.json' with { type: 'json' };
import fixtureLarge65x65 from './fixtures/large_65x65.json' with { type: 'json' };


// FUNCTIONS //

/**
* Asserts two scalars are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {Object} actual - actual array-like
* @param {Object} expected - expected array-like
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verifies that R diagonal elements are real and non-negative.
*
* @private
* @param {Complex128Array} a - factored matrix
* @param {integer} M - number of rows (leading dim)
* @param {integer} K - min(M,N)
*/
function checkDiag( a, M, K ) {
	var av = reinterpret( a, 0 );
	var i;
	for ( i = 0; i < K; i++ ) {
		assert.ok( av[ 2 * ( i + ( i * M ) ) ] >= 0, 'R diag non-negative' );
		assert.strictEqual( av[ ( 2 * ( i + ( i * M ) ) ) + 1 ], 0, 'R diag imag zero' );
	}
}


// TESTS //

test( 'zgeqrfp: basic_4x3', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		1,
		2,
		3,
		4,
		5,
		6
	]);
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 100 );
	info = zgeqrfp( 4, 3, a, 1, 4, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureBasic4x3.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), fixtureBasic4x3.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), fixtureBasic4x3.tau, 1e-10, 'tau' );
	checkDiag( a, 4, 3 );
});

test( 'zgeqrfp: square_3x3', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array([
		1,
		1,
		0,
		1,
		1,
		0,
		2,
		0.5,
		1,
		1,
		0.5,
		0.5,
		0,
		1,
		1,
		0,
		2,
		2
	]);
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 100 );
	info = zgeqrfp( 3, 3, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureSquare3x3.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), fixtureSquare3x3.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), fixtureSquare3x3.tau, 1e-10, 'tau' );
	checkDiag( a, 3, 3 );
});

test( 'zgeqrfp: m_zero quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 2 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqrfp( 0, 3, a, 1, 1, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureMZero.info, 1e-14, 'info' );
});

test( 'zgeqrfp: n_zero quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 10 );
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 10 );
	info = zgeqrfp( 4, 0, a, 1, 4, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureNZero.info, 1e-14, 'info' );
});

test( 'zgeqrfp: wide_3x4', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array([
		1,
		1,
		2,
		0,
		3,
		2,
		4,
		1,
		5,
		3,
		6,
		0.5,
		7,
		1,
		8,
		2,
		9,
		0,
		0,
		1,
		1.5,
		2.5,
		3.5,
		4.5
	]);
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 100 );
	info = zgeqrfp( 3, 4, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureWide3x4.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), fixtureWide3x4.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), fixtureWide3x4.tau, 1e-10, 'tau' );
	checkDiag( a, 3, 3 );
});

test( 'zgeqrfp: large_40x35 (blocked path)', function t() {
	var work;
	var info;
	var idx;
	var tau;
	var av;
	var M;
	var N;
	var a;
	var i;
	var j;

	M = 40;
	N = 35;
	a = new Complex128Array( M * N );
	av = reinterpret( a, 0 );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			idx = 2 * ( ( i - 1 ) + ( ( j - 1 ) * M ) );
			av[ idx ] = ( ( ( i * 7 ) + ( j * 13 ) ) % 100 ) / 10.0;
			av[ idx + 1 ] = ( ( ( i * 11 ) + ( j * 3 ) ) % 100 ) / 10.0;
		}
	}
	tau = new Complex128Array( N );
	work = new Complex128Array( N * 64 );
	info = zgeqrfp( M, N, a, 1, M, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureLarge40x35.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), fixtureLarge40x35.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), fixtureLarge40x35.tau, 1e-10, 'tau' );
	checkDiag( a, M, Math.min( M, N ) );
});

test( 'zgeqrfp: large_65x65 (blocked path with cleanup)', function t() {
	var work;
	var info;
	var idx;
	var tau;
	var av;
	var M;
	var N;
	var a;
	var i;
	var j;

	M = 65;
	N = 65;
	a = new Complex128Array( M * N );
	av = reinterpret( a, 0 );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			idx = 2 * ( ( i - 1 ) + ( ( j - 1 ) * M ) );
			av[ idx ] = ( ( ( i * 5 ) + ( j * 17 ) ) % 97 ) / 10.0;
			av[ idx + 1 ] = ( ( ( i * 13 ) + ( j * 7 ) ) % 97 ) / 10.0;
		}
	}
	tau = new Complex128Array( N );
	work = new Complex128Array( N * 64 );
	info = zgeqrfp( M, N, a, 1, M, 0, tau, 1, 0, work, 1, 0 );
	assertClose( info, fixtureLarge65x65.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), fixtureLarge65x65.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), fixtureLarge65x65.tau, 1e-10, 'tau' );
	checkDiag( a, M, Math.min( M, N ) );
});

test( 'zgeqrfp: validates M', function t() {
	var work = new Complex128Array( 9 );
	var tau = new Complex128Array( 3 );
	var a = new Complex128Array( 9 );
	assert.throws( function throws() {
		zgeqrfp( -1, 3, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	}, RangeError );
});

test( 'zgeqrfp: validates N', function t() {
	var work = new Complex128Array( 9 );
	var tau = new Complex128Array( 3 );
	var a = new Complex128Array( 9 );
	assert.throws( function throws() {
		zgeqrfp( 3, -1, a, 1, 3, 0, tau, 1, 0, work, 1, 0 );
	}, RangeError );
});
