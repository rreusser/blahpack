/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormqr from './../lib/ndarray.js';

// FIXTURES //

import qr_factors_small from './fixtures/qr_factors_small.json' with { type: 'json' };
import qr_factors_large from './fixtures/qr_factors_large.json' with { type: 'json' };
import left_notrans from './fixtures/left_notrans.json' with { type: 'json' };
import left_trans from './fixtures/left_trans.json' with { type: 'json' };
import right_notrans from './fixtures/right_notrans.json' with { type: 'json' };
import right_trans from './fixtures/right_trans.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import left_trans_rect from './fixtures/left_trans_rect.json' with { type: 'json' };
import right_notrans_rect from './fixtures/right_notrans_rect.json' with { type: 'json' };
import right_trans_rect from './fixtures/right_trans_rect.json' with { type: 'json' };
import left_notrans_blocked from './fixtures/left_notrans_blocked.json' with { type: 'json' };
import left_trans_blocked from './fixtures/left_trans_blocked.json' with { type: 'json' };
import right_notrans_blocked from './fixtures/right_notrans_blocked.json' with { type: 'json' };
import right_trans_blocked from './fixtures/right_trans_blocked.json' with { type: 'json' };

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
* Return the QR factors (A and TAU) for the 4x3 test matrix from the fixture.
* These were produced by Fortran's dgeqrf with LDA=6.
*/
function qr4x3() {
	var tc = qr_factors_small;
	return {
		'A': new Float64Array( tc.a ),
		'TAU': new Float64Array( tc.tau )
	};
}

/**
* Return the QR factors for the 40x35 test matrix from the fixture.
* These were produced by Fortran's dgeqrf with LDA=40.
*/
function qr40x35() {
	var tc = qr_factors_large;
	return {
		'A': new Float64Array( tc.a ),
		'TAU': new Float64Array( tc.tau )
	};
}

/**
* Create an identity matrix in column-major layout.
*/
function eye( n, lda ) {
	var C = new Float64Array( lda * n );
	var i;
	for ( i = 0; i < n; i++ ) {
		C[ i * lda + i ] = 1.0;
	}
	return C;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dormqr: left_notrans (Q*I)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_notrans;
	qr = qr4x3();
	C = eye( 4, 6 );
	WORK = new Float64Array( 1000 );
	info = dormqr('left', 'no-transpose', 4, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dormqr: left_trans (Q^T*I)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_trans;
	qr = qr4x3();
	C = eye( 4, 6 );
	WORK = new Float64Array( 1000 );
	info = dormqr('left', 'transpose', 4, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dormqr: right_notrans (I*Q)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_notrans;
	qr = qr4x3();
	C = eye( 4, 6 );
	WORK = new Float64Array( 1000 );
	info = dormqr('right', 'no-transpose', 4, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dormqr: right_trans (I*Q^T)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_trans;
	qr = qr4x3();
	C = eye( 4, 6 );
	WORK = new Float64Array( 1000 );
	info = dormqr('right', 'transpose', 4, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dormqr: m_zero (quick return)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = m_zero;
	qr = qr4x3();
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dormqr('left', 'no-transpose', 0, 4, 0, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dormqr: n_zero (quick return)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = n_zero;
	qr = qr4x3();
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dormqr('left', 'no-transpose', 4, 0, 0, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dormqr: k_zero (quick return)', function t() {
	var Cexpected;
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = k_zero;
	qr = qr4x3();
	C = eye( 4, 6 );
	Cexpected = eye( 4, 6 );
	WORK = new Float64Array( 1 );
	info = dormqr('left', 'no-transpose', 4, 4, 0, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), toArray( Cexpected ), 1e-14, 'c unchanged' );
});

test( 'dormqr: left_notrans_rect (Q * non-identity 4x2)', function t() {
	var result;
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_notrans_rect;
	qr = qr4x3();
	C = new Float64Array( 6 * 6 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 3.0;
	C[ 2 ] = -1.0;
	C[ 3 ] = 2.0;
	C[ 6 ] = 2.0;
	C[ 7 ] = 0.0;
	C[ 8 ] = 4.0;
	C[ 9 ] = -1.0;
	WORK = new Float64Array( 1000 );
	info = dormqr('left', 'no-transpose', 4, 2, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	result = toArray( C ).slice( 0, 12 );
	assertArrayClose( result, tc.c, 1e-14, 'c' );
});

test( 'dormqr: left_trans_rect (Q^T * non-identity 4x2)', function t() {
	var result;
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_trans_rect;
	qr = qr4x3();
	C = new Float64Array( 6 * 6 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 3.0;
	C[ 2 ] = -1.0;
	C[ 3 ] = 2.0;
	C[ 6 ] = 2.0;
	C[ 7 ] = 0.0;
	C[ 8 ] = 4.0;
	C[ 9 ] = -1.0;
	WORK = new Float64Array( 1000 );
	info = dormqr('left', 'transpose', 4, 2, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	result = toArray( C ).slice( 0, 12 );
	assertArrayClose( result, tc.c, 1e-14, 'c' );
});

test( 'dormqr: right_notrans_rect (3x4 * Q)', function t() {
	var result;
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_notrans_rect;
	qr = qr4x3();
	C = new Float64Array( 3 * 6 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 0.0;
	C[ 2 ] = 2.0;
	C[ 3 ] = 2.0;
	C[ 4 ] = 1.0;
	C[ 5 ] = -1.0;
	C[ 6 ] = -1.0;
	C[ 7 ] = 3.0;
	C[ 8 ] = 0.0;
	C[ 9 ] = 4.0;
	C[ 10 ] = -2.0;
	C[ 11 ] = 1.0;
	WORK = new Float64Array( 1000 );
	info = dormqr('right', 'no-transpose', 3, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	result = toArray( C ).slice( 0, 12 );
	assertArrayClose( result, tc.c, 1e-14, 'c' );
});

test( 'dormqr: right_trans_rect (3x4 * Q^T)', function t() {
	var result;
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_trans_rect;
	qr = qr4x3();
	C = new Float64Array( 3 * 6 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 0.0;
	C[ 2 ] = 2.0;
	C[ 3 ] = 2.0;
	C[ 4 ] = 1.0;
	C[ 5 ] = -1.0;
	C[ 6 ] = -1.0;
	C[ 7 ] = 3.0;
	C[ 8 ] = 0.0;
	C[ 9 ] = 4.0;
	C[ 10 ] = -2.0;
	C[ 11 ] = 1.0;
	WORK = new Float64Array( 1000 );
	info = dormqr('right', 'transpose', 3, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	result = toArray( C ).slice( 0, 12 );
	assertArrayClose( result, tc.c, 1e-14, 'c' );
});

test( 'dormqr: left_notrans_blocked (40x40, K=35)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_notrans_blocked;
	qr = qr40x35();
	C = eye( 40, 40 );
	WORK = new Float64Array( 10000 );
	info = dormqr('left', 'no-transpose', 40, 40, 35, qr.A, 1, 40, 0, qr.TAU, 1, 0, C, 1, 40, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-12, 'c' );
});

test( 'dormqr: left_trans_blocked (40x40, K=35)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_trans_blocked;
	qr = qr40x35();
	C = eye( 40, 40 );
	WORK = new Float64Array( 10000 );
	info = dormqr('left', 'transpose', 40, 40, 35, qr.A, 1, 40, 0, qr.TAU, 1, 0, C, 1, 40, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-12, 'c' );
});

test( 'dormqr: right_notrans_blocked (40x40, K=35)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_notrans_blocked;
	qr = qr40x35();
	C = eye( 40, 40 );
	WORK = new Float64Array( 10000 );
	info = dormqr('right', 'no-transpose', 40, 40, 35, qr.A, 1, 40, 0, qr.TAU, 1, 0, C, 1, 40, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-12, 'c' );
});

test( 'dormqr: right_trans_blocked (40x40, K=35)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_trans_blocked;
	qr = qr40x35();
	C = eye( 40, 40 );
	WORK = new Float64Array( 10000 );
	info = dormqr('right', 'transpose', 40, 40, 35, qr.A, 1, 40, 0, qr.TAU, 1, 0, C, 1, 40, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-12, 'c' );
});

test( 'dormqr: Q * Q^T = I (orthogonality check, unblocked)', function t() {
	var WORK;
	var qr2;
	var qr;
	var I4;
	var Q;

	qr = qr4x3();
	WORK = new Float64Array( 1000 );
	Q = eye( 4, 4 );
	dormqr('left', 'no-transpose', 4, 4, 3, qr.A, 1, 6, 0, qr.TAU, 1, 0, Q, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	qr2 = qr4x3();
	dormqr('left', 'transpose', 4, 4, 3, qr2.A, 1, 6, 0, qr2.TAU, 1, 0, Q, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	I4 = eye( 4, 4 );
	assertArrayClose( toArray( Q ), toArray( I4 ), 1e-14, 'Q*Q^T=I' );
});

test( 'dormqr: Q * Q^T = I (orthogonality check, blocked)', function t() {
	var WORK;
	var qr2;
	var I40;
	var qr;
	var Q;

	qr = qr40x35();
	WORK = new Float64Array( 10000 );
	Q = eye( 40, 40 );
	dormqr('left', 'no-transpose', 40, 40, 35, qr.A, 1, 40, 0, qr.TAU, 1, 0, Q, 1, 40, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	qr2 = qr40x35();
	dormqr('left', 'transpose', 40, 40, 35, qr2.A, 1, 40, 0, qr2.TAU, 1, 0, Q, 1, 40, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	I40 = eye( 40, 40 );
	assertArrayClose( toArray( Q ), toArray( I40 ), 1e-12, 'Q*Q^T=I blocked' );
});
