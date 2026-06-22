/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorml2 from './../lib/ndarray.js';
import dgelq2 from '../../dgelq2/lib/base.js';

// FIXTURES //

import left_notrans_5x5 from './fixtures/left_notrans_5x5.json' with { type: 'json' };
import left_trans_5x5 from './fixtures/left_trans_5x5.json' with { type: 'json' };
import right_notrans_5x5 from './fixtures/right_notrans_5x5.json' with { type: 'json' };
import right_trans_5x5 from './fixtures/right_trans_5x5.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import right_trans_rect from './fixtures/right_trans_rect.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Set up the 3x5 A matrix (LDA=6 in Fortran, column-major with strideA1=1, strideA2=LDA).
*/
function setupA() {
	var A = new Float64Array( 36 ); // 6x6
	// Row 1: A(1,1..5) in Fortran => A[0], A[6], A[12], A[18], A[24] col-major with LDA=6 // eslint-disable-line max-len
	A[ 0 ] = 1.0; A[ 6 ] = 2.0; A[ 12 ] = 0.5; A[ 18 ] = 1.0; A[ 24 ] = 3.0;
	// Row 2: A(2,1..5) => A[1], A[7], A[13], A[19], A[25]
	A[ 1 ] = 0.5; A[ 7 ] = 1.0; A[ 13 ] = 3.0; A[ 19 ] = 2.0; A[ 25 ] = 1.0;
	// Row 3: A(3,1..5) => A[2], A[8], A[14], A[20], A[26]
	A[ 2 ] = 3.0; A[ 8 ] = 0.5; A[ 14 ] = 1.0; A[ 20 ] = 2.0; A[ 26 ] = 0.5;
	return A;
}

/**
* Compute the LQ factorization of the 3x5 matrix A with LDA=6.
* Returns { A, TAU }.
*/
function computeLQ() {
	var WORK = new Float64Array( 200 );
	var TAU = new Float64Array( 6 );
	var A = setupA();
	dgelq2( 3, 5, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Create a 5x5 identity matrix with LDC stride (column-major).
*/
function identity5( LDC ) {
	var C = new Float64Array( LDC * 6 );
	var i;
	for ( i = 0; i < 5; i++ ) {
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

// TESTS //

test( 'dorml2: left_notrans_5x5', function t() {
	var WORK;
	var info;
	var LDC;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = left_notrans_5x5;
	lq = computeLQ();
	LDC = 6;
	C = identity5( LDC );
	info = dorml2( 'left', 'no-transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dorml2: left_trans_5x5', function t() {
	var WORK;
	var info;
	var LDC;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = left_trans_5x5;
	lq = computeLQ();
	LDC = 6;
	C = identity5( LDC );
	info = dorml2( 'left', 'transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dorml2: right_notrans_5x5', function t() {
	var WORK;
	var info;
	var LDC;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = right_notrans_5x5;
	lq = computeLQ();
	LDC = 6;
	C = identity5( LDC );
	info = dorml2( 'right', 'no-transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dorml2: right_trans_5x5', function t() {
	var WORK;
	var info;
	var LDC;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = right_trans_5x5;
	lq = computeLQ();
	LDC = 6;
	C = identity5( LDC );
	info = dorml2( 'right', 'transpose', 5, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dorml2: m_zero', function t() {
	var WORK;
	var info;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = m_zero;
	lq = computeLQ();
	C = new Float64Array( 36 );
	info = dorml2( 'left', 'no-transpose', 0, 5, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dorml2: n_zero', function t() {
	var WORK;
	var info;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = n_zero;
	lq = computeLQ();
	C = new Float64Array( 36 );
	info = dorml2( 'left', 'no-transpose', 5, 0, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dorml2: k_zero', function t() {
	var WORK;
	var info;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = k_zero;
	lq = computeLQ();
	C = new Float64Array( 36 );
	info = dorml2( 'left', 'no-transpose', 5, 5, 0, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dorml2: right_trans_rect', function t() {
	var WORK;
	var info;
	var LDC;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = right_trans_rect;
	lq = computeLQ();
	LDC = 6;
	C = new Float64Array( 36 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 3.0;
	C[ 2 ] = -1.0;
	C[ 6 ] = 0.5;
	C[ 7 ] = 1.0;
	C[ 8 ] = 4.0;
	C[ 12 ] = 2.0;
	C[ 13 ] = 0.5;
	C[ 14 ] = 1.0;
	C[ 18 ] = 1.0;
	C[ 19 ] = 2.0;
	C[ 20 ] = 0.5;
	C[ 24 ] = 0.5;
	C[ 25 ] = 1.0;
	C[ 26 ] = 2.0;
	info = dorml2( 'right', 'transpose', 3, 5, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 3, 5, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});

test( 'dorml2: left_notrans_rect', function t() {
	var WORK;
	var info;
	var LDC;
	var tc;
	var lq;
	var C;

	WORK = new Float64Array( 200 );
	tc = left_notrans_rect;
	lq = computeLQ();
	LDC = 6;
	C = new Float64Array( 36 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 3.0;
	C[ 2 ] = -1.0;
	C[ 3 ] = 2.0;
	C[ 4 ] = 0.5;
	C[ 6 ] = 0.5;
	C[ 7 ] = 1.0;
	C[ 8 ] = 4.0;
	C[ 9 ] = -0.5;
	C[ 10 ] = 1.0;
	C[ 12 ] = 2.0;
	C[ 13 ] = 0.5;
	C[ 14 ] = 1.0;
	C[ 15 ] = 3.0;
	C[ 16 ] = -1.0;
	info = dorml2( 'left', 'no-transpose', 5, 3, 3, lq.A, 1, 6, 0, lq.TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractC( C, 5, 3, LDC, tc.c.length ), tc.c, 1e-14, 'c' );
});
