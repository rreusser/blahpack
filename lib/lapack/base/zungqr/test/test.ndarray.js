// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqr2 from '../../zgeqr2/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zungqr from './../lib/ndarray.js';

// FIXTURES //

import zungqr_identity_k0 from './fixtures/zungqr_identity_k0.json' with { type: 'json' };
import zungqr_3x3_k2 from './fixtures/zungqr_3x3_k2.json' with { type: 'json' };
import zungqr_4x3_k3 from './fixtures/zungqr_4x3_k3.json' with { type: 'json' };
import zungqr_n0 from './fixtures/zungqr_n0.json' with { type: 'json' };
import zungqr_1x1_k1 from './fixtures/zungqr_1x1_k1.json' with { type: 'json' };
import zungqr_from_qr_4x4_input from './fixtures/zungqr_from_qr_4x4_input.json' with { type: 'json' };
import zungqr_from_qr_4x4 from './fixtures/zungqr_from_qr_4x4.json' with { type: 'json' };
import zungqr_blocked_40x40_input from './fixtures/zungqr_blocked_40x40_input.json' with { type: 'json' };
import zungqr_blocked_40x40 from './fixtures/zungqr_blocked_40x40.json' with { type: 'json' };
import zungqr_8x5_k5_input from './fixtures/zungqr_8x5_k5_input.json' with { type: 'json' };
import zungqr_8x5_k5 from './fixtures/zungqr_8x5_k5.json' with { type: 'json' };

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

test( 'zungqr: identity (K=0)', function t() {
	const tc = zungqr_identity_k0;
	const M = tc.M;
	const N = tc.N;
	const A = new Complex128Array( M * N );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( N * 32 );

	const info = zungqr(M, N, 0, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungqr: 3x3, K=2', function t() {
	const tc = zungqr_3x3_k2;
	const A = new Complex128Array( [
		1.0, 0.0,  0.4, 0.2,  0.1, -0.3,
		0.0, 0.0,  1.0, 0.0,  0.6, 0.5,
		0.0, 0.0,  0.0, 0.0,  0.0, 0.0
	]);
	const TAU = new Complex128Array( [ 1.1, 0.2, 0.9, -0.1 ] );
	const WORK = new Complex128Array( 3 * 32 );

	const info = zungqr(3, 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungqr: 4x3, K=3 (rectangular)', function t() {
	const tc = zungqr_4x3_k3;
	const A = new Complex128Array( [
		1.0, 0.0,  0.3, 0.1,  0.2, -0.2,  0.1, 0.05,
		0.0, 0.0,  1.0, 0.0,  0.4, 0.3,  -0.1, 0.2,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0,   0.5, -0.1
	]);
	const TAU = new Complex128Array( [ 1.05, 0.1, 1.15, -0.2, 0.8, 0.15 ] );
	const WORK = new Complex128Array( 3 * 32 );

	const info = zungqr(4, 3, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungqr: N=0 quick return', function t() {
	const tc = zungqr_n0;
	const A = new Complex128Array( 9 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );

	const info = zungqr(3, 0, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zungqr: 1x1, K=1', function t() {
	const tc = zungqr_1x1_k1;
	const A = new Complex128Array( [ 1.0, 0.0 ] );
	const TAU = new Complex128Array( [ 0.5, 0.5 ] );
	const WORK = new Complex128Array( 32 );

	const info = zungqr(1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungqr: from QR factorization 4x4', function t() {
	const input = zungqr_from_qr_4x4_input;
	const expected = zungqr_from_qr_4x4;
	const M = input.M;
	const N = input.N;
	const K = input.K;
	const A = new Complex128Array( input.A );
	const TAU = new Complex128Array( input.TAU );
	const WORK = new Complex128Array( N * 32 );

	const info = zungqr(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expected.A, 1e-12, 'A' );
});

test( 'zungqr: 40x40 fixture (K = 40 <= NX = 128: unblocked, as in the reference)', function t() {
	const input = zungqr_blocked_40x40_input;
	const expected = zungqr_blocked_40x40;
	const M = input.M;
	const N = input.N;
	const K = input.K;
	const A = new Complex128Array( input.A );
	const TAU = new Complex128Array( input.TAU );
	const WORK = new Complex128Array( N * 32 );

	const info = zungqr(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expected.A, 1e-10, 'A' );
});

test( 'zungqr: 8x5, K=5 (rectangular from QR)', function t() {
	const input = zungqr_8x5_k5_input;
	const expected = zungqr_8x5_k5;
	const M = input.M;
	const N = input.N;
	const K = input.K;
	const A = new Complex128Array( input.A );
	const TAU = new Complex128Array( input.TAU );
	const WORK = new Complex128Array( N * 32 );

	const info = zungqr(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, expected.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expected.A, 1e-12, 'A' );
});

test( 'zungqr: K=35, N=40 (K <= NX = 128: unblocked, as in the reference)', function t() {
	// K=35 with NB=32 gives kk = min(35, 32+32) = 35, and N=40 > kk=35,
	// so the zero-init loop for columns kk..N-1 in rows 0..kk-1 executes.
	// This covers lines 117-122 that are uncovered in the K=40 test.
	//
	// Strategy: QR-factor a 40x35 matrix, copy reflectors into a 40x40 matrix,
	// then call zungqr(40, 40 ) and verify Q^H * Q = I.
	const M = 40;
	const N = 40;
	const K = 35;
	const LDA = M;
	const seed = 77777;
	let x = seed;
	let Asrcv, idx, Av, i, j;

	// Generate a deterministic 40x35 matrix for QR factorization
	const Asrc = new Complex128Array( LDA * K );
	Asrcv = reinterpret( Asrc, 0 );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = 2 * ( i + j * LDA );
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Asrcv[ idx ] = ( ( x % 2000 ) - 1000 ) / 500.0;
			x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
			Asrcv[ idx + 1 ] = ( ( x % 2000 ) - 1000 ) / 500.0;
		}
	}

	// QR factorize in-place
	const TAU = new Complex128Array( K );
	const QRWORK = new Complex128Array( K );
	zgeqr2( M, K, Asrc, 1, LDA, 0, TAU, 1, 0, QRWORK, 1, 0 );

	// Copy into a 40x40 matrix (first 35 columns from QR, last 5 zeroed)
	const A = new Complex128Array( LDA * N );
	Av = reinterpret( A, 0 );
	Asrcv = reinterpret( Asrc, 0 );
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = 2 * ( i + j * LDA );
			Av[ idx ] = Asrcv[ idx ];
			Av[ idx + 1 ] = Asrcv[ idx + 1 ];
		}
	}

	// Call zungqr to generate the 40x40 Q matrix
	const WORK = new Complex128Array( N * 64 );
	const info = zungqr(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Verify Q is unitary: Q^H * Q should be I_40
	// Compute Q^H * Q manually: result[i][j] = sum_k conj(Q[k][i]) * Q[k][j]
	Av = reinterpret( A, 0 );
	let maxErr = 0;
	let expected, err, re, im, qi, qj;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0;
			im = 0;
			for ( let k = 0; k < M; k++ ) {
				qi = 2 * ( k + i * LDA );
				qj = 2 * ( k + j * LDA );
				// conj(Q[k,i]) * Q[k,j]
				re += Av[ qi ] * Av[ qj ] + Av[ qi + 1 ] * Av[ qj + 1 ];
				im += Av[ qi ] * Av[ qj + 1 ] - Av[ qi + 1 ] * Av[ qj ];
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			err = Math.abs( re - expected ) + Math.abs( im );
			if ( err > maxErr ) {
				maxErr = err;
			}
		}
	}
	assert.ok( maxErr < 1e-10, 'Q^H*Q=I, max error: ' + maxErr );
});


// TESTS: WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

const WS_N = 170; // K = 170 > NX = 128 (the ILAENV(3) crossover) and NB = 32: past the blocking threshold, two blocks
const WS_LDWORK = WS_N; // reference LDWORK (N)
const WS_NB = 32;

/**
* Factors a deterministic WS_N-by-WS_N matrix with `zgeqrf` (ample WORK), returning its reflectors and scalar factors.
*
* @private
* @returns {Object} factorization
*/
function wsFactor() {
	const A = new Complex128Array( WS_N * WS_N );
	const Av = reinterpret( A, 0 );
	const TAU = new Complex128Array( WS_N );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / 140 ) * 13 ) );
	}
	zgeqrf( WS_N, WS_N, A, 1, WS_N, 0, TAU, 1, 0, new Complex128Array( ( WS_N * 64 ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Runs `zungqr` on a copy of the factorization with a WORK of `lwork` elements, returning the interleaved Q.
*
* @private
* @param {Object} F - factorization
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} Q (column-major, interleaved re/im)
*/
function wsRun( F, lwork ) {
	const A = new Complex128Array( F.A );
	const info = zungqr( WS_N, WS_N, WS_N, A, 1, WS_N, 0, F.TAU, 1, 0, new Complex128Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return reinterpret( A, 0 );
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
* @param {Float64Array} Q - interleaved Q
* @returns {number} orthogonality error
*/
function wsOrthErr( Q ) {
	let err = 0.0;
	let re, im, a, b, i, j, k;
	for ( i = 0; i < WS_N; i++ ) {
		for ( j = 0; j < WS_N; j++ ) {
			re = ( i === j ) ? -1.0 : 0.0;
			im = 0.0;
			for ( k = 0; k < WS_N; k++ ) {
				a = 2 * ( ( i * WS_N ) + k );
				b = 2 * ( ( j * WS_N ) + k );
				re += Q[ a ] * Q[ b ] + ( Q[ a + 1 ] * Q[ b + 1 ] );
				im += ( Q[ a ] * Q[ b + 1 ] ) - ( Q[ a + 1 ] * Q[ b ] );
			}
			err = Math.max( err, Math.abs( re ), Math.abs( im ) );
		}
	}
	return err;
}

test( 'zungqr: WORK of the reference minimum max(1,N) past the blocking threshold (unblocked fallback) matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, WS_LDWORK );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-11, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'zungqr: WORK of LDWORK*8 (shrunk block size NB = 8) past the blocking threshold matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, ( WS_LDWORK * 8 ) + 3 );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-11, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'zungqr: WORK one element below the reference minimum max(1,N) throws', function t() {
	const F = wsFactor();
	assert.throws( function throws() {
		wsRun( F, WS_LDWORK - 1 );
	}, RangeError );
});


// TESTS: CROSSOVER FROM ILAENV (ticket 0049) //

test( 'zungqr: between NB = 32 and the ILAENV(3) crossover NX = 128 (K = 64), the optimal WORK takes the unblocked path as the reference does', function t() {
	const n = 64;
	const A = new Complex128Array( n * n );
	const TAU = new Complex128Array( n );
	const Av = reinterpret( A, 0 );
	let bad, i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / ( 2 * n ) ) * 13 ) );
	}
	zgeqrf( n, n, A, 1, n, 0, TAU, 1, 0, new Complex128Array( ( n * 64 ) + 4096 ), 1, 0 );
	const Aopt = new Complex128Array( A );
	const Amin = new Complex128Array( A );

	// Optimal WORK (N*NB), NaN-poisoned past the unblocked minimum max(1,N):
	const W = new Complex128Array( n * 32 );
	const Wv = reinterpret( W, 0 );
	for ( i = 2 * n; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	assert.equal( zungqr( n, n, n, Aopt, 1, n, 0, TAU, 1, 0, W, 1, 0 ), 0, 'info' );
	assert.equal( zungqr( n, n, n, Amin, 1, n, 0, TAU, 1, 0, new Complex128Array( n ), 1, 0 ), 0, 'info' );

	// The blocked path would write its T factor past WORK[N-1]; the unblocked path leaves it untouched:
	bad = 0;
	for ( i = 2 * n; i < Wv.length; i++ ) {
		if ( Wv[ i ] === Wv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'WORK past the unblocked minimum is untouched' );

	// And Q is bit-identical to the unblocked result:
	const ov = reinterpret( Aopt, 0 );
	const mv = reinterpret( Amin, 0 );
	bad = 0;
	for ( i = 0; i < ov.length; i++ ) {
		if ( ov[ i ] !== mv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'Q matches the unblocked Q bit for bit' );
});
