// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelq2 from '../../dgelq2/lib/base.js';
import dormlq from './../lib/strided.js';
import dgelqf from '../../dgelqf/lib/base.js';

// FIXTURES //

import lq_factored from './fixtures/lq_factored.json' with { type: 'json' };
import left_notrans_5x5 from './fixtures/left_notrans_5x5.json' with { type: 'json' };
import left_trans_5x5 from './fixtures/left_trans_5x5.json' with { type: 'json' };
import right_notrans_5x5 from './fixtures/right_notrans_5x5.json' with { type: 'json' };
import right_trans_5x5 from './fixtures/right_trans_5x5.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import right_trans_rect from './fixtures/right_trans_rect.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import left_notrans_blocked from './fixtures/left_notrans_blocked.json' with { type: 'json' };
import left_trans_blocked from './fixtures/left_trans_blocked.json' with { type: 'json' };
import right_notrans_blocked from './fixtures/right_notrans_blocked.json' with { type: 'json' };
import right_trans_blocked from './fixtures/right_trans_blocked.json' with { type: 'json' };

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
* Set up the 3x5 A matrix (LDA=6 in Fortran, column-major with strideA1=1, strideA2=6).
*/
function setupA() {
	const A = new Float64Array( 36 ); // 6x6
	// Row 1: A(1,1..5) in Fortran => A[0], A[6], A[12], A[18], A[24] col-major with LDA=6
	A[ 0 ] = 1.0; A[ 6 ] = 2.0; A[ 12 ] = 0.5; A[ 18 ] = 1.0; A[ 24 ] = 3.0;
	// Row 2: A(2,1..5) => A[1], A[7], A[13], A[19], A[25]
	A[ 1 ] = 0.5; A[ 7 ] = 1.0; A[ 13 ] = 3.0; A[ 19 ] = 2.0; A[ 25 ] = 1.0;
	// Row 3: A(3,1..5) => A[2], A[8], A[14], A[20], A[26]
	A[ 2 ] = 3.0; A[ 8 ] = 0.5; A[ 14 ] = 1.0; A[ 20 ] = 2.0; A[ 26 ] = 0.5;
	return A;
}

/**
* Compute the LQ factorization of the 3x5 matrix A with LDA=6 using dgelqf ().
* Returns { A, TAU }.
*/
function computeLQ() {
	const A = setupA();
	const TAU = new Float64Array( 6 );
	const WORK = new Float64Array( 200 );
	dgelqf(3, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU };
}

/**
* Create an NxN identity matrix with LDC stride (column-major).
*/
function identityN( N, LDC ) {
	const C = new Float64Array( LDC * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i + i * LDC ] = 1.0;
	}
	return C;
}

/**
* Extract C values in the fixture layout (column-major, LDC stride).
*/
function extractC( C, M, N, LDC, fixtureLen ) {
	const result = [];
	let j, i;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < LDC; i++ ) {
			if ( result.length < fixtureLen ) {
				result.push( C[ i + j * LDC ] );
			}
		}
	}
	return result;
}

/**
* Load the pre-factored big matrix A and TAU from the Fortran fixture.
* This avoids mismatches due to blocking differences between JS and Fortran dgelqf.
*/
function loadBigLQ( NBIG ) {
	const tc = lq_factored;
	const A = new Float64Array( tc.a );
	const TAU = new Float64Array( tc.tau );
	return { A: A, TAU: TAU };
}

// TESTS //

test( 'dormlq: left_notrans_5x5', function t() {
	const WORK = new Float64Array( 200 );
	const tc = left_notrans_5x5;
	const lq = computeLQ();
	const LDC = 6;
	const C = identityN( 5, LDC );
	const info = dormlq('left', 'no-transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: left_trans_5x5', function t() {
	const WORK = new Float64Array( 200 );
	const tc = left_trans_5x5;
	const lq = computeLQ();
	const LDC = 6;
	const C = identityN( 5, LDC );
	const info = dormlq('left', 'transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: right_notrans_5x5', function t() {
	const WORK = new Float64Array( 200 );
	const tc = right_notrans_5x5;
	const lq = computeLQ();
	const LDC = 6;
	const C = identityN( 5, LDC );
	const info = dormlq('right', 'no-transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: right_trans_5x5', function t() {
	const WORK = new Float64Array( 200 );
	const tc = right_trans_5x5;
	const lq = computeLQ();
	const LDC = 6;
	const C = identityN( 5, LDC );
	const info = dormlq('right', 'transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: m_zero', function t() {
	const WORK = new Float64Array( 200 );
	const tc = m_zero;
	const lq = computeLQ();
	const C = new Float64Array( 36 );
	const info = dormlq('left', 'no-transpose', 0, 5, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dormlq: n_zero', function t() {
	const WORK = new Float64Array( 200 );
	const tc = n_zero;
	const lq = computeLQ();
	const C = new Float64Array( 36 );
	const info = dormlq('left', 'no-transpose', 5, 0, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dormlq: k_zero', function t() {
	const WORK = new Float64Array( 200 );
	const tc = k_zero;
	const lq = computeLQ();
	const C = new Float64Array( 36 );
	const info = dormlq('left', 'no-transpose', 5, 5, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dormlq: right_trans_rect', function t() {
	const WORK = new Float64Array( 200 );
	const tc = right_trans_rect;
	const lq = computeLQ();
	const LDC = 6;
	const C = new Float64Array( 36 );
	// C is 3x5 matrix
	C[ 0 ] = 1.0; C[ 1 ] = 3.0; C[ 2 ] = -1.0;
	C[ 6 ] = 0.5; C[ 7 ] = 1.0; C[ 8 ] = 4.0;
	C[ 12 ] = 2.0; C[ 13 ] = 0.5; C[ 14 ] = 1.0;
	C[ 18 ] = 1.0; C[ 19 ] = 2.0; C[ 20 ] = 0.5;
	C[ 24 ] = 0.5; C[ 25 ] = 1.0; C[ 26 ] = 2.0;
	const info = dormlq('right', 'transpose', 3, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 3, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: left_notrans_rect', function t() {
	const WORK = new Float64Array( 200 );
	const tc = left_notrans_rect;
	const lq = computeLQ();
	const LDC = 6;
	const C = new Float64Array( 36 );
	// C is 5x3 matrix
	C[ 0 ] = 1.0; C[ 1 ] = 3.0; C[ 2 ] = -1.0; C[ 3 ] = 2.0; C[ 4 ] = 0.5;
	C[ 6 ] = 0.5; C[ 7 ] = 1.0; C[ 8 ] = 4.0; C[ 9 ] = -0.5; C[ 10 ] = 1.0;
	C[ 12 ] = 2.0; C[ 13 ] = 0.5; C[ 14 ] = 1.0; C[ 15 ] = 3.0; C[ 16 ] = -1.0;
	const info = dormlq('left', 'no-transpose', 5, 3, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 3, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: left_notrans_blocked', function t() {
	const NBIG = 50;
	const KBIG = 35;
	const WORK = new Float64Array( 10000 );
	const tc = left_notrans_blocked;
	const lq = loadBigLQ( NBIG );
	const C = identityN( NBIG, NBIG );
	const info = dormlq('left', 'no-transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: left_trans_blocked', function t() {
	const NBIG = 50;
	const KBIG = 35;
	const WORK = new Float64Array( 10000 );
	const tc = left_trans_blocked;
	const lq = loadBigLQ( NBIG );
	const C = identityN( NBIG, NBIG );
	const info = dormlq('left', 'transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: right_notrans_blocked', function t() {
	const NBIG = 50;
	const KBIG = 35;
	const WORK = new Float64Array( 10000 );
	const tc = right_notrans_blocked;
	const lq = loadBigLQ( NBIG );
	const C = identityN( NBIG, NBIG );
	const info = dormlq('right', 'no-transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: right_trans_blocked', function t() {
	const NBIG = 50;
	const KBIG = 35;
	const WORK = new Float64Array( 10000 );
	const tc = right_trans_blocked;
	const lq = loadBigLQ( NBIG );
	const C = identityN( NBIG, NBIG );
	const info = dormlq('right', 'transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: K=35 with WORK of exactly the reference minimum max(1,N) matches the fixture (ticket 0100)', function t() {
	const NBIG = 50;
	const KBIG = 35;
	const minWork = NBIG;
	const tc = left_notrans_blocked;
	const lq = loadBigLQ( NBIG );
	const C = identityN( NBIG, NBIG );
	const info = dormlq('left', 'no-transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, new Float64Array( minWork ), 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );

	// One element below the minimum throws, as does a missing WORK:
	assert.throws( function throws() {
		dormlq('right', 'transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, identityN( NBIG, NBIG ), 1, NBIG, 0, new Float64Array( minWork - 1 ), 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		dormlq('left', 'no-transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, identityN( NBIG, NBIG ), 1, NBIG, 0, null, 1, 0 );
	}, RangeError );
});


// WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

/**
* Applies op(Q), from the factorization of a deterministic N-by-N matrix, to a deterministic N-by-N matrix C (M = N = K) with a workspace of the given length.
*
* @private
* @param {string} side - operation side
* @param {string} trans - transpose operation
* @param {PositiveInteger} N - order of the matrices
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} the result, as interleaved components
*/
function wsApply( side, trans, N, lwork ) {
	const TAU = new Float64Array( N );
	const A = new Float64Array( N * N );
	const C = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		C[ i ] = Math.cos( ( 0.23 * i ) + 0.7 );
	}
	dgelq2( N, N, A, 1, N, 0, TAU, 1, 0, new Float64Array( N ), 1, 0 );
	const info = dormlq( side, trans, N, N, N, A, 1, N, 0, TAU, 1, 0, C, 1, N, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return C;
}

/**
* Asserts that two arrays agree to a tolerance relative to the largest magnitude of the expected array.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function wsAssertClose( actual, expected, tol, msg ) {
	let scale = 0.0;
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		scale = Math.max( scale, Math.abs( expected[ i ] ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		if ( !( Math.abs( actual[ i ] - expected[ i ] ) <= tol * scale ) ) {
			assert.fail( msg + ': index ' + i + ', expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

test( 'dormlq: M=N=K=70 with WORK of the reference minimum max(1,N) matches the optimum (unblocked fallback)', function t() {
	const N = 70;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const opt = wsApply( side, trans, N, ( N * 32 ) + 4160 );
			const lo = wsApply( side, trans, N, N );
			wsAssertClose( lo, opt, 1e-12, side + '/' + trans );
		});
	});
});

test( 'dormlq: M=N=K=150 with WORK for a shrunk block size NB=8 matches the optimum', function t() {
	const N = 150;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const opt = wsApply( side, trans, N, ( N * 32 ) + 4160 );
			const mid = wsApply( side, trans, N, ( N * 8 ) + 4160 );
			wsAssertClose( mid, opt, 1e-12, side + '/' + trans );
		});
	});
});

test( 'dormlq: throws when WORK is missing or one element below the minimum max(1,nw) (K > NB)', function t() {
	const N = 70;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		assert.throws( function throws() {
			dormlq( side, 'no-transpose', N, N, N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N - 1 ), 1, 0 );
		}, RangeError );
		assert.throws( function throws() {
			dormlq( side, 'no-transpose', N, N, N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, null, 1, 0 );
		}, RangeError );
	});
});
