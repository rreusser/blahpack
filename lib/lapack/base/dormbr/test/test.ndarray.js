/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormbr from './../lib/ndarray.js';
import dgebrd from '../../dgebrd/lib/base.js';

// FIXTURES //

import gebrd_4x3 from './fixtures/gebrd_4x3.json' with { type: 'json' };
import q_l_n_upper from './fixtures/q_l_n_upper.json' with { type: 'json' };
import q_l_t_upper from './fixtures/q_l_t_upper.json' with { type: 'json' };
import p_r_n_upper from './fixtures/p_r_n_upper.json' with { type: 'json' };
import p_r_t_upper from './fixtures/p_r_t_upper.json' with { type: 'json' };
import q_r_n_upper from './fixtures/q_r_n_upper.json' with { type: 'json' };
import p_l_n_upper from './fixtures/p_l_n_upper.json' with { type: 'json' };
import q_r_t_upper from './fixtures/q_r_t_upper.json' with { type: 'json' };
import p_l_t_upper from './fixtures/p_l_t_upper.json' with { type: 'json' };
import gebrd_3x4 from './fixtures/gebrd_3x4.json' with { type: 'json' };
import q_l_n_lower from './fixtures/q_l_n_lower.json' with { type: 'json' };
import q_l_t_lower from './fixtures/q_l_t_lower.json' with { type: 'json' };
import p_r_n_lower from './fixtures/p_r_n_lower.json' with { type: 'json' };
import p_r_t_lower from './fixtures/p_r_t_lower.json' with { type: 'json' };
import p_l_n_lower from './fixtures/p_l_n_lower.json' with { type: 'json' };
import p_l_t_lower from './fixtures/p_l_t_lower.json' with { type: 'json' };
import q_r_n_lower from './fixtures/q_r_n_lower.json' with { type: 'json' };
import q_r_t_lower from './fixtures/q_r_t_lower.json' with { type: 'json' };
import q_l_n_nonident from './fixtures/q_l_n_nonident.json' with { type: 'json' };
import p_r_n_lower_nonident from './fixtures/p_r_n_lower_nonident.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };

// FUNCTIONS //

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
	let relErr, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
	}
}

/**
* Extracts an MxN submatrix from a column-major flat array with leading dimension LDA,.
* and returns a new flat column-major array of size M*N with leading dimension M.
*/
function extractColMajor( flat, lda, M, N ) {
	const out = new Float64Array( M * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ j * M + i ] = flat[ j * lda + i ];
		}
	}
	return out;
}

/**
* Creates an MxN identity matrix in column-major flat format.
*/
function eye( M, N ) {
	const out = new Float64Array( M * N );
	let k;
	for ( k = 0; k < Math.min( M, N ); k++ ) {
		out[ k * M + k ] = 1.0;
	}
	return out;
}

// TESTS //

// ===== Upper bidiagonal (M=4, N=3): M > N, uses upper bidiagonal path =====

test( 'dormbr: VECT=Q, SIDE=L, TRANS=N (upper bidiagonal, NQ>=K)', function t() { // eslint-disable-line max-len

	const gebrd = gebrd_4x3;
	const tc = q_l_n_upper;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'left', 'no-transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=L, TRANS=T (upper bidiagonal)', function t() {

	const gebrd = gebrd_4x3;
	const tc = q_l_t_upper;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'left', 'transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=N (upper bidiagonal, NQ>=K)', function t() { // eslint-disable-line max-len

	const gebrd = gebrd_4x3;
	const tc = p_r_n_upper;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'right', 'no-transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=T (upper bidiagonal)', function t() {

	const gebrd = gebrd_4x3;
	const tc = p_r_t_upper;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'right', 'transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=N (upper bidiagonal)', function t() {

	const gebrd = gebrd_4x3;
	const tc = q_r_n_upper;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'right', 'no-transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=N (upper bidiagonal)', function t() {

	const gebrd = gebrd_4x3;
	const tc = p_l_n_upper;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'left', 'no-transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=T (upper bidiagonal)', function t() {

	const gebrd = gebrd_4x3;
	const tc = q_r_t_upper;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'right', 'transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=T (upper bidiagonal)', function t() {

	const gebrd = gebrd_4x3;
	const tc = p_l_t_upper;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'left', 'transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

// ===== Lower bidiagonal (M=3, N=4): M < N, uses lower bidiagonal path =====

test( 'dormbr: VECT=Q, SIDE=L, TRANS=N (lower bidiagonal, NQ<K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = q_l_n_lower;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'left', 'no-transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=L, TRANS=T (lower bidiagonal, NQ<K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = q_l_t_lower;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'left', 'transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=N (lower bidiagonal, NQ>K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = p_r_n_lower;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'right', 'no-transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=T (lower bidiagonal, NQ>K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = p_r_t_lower;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'right', 'transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=N (lower bidiagonal, NQ>K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = p_l_n_lower;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'left', 'no-transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=T (lower bidiagonal, NQ>K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = p_l_t_lower;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'left', 'transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=N (lower bidiagonal, NQ<K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = q_r_n_lower;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'right', 'no-transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=T (lower bidiagonal, NQ<K)', function t() {

	const gebrd = gebrd_3x4;
	const tc = q_r_t_lower;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = eye( 3, 3 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'right', 'transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

// ===== Non-identity C tests =====

test( 'dormbr: VECT=Q, SIDE=L, TRANS=N, non-identity C (upper bidiagonal)', function t() { // eslint-disable-line max-len

	const gebrd = gebrd_4x3;
	const tc = q_l_n_nonident;
	const A = new Float64Array( gebrd.A );
	const TAUQ = new Float64Array( gebrd.TAUQ );
	const C = new Float64Array( [ 1, 3, -1, 2, 2, 0, 4, -1 ] );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'left', 'no-transpose', 4, 2, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=N, non-identity C (lower bidiagonal)', function t() { // eslint-disable-line max-len

	const gebrd = gebrd_3x4;
	const tc = p_r_n_lower_nonident;
	const A = new Float64Array( gebrd.A );
	const TAUP = new Float64Array( gebrd.TAUP );
	const C = new Float64Array( [ 1, 3, -1, 2, 0, 4, -1, 2, 1, 0, 1, -2 ] );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-P', 'right', 'no-transpose', 3, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

// ===== Edge cases =====

test( 'dormbr: M=0 quick return', function t() {

	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormbr('apply-Q', 'left', 'no-transpose', 0, 3, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormbr: N=0 quick return', function t() {

	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormbr('apply-Q', 'left', 'no-transpose', 3, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormbr: K=0, VECT=Q (dormqr with K=0, C unchanged)', function t() {

	const tc = k_zero;
	const A = new Float64Array( 16 );
	const TAU = new Float64Array( 1 );
	const C = eye( 4, 4 );
	const WORK = new Float64Array( 1000 );
	const info = dormbr('apply-Q', 'left', 'no-transpose', 4, 4, 0, A, 1, 4, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, NQ=1 (P is the 1x1 identity, C unchanged)', function t() {
	// With nq = M = 1, P = I(1) for any K, so C must come back unchanged:
	const A = new Float64Array( [ 3.0 ] );
	const TAUP = new Float64Array( [ 0.5 ] );
	const C = new Float64Array( [ 1.5, -2.25 ] );
	const WORK = new Float64Array( 10 );
	const info = dormbr( 'apply-P', 'left', 'no-transpose', 1, 2, 2, A, 1, 1, 0, TAUP, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.deepEqual( C, new Float64Array( [ 1.5, -2.25 ] ) );
});

test( 'dormbr: VECT=Q, NQ=1 < K (Q is the 1x1 identity, C unchanged)', function t() {
	// With nq = M = 1 < K, Q = I(1), so C must come back unchanged:
	const A = new Float64Array( [ 3.0, 0.0 ] );
	const TAUQ = new Float64Array( [ 0.5, 0.25 ] );
	const C = new Float64Array( [ 1.5, -2.25 ] );
	const WORK = new Float64Array( 10 );
	const info = dormbr( 'apply-Q', 'left', 'no-transpose', 1, 2, 2, A, 1, 1, 0, TAUQ, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.deepEqual( C, new Float64Array( [ 1.5, -2.25 ] ) );
});

test( 'dormbr: accepts the reference minimum nw past the blocking threshold and matches an optimal-WORK run (ticket 0100)', function t() {
	const n0 = 40;
	const freeN = 50;
	const A0 = new Float64Array( n0 * n0 );
	const TAUQ = new Float64Array( n0 );
	const TAUP = new Float64Array( n0 );
	let i;
	for ( i = 0; i < A0.length; i++ ) {
		A0[ i ] = Math.sin( ( 0.37 * i ) + 0.1 ) + ( ( i % 5 ) * 0.2 );
	}
	dgebrd( n0, n0, A0, 1, n0, 0, new Float64Array( n0 ), 1, 0, new Float64Array( n0 - 1 ), 1, 0, TAUQ, 1, 0, TAUP, 1, 0, new Float64Array( 8192 ), 1, 0 );
	[ 'apply-Q', 'apply-P' ].forEach( function eachVect( vect ) {
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
				const M = ( side === 'left' ) ? n0 : freeN;
				const N = ( side === 'left' ) ? freeN : n0;
				const nw = ( side === 'left' ) ? N : M;
				const TAU = ( vect === 'apply-Q' ) ? TAUQ : TAUP;
				const label = vect + ' ' + side + ' ' + trans;
				const C1 = new Float64Array( M * N );
				let info;
				let j;
				for ( j = 0; j < C1.length; j++ ) {
					C1[ j ] = Math.cos( ( 0.23 * j ) + 0.5 );
				}
				const C2 = new Float64Array( C1 );
				info = dormbr( vect, side, trans, M, N, n0, new Float64Array( A0 ), 1, n0, 0, TAU, 1, 0, C1, 1, M, 0, new Float64Array( nw ), 1, 0 );
				assert.equal( info, 0, label + ': info (minimum WORK)' );
				info = dormbr( vect, side, trans, M, N, n0, new Float64Array( A0 ), 1, n0, 0, TAU, 1, 0, C2, 1, M, 0, new Float64Array( ( nw * 32 ) + 4160 ), 1, 0 );
				assert.equal( info, 0, label + ': info (optimal WORK)' );
				for ( j = 0; j < C1.length; j++ ) {
					assert.ok( Math.abs( C1[ j ] - C2[ j ] ) < 1e-12, label + ': C[' + j + ']' );
				}
				assert.throws( function throws() {
					dormbr( vect, side, trans, M, N, n0, new Float64Array( A0 ), 1, n0, 0, TAU, 1, 0, new Float64Array( C1 ), 1, M, 0, new Float64Array( nw - 1 ), 1, 0 );
				}, RangeError, label + ': one below the minimum' );
			});
		});
	});
});
