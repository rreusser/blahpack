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

/**
* Run dgebrd on a column-major matrix, returning TAUQ and TAUP.
*
* @param {number} M - rows
* @param {number} N - cols
* @param {Float64Array} A - M x N column-major matrix (overwritten)
* @returns {object} { TAUQ, TAUP }
*/
function runGebrd( M, N, A ) {
	const minmn = Math.min( M, N );
	const d = new Float64Array( minmn );
	const e = new Float64Array( Math.max( minmn - 1, 1 ) );
	const TAUQ = new Float64Array( minmn );
	const TAUP = new Float64Array( minmn );
	const WORK = new Float64Array( 2048 );
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
	const result = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			result.push( A[ i + j * LDA ] );
		}
	}
	return result;
}

// TESTS //

test( 'dorgbr: VECT=Q, M > N (4x3 matrix, M >= K path)', function t() {
	const tc = vect_q_m_gt_n;
	const M = 4;
	const N = 3;
	const K = 3;
	const A = new Float64Array([
		2.0, 1.0, 3.0, 1.0,
		1.0, 4.0, 2.0, 3.0,
		3.0, 2.0, 5.0, 1.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	const info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	const Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, M > N (4x3 matrix, K >= N shift path)', function t() {
	const tc = vect_p_m_gt_n;
	const M = 4;
	const N = 3;
	const A = new Float64Array([
		2.0, 1.0, 3.0, 1.0,
		1.0, 4.0, 2.0, 3.0,
		3.0, 2.0, 5.0, 1.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	// For VECT='P' with M > N: generate P^T as N x N, K = M (original rows)
	const info = dorgbr('apply-P', N, N, M, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	const PT = extractMatrix( A, N, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: VECT=Q, M < N (3x4 matrix, M < K shift path)', function t() {
	const tc = vect_q_m_lt_n;
	const M = 3;
	const N = 4;
	const A = new Float64Array([
		1.0, 3.0, 2.0,
		4.0, 1.0, 3.0,
		2.0, 5.0, 1.0,
		1.0, 2.0, 4.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	// For VECT='Q' with M < N: generate Q as M x M, K = N (original cols)
	const info = dorgbr('apply-Q', M, M, N, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	const Q = extractMatrix( A, M, M, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, M < N (3x4 matrix, K < N direct path)', function t() {
	const tc = vect_p_m_lt_n;
	const M = 3;
	const N = 4;
	const K = 3;
	const A = new Float64Array([
		1.0, 3.0, 2.0,
		4.0, 1.0, 3.0,
		2.0, 5.0, 1.0,
		1.0, 2.0, 4.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	// For VECT='P' with M < N: generate P^T as M x N, K = M
	const info = dorgbr('apply-P', M, N, K, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	const PT = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: VECT=Q, square (4x4 matrix)', function t() {
	const tc = vect_q_square;
	const M = 4;
	const N = 4;
	const K = 4;
	const A = new Float64Array([
		3.0, 1.0, 2.0, 1.0,
		1.0, 4.0, 1.0, 3.0,
		2.0, 1.0, 5.0, 2.0,
		1.0, 3.0, 2.0, 4.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	const info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	const Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, square (4x4 matrix, K >= N shift path)', function t() {
	const tc = vect_p_square;
	const M = 4;
	const N = 4;
	const A = new Float64Array([
		3.0, 1.0, 2.0, 1.0,
		1.0, 4.0, 1.0, 3.0,
		2.0, 1.0, 5.0, 2.0,
		1.0, 3.0, 2.0, 4.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	// For VECT='P' with square: K = M = N >= N => shift path
	const info = dorgbr('apply-P', N, N, M, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	const PT = extractMatrix( A, N, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: M=0 quick return', function t() {
	const tc = m_zero;
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgbr('apply-Q', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
});

test( 'dorgbr: VECT=Q, 5x4 matrix (M >= K path)', function t() {
	const tc = vect_q_5x4;
	const M = 5;
	const N = 4;
	const K = 4;
	const A = new Float64Array([
		1.0, 4.0, 2.0, 1.0, 3.0,
		2.0, 1.0, 3.0, 1.0, 2.0,
		1.0, 3.0, 2.0, 4.0, 1.0,
		3.0, 1.0, 1.0, 2.0, 1.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	const info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	const Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=Q, 1x1 matrix', function t() {
	const tc = vect_q_1x1;
	const M = 1;
	const N = 1;
	const K = 1;
	const A = new Float64Array([ 5.0 ]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	const info = dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	const Q = extractMatrix( A, M, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-14, 'Q' );
});

test( 'dorgbr: VECT=P, 1x1 matrix', function t() {
	const tc = vect_p_1x1;
	const M = 1;
	const N = 1;
	const A = new Float64Array([ 5.0 ]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	const info = dorgbr('apply-P', N, N, M, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );
	const PT = extractMatrix( A, N, N, M );

	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( PT, tc.PT, 1e-14, 'PT' );
});

test( 'dorgbr: orthogonality verification for VECT=Q', function t() {
	// Verify Q^T * Q = I for a 4x3 case
	const M = 4;
	const N = 3;
	const K = 3;
	let sum, expected;
	const A = new Float64Array([
		2.0, 1.0, 3.0, 1.0,
		1.0, 4.0, 2.0, 3.0,
		3.0, 2.0, 5.0, 1.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	dorgbr('apply-Q', M, N, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );

	// Compute Q^T * Q
	const QtQ = new Float64Array( N * N );
	let i, j, k;
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
	const M = 3;
	const N = 4;
	const K = 3;
	let sum, expected;
	const A = new Float64Array([
		1.0, 3.0, 2.0,
		4.0, 1.0, 3.0,
		2.0, 5.0, 1.0,
		1.0, 2.0, 4.0
	]);
	const WORK = new Float64Array( 2048 );
	const result = runGebrd( M, N, A );
	dorgbr('apply-P', M, N, K, A, 1, M, 0, result.TAUP, 1, 0, WORK, 1, 0 );

	// Compute (P^T) * (P^T)^T = should be I_M
	const PTPt = new Float64Array( M * M );
	let i, j, k;
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

test( 'dorgbr: VECT=Q, M < K with M - 1 > NB (34x35 reduction) forms an orthogonal Q', function t() {
	const M = 34;
	const K = 35;
	const A = new Float64Array( M * K );
	const WORK = new Float64Array( 4096 );
	let result;
	let info;
	let sum;
	let i;
	let j;
	let k;
	for ( i = 0; i < A.length; i++ ) {
		A[ i ] = Math.sin( ( 0.7 * i ) + 0.3 ) + ( ( i % 7 ) * 0.1 );
	}
	result = runGebrd( M, K, A );
	info = dorgbr( 'apply-Q', M, M, K, A, 1, M, 0, result.TAUQ, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			sum = 0.0;
			for ( k = 0; k < M; k++ ) {
				sum += A[ k + ( i * M ) ] * A[ k + ( j * M ) ];
			}
			assertClose( sum, ( i === j ) ? 1.0 : 0.0, 1e-13, 'QtQ[' + i + ',' + j + ']' );
		}
	}
	// The shifted form has Q(0,:) = Q(:,0) = e_1:
	assert.equal( A[ 0 ], 1.0 );
	for ( i = 1; i < M; i++ ) {
		assert.equal( A[ i ], 0.0, 'Q(' + i + ',0)' );
		assert.equal( A[ i * M ], 0.0, 'Q(0,' + i + ')' );
	}
});

test( 'dorgbr: VECT=Q, M = 1 < K returns the 1x1 identity', function t() {
	const A = new Float64Array( [ 3.0, 4.0 ] );
	const result = runGebrd( 1, 2, A );
	const info = dorgbr( 'apply-Q', 1, 1, 2, A, 1, 1, 0, result.TAUQ, 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.equal( info, 0 );
	assert.equal( A[ 0 ], 1.0 );
});

test( 'dorgbr: accepts the reference minimum max(1,min(M,N)) past the blocking threshold and matches an optimal-WORK run (ticket 0100)', function t() {
	const cases = [
		// [ vect, M0, N0, M, N, K ]
		[ 'apply-Q', 48, 40, 48, 40, 40 ],
		[ 'apply-Q', 40, 44, 40, 40, 44 ],
		[ 'apply-P', 40, 48, 40, 48, 40 ],
		[ 'apply-P', 44, 40, 40, 40, 44 ]
	];
	cases.forEach( function each( c ) {
		const vect = c[ 0 ];
		const M0 = c[ 1 ];
		const N0 = c[ 2 ];
		const M = c[ 3 ];
		const N = c[ 4 ];
		const K = c[ 5 ];
		const mn = Math.min( M, N );
		const A0 = new Float64Array( M0 * N0 );
		let result;
		let info;
		let A1;
		let A2;
		let i;
		for ( i = 0; i < A0.length; i++ ) {
			A0[ i ] = Math.sin( ( 0.37 * i ) + 0.1 ) + ( ( i % 5 ) * 0.2 );
		}
		result = runGebrd( M0, N0, A0 );
		A1 = new Float64Array( A0 );
		A2 = new Float64Array( A0 );
		const TAU = ( vect === 'apply-Q' ) ? result.TAUQ : result.TAUP;
		info = dorgbr( vect, M, N, K, A1, 1, M0, 0, TAU, 1, 0, new Float64Array( mn ), 1, 0 );
		assert.equal( info, 0, vect + ': info (minimum WORK)' );
		info = dorgbr( vect, M, N, K, A2, 1, M0, 0, TAU, 1, 0, new Float64Array( 64 * mn ), 1, 0 );
		assert.equal( info, 0, vect + ': info (optimal WORK)' );
		for ( i = 0; i < A1.length; i++ ) {
			assertClose( A1[ i ], A2[ i ], 1e-12, vect + ' M=' + M + ' N=' + N + ' K=' + K + ': A[' + i + ']' );
		}
		assert.throws( function throws() {
			dorgbr( vect, M, N, K, new Float64Array( A0 ), 1, M0, 0, TAU, 1, 0, new Float64Array( mn - 1 ), 1, 0 );
		}, RangeError, vect + ': one below the minimum' );
	});
});
