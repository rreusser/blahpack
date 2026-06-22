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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-underscore-dangle, camelcase */

import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrfp from './../lib/ndarray.js';


// FIXTURES //

import fixture3x3 from './fixtures/3x3.json' with { type: 'json' };
import fixture4x3 from './fixtures/4x3.json' with { type: 'json' };
import fixtureNZero from './fixtures/n_zero.json' with { type: 'json' };
import fixtureLarge from './fixtures/large_65x65.json' with { type: 'json' };


// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
* @throws {Error} if any element differs by more than `tol`
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( format( '%s[%d]: expected %f, got %f', msg, i, expected[ i ], actual[ i ] ) );
		}
	}
}

/**
* Extracts an M-by-N matrix from a column-major buffer with the given LDA.
*
* @private
* @param {Float64Array} A - packed buffer
* @param {integer} M - rows
* @param {integer} N - columns
* @param {integer} lda - leading dimension
* @returns {Array} extracted matrix in column-major order
*/
function extractMatrix( A, M, N, lda ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ i + ( j * lda ) ] );
		}
	}
	return out;
}


// TESTS //

test( 'dgeqrfp: 3x3', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixture3x3;
	A = new Float64Array( 3 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 4;
	A[ 5 ] = 2;
	A[ 6 ] = 3;
	A[ 7 ] = 2;
	A[ 8 ] = 5;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgeqrfp( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );

	// Verify R diagonal is non-negative
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 4 ] >= 0, 'R[1,1] non-negative' );
	assert.ok( A[ 8 ] >= 0, 'R[2,2] non-negative' );
});

test( 'dgeqrfp: 4x3', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixture4x3;
	A = new Float64Array( 4 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 1;
	A[ 5 ] = 4;
	A[ 6 ] = 2;
	A[ 7 ] = 3;
	A[ 8 ] = 3;
	A[ 9 ] = 2;
	A[ 10 ] = 5;
	A[ 11 ] = 1;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 3 * 32 );
	info = dgeqrfp( 4, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 4, 3, 4 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
	assert.ok( A[ 0 ] >= 0, 'R[0,0] non-negative' );
	assert.ok( A[ 5 ] >= 0, 'R[1,1] non-negative' );
	assert.ok( A[ 10 ] >= 0, 'R[2,2] non-negative' );
});

test( 'dgeqrfp: N=0', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixtureNZero;
	A = new Float64Array( 9 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 32 );
	info = dgeqrfp( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
});

test( 'dgeqrfp: M=0', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	A = new Float64Array( 9 );
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 32 );
	info = dgeqrfp( 0, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgeqrfp: 3x3 with WORK=null (internal allocation)', function t() {
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixture3x3;
	A = new Float64Array( 3 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 4;
	A[ 5 ] = 2;
	A[ 6 ] = 3;
	A[ 7 ] = 2;
	A[ 8 ] = 5;
	TAU = new Float64Array( 3 );
	info = dgeqrfp( 3, 3, A, 1, 3, 0, TAU, 1, 0, null, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeqrfp: 3x3 with too-small WORK (internal reallocation)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = fixture3x3;
	A = new Float64Array( 3 * 3 );
	A[ 0 ] = 2;
	A[ 1 ] = 1;
	A[ 2 ] = 3;
	A[ 3 ] = 1;
	A[ 4 ] = 4;
	A[ 5 ] = 2;
	A[ 6 ] = 3;
	A[ 7 ] = 2;
	A[ 8 ] = 5;
	TAU = new Float64Array( 3 );
	WORK = new Float64Array( 1 );
	info = dgeqrfp( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 3 ), tc.A, 1e-14, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
});

test( 'dgeqrfp: large 65x65 (blocked path)', function t() {
	var WORK;
	var info;
	var LDA;
	var TAU;
	var tc;
	var M;
	var N;
	var A;
	var i;
	var j;

	tc = fixtureLarge;
	M = 65;
	N = 65;
	LDA = 70;
	A = new Float64Array( LDA * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i === j ) {
				A[ i + ( j * LDA ) ] = 10.0;
			} else {
				A[ i + ( j * LDA ) ] = 1.0 / ( Math.abs( i - j ) + 1 );
			}
		}
	}
	TAU = new Float64Array( Math.min( M, N ) );
	WORK = new Float64Array( N * 32 );
	info = dgeqrfp( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( extractMatrix( A, M, N, LDA ), tc.A, 1e-12, 'A' );
	assertArrayClose( TAU, tc.TAU, 1e-12, 'TAU' );

	// Verify R diagonal non-negative
	for ( i = 0; i < Math.min( M, N ); i++ ) {
		assert.ok( A[ i + ( i * LDA ) ] >= 0, format( 'R[%d,%d] non-negative', i, i ) );
	}
});

test( 'dgeqrfp: validates M', function t() {
	var WORK = new Float64Array( 9 );
	var TAU = new Float64Array( 3 );
	var A = new Float64Array( 9 );
	assert.throws( function throws() {
		dgeqrfp( -1, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'dgeqrfp: validates N', function t() {
	var WORK = new Float64Array( 9 );
	var TAU = new Float64Array( 3 );
	var A = new Float64Array( 9 );
	assert.throws( function throws() {
		dgeqrfp( 3, -1, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	}, RangeError );
});
