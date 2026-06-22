/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm2r from './../lib/ndarray.js';

// FIXTURES //

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
import k_one from './fixtures/k_one.json' with { type: 'json' };

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
* Returns the QR-factored A (4x4 column-major, from dgeqr2 of 4x3 input).
* and the TAU vector. These are used as inputs to dorm2r.
*
* Original A (4x3):
*   [1 5  9 ]
*   [2 6  10]
*   [3 7  11]
*   [4 8  12]
*
* After dgeqr2(4, 3, A, 4, TAU, WORK, info), A is overwritten with
* the R factor and Householder vectors.
*/
function getQRFactors() {
	// Column-major storage (4x4, only first 3 columns used)
	var TAU = new Float64Array([
		1.18257418583505536e+000,
		1.15613523018304587e+000,
		1.43559863658771314e+000
	]);
	var A = new Float64Array([
		-5.47722557505166119e+000,
		3.08774177589769716e-001,
		4.63161266384654602e-001,
		6.17548355179539432e-001,
		-1.27801930084538746e+001,
		-3.26598632371090325e+000,
		-3.27098059594077228e-001,
		-7.89245398984191215e-001,
		-2.00831604418560907e+001,
		-6.53197264742180650e+000,
		3.48019857498711898e-015,
		6.27014390693441448e-001,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	return {
		'A': A,
		'TAU': TAU
	};
}

// TESTS //

test( 'dorm2r: left_notrans (Q*I = Q)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_notrans;
	qr = getQRFactors();
	C = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'left', 'no-transpose', 4, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: left_trans (Q^T*I = Q^T)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_trans;
	qr = getQRFactors();
	C = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'left', 'transpose', 4, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: right_notrans (I*Q = Q)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_notrans;
	qr = getQRFactors();
	C = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'right', 'no-transpose', 4, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: right_trans (I*Q^T = Q^T)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_trans;
	qr = getQRFactors();
	C = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'right', 'transpose', 4, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: m_zero (quick return)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = m_zero;
	qr = getQRFactors();
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorm2r( 'left', 'no-transpose', 0, 4, 0, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
});

test( 'dorm2r: n_zero (quick return)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = n_zero;
	qr = getQRFactors();
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dorm2r( 'left', 'no-transpose', 4, 0, 0, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
});

test( 'dorm2r: k_zero (quick return)', function t() {
	var expected;
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = k_zero;
	qr = getQRFactors();
	C = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'left', 'no-transpose', 4, 4, 0, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	expected = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	assertArrayClose( C, expected, 1e-14, 'c' );
});

test( 'dorm2r: left_notrans_rect (Q * non-identity 4x2)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_notrans_rect;
	qr = getQRFactors();
	C = new Float64Array([
		1.0,
		3.0,
		-1.0,
		2.0,
		2.0,
		0.0,
		4.0,
		-1.0
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'left', 'no-transpose', 4, 2, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: left_trans_rect (Q^T * non-identity 4x2)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = left_trans_rect;
	qr = getQRFactors();
	C = new Float64Array([
		1.0,
		3.0,
		-1.0,
		2.0,
		2.0,
		0.0,
		4.0,
		-1.0
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'left', 'transpose', 4, 2, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: right_notrans_rect (2x4 * Q)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_notrans_rect;
	qr = getQRFactors();
	C = new Float64Array([
		1.0,
		0.0,
		2.0,
		1.0,
		-1.0,
		3.0,
		4.0,
		-2.0
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'right', 'no-transpose', 2, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: right_trans_rect (2x4 * Q^T)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = right_trans_rect;
	qr = getQRFactors();
	C = new Float64Array([
		1.0,
		0.0,
		2.0,
		1.0,
		-1.0,
		3.0,
		4.0,
		-2.0
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'right', 'transpose', 2, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: k_one (single reflector, left, notrans)', function t() {
	var WORK;
	var info;
	var tc;
	var qr;
	var C;

	tc = k_one;
	qr = getQRFactors();
	C = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	WORK = new Float64Array( 100 );
	info = dorm2r( 'left', 'no-transpose', 4, 4, 1, qr.A, 1, 4, 0, qr.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0);
	assert.equal( info, tc.info );
	assertArrayClose( C, tc.c, 1e-14, 'c' );
});

test( 'dorm2r: Q * Q^T = I (orthogonality check)', function t() {
	var WORK;
	var qr2;
	var qr;
	var I4;
	var i;
	var Q;

	qr = getQRFactors();
	WORK = new Float64Array( 100 );
	Q = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	dorm2r( 'left', 'no-transpose', 4, 4, 3, qr.A, 1, 4, 0, qr.TAU, 1, 0, Q, 1, 4, 0, WORK, 1, 0);
	qr2 = getQRFactors();
	dorm2r( 'left', 'transpose', 4, 4, 3, qr2.A, 1, 4, 0, qr2.TAU, 1, 0, Q, 1, 4, 0, WORK, 1, 0);
	I4 = new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
	assertArrayClose( Q, I4, 1e-14, 'Q*Q^T=I' );
});
