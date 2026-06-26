/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements-per-line, node/no-sync, max-lines */

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

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqlf from './../lib/ndarray.js';
var ndarrayFn = zgeqlf;


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zgeqlf.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

/**
* Returns the fixture case with the provided name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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

test( 'base is a function', function t() {
	assert.strictEqual( typeof zgeqlf, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'zgeqlf: basic 4x3 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'basic_4x3' );
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
	work = new Complex128Array( 200 );
	info = zgeqlf( 4, 3, a, 1, 4, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ).subarray( 0, 6 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf: square 3x3 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'square_3x3' );
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
	work = new Complex128Array( 200 );
	info = zgeqlf( 3, 3, a, 1, 3, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ).subarray( 0, 6 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf: M=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 4 );
	tau = new Complex128Array( 4 );
	work = new Complex128Array( 10 );
	info = zgeqlf( 0, 3, a, 1, 1, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgeqlf: N=0 quick return', function t() {
	var work;
	var info;
	var tau;
	var a;

	a = new Complex128Array( 16 );
	tau = new Complex128Array( 4 );
	work = new Complex128Array( 10 );
	info = zgeqlf( 4, 0, a, 1, 4, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, 0, 1e-14, 'info' );
});

test( 'zgeqlf: 1x1 matrix', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'one_by_one' );
	a = new Complex128Array( [ 5, 3 ] );
	tau = new Complex128Array( 1 );
	work = new Complex128Array( 10 );
	info = zgeqlf( 1, 1, a, 1, 1, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf: tall 5x2 matrix (unblocked path)', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'tall_5x2' );
	a = new Complex128Array([
		1,
		0.5,
		2,
		1,
		3,
		1.5,
		4,
		2,
		5,
		2.5,
		0.5,
		1,
		1.5,
		2,
		2.5,
		3,
		3.5,
		4,
		4.5,
		5
	]);
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 200 );
	info = zgeqlf( 5, 2, a, 1, 5, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ).subarray( 0, 4 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf: wide 2x5 matrix (M < N)', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'wide_2x5' );
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
		1
	]);
	tau = new Complex128Array( 2 );
	work = new Complex128Array( 200 );
	info = zgeqlf( 2, 5, a, 1, 2, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ).subarray( 0, 4 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf: large 40x35 matrix (blocked path)', function t() {
	var work;
	var info;
	var idx;
	var tau;
	var tc;
	var av;
	var M;
	var N;
	var a;
	var i;
	var j;

	tc = findCase( 'large_40x35' );
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
	work = new Complex128Array( ( N * 64 ) + ( 64 * 64 ) );
	info = zgeqlf( M, N, a, 1, M, 0, tau, 1, 0, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ).subarray( 0, 2 * N ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf: works with offset', function t() {
	var work;
	var info;
	var pad;
	var tau;
	var tc;
	var av;
	var a;

	tc = findCase( 'square_3x3' );
	pad = 2;
	a = new Complex128Array( pad + 9 );
	av = reinterpret( a, 0 );
	av.set([
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
	], pad * 2 );
	tau = new Complex128Array( pad + 3 );
	work = new Complex128Array( 200 );
	info = zgeqlf( 3, 3, a, 1, 3, pad, tau, 1, pad, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ).subarray( pad * 2, ( pad * 2 ) + 18 ), tc.a, 1e-10, 'a with offset' );
	assertArrayClose( reinterpret( tau, 0 ).subarray( pad * 2, ( pad * 2 ) + 6 ), tc.tau, 1e-10, 'tau with offset' );
});

test( 'zgeqlf: padded LDA with offset and strided TAU (base API cannot express)', function t() {
	var SENTINEL_RE;
	var SENTINEL_IM;
	var strideTAU;
	var offsetTAU;
	var strideA2;
	var offsetA;
	var work;
	var info;
	var src;
	var tau;
	var tc;
	var av;
	var tv;
	var a;
	var i;
	var j;
	var M;
	var N;

	SENTINEL_RE = -999.5;
	SENTINEL_IM = 777.25;

	tc = findCase( 'basic_4x3' );
	M = 4;
	N = 3;
	strideA2 = 6; // padded LDA > M
	offsetA = 3; // non-zero complex offset
	strideTAU = 2; // strided TAU
	offsetTAU = 1;

	// Source data for the 4x3 matrix, column-major, interleaved re/im
	src = [
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
	];

	a = new Complex128Array( offsetA + ( strideA2 * N ) + 4 );
	av = reinterpret( a, 0 );

	// Fill with sentinel values to detect out-of-bounds writes
	for ( i = 0; i < av.length; i += 2 ) {
		av[ i ] = SENTINEL_RE;
		av[ i + 1 ] = SENTINEL_IM;
	}
	// Write the matrix into the padded buffer at offsetA with strideA2
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			av[ 2 * ( offsetA + ( j * strideA2 ) + i ) ] = src[ 2 * ( ( j * M ) + i ) ];
			av[ ( 2 * ( offsetA + ( j * strideA2 ) + i ) ) + 1 ] = src[ ( 2 * ( ( j * M ) + i ) ) + 1 ];
		}
	}

	tau = new Complex128Array( offsetTAU + ( strideTAU * N ) + 2 );
	tv = reinterpret( tau, 0 );
	for ( i = 0; i < tv.length; i += 2 ) {
		tv[ i ] = SENTINEL_RE;
		tv[ i + 1 ] = SENTINEL_IM;
	}

	work = new Complex128Array( 200 );
	info = zgeqlf( M, N, a, 1, strideA2, offsetA, tau, strideTAU, offsetTAU, work, 1, 0, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );

	// Verify the M-by-N written sub-matrix at (offsetA, strideA2) matches fixture
	av = reinterpret( a, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			assertClose( av[ 2 * ( offsetA + ( j * strideA2 ) + i ) ], tc.a[ 2 * ( ( j * M ) + i ) ], 1e-10, 'a[' + i + ',' + j + '] re' );
			assertClose( av[ ( 2 * ( offsetA + ( j * strideA2 ) + i ) ) + 1 ], tc.a[ ( 2 * ( ( j * M ) + i ) ) + 1 ], 1e-10, 'a[' + i + ',' + j + '] im' );
		}
	}

	// Verify leading sentinel (before offsetA) untouched
	for ( i = 0; i < offsetA; i++ ) {
		assert.strictEqual( av[ 2 * i ], SENTINEL_RE, 'leading sentinel re @' + i );
		assert.strictEqual( av[ ( 2 * i ) + 1 ], SENTINEL_IM, 'leading sentinel im @' + i );
	}
	// Verify padding rows (between column m and end of stride) and trailing sentinel untouched
	for ( j = 0; j < N; j++ ) {
		for ( i = M; i < strideA2; i++ ) {
			assert.strictEqual( av[ 2 * ( offsetA + ( j * strideA2 ) + i ) ], SENTINEL_RE, 'pad re col ' + j + ' row ' + i );
			assert.strictEqual( av[ ( 2 * ( offsetA + ( j * strideA2 ) + i ) ) + 1 ], SENTINEL_IM, 'pad im col ' + j + ' row ' + i );
		}
	}
	for ( i = offsetA + ( strideA2 * N ); i < ( a.length ); i++ ) {
		assert.strictEqual( av[ 2 * i ], SENTINEL_RE, 'trailing sentinel re @' + i );
		assert.strictEqual( av[ ( 2 * i ) + 1 ], SENTINEL_IM, 'trailing sentinel im @' + i );
	}

	// Verify TAU: values at offsetTAU + k*strideTAU, sentinels elsewhere
	tv = reinterpret( tau, 0 );
	for ( i = 0; i < N; i++ ) {
		assertClose( tv[ 2 * ( offsetTAU + ( i * strideTAU ) ) ], tc.tau[ 2 * i ], 1e-10, 'tau[' + i + '] re' );
		assertClose( tv[ ( 2 * ( offsetTAU + ( i * strideTAU ) ) ) + 1 ], tc.tau[ ( 2 * i ) + 1 ], 1e-10, 'tau[' + i + '] im' );
	}
	// Leading sentinel
	for ( i = 0; i < offsetTAU; i++ ) {
		assert.strictEqual( tv[ 2 * i ], SENTINEL_RE, 'tau leading sentinel re @' + i );
		assert.strictEqual( tv[ ( 2 * i ) + 1 ], SENTINEL_IM, 'tau leading sentinel im @' + i );
	}
	// Gap sentinels between strided elements
	for ( i = 0; i < N; i++ ) {
		for ( j = 1; j < strideTAU; j++ ) {
			assert.strictEqual( tv[ 2 * ( offsetTAU + ( i * strideTAU ) + j ) ], SENTINEL_RE, 'tau gap re @' + i + ',' + j );
			assert.strictEqual( tv[ ( 2 * ( offsetTAU + ( i * strideTAU ) + j ) ) + 1 ], SENTINEL_IM, 'tau gap im @' + i + ',' + j );
		}
	}
	// Trailing sentinel
	for ( i = offsetTAU + ( strideTAU * N ); i < tau.length; i++ ) {
		assert.strictEqual( tv[ 2 * i ], SENTINEL_RE, 'tau trailing sentinel re @' + i );
		assert.strictEqual( tv[ ( 2 * i ) + 1 ], SENTINEL_IM, 'tau trailing sentinel im @' + i );
	}
});
