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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerqf from './../../zgerqf/lib/base.js';
import zungrq from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zungrq.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Look up a fixture case by name.
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
* Assert that two floats are within `tol` relative error.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays of floats agree element-wise within `tol`.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Convert a typed array to a plain Array.
*
* @private
* @param {TypedArray} arr - input typed array
* @returns {Array} plain array
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
* RQ-factor a column-major M-by-N complex matrix.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Array} entries - flat interleaved (re, im, re, im, ...) column-major
* @returns {Object} { A, TAU } the factored matrix and tau vector
*/
function rqFactor( M, N, entries ) {
	var WORK;
	var TAU;
	var A;
	A = new Complex128Array( entries );
	TAU = new Complex128Array( Math.min( M, N ) );
	WORK = new Complex128Array( Math.max( 1, M ) * 64 );
	zgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0, WORK.length );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Compute the maximum element-wise deviation of `Q*Q^H` from `I_M`.
*
* @private
* @param {Float64Array} Av - interleaved (re, im) view of Q, column-major M-by-N
* @param {NonNegativeInteger} M - number of rows of Q
* @param {NonNegativeInteger} N - number of columns of Q
* @returns {number} the maximum |Q*Q^H - I|_ij over all (i, j)
*/
function maxOrthonormalErr( Av, M, N ) {
	var maxErr;
	var expI;
	var rsum;
	var isum;
	var err;
	var ii;
	var jj;
	var qi;
	var qj;
	var k;
	maxErr = 0.0;
	for ( ii = 0; ii < M; ii++ ) {
		for ( jj = 0; jj < M; jj++ ) {
			rsum = 0.0;
			isum = 0.0;
			for ( k = 0; k < N; k++ ) {
				qi = 2 * ( ii + ( k * M ) );
				qj = 2 * ( jj + ( k * M ) );
				rsum += ( Av[ qi ] * Av[ qj ] ) + ( Av[ qi + 1 ] * Av[ qj + 1 ] );
				isum += ( -Av[ qi ] * Av[ qj + 1 ] ) + ( Av[ qi + 1 ] * Av[ qj ] );
			}
			expI = ( ii === jj ) ? 1.0 : 0.0;
			err = Math.abs( rsum - expI ) + Math.abs( isum );
			if ( err > maxErr ) {
				maxErr = err;
			}
		}
	}
	return maxErr;
}


// TESTS //

test( 'zungrq: 3x4, K=3 (from RQ of 3x4)', function t() {
	var entries;
	var WORK;
	var info;
	var rq;
	var tc;
	tc = findCase( 'zungrq_3x4_k3' );
	entries = [
		2.0,
		1.0,
		1.0,
		0.2,
		3.0,
		0.8,
		1.0,
		-0.5,
		4.0,
		-1.0,
		2.0,
		0.1,
		3.0,
		0.7,
		2.0,
		0.4,
		5.0,
		0.6,
		1.0,
		0.3,
		3.0,
		-0.2,
		2.0,
		-0.3
	];
	rq = rqFactor( 3, 4, entries );
	WORK = new Complex128Array( 3 * 32 );
	info = zungrq( 3, 4, 3, rq.A, 1, 3, 0, rq.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( 3, tc.M, 'M' );
	assert.equal( 4, tc.N, 'N' );
	assertArrayClose( toArray( reinterpret( rq.A, 0 ) ), tc.A, 1e-12, 'A' );
});

test( 'zungrq: 3x3, K=3 (from RQ of 3x3)', function t() {
	var entries;
	var WORK;
	var info;
	var rq;
	var tc;
	tc = findCase( 'zungrq_3x3_k3' );
	entries = [
		4.0,
		0.5,
		1.0,
		0.1,
		2.0,
		-0.6,
		1.0,
		-0.2,
		3.0,
		0.0,
		1.0,
		0.8,
		2.0,
		0.3,
		1.0,
		0.4,
		5.0,
		-0.1
	];
	rq = rqFactor( 3, 3, entries );
	WORK = new Complex128Array( 3 * 32 );
	info = zungrq( 3, 3, 3, rq.A, 1, 3, 0, rq.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( rq.A, 0 ) ), tc.A, 1e-12, 'A' );
});

test( 'zungrq: 2x5, K=2 (rectangular, M < N)', function t() {
	var entries;
	var WORK;
	var info;
	var rq;
	var tc;
	tc = findCase( 'zungrq_2x5_k2' );
	entries = [
		1.0,
		0.5,
		6.0,
		0.4,
		2.0,
		-0.3,
		7.0,
		0.1,
		3.0,
		0.2,
		8.0,
		-0.5,
		4.0,
		0.6,
		9.0,
		0.3,
		5.0,
		-0.1,
		10.0,
		-0.2
	];
	rq = rqFactor( 2, 5, entries );
	WORK = new Complex128Array( 2 * 32 );
	info = zungrq( 2, 5, 2, rq.A, 1, 2, 0, rq.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( rq.A, 0 ) ), tc.A, 1e-12, 'A' );
});

test( 'zungrq: K=0 (no reflectors, identity loading)', function t() {
	var entries;
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( 'zungrq_k0_identity' );
	entries = [
		9.0,
		1.0,
		9.0,
		4.0,
		9.0,
		7.0,
		9.0,
		2.0,
		9.0,
		5.0,
		9.0,
		8.0,
		9.0,
		3.0,
		9.0,
		6.0,
		9.0,
		9.0
	];
	A = new Complex128Array( entries );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 32 );
	info = zungrq( 3, 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungrq: M=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( 'zungrq_m0_quick' );
	A = new Complex128Array( 4 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zungrq( 0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zungrq: 1x1, K=1', function t() {
	var entries;
	var WORK;
	var info;
	var rq;
	var tc;
	tc = findCase( 'zungrq_1x1_k1' );
	entries = [ 7.0, -2.0 ];
	rq = rqFactor( 1, 1, entries );
	WORK = new Complex128Array( 32 );
	info = zungrq( 1, 1, 1, rq.A, 1, 1, 0, rq.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( rq.A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungrq: 1x4, K=1 (single row, from RQ)', function t() {
	var entries;
	var WORK;
	var info;
	var rq;
	var tc;
	tc = findCase( 'zungrq_1x4_k1' );
	entries = [
		1.0,
		0.5,
		2.0,
		-0.3,
		3.0,
		0.2,
		4.0,
		0.6
	];
	rq = rqFactor( 1, 4, entries );
	WORK = new Complex128Array( 32 );
	info = zungrq( 1, 4, 1, rq.A, 1, 1, 0, rq.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( rq.A, 0 ) ), tc.A, 1e-12, 'A' );
});

test( 'zungrq: 35x40, K=35 (blocked path, NB=32) -- property-based', function t() {
	// RQ factorization is not unique (TAU sign ambiguity), so element-wise
	// Fixture comparison can be fragile. Verify the mathematical property:
	// `Q*Q^H = I_M` (Q has orthonormal rows).
	var entries;
	var maxErr;
	var WORK;
	var info;
	var LDA;
	var rq;
	var Av;
	var re;
	var im;
	var M;
	var N;
	var K;
	var i;
	var j;
	findCase( 'zungrq_35x40_k35_blocked' ); // ensure fixture exists
	M = 35;
	N = 40;
	K = 35;
	LDA = M;
	entries = [];
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			re = ( ( i + j ) / ( M + N ) ) + ( 0.1 * ( ( i * j ) % 7 ) );
			im = ( i - j ) / ( M + N );
			entries[ 2 * ( ( ( j - 1 ) * M ) + ( i - 1 ) ) ] = re;
			entries[ ( 2 * ( ( ( j - 1 ) * M ) + ( i - 1 ) ) ) + 1 ] = im;
		}
	}
	rq = rqFactor( M, N, entries );
	WORK = new Complex128Array( M * 64 );
	info = zungrq( M, N, K, rq.A, 1, LDA, 0, rq.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( rq.A, 0 );
	maxErr = maxOrthonormalErr( Av, M, N );
	assert.ok( maxErr < 1e-10, 'Q*Q^H = I, max error: ' + maxErr );
});

test( 'zungrq: N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	tc = findCase( 'zungrq_n0_quick' );
	A = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zungrq( 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zungrq: from RQ factorization 4x4 (paired input/output)', function t() {
	var expected;
	var maxErr;
	var input;
	var WORK;
	var info;
	var TAU;
	var Av;
	var M;
	var N;
	var K;
	var A;
	input = findCase( 'zungrq_from_rq_4x4_input' );
	expected = findCase( 'zungrq_from_rq_4x4' );
	M = input.M;
	N = input.N;
	K = input.K;
	A = new Complex128Array( input.A );
	TAU = new Complex128Array( input.TAU );
	WORK = new Complex128Array( M * 64 );
	info = zungrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), expected.A, 1e-12, 'A' );
	Av = reinterpret( A, 0 );
	maxErr = maxOrthonormalErr( Av, M, N );
	assert.ok( maxErr < 1e-10, 'Q*Q^H = I, max error: ' + maxErr );
});

test( 'zungrq: 5x8, K=5 (paired input/output)', function t() {
	var expected;
	var input;
	var WORK;
	var info;
	var TAU;
	var M;
	var N;
	var K;
	var A;
	input = findCase( 'zungrq_5x8_k5_input' );
	expected = findCase( 'zungrq_5x8_k5' );
	M = input.M;
	N = input.N;
	K = input.K;
	A = new Complex128Array( input.A );
	TAU = new Complex128Array( input.TAU );
	WORK = new Complex128Array( M * 64 );
	info = zungrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), expected.A, 1e-12, 'A' );
});

test( 'zungrq: blocked 40x40 (paired input/output, blocked path)', function t() {
	var expected;
	var maxErr;
	var input;
	var WORK;
	var info;
	var TAU;
	var Av;
	var M;
	var N;
	var K;
	var A;
	input = findCase( 'zungrq_blocked_40x40_input' );
	expected = findCase( 'zungrq_blocked_40x40' );
	M = input.M;
	N = input.N;
	K = input.K;
	A = new Complex128Array( input.A );
	TAU = new Complex128Array( input.TAU );
	WORK = new Complex128Array( M * 64 );
	info = zungrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), expected.A, 1e-9, 'A' );
	Av = reinterpret( A, 0 );
	maxErr = maxOrthonormalErr( Av, M, N );
	assert.ok( maxErr < 1e-10, 'Q*Q^H = I, max error: ' + maxErr );
});

test( 'zungrq: blocked partial-block zero-init (M > K, exercises zero loop)', function t() {
	// To exercise the partial-block zero-init loop (`for i = 0; i < M-kk`),
	// We need M > kk. With K=33, NB=32, kk = min(33, ceil(33/32)*32) = 33.
	// Strategy: RQ-factor a K-by-N matrix, then place the K reflectors in
	// The LAST K rows of an M-by-N matrix; ZUNGRQ should zero the top M-K rows.
	var subEntries;
	var maxErr;
	var subIdx;
	var subAv;
	var WORK;
	var seed;
	var info;
	var rqS;
	var LDA;
	var idx;
	var Av;
	var M;
	var N;
	var K;
	var x;
	var A;
	var i;
	var j;
	M = 40;
	N = 45;
	K = 33;
	LDA = M;
	seed = 12345;
	x = seed;
	subEntries = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			idx = 2 * ( i + ( j * K ) );
			subEntries[ idx ] = ( ( x % 2000 ) - 1000 ) / 500.0;
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			subEntries[ idx + 1 ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}
	rqS = rqFactor( K, N, subEntries );
	subAv = reinterpret( rqS.A, 0 );
	A = new Complex128Array( M * N );
	Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			subIdx = 2 * ( i + ( j * K ) );
			idx = 2 * ( ( ( M - K ) + i ) + ( j * M ) );
			Av[ idx ] = subAv[ subIdx ];
			Av[ idx + 1 ] = subAv[ subIdx + 1 ];
		}
	}
	WORK = new Complex128Array( M * 64 );
	info = zungrq( M, N, K, A, 1, LDA, 0, rqS.TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	maxErr = maxOrthonormalErr( Av, M, N );
	assert.ok( maxErr < 1e-9, 'Q*Q^H = I, max error: ' + maxErr );
});
