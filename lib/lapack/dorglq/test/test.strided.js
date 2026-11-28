/* eslint-disable no-restricted-syntax */

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

test( 'dorglq: 35x40_k35_blocked fixture (K = 35 <= NX = 128: unblocked, as in the reference)', function t() { // eslint-disable-line max-len
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

test( 'dorglq: K=35, M=40 (K <= NX = 128: unblocked, as in the reference)', function t() {
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


// TESTS: WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

const WS_N = 170; // K = 170 > NX = 128 (the ILAENV(3) crossover) and NB = 32: past the blocking threshold, two blocks
const WS_LDWORK = WS_N; // reference LDWORK (M)
const WS_NB = 32;

/**
* Factors a deterministic WS_N-by-WS_N matrix with `dgelqf` (ample WORK), returning its reflectors and scalar factors.
*
* @private
* @returns {Object} factorization
*/
function wsFactor() {
	const A = new Float64Array( WS_N * WS_N );
	const Av = A;
	const TAU = new Float64Array( WS_N );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / 70 ) * 13 ) );
	}
	dgelqf( WS_N, WS_N, A, 1, WS_N, 0, TAU, 1, 0, new Float64Array( ( WS_N * 64 ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Runs `dorglq` on a copy of the factorization with a WORK of `lwork` elements, returning the interleaved Q.
*
* @private
* @param {Object} F - factorization
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} Q (column-major, real)
*/
function wsRun( F, lwork ) {
	const A = new Float64Array( F.A );
	const info = dorglq( WS_N, WS_N, WS_N, A, 1, WS_N, 0, F.TAU, 1, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return A;
}

/**
* Returns the largest elementwise difference between two arrays.
*
* @private
* @param {Float64Array} x - first array
* @param {Float64Array} y - second array
* @returns {number} max |x - y|
*/
function wsMaxDiff( x, y ) {
	let d = 0.0;
	let i;
	for ( i = 0; i < x.length; i++ ) {
		d = Math.max( d, Math.abs( x[ i ] - y[ i ] ) );
	}
	return d;
}

/**
* Returns max |Q^H Q - I| for a square column-major Q.
*
* @private
* @param {Float64Array} Q - Q
* @returns {number} orthogonality error
*/
function wsOrthErr( Q ) {
	let err = 0.0;
	let re, a, b, i, j, k;
	for ( i = 0; i < WS_N; i++ ) {
		for ( j = 0; j < WS_N; j++ ) {
			re = ( i === j ) ? -1.0 : 0.0;
			for ( k = 0; k < WS_N; k++ ) {
				a = ( i * WS_N ) + k;
				b = ( j * WS_N ) + k;
				re += Q[ a ] * Q[ b ];
			}
			err = Math.max( err, Math.abs( re ) );
		}
	}
	return err;
}

test( 'dorglq: WORK of the reference minimum max(1,M) past the blocking threshold (unblocked fallback) matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, WS_LDWORK );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorglq: WORK of LDWORK*8 (shrunk block size NB = 8) past the blocking threshold matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, ( WS_LDWORK * 8 ) + 3 );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorglq: WORK one element below the reference minimum max(1,M) throws', function t() {
	const F = wsFactor();
	assert.throws( function throws() {
		wsRun( F, WS_LDWORK - 1 );
	}, RangeError );
});


// TESTS: CROSSOVER FROM ILAENV (ticket 0049) //

test( 'dorglq: between NB = 32 and the ILAENV(3) crossover NX = 128 (K = 64), the optimal WORK takes the unblocked path as the reference does', function t() {
	const n = 64;
	const A = new Float64Array( n * n );
	const TAU = new Float64Array( n );
	const Av = A;
	let bad, i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / ( n ) ) * 13 ) );
	}
	dgelqf( n, n, A, 1, n, 0, TAU, 1, 0, new Float64Array( ( n * 64 ) + 4096 ), 1, 0 );
	const Aopt = new Float64Array( A );
	const Amin = new Float64Array( A );

	// Optimal WORK (N*NB), NaN-poisoned past the unblocked minimum max(1,N):
	const W = new Float64Array( n * 32 );
	const Wv = W;
	for ( i = n; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	assert.equal( dorglq( n, n, n, Aopt, 1, n, 0, TAU, 1, 0, W, 1, 0 ), 0, 'info' );
	assert.equal( dorglq( n, n, n, Amin, 1, n, 0, TAU, 1, 0, new Float64Array( n ), 1, 0 ), 0, 'info' );

	// The blocked path would write its T factor past WORK[N-1]; the unblocked path leaves it untouched:
	bad = 0;
	for ( i = n; i < Wv.length; i++ ) {
		if ( !Number.isNaN( Wv[ i ] ) ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'WORK past the unblocked minimum is untouched' );

	// And Q is bit-identical to the unblocked result:
	const ov = Aopt;
	const mv = Amin;
	bad = 0;
	for ( i = 0; i < ov.length; i++ ) {
		if ( ov[ i ] !== mv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'Q matches the unblocked Q bit for bit' );
});
