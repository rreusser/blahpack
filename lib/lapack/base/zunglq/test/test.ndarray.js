// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgelq2 from '../../zgelq2/lib/base.js';
import zunglq from './../lib/ndarray.js';

// FIXTURES //

import zunglq_identity_k0 from './fixtures/zunglq_identity_k0.json' with { type: 'json' };
import zunglq_3x3_k2 from './fixtures/zunglq_3x3_k2.json' with { type: 'json' };
import zunglq_3x4_k3 from './fixtures/zunglq_3x4_k3.json' with { type: 'json' };
import zunglq_m0 from './fixtures/zunglq_m0.json' with { type: 'json' };
import zunglq_1x1_k1 from './fixtures/zunglq_1x1_k1.json' with { type: 'json' };
import zunglq_from_lq_4x4_input from './fixtures/zunglq_from_lq_4x4_input.json' with { type: 'json' };
import zunglq_from_lq_4x4 from './fixtures/zunglq_from_lq_4x4.json' with { type: 'json' };
import zunglq_blocked_40x40_input from './fixtures/zunglq_blocked_40x40_input.json' with { type: 'json' };
import zunglq_blocked_40x40 from './fixtures/zunglq_blocked_40x40.json' with { type: 'json' };
import zunglq_5x8_k5_input from './fixtures/zunglq_5x8_k5_input.json' with { type: 'json' };
import zunglq_5x8_k5 from './fixtures/zunglq_5x8_k5.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zunglq: identity (K=0)', function t() {
	const tc = zunglq_identity_k0;
	const M = tc.M;
	const N = tc.N;
	const A = new Complex128Array( M * N );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( M * 32 );

	const info = zunglq(M, N, 0, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zunglq: 3x3, K=2', function t() {
	const tc = zunglq_3x3_k2;
	// LQ reflectors stored in rows
	const A = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.4, 0.2,  1.0, 0.0,  0.0, 0.0,
		0.1, -0.3, 0.6, 0.5,  0.0, 0.0
	]);
	const TAU = new Complex128Array( [ 1.1, 0.2, 0.9, -0.1 ] );
	const WORK = new Complex128Array( 3 * 32 );

	const info = zunglq(3, 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zunglq: 3x4, K=3 (rectangular)', function t() {
	const tc = zunglq_3x4_k3;
	const A = new Complex128Array( [
		1.0, 0.0,   0.0, 0.0,   0.0, 0.0,
		0.3, 0.1,   1.0, 0.0,   0.0, 0.0,
		0.2, -0.2,  0.4, 0.3,   1.0, 0.0,
		0.1, 0.05, -0.1, 0.2,   0.5, -0.1
	]);
	const TAU = new Complex128Array( [ 1.05, 0.1, 1.15, -0.2, 0.8, 0.15 ] );
	const WORK = new Complex128Array( 3 * 32 );

	const info = zunglq(3, 4, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zunglq: M=0 quick return', function t() {
	const tc = zunglq_m0;
	const A = new Complex128Array( 9 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );

	const info = zunglq(0, 3, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zunglq: 1x1, K=1', function t() {
	const tc = zunglq_1x1_k1;
	const A = new Complex128Array( [ 1.0, 0.0 ] );
	const TAU = new Complex128Array( [ 0.5, 0.5 ] );
	const WORK = new Complex128Array( 32 );

	const info = zunglq(1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zunglq: from LQ factorization 4x4', function t() {
	const input = zunglq_from_lq_4x4_input;
	const expected = zunglq_from_lq_4x4;
	const M = input.M;
	const N = input.N;
	const K = input.K;
	const A = new Complex128Array( input.A );
	const TAU = new Complex128Array( input.TAU );
	const WORK = new Complex128Array( M * 32 );

	const info = zunglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expected.A, 1e-12, 'A' );
});

test( 'zunglq: blocked 40x40 (K>NB triggers blocking)', function t() {
	const input = zunglq_blocked_40x40_input;
	const expected = zunglq_blocked_40x40;
	const M = input.M;
	const N = input.N;
	const K = input.K;
	const A = new Complex128Array( input.A );
	const TAU = new Complex128Array( input.TAU );
	const WORK = new Complex128Array( M * 32 );

	const info = zunglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expected.A, 1e-10, 'A' );
});

test( 'zunglq: 5x8, K=5 (rectangular from LQ)', function t() {
	const input = zunglq_5x8_k5_input;
	const expected = zunglq_5x8_k5;
	const M = input.M;
	const N = input.N;
	const K = input.K;
	const A = new Complex128Array( input.A );
	const TAU = new Complex128Array( input.TAU );
	const WORK = new Complex128Array( M * 32 );

	const info = zunglq(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expected.A, 1e-12, 'A' );
});

test( 'zunglq: blocked K=35, M=40 (partial-block zero init, covers lines 114-117)', function t() {
	// K=35 with NB=32 gives kk = min(35, 32+32) = 35, and M=40 > kk=35,
	// so the zero-init loop for rows kk..M-1 in columns 0..kk-1 executes.
	// This covers lines 114-117 that are uncovered in the K=40 test.
	//
	// Strategy: LQ-factor a 35x40 matrix, copy reflectors into a 40x40 matrix,
	// then call zunglq(40, 40 ) and verify Q * Q^H = I.
	const M = 40;
	const N = 40;
	const K = 35;
	const LDA = M;
	const seed = 88888;
	let x = seed;
	let Asrcv, idx, Av, i, j;

	// Generate a deterministic 35x40 matrix for LQ factorization
	// LQ needs rows=K, cols=N. In column-major with LDA_src=K.
	const LDA_src = K;
	const Asrc = new Complex128Array( LDA_src * N );
	Asrcv = reinterpret( Asrc, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			idx = 2 * ( i + j * LDA_src );
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Asrcv[ idx ] = ( ( x % 2000 ) - 1000 ) / 500.0;
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Asrcv[ idx + 1 ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}

	// LQ factorize in-place
	const TAU = new Complex128Array( K );
	const LQWORK = new Complex128Array( K );
	zgelq2( K, N, Asrc, 1, LDA_src, 0, TAU, 1, 0, LQWORK, 1, 0 );

	// Copy into a 40x40 matrix (first 35 rows from LQ, last 5 zeroed)
	const A = new Complex128Array( LDA * N );
	Av = reinterpret( A, 0 );
	Asrcv = reinterpret( Asrc, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < K; i++ ) {
			const srcIdx = 2 * ( i + j * LDA_src );
			const dstIdx = 2 * ( i + j * LDA );
			Av[ dstIdx ] = Asrcv[ srcIdx ];
			Av[ dstIdx + 1 ] = Asrcv[ srcIdx + 1 ];
		}
	}

	// Call zunglq to generate the 40x40 Q matrix
	const WORK = new Complex128Array( M * 64 );
	const info = zunglq(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Verify Q is unitary: Q * Q^H should be I_40
	// result[i][j] = sum_k Q[i][k] * conj(Q[j][k])
	Av = reinterpret( A, 0 );
	let maxErr = 0;
	let expected, err, re, im, qi, qj;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			re = 0;
			im = 0;
			for ( let k = 0; k < N; k++ ) {
				qi = 2 * ( i + k * LDA );
				qj = 2 * ( j + k * LDA );
				// Q[i,k] * conj(Q[j,k])
				re += Av[ qi ] * Av[ qj ] + Av[ qi + 1 ] * Av[ qj + 1 ];
				im += Av[ qi + 1 ] * Av[ qj ] - Av[ qi ] * Av[ qj + 1 ];
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			err = Math.abs( re - expected ) + Math.abs( im );
			if ( err > maxErr ) {
				maxErr = err;
			}
		}
	}
	assert.ok( maxErr < 1e-10, 'Q*Q^H=I, max error: ' + maxErr );
});
