// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormlq from './../lib/ndarray.js';
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
* Set up the 3x5 A matrix (LDA=6 in Fortran, column-major with strideA1=1, strideA2=6).
*/
function setupA() {
	var A = new Float64Array( 36 ); // 6x6
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
	var A = setupA();
	var TAU = new Float64Array( 6 );
	var WORK = new Float64Array( 200 );
	dgelqf(3, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU };
}

/**
* Create an NxN identity matrix with LDC stride (column-major).
*/
function identityN( N, LDC ) {
	var C = new Float64Array( LDC * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i + i * LDC ] = 1.0;
	}
	return C;
}

/**
* Extract C values in the fixture layout (column-major, LDC stride).
*/
function extractC( C, M, N, LDC, fixtureLen ) {
	var result = [];
	var j;
	var i;
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
	var tc = lq_factored;
	var A = new Float64Array( tc.a );
	var TAU = new Float64Array( tc.tau );
	return { A: A, TAU: TAU };
}

// TESTS //

test( 'dormlq: left_notrans_5x5', function t() {
	var WORK = new Float64Array( 200 );
	var tc = left_notrans_5x5;
	var lq = computeLQ();
	var LDC = 6;
	var C = identityN( 5, LDC );
	var info = dormlq('left', 'no-transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: left_trans_5x5', function t() {
	var WORK = new Float64Array( 200 );
	var tc = left_trans_5x5;
	var lq = computeLQ();
	var LDC = 6;
	var C = identityN( 5, LDC );
	var info = dormlq('left', 'transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: right_notrans_5x5', function t() {
	var WORK = new Float64Array( 200 );
	var tc = right_notrans_5x5;
	var lq = computeLQ();
	var LDC = 6;
	var C = identityN( 5, LDC );
	var info = dormlq('right', 'no-transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: right_trans_5x5', function t() {
	var WORK = new Float64Array( 200 );
	var tc = right_trans_5x5;
	var lq = computeLQ();
	var LDC = 6;
	var C = identityN( 5, LDC );
	var info = dormlq('right', 'transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: m_zero', function t() {
	var WORK = new Float64Array( 200 );
	var tc = m_zero;
	var lq = computeLQ();
	var C = new Float64Array( 36 );
	var info = dormlq('left', 'no-transpose', 0, 5, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dormlq: n_zero', function t() {
	var WORK = new Float64Array( 200 );
	var tc = n_zero;
	var lq = computeLQ();
	var C = new Float64Array( 36 );
	var info = dormlq('left', 'no-transpose', 5, 0, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dormlq: k_zero', function t() {
	var WORK = new Float64Array( 200 );
	var tc = k_zero;
	var lq = computeLQ();
	var C = new Float64Array( 36 );
	var info = dormlq('left', 'no-transpose', 5, 5, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dormlq: right_trans_rect', function t() {
	var WORK = new Float64Array( 200 );
	var tc = right_trans_rect;
	var lq = computeLQ();
	var LDC = 6;
	var C = new Float64Array( 36 );
	// C is 3x5 matrix
	C[ 0 ] = 1.0; C[ 1 ] = 3.0; C[ 2 ] = -1.0;
	C[ 6 ] = 0.5; C[ 7 ] = 1.0; C[ 8 ] = 4.0;
	C[ 12 ] = 2.0; C[ 13 ] = 0.5; C[ 14 ] = 1.0;
	C[ 18 ] = 1.0; C[ 19 ] = 2.0; C[ 20 ] = 0.5;
	C[ 24 ] = 0.5; C[ 25 ] = 1.0; C[ 26 ] = 2.0;
	var info = dormlq('right', 'transpose', 3, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 3, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: left_notrans_rect', function t() {
	var WORK = new Float64Array( 200 );
	var tc = left_notrans_rect;
	var lq = computeLQ();
	var LDC = 6;
	var C = new Float64Array( 36 );
	// C is 5x3 matrix
	C[ 0 ] = 1.0; C[ 1 ] = 3.0; C[ 2 ] = -1.0; C[ 3 ] = 2.0; C[ 4 ] = 0.5;
	C[ 6 ] = 0.5; C[ 7 ] = 1.0; C[ 8 ] = 4.0; C[ 9 ] = -0.5; C[ 10 ] = 1.0;
	C[ 12 ] = 2.0; C[ 13 ] = 0.5; C[ 14 ] = 1.0; C[ 15 ] = 3.0; C[ 16 ] = -1.0;
	var info = dormlq('left', 'no-transpose', 5, 3, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 3, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dormlq: left_notrans_blocked', function t() {
	var NBIG = 50;
	var KBIG = 35;
	var WORK = new Float64Array( 10000 );
	var tc = left_notrans_blocked;
	var lq = loadBigLQ( NBIG );
	var C = identityN( NBIG, NBIG );
	var info = dormlq('left', 'no-transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: left_trans_blocked', function t() {
	var NBIG = 50;
	var KBIG = 35;
	var WORK = new Float64Array( 10000 );
	var tc = left_trans_blocked;
	var lq = loadBigLQ( NBIG );
	var C = identityN( NBIG, NBIG );
	var info = dormlq('left', 'transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: right_notrans_blocked', function t() {
	var NBIG = 50;
	var KBIG = 35;
	var WORK = new Float64Array( 10000 );
	var tc = right_notrans_blocked;
	var lq = loadBigLQ( NBIG );
	var C = identityN( NBIG, NBIG );
	var info = dormlq('right', 'no-transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'dormlq: right_trans_blocked', function t() {
	var NBIG = 50;
	var KBIG = 35;
	var WORK = new Float64Array( 10000 );
	var tc = right_trans_blocked;
	var lq = loadBigLQ( NBIG );
	var C = identityN( NBIG, NBIG );
	var info = dormlq('right', 'transpose', NBIG, NBIG, KBIG, lq.A, 1, NBIG, 0, lq.TAU, 1, 0, C, 1, NBIG, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, NBIG, NBIG, NBIG, tc.c.length ), tc.c, 1e-12, 'c' );
});
