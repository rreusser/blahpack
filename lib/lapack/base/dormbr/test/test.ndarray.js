/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormbr from './../lib/ndarray.js';

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
	var relErr;
	var i;
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
	var out = new Float64Array( M * N );
	var i;
	var j;
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
	var out = new Float64Array( M * N );
	var k;
	for ( k = 0; k < Math.min( M, N ); k++ ) {
		out[ k * M + k ] = 1.0;
	}
	return out;
}

// TESTS //

// ===== Upper bidiagonal (M=4, N=3): M > N, uses upper bidiagonal path =====

test( 'dormbr: VECT=Q, SIDE=L, TRANS=N (upper bidiagonal, NQ>=K)', function t() { // eslint-disable-line max-len
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = q_l_n_upper;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'left', 'no-transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=L, TRANS=T (upper bidiagonal)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = q_l_t_upper;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'left', 'transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=N (upper bidiagonal, NQ>=K)', function t() { // eslint-disable-line max-len
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = p_r_n_upper;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'right', 'no-transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=T (upper bidiagonal)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = p_r_t_upper;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'right', 'transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=N (upper bidiagonal)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = q_r_n_upper;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'right', 'no-transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=N (upper bidiagonal)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = p_l_n_upper;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'left', 'no-transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=T (upper bidiagonal)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = q_r_t_upper;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'right', 'transpose', 4, 4, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=T (upper bidiagonal)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = p_l_t_upper;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'left', 'transpose', 3, 3, 3, A, 1, 4, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

// ===== Lower bidiagonal (M=3, N=4): M < N, uses lower bidiagonal path =====

test( 'dormbr: VECT=Q, SIDE=L, TRANS=N (lower bidiagonal, NQ<K)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = q_l_n_lower;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'left', 'no-transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=L, TRANS=T (lower bidiagonal, NQ<K)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = q_l_t_lower;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'left', 'transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=N (lower bidiagonal, NQ>K)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = p_r_n_lower;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'right', 'no-transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=T (lower bidiagonal, NQ>K)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = p_r_t_lower;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'right', 'transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=N (lower bidiagonal, NQ>K)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = p_l_n_lower;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'left', 'no-transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=L, TRANS=T (lower bidiagonal, NQ>K)', function t() {
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = p_l_t_lower;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'left', 'transpose', 4, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=N (lower bidiagonal, NQ<K)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = q_r_n_lower;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'right', 'no-transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=Q, SIDE=R, TRANS=T (lower bidiagonal, NQ<K)', function t() {
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = q_r_t_lower;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = eye( 3, 3 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'right', 'transpose', 3, 3, 4, A, 1, 3, 0, TAUQ, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

// ===== Non-identity C tests =====

test( 'dormbr: VECT=Q, SIDE=L, TRANS=N, non-identity C (upper bidiagonal)', function t() { // eslint-disable-line max-len
	var gebrd;
	var TAUQ;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_4x3;
	tc = q_l_n_nonident;
	A = new Float64Array( gebrd.A );
	TAUQ = new Float64Array( gebrd.TAUQ );
	C = new Float64Array( [ 1, 3, -1, 2, 2, 0, 4, -1 ] );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'left', 'no-transpose', 4, 2, 3, A, 1, 4, 0, TAUQ, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dormbr: VECT=P, SIDE=R, TRANS=N, non-identity C (lower bidiagonal)', function t() { // eslint-disable-line max-len
	var gebrd;
	var TAUP;
	var WORK;
	var info;
	var tc;
	var A;
	var C;

	gebrd = gebrd_3x4;
	tc = p_r_n_lower_nonident;
	A = new Float64Array( gebrd.A );
	TAUP = new Float64Array( gebrd.TAUP );
	C = new Float64Array( [ 1, 3, -1, 2, 0, 4, -1, 2, 1, 0, 1, -2 ] );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-P', 'right', 'no-transpose', 3, 4, 3, A, 1, 3, 0, TAUP, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

// ===== Edge cases =====

test( 'dormbr: M=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dormbr('apply-Q', 'left', 'no-transpose', 0, 3, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormbr: N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var C;

	A = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dormbr('apply-Q', 'left', 'no-transpose', 3, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormbr: K=0, VECT=Q (dormqr with K=0, C unchanged)', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var A;
	var C;

	tc = k_zero;
	A = new Float64Array( 16 );
	TAU = new Float64Array( 1 );
	C = eye( 4, 4 );
	WORK = new Float64Array( 1000 );
	info = dormbr('apply-Q', 'left', 'no-transpose', 4, 4, 0, A, 1, 4, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});
