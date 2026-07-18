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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
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
	let sum, i, j, k;

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

	const tc = _3x4_k3;
	const M = 3;
	const N = 4;
	const K = 3;
	const A = new Float64Array([
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
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: 3x3_k3 (square, full K=M from LQ)', function t() {

	const tc = _3x3_k3;
	const M = 3;
	const N = 3;
	const K = 3;
	const A = new Float64Array([
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
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: 2x5_k2 (rectangular, M < N)', function t() {

	const tc = _2x5_k2;
	const M = 2;
	const N = 5;
	const K = 2;
	const A = new Float64Array([
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
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: k0_identity (K=0 produces identity)', function t() {

	const tc = k0_identity;
	const M = 3;
	const N = 3;
	const K = 0;
	const A = new Float64Array([
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
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( M * 32 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorglq: m0_quick (M=0 quick return)', function t() {

	const tc = m0_quick;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorglq(0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorglq: 1x1_k1', function t() {

	const tc = _1x1_k1;
	const M = 1;
	const N = 1;
	const K = 1;
	const A = new Float64Array([ 7.0 ]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorglq: 3x4_k2 (K < M, partial generation)', function t() {

	const tc = _3x4_k2;
	const M = 3;
	const N = 4;
	const K = 2;
	const A = new Float64Array([
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
	const TAU = new Float64Array( M );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: 35x40_k35_blocked (exercises blocked path, NB=32)', function t() { // eslint-disable-line max-len
	let i, j;

	const M = 35;
	const N = 40;
	const K = 35;
	const LDA = 35;
	const A = new Float64Array( LDA * N );
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = ( i + 1 + j + 1 ) / ( M + N ) + 0.1 * ( ( ( i + 1 ) * ( j + 1 ) ) % 7 ); // eslint-disable-line max-len
		}
	}
	dgelq2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	assertOrthogonal( A, M, N, 1e-10 );
});

test( 'dorglq: 1x4_k1 (single row)', function t() {

	const tc = _1x4_k1;
	const M = 1;
	const N = 4;
	const K = 1;
	const A = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorglq: n0_quick (N=0 quick return)', function t() {

	const tc = n0_quick;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorglq(0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorglq: verifies Q*Q^T = I for 3x4_k3', function t() {

	const M = 3;
	const N = 4;
	const K = 3;
	const A = new Float64Array([
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
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 32 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	dorglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assertOrthogonal( A, M, N, 1e-14 );
});

test( 'dorglq: blocked K=35, M=40 (partial-block zero init)', function t() {
	let x, i, j;

	const M = 40;
	const N = 40;
	const K = 35;
	const LDA = M;
	const A_src = new Float64Array( K * N );
	const A = new Float64Array( LDA * N );
	const TAU = new Float64Array( K );
	const WORK = new Float64Array( M * 64 );
	const seed = 88888;
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
	const info = dorglq(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertOrthogonal( A, M, N, 1e-10 );
});
