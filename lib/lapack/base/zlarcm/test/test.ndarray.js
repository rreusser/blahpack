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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import base from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';


// VARIABLES //

var FIXTURE_PATH = resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlarcm.jsonl' );
var FIXTURE_LINES = readFileSync( FIXTURE_PATH, 'utf8' ).split( '\n' ); // eslint-disable-line node/no-sync
var FIXTURES = parseFixtures( FIXTURE_LINES );


// FUNCTIONS //

/**
* Parses JSONL fixture lines and returns an object keyed by case name.
*
* @private
* @param {Array<string>} lines - fixture lines
* @returns {Object} fixture cases
*/
function parseFixtures( lines ) {
	var cases;
	var rec;
	var i;
	cases = {};
	for ( i = 0; i < lines.length; i++ ) {
		if ( lines[ i ].length === 0 ) {
			continue;
		}
		rec = JSON.parse( lines[ i ] );
		cases[ rec.name ] = rec;
	}
	return cases;
}

/**
* Asserts two real arrays are close in absolute terms.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - absolute tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol, format( '%s[%d]: expected %d, got %d', msg, i, expected[ i ], actual[ i ] ) );
	}
}

/**
* Runs a fixture-driven case through the base routine in column-major layout.
*
* @private
* @param {Object} tc - fixture case
*/
function runFixture( tc ) {
	var RWORK;
	var M;
	var N;
	var A;
	var B;
	var C;
	M = tc.m;
	N = tc.n;
	A = new Float64Array( tc.a );
	B = new Complex128Array( new Float64Array( tc.b ) );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );
	base( M, N, A, 1, M, 0, B, 1, M, 0, C, 1, M, 0, RWORK, 1, 0 );
	assertArrayClose( reinterpret( C, 0 ), tc.c, 1e-13, tc.name );
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof base, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarray, 'function', 'is a function' );
});

test( 'zlarcm.base: 3x3 real * 3x2 complex matches Fortran fixture', function t() {
	runFixture( FIXTURES.zlarcm_basic );
});

test( 'zlarcm.base: scalar (M=N=1) matches Fortran fixture', function t() {
	runFixture( FIXTURES.zlarcm_one );
});

test( 'zlarcm.base: 4x4 real * 4x3 complex matches Fortran fixture', function t() {
	runFixture( FIXTURES.zlarcm_4x3 );
});

test( 'zlarcm.base: 2x2 real * 2x4 complex matches Fortran fixture', function t() {
	runFixture( FIXTURES.zlarcm_2x4 );
});

test( 'zlarcm.base: M=0 quick return leaves C empty', function t() {
	var RWORK;
	var A;
	var B;
	var C;
	A = new Float64Array( 0 );
	B = new Complex128Array( 0 );
	C = new Complex128Array( 0 );
	RWORK = new Float64Array( 1 );
	base( 0, 3, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( C.length, 0, 'C is empty' );
});

test( 'zlarcm.base: N=0 quick return leaves C empty', function t() {
	var RWORK;
	var A;
	var B;
	var C;
	A = new Float64Array( 4 );
	B = new Complex128Array( 0 );
	C = new Complex128Array( 0 );
	RWORK = new Float64Array( 1 );
	base( 2, 0, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, RWORK, 1, 0 );
	assert.strictEqual( C.length, 0, 'C is empty' );
});

test( 'zlarcm.ndarray: validates negative M', function t() {
	var RWORK;
	var A;
	var B;
	var C;
	A = new Float64Array( 1 );
	B = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	RWORK = new Float64Array( 2 );
	assert.throws( function bad() {
		ndarray( -1, 1, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, RWORK, 1, 0 );
	}, RangeError );
});

test( 'zlarcm.ndarray: validates negative N', function t() {
	var RWORK;
	var A;
	var B;
	var C;
	A = new Float64Array( 1 );
	B = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	RWORK = new Float64Array( 2 );
	assert.throws( function bad() {
		ndarray( 1, -1, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, RWORK, 1, 0 );
	}, RangeError );
});

test( 'zlarcm.base: row-major A (strideA1=M, strideA2=1) computes C = A * B', function t() {
	var expected;
	var RWORK;
	var M;
	var N;
	var A;
	var B;
	var C;
	M = 2;
	N = 2;

	// A = [[1,2],[3,4]] stored row-major: [1,2,3,4]
	A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

	// B = [[1+i, 2-i],[3+2i, 4]] interleaved column-major:
	B = new Complex128Array( new Float64Array( [ 1.0, 1.0, 3.0, 2.0, 2.0, -1.0, 4.0, 0.0 ] ) );
	C = new Complex128Array( M * N );
	RWORK = new Float64Array( 2 * M * N );

	// row-major A: strideA1=2, strideA2=1; column-major B/C
	base( M, N, A, 2, 1, 0, B, 1, M, 0, C, 1, M, 0, RWORK, 1, 0 );

	// Expected C = A * B: C[0,0]=7+5i, C[1,0]=15+11i, C[0,1]=10-i, C[1,1]=22-3i.
	expected = [ 7.0, 5.0, 15.0, 11.0, 10.0, -1.0, 22.0, -3.0 ];
	assertArrayClose( reinterpret( C, 0 ), expected, 1e-13, 'row-major-A' );
});

test( 'zlarcm.base: non-zero offsetRWORK (use mid-buffer scratch)', function t() {
	var RWORK;
	var M;
	var N;
	var A;
	var B;
	var C;
	M = 2;
	N = 2;
	A = new Float64Array( [ 2.0, 0.0, 0.0, 2.0 ] );
	B = new Complex128Array( new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] ) );
	C = new Complex128Array( M * N );

	// Allocate RWORK with leading padding to exercise offsetRWORK > 0:
	RWORK = new Float64Array( ( 2 * M * N ) + 5 );
	base( M, N, A, 1, M, 0, B, 1, M, 0, C, 1, M, 0, RWORK, 1, 5 );

	// Expected: A=2*I, so C = 2*B.
	assertArrayClose( reinterpret( C, 0 ), [ 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0 ], 1e-13, 'offsetRWORK' );
});
