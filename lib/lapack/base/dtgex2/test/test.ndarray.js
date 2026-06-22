/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, node/no-sync, array-element-newline */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgex2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines;
var fixture;
var i;

lines = readFileSync( path.join( fixtureDir, 'dtgex2.jsonl' ), 'utf8' );
lines = lines.trim().split( '\n' );
fixture = [];
for ( i = 0; i < lines.length; i++ ) {
	fixture.push( JSON.parse( lines[ i ] ) );
}


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {(Object|undefined)} test case or undefined
*/
function findCase( name ) {
	var j;
	for ( j = 0; j < fixture.length; j++ ) {
		if ( fixture[ j ].name === name ) {
			return fixture[ j ];
		}
	}
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var j;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( j = 0; j < expected.length; j++ ) {
		relErr = Math.abs( actual[j] - expected[j] );
		relErr /= Math.max( Math.abs( expected[j] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + j + ']' );
	}
}

/**
* Extracts a column-major MxM subblock from an NxN array.
*
* @private
* @param {Float64Array} arr - column-major NxN array
* @param {integer} N - leading dimension
* @param {integer} M - subblock size
* @returns {Array} flat column-major MxM values
*/
function extractColMajor( arr, N, M ) {
	var out = [];
	var j;
	var k;
	for ( j = 0; j < M; j++ ) {
		for ( k = 0; k < M; k++ ) {
			out.push( arr[ k + ( j * N ) ] );
		}
	}
	return out;
}


// TESTS //

test( 'dtgex2::ndarray: swap_1x1_no_qz', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_no_qz' );
	N = 3;
	A = new Float64Array([
		1.0, 0.0, 0.0,
		0.5, 2.0, 0.0,
		0.3, 0.4, 3.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0,
		0.2, 1.5, 0.0,
		0.1, 0.3, 2.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-14, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-14, 'B' );
});

test( 'dtgex2::ndarray: swap_1x1_with_qz', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_with_qz' );
	N = 3;
	A = new Float64Array([
		1.0, 0.0, 0.0,
		0.5, 2.0, 0.0,
		0.3, 0.4, 3.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0,
		0.2, 1.5, 0.0,
		0.1, 0.3, 2.0
	]);
	Q = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	Z = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-14, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-14, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-14, 'Z' );
});

test( 'dtgex2::ndarray: swap_1x1_j1_2', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_j1_2' );
	N = 3;
	A = new Float64Array([
		4.0, 0.0, 0.0,
		0.3, 1.0, 0.0,
		0.2, 0.6, 5.0
	]);
	B = new Float64Array([
		2.0, 0.0, 0.0,
		0.1, 3.0, 0.0,
		0.3, 0.5, 1.0
	]);
	Q = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	Z = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-14, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-14, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-14, 'Z' );
});

test( 'dtgex2::ndarray: swap_2x2_1x1 (N1=2, N2=1)', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_2x2_1x1' );
	N = 4;
	A = new Float64Array([
		1.0, -0.5, 0.0, 0.0,
		0.5, 1.0, 0.0, 0.0,
		0.3, 0.2, 3.0, 0.0,
		0.1, 0.15, 0.4, 4.0
	]);
	B = new Float64Array([
		2.0, 0.0, 0.0, 0.0,
		0.3, 2.5, 0.0, 0.0,
		0.1, 0.2, 3.0, 0.0,
		0.05, 0.1, 0.3, 1.5
	]);
	Q = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	Z = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-13, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-13, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-13, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-13, 'Z' );
});

test( 'dtgex2::ndarray: swap_1x1_2x2 (N1=1, N2=2)', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_2x2' );
	N = 4;
	A = new Float64Array([
		5.0, 0.0, 0.0, 0.0,
		0.3, 1.0, -0.5, 0.0,
		0.2, 0.5, 1.0, 0.0,
		0.1, 0.15, 0.2, 4.0
	]);
	B = new Float64Array([
		2.0, 0.0, 0.0, 0.0,
		0.1, 1.5, 0.0, 0.0,
		0.05, 0.3, 2.5, 0.0,
		0.02, 0.1, 0.2, 3.0
	]);
	Q = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	Z = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-13, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-13, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-13, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-13, 'Z' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 (N1=2, N2=2)', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_2x2_2x2' );
	N = 5;
	A = new Float64Array([
		2.0, -1.0, 0.0, 0.0, 0.0,
		1.0, 2.0, 0.0, 0.0, 0.0,
		0.3, 0.4, 5.0, -0.8, 0.0,
		0.2, 0.1, 0.8, 5.0, 0.0,
		0.1, 0.05, 0.3, 0.2, 8.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0, 0.0,
		0.2, 1.5, 0.0, 0.0, 0.0,
		0.1, 0.3, 2.0, 0.0, 0.0,
		0.05, 0.1, 0.2, 2.5, 0.0,
		0.02, 0.05, 0.1, 0.15, 3.0
	]);
	Q = new Float64Array([
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1
	]);
	Z = new Float64Array([
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgex2::ndarray: swap_1x1_n5_j2', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_n5_j2' );
	N = 5;
	A = new Float64Array([
		1.0, 0.0, 0.0, 0.0, 0.0,
		0.3, 2.0, 0.0, 0.0, 0.0,
		0.2, 0.5, 4.0, 0.0, 0.0,
		0.1, 0.3, 0.6, 5.0, 0.0,
		0.05, 0.1, 0.2, 0.4, 6.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0, 0.0,
		0.1, 1.5, 0.0, 0.0, 0.0,
		0.05, 0.2, 2.0, 0.0, 0.0,
		0.02, 0.1, 0.3, 2.5, 0.0,
		0.01, 0.05, 0.1, 0.2, 3.0
	]);
	Q = new Float64Array([
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1
	]);
	Z = new Float64Array([
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-14, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-14, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-14, 'Z' );
});

test( 'dtgex2::ndarray: sb > sa branch', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_sb_gt_sa' );
	N = 3;
	A = new Float64Array([
		5.0, 0.0, 0.0,
		0.3, 0.1, 0.0,
		0.2, 0.4, 3.0
	]);
	B = new Float64Array([
		0.1, 0.0, 0.0,
		0.2, 5.0, 0.0,
		0.1, 0.3, 2.0
	]);
	Q = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	Z = new Float64Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-14, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-14, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-14, 'Z' );
});

test( 'dtgex2::ndarray: general case with leading part', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;
	var k;

	tc = findCase( 'swap_1x1_2x2_j2' );
	N = 5;
	A = new Float64Array([
		10.0, 0.0, 0.0, 0.0, 0.0,
		0.5, 5.0, 0.0, 0.0, 0.0,
		0.3, 0.3, 1.0, -0.5, 0.0,
		0.2, 0.2, 0.5, 1.0, 0.0,
		0.1, 0.15, 0.2, 0.1, 8.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0, 0.0,
		0.1, 1.5, 0.0, 0.0, 0.0,
		0.05, 0.2, 2.0, 0.0, 0.0,
		0.02, 0.1, 0.3, 2.5, 0.0,
		0.01, 0.05, 0.1, 0.15, 3.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	for ( k = 0; k < N; k++ ) {
		Q[ k + ( k * N ) ] = 1.0;
		Z[ k + ( k * N ) ] = 1.0;
	}
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 1, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractColMajor( Q, N, N ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( extractColMajor( Z, N, N ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgex2::ndarray: n1 > N returns 0', function t() {
	var WORK;
	var info;
	var A;
	var B;

	A = new Float64Array( 9 );
	B = new Float64Array( 9 );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, 3, A, 1, 3, 0, B, 1, 3, 0, A, 1, 3, 0, A, 1, 3, 0, 0, 4, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'returns 0 for n1 > N' );
});

test( 'dtgex2::ndarray: quick return for N <= 1', function t() {
	var WORK;
	var info;
	var A;
	var B;

	A = new Float64Array([ 1.0 ]);
	B = new Float64Array([ 2.0 ]);
	WORK = new Float64Array( 10 );
	info = dtgex2( false, false, 1, A, 1, 1, 0, B, 1, 1, 0, A, 1, 1, 0, A, 1, 1, 0, 0, 1, 1, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'returns 0 for N=1' );
});

test( 'dtgex2::ndarray: quick return for n1 = 0', function t() {
	var WORK;
	var info;
	var A;
	var B;

	A = new Float64Array( 9 );
	B = new Float64Array( 9 );
	WORK = new Float64Array( 10 );
	info = dtgex2( false, false, 3, A, 1, 3, 0, B, 1, 3, 0, A, 1, 3, 0, A, 1, 3, 0, 0, 0, 1, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'returns 0 for n1=0' );
});

test( 'dtgex2::ndarray: workspace query', function t() {
	var WORK;
	var info;
	var A;
	var B;

	A = new Float64Array( 16 );
	B = new Float64Array( 16 );
	WORK = new Float64Array( 1 );
	info = dtgex2( false, false, 4, A, 1, 4, 0, B, 1, 4, 0, A, 1, 4, 0, A, 1, 4, 0, 0, 2, 2, WORK, 1, 0, 0 ); // eslint-disable-line max-len
	assert.equal( info, -16, 'info=-16 for insufficient workspace' );
	assert.ok( WORK[ 0 ] > 0, 'WORK[0] set to required size' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 returns info=1 when blocks have identical eigenvalues', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	// Two 2x2 blocks with identical complex eigenvalue pairs (1±i)
	// The swap is ill-conditioned and should return info=1
	N = 4;
	A = new Float64Array([
		1.0, -1.0, 0.0, 0.0,
		1.0, 1.0, 0.0, 0.0,
		0.3, 0.2, 1.0, -1.0,
		0.1, 0.15, 1.0, 1.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		0.1, 1.0, 0.0, 0.0,
		0.05, 0.1, 1.0, 0.0,
		0.02, 0.05, 0.1, 1.0
	]);
	Q = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	Z = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'returns info=1 for ill-conditioned 2x2+2x2 swap' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 returns info=1 (threshold/stability path)', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	// Distinct eigenvalues (dtgsy2 succeeds) but large B off-diagonals cause
	// the factorization quality to exceed the threshold or fail the strong test
	N = 4;
	A = new Float64Array([
		2.0, -1.0, 0.0, 0.0,
		1.0, 2.0, 0.0, 0.0,
		0.3, 0.4, 5.0, -0.8,
		0.2, 0.1, 0.8, 5.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		100.0, 1.0, 0.0, 0.0,
		100.0, 100.0, 2.0, 0.0,
		100.0, 100.0, 100.0, 2.5
	]);
	Q = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	Z = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'returns info=1 for threshold/stability failure' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 returns info=1 without Q/Z update', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	N = 4;
	A = new Float64Array([
		1.0, -1.0, 0.0, 0.0,
		1.0, 1.0, 0.0, 0.0,
		0.3, 0.2, 1.0, -1.0,
		0.1, 0.15, 1.0, 1.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0,
		0.1, 1.0, 0.0, 0.0,
		0.05, 0.1, 1.0, 0.0,
		0.02, 0.05, 0.1, 1.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'returns info=1 for ill-conditioned swap without Q/Z' );
});

test( 'dtgex2::ndarray: swap_2x2_1x1 returns info=1 (dtgsy2 path)', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	// 2x2 block with eigenvalues 1±1e-15i, 1x1 block with eigenvalue 1
	// Large off-diagonal coupling makes the swap fail at dtgsy2
	N = 3;
	A = new Float64Array([
		1.0, -1e-15, 0.0,
		1e-15, 1.0, 0.0,
		5.0, 5.0, 1.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0,
		5.0, 1.0, 0.0,
		5.0, 5.0, 1.0
	]);
	Q = new Float64Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]);
	Z = new Float64Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'returns info=1 for ill-conditioned 2x2+1x1 swap' );
});

test( 'dtgex2::ndarray: swap_1x1_2x2 returns info=1 for nearly-identical eigenvalues', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	// 1x1 block with eigenvalue 1, 2x2 block with eigenvalues 1±1e-15i
	N = 3;
	A = new Float64Array([
		1.0, 0.0, 0.0,
		5.0, 1.0, -1e-15,
		5.0, 1e-15, 1.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0,
		5.0, 1.0, 0.0,
		5.0, 5.0, 1.0
	]);
	Q = new Float64Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]);
	Z = new Float64Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]);
	WORK = new Float64Array( 200 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'returns info=1 for ill-conditioned 1x1+2x2 swap' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 without Q/Z (wantq=false, wantz=false)', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_2x2_2x2' );
	N = 5;
	A = new Float64Array([
		2.0, -1.0, 0.0, 0.0, 0.0,
		1.0, 2.0, 0.0, 0.0, 0.0,
		0.3, 0.4, 5.0, -0.8, 0.0,
		0.2, 0.1, 0.8, 5.0, 0.0,
		0.1, 0.05, 0.3, 0.2, 8.0
	]);
	B = new Float64Array([
		1.0, 0.0, 0.0, 0.0, 0.0,
		0.2, 1.5, 0.0, 0.0, 0.0,
		0.1, 0.3, 2.0, 0.0, 0.0,
		0.05, 0.1, 0.2, 2.5, 0.0,
		0.02, 0.05, 0.1, 0.15, 3.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-12, 'B' );
});

test( 'dtgex2::ndarray: swap_2x2_1x1 without Q/Z', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_2x2_1x1' );
	N = 4;
	A = new Float64Array([
		1.0, -0.5, 0.0, 0.0,
		0.5, 1.0, 0.0, 0.0,
		0.3, 0.2, 3.0, 0.0,
		0.1, 0.15, 0.4, 4.0
	]);
	B = new Float64Array([
		2.0, 0.0, 0.0, 0.0,
		0.3, 2.5, 0.0, 0.0,
		0.1, 0.2, 3.0, 0.0,
		0.05, 0.1, 0.3, 1.5
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-13, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-13, 'B' );
});

test( 'dtgex2::ndarray: swap_1x1_2x2 without Q/Z', function t() {
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	tc = findCase( 'swap_1x1_2x2' );
	N = 4;
	A = new Float64Array([
		5.0, 0.0, 0.0, 0.0,
		0.3, 1.0, -0.5, 0.0,
		0.2, 0.5, 1.0, 0.0,
		0.1, 0.15, 0.2, 4.0
	]);
	B = new Float64Array([
		2.0, 0.0, 0.0, 0.0,
		0.1, 1.5, 0.0, 0.0,
		0.05, 0.3, 2.5, 0.0,
		0.02, 0.1, 0.2, 3.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 2, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractColMajor( A, N, N ), tc.A, 1e-13, 'A' );
	assertArrayClose( extractColMajor( B, N, N ), tc.B, 1e-13, 'B' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 with larger matrix (exercises trailing part)', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;
	var k;

	// N=6 with 2x2+2x2 swap at j1=0, so trailing part (columns 4,5) gets updated
	N = 6;
	A = new Float64Array([
		2, -1, 0, 0, 0, 0,
		1, 2, 0, 0, 0, 0,
		0.3, 0.4, 5, -0.8, 0, 0,
		0.2, 0.1, 0.8, 5, 0, 0,
		0.1, 0.05, 0.3, 0.2, 8, 0,
		0.05, 0.02, 0.1, 0.1, 0.3, 9
	]);
	B = new Float64Array([
		1, 0, 0, 0, 0, 0,
		0.2, 1.5, 0, 0, 0, 0,
		0.1, 0.3, 2, 0, 0, 0,
		0.05, 0.1, 0.2, 2.5, 0, 0,
		0.02, 0.05, 0.1, 0.15, 3, 0,
		0.01, 0.02, 0.05, 0.08, 0.1, 3.5
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	for ( k = 0; k < N; k++ ) {
		Q[ k + ( k * N ) ] = 1.0;
		Z[ k + ( k * N ) ] = 1.0;
	}
	WORK = new Float64Array( 400 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, 2, WORK, 1, 0, 400 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dtgex2::ndarray: swap_1x1 returns info=1 for weak stability failure', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;

	// Non-Schur-form input with nonzero subdiagonal triggers weak stability failure
	// in the 1x1+1x1 swap path (the rotation cannot simultaneously triangularize
	// both A and B subblocks)
	N = 3;
	A = new Float64Array([
		1.0, 0.1, 0.0,
		0.3, 0.5, 0.0,
		0.0, 0.0, 3.0
	]);
	B = new Float64Array([
		1.0, 0.1, 0.0,
		0.2, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	info = dtgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 1, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( info, 1, 'returns info=1 for weak stability failure in 1x1 swap' );
});

test( 'dtgex2::ndarray: swap_2x2_2x2 at j1=1 (exercises leading part)', function t() {
	var WORK;
	var info;
	var A;
	var B;
	var Q;
	var Z;
	var N;
	var k;

	// N=6 with 2x2+2x2 swap at j1=1, so leading part (row 0) and trailing part get updated
	N = 6;
	A = new Float64Array([
		8, 0, 0, 0, 0, 0,
		0.3, 2, -1, 0, 0, 0,
		0.2, 1, 2, 0, 0, 0,
		0.1, 0.4, 0.3, 5, -0.8, 0,
		0.05, 0.2, 0.1, 0.8, 5, 0,
		0.02, 0.1, 0.05, 0.3, 0.2, 9
	]);
	B = new Float64Array([
		3, 0, 0, 0, 0, 0,
		0.1, 1, 0, 0, 0, 0,
		0.05, 0.2, 1.5, 0, 0, 0,
		0.02, 0.1, 0.3, 2, 0, 0,
		0.01, 0.05, 0.1, 0.2, 2.5, 0,
		0.005, 0.02, 0.05, 0.08, 0.1, 3.5
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	for ( k = 0; k < N; k++ ) {
		Q[ k + ( k * N ) ] = 1.0;
		Z[ k + ( k * N ) ] = 1.0;
	}
	WORK = new Float64Array( 400 );
	info = dtgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 2, 2, WORK, 1, 0, 400 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});
