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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_PATH = resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlarz.jsonl' );
var RAW = readFileSync( FIXTURE_PATH, 'utf8' ); // eslint-disable-line node/no-sync
var LINES = RAW.trim().split( '\n' );
var FIXTURES = LINES.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Looks up a fixture by name.
*
* @private
* @param {string} name - fixture name
* @returns {Object} fixture
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	return null;
}

/**
* Returns a fresh 4x3 column-major interleaved matrix used across tests.
*
* @private
* @returns {Complex128Array} complex matrix
*/
function buildC4x3() {
	var out = new Complex128Array( 12 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = 1.0;
	v[ 1 ] = 0.0;
	v[ 2 ] = 2.0;
	v[ 3 ] = 1.0;
	v[ 4 ] = 3.0;
	v[ 5 ] = -1.0;
	v[ 6 ] = 4.0;
	v[ 7 ] = 0.5;
	v[ 8 ] = -1.0;
	v[ 9 ] = 2.0;
	v[ 10 ] = 0.5;
	v[ 11 ] = 0.5;
	v[ 12 ] = 1.5;
	v[ 13 ] = -0.5;
	v[ 14 ] = -2.0;
	v[ 15 ] = 1.0;
	v[ 16 ] = 0.0;
	v[ 17 ] = 1.0;
	v[ 18 ] = 1.0;
	v[ 19 ] = 1.0;
	v[ 20 ] = -0.5;
	v[ 21 ] = 0.0;
	v[ 22 ] = 2.0;
	v[ 23 ] = -2.0;
	return out;
}

/**
* Returns a fresh 3x2 column-major interleaved matrix used across tests.
*
* @private
* @returns {Complex128Array} complex matrix
*/
function buildC3x2() {
	var out = new Complex128Array( 6 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = 1.0;
	v[ 1 ] = 0.0;
	v[ 2 ] = 2.0;
	v[ 3 ] = 1.0;
	v[ 4 ] = 3.0;
	v[ 5 ] = -1.0;
	v[ 6 ] = 4.0;
	v[ 7 ] = 0.5;
	v[ 8 ] = -1.0;
	v[ 9 ] = 2.0;
	v[ 10 ] = 0.5;
	v[ 11 ] = 0.5;
	return out;
}

/**
* Returns a length-2 reflector.
*
* @private
* @returns {Complex128Array} v
*/
function buildV2() {
	var out = new Complex128Array( 2 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = 0.5;
	v[ 1 ] = 0.2;
	v[ 2 ] = -0.3;
	v[ 3 ] = 0.4;
	return out;
}

/**
* Returns a length-3 reflector.
*
* @private
* @returns {Complex128Array} v
*/
function buildV3() {
	var out = new Complex128Array( 3 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = 0.5;
	v[ 1 ] = 0.2;
	v[ 2 ] = -0.3;
	v[ 3 ] = 0.4;
	v[ 4 ] = 0.7;
	v[ 5 ] = -0.1;
	return out;
}

/**
* Returns a single complex scalar as a Complex128Array of length 1.
*
* @private
* @param {number} re - real part
* @param {number} im - imag part
* @returns {Complex128Array} tau
*/
function buildTau( re, im ) {
	var out = new Complex128Array( 1 );
	var v = reinterpret( out, 0 );
	v[ 0 ] = re;
	v[ 1 ] = im;
	return out;
}

/**
* Asserts that two real numbers agree within tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two real arrays agree elementwise within tolerance.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
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
* Converts a typed array (or array-like) to a plain array.
*
* @private
* @param {Object} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Permutes an interleaved column-major complex flat array to row-major.
*
* @private
* @param {Array} src - column-major interleaved array of length 2*M*N
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @returns {Array} row-major interleaved array
*/
function permuteColToRow( src, M, N ) {
	var sIdx;
	var out;
	var k;
	var i;
	var j;
	out = [];
	for ( k = 0; k < 2 * M * N; k++ ) {
		out.push( 0.0 );
	}
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sIdx = 2 * ( i + ( M * j ) );
			out[ 2 * ( ( N * i ) + j ) ] = src[ sIdx ];
			out[ ( 2 * ( ( N * i ) + j ) ) + 1 ] = src[ sIdx + 1 ];
		}
	}
	return out;
}


// TESTS //

test( 'ndarray export is a function', function t() {
	assert.strictEqual( typeof ndarray, 'function', 'is a function' );
});

test( 'ndarray: throws TypeError for invalid side', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		ndarray( 'invalid', 2, 2, 1, v, 1, 0, tau, 0, C, 1, 2, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		ndarray( 'left', -1, 2, 1, v, 1, 0, tau, 0, C, 1, 2, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = new Complex128Array( 1 );
	var C = new Complex128Array( 4 );
	var v = new Complex128Array( 2 );
	assert.throws( function throws() {
		ndarray( 'left', 2, -1, 1, v, 1, 0, tau, 0, C, 1, 2, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'ndarray: returns C unchanged when M=0', function t() {
	var WORK;
	var tau;
	var out;
	var C;
	var v;
	WORK = new Complex128Array( 1 );
	tau = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	v = new Complex128Array( 1 );
	out = ndarray( 'left', 0, 1, 0, v, 1, 0, tau, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out, C, 'returns C' );
});

test( 'ndarray: returns C unchanged when N=0', function t() {
	var WORK;
	var tau;
	var out;
	var C;
	var v;
	WORK = new Complex128Array( 1 );
	tau = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	v = new Complex128Array( 1 );
	out = ndarray( 'left', 1, 0, 0, v, 1, 0, tau, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out, C, 'returns C' );
});

test( 'ndarray: left 4x3 L=2 matches fixture (column-major)', function t() {
	var WORK = new Complex128Array( 3 );
	var tau = buildTau( 1.2, -0.4 );
	var tc = findCase( 'zlarz_left_4x3_l2' );
	var C = buildC4x3();
	var v = buildV2();
	ndarray( 'left', 4, 3, 2, v, 1, 0, tau, 0, C, 1, 4, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'ndarray: left 4x3 L=2 row-major strides matches fixture', function t() {
	var expected;
	var rowIn;
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	WORK = new Complex128Array( 3 );
	tau = buildTau( 1.2, -0.4 );
	tc = findCase( 'zlarz_left_4x3_l2' );
	rowIn = permuteColToRow( toArray( reinterpret( buildC4x3(), 0 ) ), 4, 3 );
	expected = permuteColToRow( tc.C, 4, 3 );
	C = new Complex128Array( rowIn );
	v = buildV2();
	ndarray( 'left', 4, 3, 2, v, 1, 0, tau, 0, C, 3, 1, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), expected, 1e-13, 'C' );
});

test( 'ndarray: left with padded buffers, sentinels untouched', function t() {
	var WORK;
	var base;
	var full;
	var tau;
	var Cv;
	var tc;
	var tv;
	var vv;
	var wv;
	var C;
	var i;
	var v;
	WORK = new Complex128Array( 5 );
	tau = new Complex128Array( 3 );
	v = new Complex128Array( 5 );
	tc = findCase( 'zlarz_left_4x3_l2' );

	// WORK: [33,-33, 0,0,0,0,0,0, 44,-44]
	wv = reinterpret( WORK, 0 );
	wv[ 0 ] = 33.0;
	wv[ 1 ] = -33.0;
	wv[ 8 ] = 44.0;
	wv[ 9 ] = -44.0;

	// tau: [11,-11, 1.2,-0.4, 22,-22]
	tv = reinterpret( tau, 0 );
	tv[ 0 ] = 11.0;
	tv[ 1 ] = -11.0;
	tv[ 2 ] = 1.2;
	tv[ 3 ] = -0.4;
	tv[ 4 ] = 22.0;
	tv[ 5 ] = -22.0;

	// v: [99,-99, 0.5,0.2, -0.3,0.4, 77,-77, 88,-88]
	vv = reinterpret( v, 0 );
	vv[ 0 ] = 99.0;
	vv[ 1 ] = -99.0;
	vv[ 2 ] = 0.5;
	vv[ 3 ] = 0.2;
	vv[ 4 ] = -0.3;
	vv[ 5 ] = 0.4;
	vv[ 6 ] = 77.0;
	vv[ 7 ] = -77.0;
	vv[ 8 ] = 88.0;
	vv[ 9 ] = -88.0;

	// C: [13,-13, <24 body>, 17,-17, 19,-19]
	C = new Complex128Array( 15 );
	Cv = reinterpret( C, 0 );
	Cv[ 0 ] = 13.0;
	Cv[ 1 ] = -13.0;
	base = toArray( reinterpret( buildC4x3(), 0 ) );
	for ( i = 0; i < 24; i++ ) {
		Cv[ 2 + i ] = base[ i ];
	}
	Cv[ 26 ] = 17.0;
	Cv[ 27 ] = -17.0;
	Cv[ 28 ] = 19.0;
	Cv[ 29 ] = -19.0;

	ndarray( 'left', 4, 3, 2, v, 1, 1, tau, 1, C, 1, 4, 1, WORK, 1, 1 );

	full = toArray( reinterpret( C, 0 ) );
	assertArrayClose( full.slice( 2, 26 ), tc.C, 1e-13, 'C body' );
	assert.strictEqual( full[ 0 ], 13.0, 'C head re' );
	assert.strictEqual( full[ 1 ], -13.0, 'C head im' );
	assert.strictEqual( full[ 26 ], 17.0, 'C tail0 re' );
	assert.strictEqual( full[ 27 ], -17.0, 'C tail0 im' );
	assert.strictEqual( full[ 28 ], 19.0, 'C tail1 re' );
	assert.strictEqual( full[ 29 ], -19.0, 'C tail1 im' );
});

test( 'ndarray: right with non-unit strideV and offsetV', function t() {
	var vfull;
	var WORK;
	var tau;
	var tc;
	var vv;
	var C;
	var v;
	WORK = new Complex128Array( 3 );
	tau = buildTau( 0.8, 0.5 );
	tc = findCase( 'zlarz_right_3x4_l2' );
	C = buildC4x3();
	v = new Complex128Array( 3 );

	// v packed with stride 2: [0.5,0.2, 55,-55, -0.3,0.4]
	vv = reinterpret( v, 0 );
	vv[ 0 ] = 0.5;
	vv[ 1 ] = 0.2;
	vv[ 2 ] = 55.0;
	vv[ 3 ] = -55.0;
	vv[ 4 ] = -0.3;
	vv[ 5 ] = 0.4;

	ndarray( 'right', 3, 4, 2, v, 2, 0, tau, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );

	vfull = toArray( reinterpret( v, 0 ) );
	assert.strictEqual( vfull[ 2 ], 55.0, 'v filler re' );
	assert.strictEqual( vfull[ 3 ], -55.0, 'v filler im' );
});

test( 'ndarray: tau = 0 is a no-op (left)', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = buildTau( 0.0, 0.0 );
	var tc = findCase( 'zlarz_tau_zero' );
	var C = buildC3x2();
	var v = buildV2();
	ndarray( 'left', 3, 2, 2, v, 1, 0, tau, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'ndarray: L=0 on left only updates first row', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = buildTau( 1.0, 0.3 );
	var tc = findCase( 'zlarz_l_zero_left' );
	var C = buildC3x2();
	var v = buildV2();
	ndarray( 'left', 3, 2, 0, v, 1, 0, tau, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'ndarray: left 3x2 L=3 (L == M)', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = buildTau( 0.9, 0.2 );
	var tc = findCase( 'zlarz_left_3x2_l3' );
	var C = buildC3x2();
	var v = buildV3();
	ndarray( 'left', 3, 2, 3, v, 1, 0, tau, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});

test( 'ndarray: right 2x3 L=3 (L == N)', function t() {
	var WORK = new Complex128Array( 2 );
	var tau = buildTau( 1.1, -0.3 );
	var tc = findCase( 'zlarz_right_2x3_l3' );
	var C = buildC3x2();
	var v = buildV3();
	ndarray( 'right', 2, 3, 3, v, 1, 0, tau, 0, C, 1, 2, 0, WORK, 1, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-13, 'C' );
});
