/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dggsvp3 from './../lib/strided.js';

// FIXTURES //

import basic_4x3_3x3_uvq from './fixtures/basic_4x3_3x3_uvq.json' with { type: 'json' };
import basic_4x3_3x3_nnn from './fixtures/basic_4x3_3x3_nnn.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import p_zero from './fixtures/p_zero.json' with { type: 'json' };
import rank_deficient_b from './fixtures/rank_deficient_b.json' with { type: 'json' };
import wide_2x5_uvq from './fixtures/wide_2x5_uvq.json' with { type: 'json' };
import diagonal_3x3 from './fixtures/diagonal_3x3.json' with { type: 'json' };
import tall_b_3x5x3 from './fixtures/tall_b_3x5x3.json' with { type: 'json' };

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
* ExtractMatrix.
*
* @private
* @param {TypedArray} arr - input array
* @param {*} offset - offset
* @param {*} strideA1 - strideA1
* @param {*} strideA2 - strideA2
* @param {*} m - m
* @param {*} n - n
* @returns {*} result
*/
function extractMatrix( arr, offset, strideA1, strideA2, m, n ) {
	const out = [];
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			out.push( arr[ offset + (i * strideA1) + (j * strideA2) ] );
		}
	}
	return out;
}

/**
* Verify that a matrix is orthogonal: Q^T * Q = I.
*/
function assertOrthogonal( Q, n, stride1, stride2, offset, tol, msg ) {
	let dot, i, j, k;
	for ( i = 0; i < n; i++ ) {
		for ( j = i; j < n; j++ ) {
			dot = 0.0;
			for ( k = 0; k < n; k++ ) {
				dot += Q[ offset + (k * stride1) + (i * stride2) ] * Q[ offset + (k * stride1) + (j * stride2) ]; // eslint-disable-line max-len
			}
			if ( i === j ) {
				assertClose( dot, 1.0, tol, msg + ': col ' + i + ' norm' );
			} else {
				assert.ok( Math.abs( dot ) < tol, msg + ': cols ' + i + ',' + j + ' dot=' + dot ); // eslint-disable-line max-len
			}
		}
	}
}

// TESTS //

test( 'dggsvp3: basic_4x3_3x3_UVQ', function t() {

	const tc = basic_4x3_3x3_uvq;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const B = new Float64Array( [ 10, 1, 1, 1, 10, 1, 1, 1, 10 ] );
	const U = new Float64Array( 16 );
	const V = new Float64Array( 9 );
	const Q = new Float64Array( 9 );
	const IWORK = new Int32Array( 3 );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 4, 3, 3, A, 1, 4, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 4, 0, V, 1, 3, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 4, 4, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
	assertOrthogonal( U, 4, 1, 4, 0, 1e-12, 'U orthogonal' );
	assertArrayClose( extractMatrix( V, 0, 1, 3, 3, 3 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: basic_4x3_3x3_NNN', function t() {

	const tc = basic_4x3_3x3_nnn;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const B = new Float64Array( [ 10, 1, 1, 1, 10, 1, 1, 1, 10 ] );
	const U = new Float64Array( 1 );
	const V = new Float64Array( 1 );
	const Q = new Float64Array( 1 );
	const IWORK = new Int32Array( 3 );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'none', 'none', 'none', 4, 3, 3, A, 1, 4, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, 1, 0, Q, 1, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 4, 4, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
});

test( 'dggsvp3: m_zero', function t() {

	const tc = m_zero;
	const A = new Float64Array( 1 );
	const B = new Float64Array( [ 5, 1, 1, 5 ] );
	const U = new Float64Array( 1 );
	const V = new Float64Array( 4 );
	const Q = new Float64Array( 4 );
	const IWORK = new Int32Array( 2 );
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 0, 2, 2, A, 1, 1, 0, B, 1, 2, 0, 1e-8, 1e-8, K, l, U, 1, 1, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
});

test( 'dggsvp3: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const U = new Float64Array( 9 );
	const V = new Float64Array( 4 );
	const Q = new Float64Array( 1 );
	const IWORK = new Int32Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 2, 0, A, 1, 3, 0, B, 1, 2, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 2, 0, Q, 1, 1, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
});

test( 'dggsvp3: p_zero', function t() {

	const tc = p_zero;
	const A = new Float64Array( [ 5, 1, 1, 5 ] );
	const B = new Float64Array( 1 );
	const U = new Float64Array( 4 );
	const V = new Float64Array( 1 );
	const Q = new Float64Array( 4 );
	const IWORK = new Int32Array( 2 );
	const TAU = new Float64Array( 2 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 0, 2, A, 1, 2, 0, B, 1, 1, 0, 1e-8, 1e-8, K, l, U, 1, 2, 0, V, 1, 1, 0, Q, 1, 2, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
});

test( 'dggsvp3: rank_deficient_B', function t() {

	const tc = rank_deficient_b;
	const A = new Float64Array( [ 2, 1, 0, 1, 3, 1, 0, 1, 4 ] );
	const B = new Float64Array( [ 5, 1, 0, 1, 5, 0, 1, 1, 0 ] );
	const U = new Float64Array( 9 );
	const V = new Float64Array( 9 );
	const Q = new Float64Array( 9 );
	const IWORK = new Int32Array( 3 );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, A, 1, 3, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 3, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 3, 3, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 3, 3, 3 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 3, 3, 3 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: wide_2x5_UVQ', function t() {

	const tc = wide_2x5_uvq;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	const B = new Float64Array( [ 10, 1, 1, 10, 2, 2, 3, 3, 1, 1 ] );
	const U = new Float64Array( 4 );
	const V = new Float64Array( 4 );
	const Q = new Float64Array( 25 );
	const IWORK = new Int32Array( 5 );
	const TAU = new Float64Array( 5 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 5, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, l, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 5, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 2, 2, 5 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 2, 2, 5 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 2, 2, 2 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 2, 2, 2 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 5, 5, 5 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: diagonal_3x3', function t() {

	const tc = diagonal_3x3;
	const A = new Float64Array( [ 10, 0, 0, 0, 5, 0, 0, 0, 1 ] );
	const B = new Float64Array( [ 8, 0, 0, 0, 4, 0, 0, 0, 2 ] );
	const U = new Float64Array( 9 );
	const V = new Float64Array( 9 );
	const Q = new Float64Array( 9 );
	const IWORK = new Int32Array( 3 );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, A, 1, 3, 0, B, 1, 3, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 3, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 3, 3, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 3, 3, 3 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 3, 3, 3 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 3, 3, 3 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

test( 'dggsvp3: tall_B_3x5x3', function t() {

	const tc = tall_b_3x5x3;
	const A = new Float64Array( [ 2, 1, 0.5, 0.5, 3, 1, 1, 0.5, 4 ] );
	const B = new Float64Array( [ 10, 1, 1, 1, 1, 1, 10, 1, 1, 1, 1, 1, 10, 1, 1 ] );
	const U = new Float64Array( 9 );
	const V = new Float64Array( 25 );
	const Q = new Float64Array( 9 );
	const IWORK = new Int32Array( 3 );
	const TAU = new Float64Array( 3 );
	const WORK = new Float64Array( 5000 );
	const K = [ 0 ];
	const l = [ 0 ];
	const info = dggsvp3( 'compute-U', 'compute-V', 'compute-Q', 3, 5, 3, A, 1, 3, 0, B, 1, 5, 0, 1e-8, 1e-8, K, l, U, 1, 3, 0, V, 1, 5, 0, Q, 1, 3, 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( K[ 0 ], tc.K );
	assert.equal( l[ 0 ], tc.L );
	assertArrayClose( extractMatrix( A, 0, 1, 3, 3, 3 ), tc.A, 1e-12, 'A' );
	assertArrayClose( extractMatrix( B, 0, 1, 5, 5, 3 ), tc.B, 1e-12, 'B' );
	assertArrayClose( extractMatrix( U, 0, 1, 3, 3, 3 ), tc.U, 1e-12, 'U' );
	assertArrayClose( extractMatrix( V, 0, 1, 5, 5, 5 ), tc.V, 1e-12, 'V' );
	assertArrayClose( extractMatrix( Q, 0, 1, 3, 3, 3 ), tc.Q, 1e-12, 'Q' );
});

/**
* Runs `dggsvp3` on deterministic M-by-N A and P-by-N B with a WORK of `lwork` elements and returns all outputs.
*
* @private
* @param {NonNegativeInteger} M - rows of A
* @param {NonNegativeInteger} p - rows of B
* @param {NonNegativeInteger} N - columns
* @param {NonNegativeInteger} lwork - WORK length
* @returns {Object} outputs
*/
function runWithWork( M, p, N, lwork ) {
	const A = new Float64Array( Math.max( 1, M * N ) );
	const B = new Float64Array( Math.max( 1, p * N ) );
	const U = new Float64Array( Math.max( 1, M * M ) );
	const V = new Float64Array( Math.max( 1, p * p ) );
	const Q = new Float64Array( Math.max( 1, N * N ) );
	const IWORK = new Int32Array( Math.max( 1, N ) );
	const TAU = new Float64Array( Math.max( 1, N ) );
	const WORK = new Float64Array( lwork );
	const K = [ 0 ];
	const l = [ 0 ];
	let i;
	for ( i = 0; i < M * N; i++ ) {
		A[ i ] = Math.sin( ( 3 * i ) + 1 );
	}
	for ( i = 0; i < p * N; i++ ) {
		B[ i ] = Math.cos( ( 5 * i ) + 2 );
	}
	dggsvp3( 'compute-U', 'compute-V', 'compute-Q', M, p, N, A, 1, Math.max( 1, M ), 0, B, 1, Math.max( 1, p ), 0, 1e-12, 1e-12, K, l, U, 1, Math.max( 1, M ), 0, V, 1, Math.max( 1, p ), 0, Q, 1, Math.max( 1, N ), 0, IWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	return {
		'K': K[ 0 ],
		'l': l[ 0 ],
		'A': Array.from( A ),
		'B': Array.from( B ),
		'U': Array.from( U ),
		'V': Array.from( V ),
		'Q': Array.from( Q )
	};
}

test( 'dggsvp3: WORK of exactly the minimum (3N+1, DGEQP3\'s) matches a large WORK', function t() {
	const big = runWithWork( 3, 3, 3, 5000 );
	const out = runWithWork( 3, 3, 3, 10 );
	assert.deepStrictEqual( out, big );
	assert.throws( function bad() {
		runWithWork( 3, 3, 3, 9 );
	}, RangeError );
});

test( 'dggsvp3: M = 0 still needs the dgeqp3 workspace for B (ticket 0096)', function t() {
	// B (P-by-N) is still factored when M = 0:
	const big = runWithWork( 0, 3, 4, 5000 );
	const out = runWithWork( 0, 3, 4, 13 );
	assert.deepStrictEqual( out, big );
	assert.throws( function bad() {
		runWithWork( 0, 3, 4, 12 );
	}, RangeError );
});

test( 'dggsvp3: WORK of exactly the minimum 3N+1 past dgeqp3\'s blocking threshold matches the optimal WORK (ticket 0100)', function t() {
	// min(M,N) = 130 > NX = 128 selects the blocked dgeqp3 at its optimum 2N + (N+1)*32; with 3N+1 it falls back to the unblocked dlaqp2, as the reference's DGEQP3 does.
	const N = 130;
	const lwork = ( 3 * N ) + 1;
	const big = runWithWork( N, 2, N, ( 2 * N ) + ( ( N + 1 ) * 32 ) );
	const out = runWithWork( N, 2, N, lwork );
	let key;
	assert.strictEqual( out.K, big.K, 'K' );
	assert.strictEqual( out.l, big.l, 'l' );
	for ( key of [ 'A', 'B', 'U', 'V', 'Q' ] ) {
		assertArrayClose( out[ key ], big[ key ], 1e-9, key );
	}
	assert.throws( function bad() {
		runWithWork( N, 2, N, lwork - 1 );
	}, RangeError );
});


// WORKSPACE MINIMUM (ticket 0016) //

function wsRand( n, seed ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < n; i++ ) {
		s = ( s * 16807 ) % 2147483647;
		out[ i ] = ( s / 2147483647 ) - 0.5;
	}
	return out;
}

function wsMat( n, seed ) {
	return wsRand( n, seed );
}

function wsWork( n ) {
	return new Float64Array( n ).fill( NaN );
}

function wsFlat( x ) {
	return Array.from( x );
}

function wsRun( c, lw, liwork ) {
	const lda = Math.max( 1, c.M );
	const ldb = Math.max( 1, c.P );
	const liw = ( liwork === void 0 ) ? c.N : liwork;
	const A = wsMat( lda * c.N, 7 + c.M );
	const B = wsMat( ldb * c.N, 11 + c.P );
	const K = new Int32Array( 1 );
	const L = new Int32Array( 1 );
	const U = new Float64Array( lda * lda );
	const V = new Float64Array( ldb * ldb );
	const Q = new Float64Array( c.N * c.N );
	const al = new Float64Array( c.N );
	const be = new Float64Array( c.N );
	const info = dggsvp3( c.ju, c.jv, c.jq, c.M, c.P, c.N, A, 1, lda, 0, B, 1, ldb, 0, 1e-12, 1e-12, K, L, U, 1, lda, 0, V, 1, ldb, 0, Q, 1, c.N, 0, ( liw < 0 ) ? null : new Int32Array( liw ), 1, 0, new Float64Array( c.N ), 1, 0, wsWork( lw ), 1, 0 );
	return [ info, K[ 0 ], L[ 0 ] ].concat( wsFlat( A ), wsFlat( B ), wsFlat( U ), wsFlat( V ), wsFlat( Q ), wsFlat( al ), wsFlat( be ) );
}

const WS_CASES = [
		{ 'ju': 'none', 'jv': 'none', 'jq': 'none', 'M': 3, 'P': 9, 'N': 2, 'lwork': 7 }, // old minimum: 9,
		{ 'ju': 'compute-U', 'jv': 'none', 'jq': 'compute-Q', 'M': 10, 'P': 110, 'N': 34, 'lwork': 103 }, // old minimum: 110,
		{ 'ju': 'none', 'jv': 'compute-V', 'jq': 'none', 'M': 9, 'P': 1, 'N': 2, 'lwork': 9 }, // old minimum: 9,
		{ 'ju': 'compute-U', 'jv': 'compute-V', 'jq': 'compute-Q', 'M': 9, 'P': 3, 'N': 4, 'lwork': 13 }, // old minimum: 13,
		{ 'ju': 'none', 'jv': 'none', 'jq': 'compute-Q', 'M': 40, 'P': 0, 'N': 3, 'lwork': 10 }, // old minimum: 40,
		{ 'ju': 'compute-U', 'jv': 'compute-V', 'jq': 'compute-Q', 'M': 5, 'P': 4, 'N': 40, 'lwork': 121 }, // old minimum: 121
		{ 'ju': 'none', 'jv': 'compute-V', 'jq': 'none', 'M': 1, 'P': 9, 'N': 1, 'lwork': 8 }, // V's reflectors touch at most P-1 columns; old minimum: 9 (ticket 0016)
		{ 'ju': 'compute-U', 'jv': 'none', 'jq': 'none', 'M': 33, 'P': 0, 'N': 5, 'lwork': 32 } // P = 0: only U's generation, M-1; old minimum: 33 (ticket 0016)
];

test( 'dggsvp3: WORK of exactly the minimum (NaN-filled) gives the results of an ample WORK, also where the old minimum max(M, N, P, ...) rejected it and past the blocking threshold', function t() {
	let got, ref, c, k, i;
	for ( k = 0; k < WS_CASES.length; k++ ) {
		c = WS_CASES[ k ];
		ref = wsRun( c, c.lwork + 4096 );
		got = wsRun( c, c.lwork );
		assert.equal( got.length, ref.length, 'length' );
		for ( i = 0; i < ref.length; i++ ) {
			assert.ok( Math.abs( got[ i ] - ref[ i ] ) <= 1e-10 * Math.max( 1.0, Math.abs( ref[ i ] ) ), JSON.stringify( c ) + ': element ' + i + ': ' + got[ i ] + ' vs ' + ref[ i ] );
		}
	}
});

test( 'dggsvp3: one less than the minimum WORK or IWORK (N) throws a RangeError', function t() {
	let c, k;
	for ( k = 0; k < WS_CASES.length; k++ ) {
		c = WS_CASES[ k ];
		assert.throws( wsCall( c, c.lwork - 1 ), RangeError, JSON.stringify( c ) + ': WORK' );
		assert.throws( wsCall( c, c.lwork, c.N - 1 ), RangeError, JSON.stringify( c ) + ': IWORK' );
	}
});

function wsCall( c, lw, liwork ) {
	return function call() {
		wsRun( c, lw, liwork );
	};
}

test( 'dggsvp3: a missing (null) IWORK throws a RangeError', function t() {
	const c = WS_CASES[ 0 ];
	assert.throws( wsCall( c, c.lwork, -1 ), RangeError, 'IWORK' );
});
