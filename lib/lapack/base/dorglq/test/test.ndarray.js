/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelq2 from '../../dgelq2/lib/base.js';
import dgelqf from '../../dgelqf/lib/base.js';
import dorglq from './../lib/ndarray.js';

// FIXTURES //

import _3x4_k3 from './fixtures/3x4_k3.json' with { type: 'json' };
import _3x3_k3 from './fixtures/3x3_k3.json' with { type: 'json' };
import _2x5_k2 from './fixtures/2x5_k2.json' with { type: 'json' };
import k0_identity from './fixtures/k0_identity.json' with { type: 'json' };
import m0_quick from './fixtures/m0_quick.json' with { type: 'json' };
import _1x1_k1 from './fixtures/1x1_k1.json' with { type: 'json' };
import _3x4_k2 from './fixtures/3x4_k2.json' with { type: 'json' };
import _1x4_k1 from './fixtures/1x4_k1.json' with { type: 'json' };
import n0_quick from './fixtures/n0_quick.json' with { type: 'json' };

// FUNCTIONS //

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
* @param {number} tol - tolerance for comparison
*/
function assertOrthogonal( A, M, N, tol ) {
	var sum;
	var i;
	var j;
	var k;

	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				// A is column-major: A(i,k) = A[k*M + i]
				sum += A[ k * M + i ] * A[ k * M + j ];
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

test( 'dorglq: 3x4_k3 (M < N, full K=M from LQ)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = _3x4_k3;
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
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: 3x3_k3 (square, full K=M from LQ)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = _3x3_k3;
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
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: 2x5_k2 (rectangular, M < N)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = _2x5_k2;
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
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: k0_identity (K=0 produces identity)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = k0_identity;
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
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorglq: m0_quick (M=0 quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = m0_quick;
	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorglq(0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorglq: 1x1_k1', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = _1x1_k1;
	M = 1;
	N = 1;
	K = 1;
	A = new Float64Array([ 7.0 ]);
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorglq: 3x4_k2 (K < M, partial generation)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = _3x4_k2;
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
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: 35x40_k35_blocked (exercises blocked path, NB=32)', function t() { // eslint-disable-line max-len
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
	WORK = new Float64Array( M * 32 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = ( i + 1 + j + 1 ) / ( M + N ) + 0.1 * ( ( ( i + 1 ) * ( j + 1 ) ) % 7 ); // eslint-disable-line max-len
		}
	}
	dgelq2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( A, M, N, 1e-10 );
});

test( 'dorglq: 1x4_k1 (single row)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var M;
	var N;
	var K;
	var A;

	tc = _1x4_k1;
	M = 1;
	N = 4;
	K = 1;
	A = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorglq: n0_quick (N=0 quick return)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;

	tc = n0_quick;
	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorglq(0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorglq: verifies Q*Q^T = I for 3x4_k3', function t() {
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
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: blocked K=35, M=40 (partial-block zero init)', function t() {
	var A_src;
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
	A_src = new Float64Array( K * N );
	A = new Float64Array( LDA * N );
	TAU = new Float64Array( K );
	WORK = new Float64Array( M * 64 );
	seed = 88888;
	x = seed;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			A_src[ j * K + i ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}
	dgelq2( K, N, A_src, 1, K, 0, TAU, 1, 0, WORK, 1, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			A[ j * LDA + i ] = A_src[ j * K + i ];
		}
	}
	info = dorglq(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertOrthogonal( A, M, N, 1e-10 );
});
