/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelq2 from '../../dgelq2/lib/base.js';
import dorgl2 from './../lib/ndarray.js';

// FIXTURES //

import _3x4_k3 from './fixtures/3x4_k3.json' with { type: 'json' };
import _3x3_k3 from './fixtures/3x3_k3.json' with { type: 'json' };
import _2x5_k1 from './fixtures/2x5_k1.json' with { type: 'json' };
import k0_identity from './fixtures/k0_identity.json' with { type: 'json' };
import m0_quick from './fixtures/m0_quick.json' with { type: 'json' };
import _1x1_k1 from './fixtures/1x1_k1.json' with { type: 'json' };
import _1x4_k1 from './fixtures/1x4_k1.json' with { type: 'json' };
import _2x5_k2 from './fixtures/2x5_k2.json' with { type: 'json' };
import _3x4_k2 from './fixtures/3x4_k2.json' with { type: 'json' };

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

// TESTS //

test( 'dorgl2: 3x4_k3 (M < N, full K=M from LQ)', function t() {

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
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: 3x3_k3 (square, full K=M from LQ)', function t() {

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
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: 2x5_k1 (K < M, partial generation)', function t() {

	const tc = _2x5_k1;
	const M = 2;
	const N = 5;
	const K = 1;
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
	const TAU = new Float64Array( M );
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: k0_identity (K=0 produces identity)', function t() {

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
	const WORK = new Float64Array( N );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: m0_quick (M=0 quick return)', function t() {

	const tc = m0_quick;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgl2( 0, 4, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dorgl2: 1x1_k1', function t() {

	const tc = _1x1_k1;
	const M = 1;
	const N = 1;
	const K = 1;
	const A = new Float64Array([ 7.0 ]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: 1x4_k1 (single row)', function t() {

	const tc = _1x4_k1;
	const M = 1;
	const N = 4;
	const K = 1;
	const A = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: 2x5_k2 (full K=M from LQ)', function t() {

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
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: 3x4_k2 (K < M, partial generation)', function t() {

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
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dorgl2: verifies Q*Q^T = I for 3x4_k3', function t() {
	let sum, i, j, k;

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
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const QQT = new Float64Array( M * M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				// A is column-major: A(i,k) = A[k*M + i]
				sum += A[ k * M + i ] * A[ k * M + j ];
			}
			QQT[ j * M + i ] = sum;
		}
	}
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			if ( i === j ) {
				assertClose( QQT[ j * M + i ], 1.0, 1e-14, 'QQT[' + i + ',' + j + ']' );
			} else {
				assert.ok( Math.abs( QQT[ j * M + i ] ) < 1e-14, 'QQT[' + i + ',' + j + '] should be ~0' ); // eslint-disable-line max-len
			}
		}
	}
});

test( 'dorgl2: verifies Q*Q^T = I for 3x3_k3 (square)', function t() {
	let sum, i, j, k;

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
	const WORK = new Float64Array( N );
	dgelq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	dorgl2( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	const QQT = new Float64Array( M * M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += A[ k * M + i ] * A[ k * M + j ];
			}
			QQT[ j * M + i ] = sum;
		}
	}
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			if ( i === j ) {
				assertClose( QQT[ j * M + i ], 1.0, 1e-14, 'QQT[' + i + ',' + j + ']' );
			} else {
				assert.ok( Math.abs( QQT[ j * M + i ] ) < 1e-14, 'QQT[' + i + ',' + j + '] should be ~0' ); // eslint-disable-line max-len
			}
		}
	}
});
