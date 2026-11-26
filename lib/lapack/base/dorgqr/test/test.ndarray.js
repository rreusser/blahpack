/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrf from '../../dgeqrf/lib/base.js';
import dorgqr from './../lib/ndarray.js';

// FIXTURES //

import _4x3_k3 from './fixtures/4x3_k3.json' with { type: 'json' };
import _3x3_k3 from './fixtures/3x3_k3.json' with { type: 'json' };
import _4x2_k2 from './fixtures/4x2_k2.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import _5x3_orthogonal from './fixtures/5x3_orthogonal.json' with { type: 'json' };
import _6x4_k4 from './fixtures/6x4_k4.json' with { type: 'json' };

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
* Extracts the matrix Q from a column-major array A(LDA, N) as a flat.
* column-major array of shape M x N (matching Fortran print_matrix output).
*/
function extractMatrix( A, LDA, M, N ) {
	const out = new Float64Array( M * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ j * M + i ] = A[ j * LDA + i ];
		}
	}
	return out;
}

/**
* Helper: set up a column-major matrix, run dgeqrf, then dorgqr.
* Returns { info, Q } where Q is the flat M x N column-major result.
*/
function runDorgqr( inputA, M, N, K, LDA ) {
	const WORK = new Float64Array( Math.max( ( N * 32 ) + ( 32 * 32 ), 1 ) );
	const TAU = new Float64Array( Math.min( M, N ) );
	const A = new Float64Array( LDA * N );
	let i, j;

	// Copy input into column-major A(LDA, N)
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = inputA[ j * M + i ];
		}
	}

	// Run dgeqrf to get Householder reflectors + TAU
	dgeqrf( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );

	// Run dorgqr to generate Q
	const info = dorgqr(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );

	return {
		'info': info,
		'Q': extractMatrix( A, LDA, M, N )
	};
}

// TESTS //

test( 'dorgqr: 4x3_k3', function t() {
	const result = runDorgqr(new Float64Array([ 2, 1, 3, 1, 1, 4, 2, 3, 3, 2, 5, 1 ]), 4, 3, 3, 4);
	const tc = _4x3_k3;
	assert.equal( result.info, tc.INFO );
	assertArrayClose( result.Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgqr: 3x3_k3', function t() {
	const result = runDorgqr(new Float64Array([ 4, 3, 1, 1, 2, 5, 2, 1, 3 ]), 3, 3, 3, 3);
	const tc = _3x3_k3;
	assert.equal( result.info, tc.INFO );
	assertArrayClose( result.Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgqr: 4x2_k2', function t() {
	const result = runDorgqr(new Float64Array([ 1, 3, 5, 7, 2, 4, 6, 8 ]), 4, 2, 2, 4);
	const tc = _4x2_k2;
	assert.equal( result.info, tc.INFO );
	assertArrayClose( result.Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgqr: k_zero (identity)', function t() {

	const tc = k_zero;
	const WORK = new Float64Array( 64 );
	const TAU = new Float64Array( 2 );
	const A = new Float64Array( 6 );
	A[ 0 ] = 99;
	A[ 1 ] = 77;
	A[ 2 ] = 55;
	A[ 3 ] = 88;
	A[ 4 ] = 66;
	A[ 5 ] = 44;
	const info = dorgqr(3, 2, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO );
	assertArrayClose( extractMatrix( A, 3, 3, 2 ), tc.Q, 1e-14, 'Q' );
});

test( 'dorgqr: n_zero quick return', function t() {

	const tc = n_zero;
	const WORK = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const A = new Float64Array( 1 );
	const info = dorgqr(3, 0, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO );
});

test( 'dorgqr: m_zero quick return', function t() {

	const tc = m_zero;
	const WORK = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const A = new Float64Array( 1 );
	const info = dorgqr(0, 0, 0, A, 1, 0, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO );
});

test( 'dorgqr: 5x3_orthogonal (Q^T*Q = I)', function t() {
	let i, j, k;

	const tc = _5x3_orthogonal;
	const result = runDorgqr(new Float64Array([ 1, 4, 2, 1, 3, 2, 1, 3, 1, 2, 1, 3, 2, 4, 1 ]), 5, 3, 3, 5);
	assert.equal( result.info, tc.INFO );
	assertArrayClose( result.Q, tc.Q, 1e-14, 'Q' );
	const M = 5;
	const N = 3;
	const QtQ = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			for ( k = 0; k < M; k++ ) {
				QtQ[ j * N + i ] += result.Q[ i * M + k ] * result.Q[ j * M + k ];
			}
		}
	}
	assertArrayClose( QtQ, tc.QtQ, 1e-14, 'QtQ' );
});

test( 'dorgqr: 6x4_k4', function t() {
	const result = runDorgqr(new Float64Array([
		2,
		1,
		3,
		1,
		2,
		1,
		1,
		4,
		2,
		3,
		1,
		2,
		3,
		2,
		5,
		1,
		4,
		1,
		1,
		3,
		2,
		4,
		1,
		3
	]), 6, 4, 4, 6);
	const tc = _6x4_k4;
	assert.equal( result.info, tc.INFO );
	assertArrayClose( result.Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgqr: 40x35_blocked fixture (K = 35 <= NX = 128: unblocked, as in the reference)', function t() { // eslint-disable-line max-len
	let expected, maxErr, dot, i, j, k;

	const M = 40;
	const N = 35;
	const K = 35;
	const inputA = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			inputA[ j * M + i ] = Math.sin( ( i + 1 ) * 7 + ( j + 1 ) * 13 );
		}
	}
	const result = runDorgqr( inputA, M, N, K, M );
	assert.equal( result.info, 0 );
	maxErr = 0;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dot = 0;
			for ( k = 0; k < M; k++ ) {
				dot += result.Q[ i * M + k ] * result.Q[ j * M + k ];
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			maxErr = Math.max( maxErr, Math.abs( dot - expected ) );
		}
	}
	assert.ok( maxErr < 1e-13, 'Q^T * Q = I, max error: ' + maxErr );
});

test( 'dorgqr: 40x40_k34_blocked fixture (K = 34 <= NX = 128: unblocked, as in the reference)', function t() { // eslint-disable-line max-len
	let expected, maxErr, dot, i, j, k;

	const M = 40;
	const N = 40;
	const K = 34;
	const LDA = M;
	const WORK = new Float64Array( Math.max( ( N * 32 ) + ( 32 * 32 ), 1 ) );
	const TAU = new Float64Array( K );
	const A = new Float64Array( LDA * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = Math.sin( ( i + 1 ) * 7 + ( j + 1 ) * 13 );
		}
	}
	dgeqrf( M, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const info = dorgqr(M, N, K, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	maxErr = 0;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dot = 0;
			for ( k = 0; k < M; k++ ) {
				dot += A[ i * LDA + k ] * A[ j * LDA + k ];
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			maxErr = Math.max( maxErr, Math.abs( dot - expected ) );
		}
	}
	assert.ok( maxErr < 1e-13, 'Q^T * Q = I, max error: ' + maxErr );
});


// TESTS: WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

const WS_N = 170; // K = 170 > NX = 128 (the ILAENV(3) crossover) and NB = 32: past the blocking threshold, two blocks
const WS_LDWORK = WS_N; // reference LDWORK (N)
const WS_NB = 32;

/**
* Factors a deterministic WS_N-by-WS_N matrix with `dgeqrf` (ample WORK), returning its reflectors and scalar factors.
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
	dgeqrf( WS_N, WS_N, A, 1, WS_N, 0, TAU, 1, 0, new Float64Array( ( WS_N * 64 ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Runs `dorgqr` on a copy of the factorization with a WORK of `lwork` elements, returning the interleaved Q.
*
* @private
* @param {Object} F - factorization
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} Q (column-major, real)
*/
function wsRun( F, lwork ) {
	const A = new Float64Array( F.A );
	const info = dorgqr( WS_N, WS_N, WS_N, A, 1, WS_N, 0, F.TAU, 1, 0, new Float64Array( lwork ), 1, 0 );
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

test( 'dorgqr: WORK of the reference minimum max(1,N) past the blocking threshold (unblocked fallback) matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, WS_LDWORK );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorgqr: WORK of LDWORK*8 (shrunk block size NB = 8) past the blocking threshold matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, ( WS_LDWORK * 8 ) + 3 );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorgqr: WORK one element below the reference minimum max(1,N) throws', function t() {
	const F = wsFactor();
	assert.throws( function throws() {
		wsRun( F, WS_LDWORK - 1 );
	}, RangeError );
});


// TESTS: CROSSOVER FROM ILAENV (ticket 0049) //

test( 'dorgqr: between NB = 32 and the ILAENV(3) crossover NX = 128 (K = 64), the optimal WORK takes the unblocked path as the reference does', function t() {
	const n = 64;
	const A = new Float64Array( n * n );
	const TAU = new Float64Array( n );
	const Av = A;
	let bad, i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / ( n ) ) * 13 ) );
	}
	dgeqrf( n, n, A, 1, n, 0, TAU, 1, 0, new Float64Array( ( n * 64 ) + 4096 ), 1, 0 );
	const Aopt = new Float64Array( A );
	const Amin = new Float64Array( A );

	// Optimal WORK (N*NB), NaN-poisoned past the unblocked minimum max(1,N):
	const W = new Float64Array( n * 32 );
	const Wv = W;
	for ( i = n; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	assert.equal( dorgqr( n, n, n, Aopt, 1, n, 0, TAU, 1, 0, W, 1, 0 ), 0, 'info' );
	assert.equal( dorgqr( n, n, n, Amin, 1, n, 0, TAU, 1, 0, new Float64Array( n ), 1, 0 ), 0, 'info' );

	// The blocked path would write its T factor past WORK[N-1]; the unblocked path leaves it untouched:
	bad = 0;
	for ( i = n; i < Wv.length; i++ ) {
		if ( Wv[ i ] === Wv[ i ] ) {
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
