/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerq2 from '../../dgerq2/lib/base.js';
import dgerqf from '../../dgerqf/lib/base.js';
import dorgrq from './../lib/ndarray.js';


// FIXTURES //

var FIXTURE_DIR = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var LINES = readFileSync( path.join( FIXTURE_DIR, 'dorgrq.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len, node/no-sync
var FIXTURE = LINES.map( function parse( line ) {
	return JSON.parse( line );
} );


// FUNCTIONS //

/**
* Looks up a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return FIXTURE.find( function find( t ) {
		return t.name === name;
	} );
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

/**
* Verifies Q * Q^T = I for an M-by-N orthogonal matrix Q (real, column-major).
*
* @private
* @param {Float64Array} A - the matrix Q in column-major order
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {integer} LDA - leading dimension of A
* @param {number} tol - tolerance for comparison
*/
function assertOrthogonal( A, M, N, LDA, tol ) {
	var sum;
	var i;
	var j;
	var k;

	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				// `A` is column-major: `A(i,k) = A[k*LDA + i]`
				sum += A[ ( k * LDA ) + i ] * A[ ( k * LDA ) + j ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, tol, 'QQT[' + i + ',' + j + ']' );
			} else {
				assert.ok( Math.abs( sum ) < tol, 'QQT[' + i + ',' + j + '] should be ~0, got ' + sum ); // eslint-disable-line max-len
			}
		}
	}
}


// TESTS //

test( 'dorgrq: 3x4_k3 (M < N, full K=M from RQ)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = findCase( '3x4_k3' );
	M = 3;
	N = 4;
	K = 3;
	A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		2.0,
		3.0,
		2.0,
		5.0,
		1.0,
		3.0,
		2.0
	]);
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertOrthogonal( A, M, N, M, 1e-13 );
});

test( 'dorgrq: 3x3_k3 (square, full K=M from RQ)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = findCase( '3x3_k3' );
	M = 3;
	N = 3;
	K = 3;
	A = new Float64Array([
		4.0,
		1.0,
		2.0,
		1.0,
		3.0,
		1.0,
		2.0,
		1.0,
		5.0
	]);
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertOrthogonal( A, M, N, M, 1e-13 );
});

test( 'dorgrq: 2x5_k2 (rectangular, M < N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = findCase( '2x5_k2' );
	M = 2;
	N = 5;
	K = 2;
	A = new Float64Array([
		1.0,
		6.0,
		2.0,
		7.0,
		3.0,
		8.0,
		4.0,
		9.0,
		5.0,
		10.0
	]);
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
	assertOrthogonal( A, M, N, M, 1e-13 );
});

test( 'dorgrq: k0_identity (K=0 produces identity in last M rows)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = findCase( 'k0_identity' );
	M = 3;
	N = 3;
	K = 0;
	A = new Float64Array([
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0,
		9.0
	]);
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( M * 32 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgrq: m0_quick (M=0 quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( 'm0_quick' );
	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorgrq( 0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorgrq: 1x1_k1', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = findCase( '1x1_k1' );
	M = 1;
	N = 1;
	K = 1;
	A = new Float64Array([ 7.0 ]);
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgrq: 3x4_k2 (K < M, matches Fortran reference)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	// With K=2 < min(M,N)=3, calling DGERQF (which uses k=3) then DORGRQ (which uses k=2) is inconsistent — DGERQF stores reflector i in row i, while DORGRQ expects reflector i in row m-k+i = 1+i. The result is therefore NOT orthogonal in general, but our output should still match the Fortran reference exactly. // eslint-disable-line max-len
	tc = findCase( '3x4_k2' );
	M = 3;
	N = 4;
	K = 2;
	A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		2.0,
		3.0,
		2.0,
		5.0,
		1.0,
		3.0,
		2.0
	]);
	TAU = new Float64Array( M );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-13, 'A' );
});

test( 'dorgrq: 35x40_k35_blocked (exercises blocked path, NB=32)', function t() {
	var WORK;
	var info;
	var LDA;
	var TAU;
	var M;
	var N;
	var K;
	var A;
	var i;
	var j;

	M = 35;
	N = 40;
	K = 35;
	LDA = 35;
	A = new Float64Array( LDA * N );
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 64 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ ( j * LDA ) + i ] = ( ( i + 1 + j + 1 ) / ( M + N ) ) + ( 0.1 * ( ( ( i + 1 ) * ( j + 1 ) ) % 7 ) ); // eslint-disable-line max-len
		}
	}
	dgerqf( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( A, M, N, LDA, 1e-10 );
});

test( 'dorgrq: 1x4_k1 (single row)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = findCase( '1x4_k1' );
	M = 1;
	N = 4;
	K = 1;
	A = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgrq: n0_quick (N=0 quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = findCase( 'n0_quick' );
	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorgrq( 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorgrq: verifies Q*Q^T = I for 3x4_k3', function t() {
	var WORK;
	var TAU;
	var M;
	var N;
	var K;
	var A;

	M = 3;
	N = 4;
	K = 3;
	A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		2.0,
		3.0,
		2.0,
		5.0,
		1.0,
		3.0,
		2.0
	]);
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 32 );
	dgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	dorgrq( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assertOrthogonal( A, M, N, M, 1e-14 );
});

test( 'dorgrq: K=2 < M=3, consistent reflectors → orthogonal Q', function t() {
	var Asrc;
	var WORK;
	var TAU;
	var LDA;
	var M;
	var N;
	var K;
	var A;
	var i;
	var j;

	// To get an orthogonal Q with K < M, generate K reflectors via DGERQF on a K x N matrix, then place them in the LAST K rows of an M x N A. // eslint-disable-line max-len
	M = 3;
	N = 4;
	K = 2;
	LDA = M;
	Asrc = new Float64Array( K * N );
	A = new Float64Array( LDA * N );
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 32 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			Asrc[ ( j * K ) + i ] = ( ( i + 1 ) * 0.7 ) + ( ( j + 1 ) * 0.3 );
		}
	}
	dgerqf( K, N, Asrc, 1, K, 0, TAU, 1, 0, WORK, 1, 0 );

	// Copy reflector rows to the LAST K rows of A
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			A[ ( j * LDA ) + ( M - K + i ) ] = Asrc[ ( j * K ) + i ];
		}
	}
	dorgrq( M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assertOrthogonal( A, M, N, LDA, 1e-13 );
});

test( 'dorgrq: blocked K=35, M=40 (partial-block zero init)', function t() {
	var Asrc;
	var WORK;
	var seed;
	var info;
	var LDA;
	var TAU;
	var M;
	var N;
	var K;
	var A;
	var x;
	var i;
	var j;

	M = 40;
	N = 40;
	K = 35;
	LDA = M;
	Asrc = new Float64Array( K * N );
	A = new Float64Array( LDA * N );
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 64 );
	seed = 88888;
	x = seed;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Asrc[ ( j * K ) + i ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}

	// Compute RQ on the K x N source. The reflectors live in the LAST K rows of Asrc.
	// For dorgrq applied to MxN with this K, copy the K reflector rows into rows M-K..M-1 of A.
	dgerqf( K, N, Asrc, 1, K, 0, TAU, 1, 0, WORK, 1, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			A[ ( j * LDA ) + ( M - K + i ) ] = Asrc[ ( j * K ) + i ];
		}
	}
	info = dorgrq( M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertOrthogonal( A, M, N, LDA, 1e-10 );
});
