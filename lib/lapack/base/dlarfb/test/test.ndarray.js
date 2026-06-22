/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb from './../lib/ndarray.js';

// FIXTURES //

import left_notrans_fwd_col from './fixtures/left_notrans_fwd_col.json' with { type: 'json' };
import left_trans_fwd_col from './fixtures/left_trans_fwd_col.json' with { type: 'json' };
import right_notrans_fwd_col from './fixtures/right_notrans_fwd_col.json' with { type: 'json' };
import right_trans_fwd_col from './fixtures/right_trans_fwd_col.json' with { type: 'json' };
import left_notrans_bwd_col from './fixtures/left_notrans_bwd_col.json' with { type: 'json' };
import left_trans_bwd_col from './fixtures/left_trans_bwd_col.json' with { type: 'json' };
import right_notrans_bwd_col from './fixtures/right_notrans_bwd_col.json' with { type: 'json' };
import right_trans_bwd_col from './fixtures/right_trans_bwd_col.json' with { type: 'json' };
import left_notrans_fwd_row from './fixtures/left_notrans_fwd_row.json' with { type: 'json' };
import left_trans_fwd_row from './fixtures/left_trans_fwd_row.json' with { type: 'json' };
import right_notrans_fwd_row from './fixtures/right_notrans_fwd_row.json' with { type: 'json' };
import right_trans_fwd_row from './fixtures/right_trans_fwd_row.json' with { type: 'json' };
import left_notrans_bwd_row from './fixtures/left_notrans_bwd_row.json' with { type: 'json' };
import left_trans_bwd_row from './fixtures/left_trans_bwd_row.json' with { type: 'json' };
import right_notrans_bwd_row from './fixtures/right_notrans_bwd_row.json' with { type: 'json' };
import right_trans_bwd_row from './fixtures/right_trans_bwd_row.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* SetupV4x2.
*
* @private
* @param {*} V - V
*/
function setupV4x2( V ) {
	// LDA=6 in Fortran, so strideV1=1, strideV2=6
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5; V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25; V[ 2 + 1 * 6 ] = 0.5;
	V[ 3 + 0 * 6 ] = 0.125; V[ 3 + 1 * 6 ] = 0.25;
}

/**
* SetupT2x2.
*
* @private
* @param {*} T - T
*/
function setupT2x2( T ) {
	T[ 0 ] = 1.2; T[ 2 ] = -0.3;
	T[ 3 ] = 1.5;
}

/**
* SetupC4x3.
*
* @private
* @param {*} C - C
*/
function setupC4x3( C ) {
	C[ 0 + 0 * 6 ] = 1; C[ 0 + 1 * 6 ] = 2; C[ 0 + 2 * 6 ] = 3;
	C[ 1 + 0 * 6 ] = 4; C[ 1 + 1 * 6 ] = 5; C[ 1 + 2 * 6 ] = 6;
	C[ 2 + 0 * 6 ] = 7; C[ 2 + 1 * 6 ] = 8; C[ 2 + 2 * 6 ] = 9;
	C[ 3 + 0 * 6 ] = 10; C[ 3 + 1 * 6 ] = 11; C[ 3 + 2 * 6 ] = 12;
}

/**
* ExtractC.
*
* @private
* @param {*} C - C
* @param {*} M - M
* @param {*} N - N
* @param {*} lda - lda
* @returns {*} result
*/
function extractC( C, M, N, lda ) {
	var out = [];
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( C[ i + j * lda ] );
		}
	}
	return out;
}

test( 'dlarfb: left notrans fwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_notrans_fwd_col;
	V = new Float64Array( 6 * 2 );
	setupV4x2( V );
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: left trans fwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_trans_fwd_col;
	V = new Float64Array( 6 * 2 );
	setupV4x2( V );
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'transpose', 'forward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right notrans fwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_notrans_fwd_col;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25;
	V[ 2 + 1 * 6 ] = 0.5;
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right trans fwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_trans_fwd_col;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25;
	V[ 2 + 1 * 6 ] = 0.5;
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'transpose', 'forward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

// Helper for backward V: 4x2, unit triangular at bottom (rows 2,3)

/**
* SetupVBwd4x2.
*
* @private
* @param {*} V - V
*/
function setupVBwd4x2( V ) {
	// LDA=6, column-major
	V[ 0 + 0 * 6 ] = 0.5; V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 0.25; V[ 1 + 1 * 6 ] = 0.125;
	V[ 2 + 0 * 6 ] = 1.0; V[ 2 + 1 * 6 ] = 0.0;
	V[ 3 + 0 * 6 ] = 0.0; V[ 3 + 1 * 6 ] = 1.0;
}

// Helper for backward T: 2x2 lower triangular
/**
* SetupTBwd2x2.
*
* @private
* @param {*} T - T
*/
function setupTBwd2x2( T ) {
	T[ 0 ] = 1.2;
	T[ 1 ] = -0.3; T[ 3 ] = 1.5;
}

test( 'dlarfb: left notrans bwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_notrans_bwd_col;
	V = new Float64Array( 6 * 2 );
	setupVBwd4x2( V );
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'no-transpose', 'backward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: left trans bwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_trans_bwd_col;
	V = new Float64Array( 6 * 2 );
	setupVBwd4x2( V );
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'transpose', 'backward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right notrans bwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_notrans_bwd_col;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 1.0;
	V[ 1 + 1 * 6 ] = 0.0;
	V[ 2 + 0 * 6 ] = 0.0;
	V[ 2 + 1 * 6 ] = 1.0;
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'no-transpose', 'backward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right trans bwd col', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_trans_bwd_col;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 1.0;
	V[ 1 + 1 * 6 ] = 0.0;
	V[ 2 + 0 * 6 ] = 0.0;
	V[ 2 + 1 * 6 ] = 1.0;
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'transpose', 'backward', 'columnwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: M=0 quick return', function t() {
	var WORK = new Float64Array( 1 );
	var C = new Float64Array( [ 99 ] );
	var V = new Float64Array( 1 );
	var T = new Float64Array( 1 );
	dlarfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 3, 2, V, 1, 1, 0, T, 1, 1, 0, C, 1, 1, 0, WORK, 1, 1, 0 ); // eslint-disable-line max-len
	if ( C[ 0 ] !== 99 ) {
		throw new Error( 'C changed on M=0' );
	}
});

// =========================================================

// STOREV='R' tests: V stored row-wise

// =========================================================

// Helper for rowwise V: 2x4 (K=2, M=4), unit upper triangular in first K cols

/**
* SetupVRow2x4.
*
* @private
* @param {*} V - V
*/
function setupVRow2x4( V ) {
	// LDV=6 in Fortran, so strideV1=1, strideV2=6
	V[ 0 + 0 * 6 ] = 1; V[ 0 + 1 * 6 ] = 0.5; V[ 0 + 2 * 6 ] = 0.25; V[ 0 + 3 * 6 ] = 0.125; // eslint-disable-line max-len
	V[ 1 + 1 * 6 ] = 1; V[ 1 + 2 * 6 ] = 0.5; V[ 1 + 3 * 6 ] = 0.25;
}

test( 'dlarfb: left notrans fwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_notrans_fwd_row;
	V = new Float64Array( 6 * 6 );
	setupVRow2x4( V );
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'no-transpose', 'forward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: left trans fwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_trans_fwd_row;
	V = new Float64Array( 6 * 6 );
	setupVRow2x4( V );
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'transpose', 'forward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right notrans fwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_notrans_fwd_row;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 0 + 1 * 6 ] = 0.5;
	V[ 0 + 2 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 1;
	V[ 1 + 2 * 6 ] = 0.5;
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'no-transpose', 'forward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right trans fwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_trans_fwd_row;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 0 + 1 * 6 ] = 0.5;
	V[ 0 + 2 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 1;
	V[ 1 + 2 * 6 ] = 0.5;
	T = new Float64Array( 4 );
	setupT2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'transpose', 'forward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

// Backward, Rowwise helpers

// V: 2 x 4, unit lower triangular at right (columns M-K..M-1 = 2,3)

/**
* SetupVBwdRow2x4.
*
* @private
* @param {*} V - V
*/
function setupVBwdRow2x4( V ) {
	V[ 0 + 0 * 6 ] = 0.5; V[ 0 + 1 * 6 ] = 0.25; V[ 0 + 2 * 6 ] = 1.0; V[ 0 + 3 * 6 ] = 0.0; // eslint-disable-line max-len
	V[ 1 + 0 * 6 ] = 0.25; V[ 1 + 1 * 6 ] = 0.125; V[ 1 + 2 * 6 ] = 0.0; V[ 1 + 3 * 6 ] = 1.0; // eslint-disable-line max-len
}

test( 'dlarfb: left notrans bwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_notrans_bwd_row;
	V = new Float64Array( 6 * 6 );
	setupVBwdRow2x4( V );
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'no-transpose', 'backward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: left trans bwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = left_trans_bwd_row;
	V = new Float64Array( 6 * 6 );
	setupVBwdRow2x4( V );
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'left', 'transpose', 'backward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right notrans bwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_notrans_bwd_row;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 1.0;
	V[ 0 + 2 * 6 ] = 0.0;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.0;
	V[ 1 + 2 * 6 ] = 1.0;
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'no-transpose', 'backward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});

test( 'dlarfb: right trans bwd row', function t() {
	var WORK;
	var tc;
	var V;
	var T;
	var C;

	tc = right_trans_bwd_row;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 1.0;
	V[ 0 + 2 * 6 ] = 0.0;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.0;
	V[ 1 + 2 * 6 ] = 1.0;
	T = new Float64Array( 4 );
	setupTBwd2x2( T );
	C = new Float64Array( 6 * 3 );
	setupC4x3( C );
	WORK = new Float64Array( 4 * 2 );
	dlarfb( 'right', 'transpose', 'backward', 'rowwise', 4, 3, 2, V, 1, 6, 0, T, 1, 2, 0, C, 1, 6, 0, WORK, 1, 4, 0 ); // eslint-disable-line max-len
	assertArrayClose( extractC( C, 4, 3, 6 ), tc.C, 1e-14, 'C' );
});
