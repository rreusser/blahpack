// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebrd from '../../dgebrd/lib/base.js';
import dorgbr from './../lib/ndarray.js';

// FIXTURES //

import vect_q_m_gt_n from './fixtures/vect_q_m_gt_n.json' with { type: 'json' };
import vect_p_m_gt_n from './fixtures/vect_p_m_gt_n.json' with { type: 'json' };
import vect_q_m_lt_n from './fixtures/vect_q_m_lt_n.json' with { type: 'json' };
import vect_p_m_lt_n from './fixtures/vect_p_m_lt_n.json' with { type: 'json' };
import vect_q_square from './fixtures/vect_q_square.json' with { type: 'json' };
import vect_p_square from './fixtures/vect_p_square.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import vect_q_5x4 from './fixtures/vect_q_5x4.json' with { type: 'json' };
import vect_q_1x1 from './fixtures/vect_q_1x1.json' with { type: 'json' };
import vect_p_1x1 from './fixtures/vect_p_1x1.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Run dgebrd on a column-major matrix, returning TAUQ and TAUP.
*
* @param {number} M - rows
* @param {number} N - cols
* @param {Float64Array} A - M x N column-major matrix (overwritten)
* @returns {object} { TAUQ, TAUP }
*/
function runGebrd( M, N, A ) {
	var minmn = Math.min( M, N );
	var d = new Float64Array( minmn );
	var e = new Float64Array( Math.max( minmn - 1, 1 ) );
	var TAUQ = new Float64Array( minmn );
	var TAUP = new Float64Array( minmn );
	var WORK = new Float64Array( 2048 );
	dgebrd( M, N, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 2048 );
	return { TAUQ: TAUQ, TAUP: TAUP };
}

/**
* Extract column-major matrix values in the same order as the Fortran fixture
* (column-major, M rows, N cols, leading dimension = LDA).
*
* @param {Float64Array} A - column-major data
* @param {number} M - rows
* @param {number} N - cols
* @param {number} LDA - leading dimension
* @returns {Array} flat array of M*N values in column-major order
*/
function extractMatrix( A, M, N, LDA ) {
	var result = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			result.push( A[ i + j * LDA ] );
		}
	}
	return result;
}

// TESTS //

test( 'dorgbr: VECT=Q, M > N (4x3 matrix, M >= K path)', function t() {
	var tc = vect_q_m_gt_n;
	var M = 4;
	var N = 3;
	var K = 3;
	var A = new Float64Array([
		2.0, 1.0, 3.0, 1.0,
		1.0, 4.0, 2.0, 3.0,
		3.0, 2.0, 5.0, 1.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	var info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	var Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, M > N (4x3 matrix, K >= N shift path)', function t() {
	var tc = vect_p_m_gt_n;
	var M = 4;
	var N = 3;
	var A = new Float64Array([
		2.0, 1.0, 3.0, 1.0,
		1.0, 4.0, 2.0, 3.0,
		3.0, 2.0, 5.0, 1.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	// For VECT='P' with M > N: generate P^T as N x N, K = M (original rows)
	var info = dorgbr('apply-P', N, N, M, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	var PT = extractMatrix( A, N, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: VECT=Q, M < N (3x4 matrix, M < K shift path)', function t() {
	var tc = vect_q_m_lt_n;
	var M = 3;
	var N = 4;
	var A = new Float64Array([
		1.0, 3.0, 2.0,
		4.0, 1.0, 3.0,
		2.0, 5.0, 1.0,
		1.0, 2.0, 4.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	// For VECT='Q' with M < N: generate Q as M x M, K = N (original cols)
	var info = dorgbr('apply-Q', M, M, N, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	var Q = extractMatrix( A, M, M, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, M < N (3x4 matrix, K < N direct path)', function t() {
	var tc = vect_p_m_lt_n;
	var M = 3;
	var N = 4;
	var K = 3;
	var A = new Float64Array([
		1.0, 3.0, 2.0,
		4.0, 1.0, 3.0,
		2.0, 5.0, 1.0,
		1.0, 2.0, 4.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	// For VECT='P' with M < N: generate P^T as M x N, K = M
	var info = dorgbr('apply-P', M, N, K, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	var PT = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: VECT=Q, square (4x4 matrix)', function t() {
	var tc = vect_q_square;
	var M = 4;
	var N = 4;
	var K = 4;
	var A = new Float64Array([
		3.0, 1.0, 2.0, 1.0,
		1.0, 4.0, 1.0, 3.0,
		2.0, 1.0, 5.0, 2.0,
		1.0, 3.0, 2.0, 4.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	var info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	var Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, square (4x4 matrix, K >= N shift path)', function t() {
	var tc = vect_p_square;
	var M = 4;
	var N = 4;
	var A = new Float64Array([
		3.0, 1.0, 2.0, 1.0,
		1.0, 4.0, 1.0, 3.0,
		2.0, 1.0, 5.0, 2.0,
		1.0, 3.0, 2.0, 4.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	// For VECT='P' with square: K = M = N >= N => shift path
	var info = dorgbr('apply-P', N, N, M, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	var PT = extractMatrix( A, N, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: M=0 quick return', function t() {
	var tc = m_zero;
	var A = new Float64Array( 1 );
	var TAU = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dorgbr('apply-Q', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dorgbr: VECT=Q, 5x4 matrix (M >= K path)', function t() {
	var tc = vect_q_5x4;
	var M = 5;
	var N = 4;
	var K = 4;
	var A = new Float64Array([
		1.0, 4.0, 2.0, 1.0, 3.0,
		2.0, 1.0, 3.0, 1.0, 2.0,
		1.0, 3.0, 2.0, 4.0, 1.0,
		3.0, 1.0, 1.0, 2.0, 1.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	var info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	var Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=Q, 1x1 matrix', function t() {
	var tc = vect_q_1x1;
	var M = 1;
	var N = 1;
	var K = 1;
	var A = new Float64Array([ 5.0 ]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	var info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	var Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, 1x1 matrix', function t() {
	var tc = vect_p_1x1;
	var M = 1;
	var N = 1;
	var K = 1;
	var A = new Float64Array([ 5.0 ]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	var info = dorgbr('apply-P', N, N, M, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	var PT = extractMatrix( A, N, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: orthogonality verification for VECT=Q', function t() {
	// Verify Q^T * Q = I for a 4x3 case
	var M = 4;
	var N = 3;
	var K = 3;
	var sum;
	var expected;
	var A = new Float64Array([
		2.0, 1.0, 3.0, 1.0,
		1.0, 4.0, 2.0, 3.0,
		3.0, 2.0, 5.0, 1.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );

	// Compute Q^T * Q
	var QtQ = new Float64Array( N * N );
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < M; k++ ) {
				sum += A[ k + i * M ] * A[ k + j * M ];
			}
			QtQ[ i + j * N ] = sum;
		}
	}
	// Should be identity
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			expected = ( i === j ) ? 1.0 : 0.0;
			assertClose( QtQ[ i + j * N ], expected, 1e-14, 'QtQ[' + i + ',' + j + ']' );
		}
	}
});

test( 'dorgbr: orthogonality verification for VECT=P', function t() {
	// Verify P^T * (P^T)^T = I for a 3x4 case
	var M = 3;
	var N = 4;
	var K = 3;
	var sum;
	var expected;
	var A = new Float64Array([
		1.0, 3.0, 2.0,
		4.0, 1.0, 3.0,
		2.0, 5.0, 1.0,
		1.0, 2.0, 4.0
	]);
	var WORK = new Float64Array( 2048 );
	var result = runGebrd( M, N, A );
	dorgbr('apply-P', M, N, K, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );

	// Compute (P^T) * (P^T)^T = should be I_M
	var PTPt = new Float64Array( M * M );
	var i;
	var j;
	var k;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += A[ i + k * M ] * A[ j + k * M ];
			}
			PTPt[ i + j * M ] = sum;
		}
	}
	// Should be identity
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			expected = ( i === j ) ? 1.0 : 0.0;
			assertClose( PTPt[ i + j * M ], expected, 1e-14, 'PTPt[' + i + ',' + j + ']' );
		}
	}
});
