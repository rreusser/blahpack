/* eslint-disable no-restricted-syntax, max-len, stdlib/require-globals, node/no-sync, stdlib/first-unit-test, function-paren-newline, function-call-argument-newline, require-jsdoc, stdlib/jsdoc-private-annotation, max-statements-per-line */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import dtbrfs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import upper_unit_no_trans from './fixtures/upper_unit_no_trans.json' with { type: 'json' };
import lower_unit_trans from './fixtures/lower_unit_trans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import lower_no_trans_kd1 from './fixtures/lower_no_trans_kd1.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };
import lower_unit_no_trans from './fixtures/lower_unit_no_trans.json' with { type: 'json' };
import upper_unit_trans from './fixtures/upper_unit_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Calls dtbrfs with column-major band layout and returns FERR, BERR, info.
*
* @private
* @param {string} uplo - triangle
* @param {string} trans - transpose
* @param {string} diag - diagonal type
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AB - band matrix
* @param {Float64Array} B - right-hand side
* @param {Float64Array} X - solution
* @returns {Object} result with info, ferr, berr
*/
function callDtbrfs( uplo, trans, diag, N, kd, nrhs, AB, B, X ) {
	var IWORK = new Int32Array( N );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Float64Array( 3 * N );
	var ldab = kd + 1;
	var info;

	info = dtbrfs( uplo, trans, diag, N, kd, nrhs, AB, 1, ldab, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	return {
		'info': info,
		'ferr': FERR,
		'berr': BERR
	};
}

// TESTS //

test( 'dtbrfs: upper_no_trans (kd=2, N=4)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = upper_no_trans;

	// A = [2 1 3 0; 0 4 5 2; 0 0 6 1; 0 0 0 3], kd=2, ldab=3, col-major
	AB = new Float64Array( [ 0, 0, 2, 0, 1, 4, 3, 5, 6, 2, 1, 3 ] );
	B = new Float64Array( [ 13, 31, 22, 12 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'upper', 'no-transpose', 'non-unit', 4, 2, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
});

test( 'dtbrfs: lower_no_trans (kd=2, N=4)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = lower_no_trans;

	// A = [3 0 0 0; 2 5 0 0; 1 4 7 0; 0 6 2 8], kd=2, ldab=3, col-major
	AB = new Float64Array( [ 3, 2, 1, 5, 4, 6, 7, 2, 0, 8, 0, 0 ] );
	B = new Float64Array( [ 3, 12, 30, 50 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'lower', 'no-transpose', 'non-unit', 4, 2, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
});

test( 'dtbrfs: upper_trans (kd=1, N=4)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = upper_trans;

	// A = [2 1 0 0; 0 4 5 0; 0 0 6 1; 0 0 0 3], kd=1, ldab=2, col-major
	AB = new Float64Array( [ 0, 2, 1, 4, 5, 6, 1, 3 ] );
	B = new Float64Array( [ 2, 9, 28, 15 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'upper', 'transpose', 'non-unit', 4, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
});

test( 'dtbrfs: upper_unit_no_trans (kd=1, N=3)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = upper_unit_no_trans;
	AB = new Float64Array( [ 0, 0, 2, 0, 4, 0 ] );
	B = new Float64Array( [ 5, 14, 3 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'upper', 'no-transpose', 'unit', 3, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12 );
});

test( 'dtbrfs: lower_unit_trans (kd=1, N=3)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = lower_unit_trans;
	AB = new Float64Array( [ 0, 2, 0, 5, 0, 0 ] );
	B = new Float64Array( [ 5, 17, 3 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'lower', 'transpose', 'unit', 3, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12 );
});

test( 'dtbrfs: multi_rhs (kd=2, N=4, nrhs=2)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = multi_rhs;
	AB = new Float64Array( [ 0, 0, 2, 0, 1, 4, 3, 5, 6, 2, 1, 3 ] );
	B = new Float64Array( [ 13, 31, 22, 12, 31, 64, 43, 21 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'upper', 'no-transpose', 'non-unit', 4, 2, 2, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.equal( result.berr[ 1 ], tc.berr[ 1 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
	assert.ok( result.ferr[ 1 ] < 1e-13 );
});

test( 'dtbrfs: n_zero', function t() {
	var IWORK;
	var BERR;
	var FERR;
	var WORK;
	var info;
	var AB;
	var tc;
	var B;
	var X;

	tc = n_zero;
	IWORK = new Int32Array( 1 );
	BERR = new Float64Array( 1 );
	FERR = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	AB = new Float64Array( 1 );
	B = new Float64Array( 1 );
	X = new Float64Array( 1 );
	info = dtbrfs( 'upper', 'no-transpose', 'non-unit', 0, 1, 1, AB, 1, 2, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'dtbrfs: n_one (kd=0)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = n_one;
	AB = new Float64Array( [ 5.0 ] );
	B = new Float64Array( [ 15.0 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'upper', 'no-transpose', 'non-unit', 1, 0, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
});

test( 'dtbrfs: lower_no_trans_kd1 (kd=1, N=3)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = lower_no_trans_kd1;
	AB = new Float64Array( [ 3, 2, 5, 4, 7, 0 ] );
	B = new Float64Array( [ 3, 12, 29 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'lower', 'no-transpose', 'non-unit', 3, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
});

test( 'dtbrfs: lower_trans (kd=1, N=3)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = lower_trans;
	AB = new Float64Array( [ 3, 2, 5, 4, 7, 0 ] );
	B = new Float64Array( [ 7, 22, 21 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'lower', 'transpose', 'non-unit', 3, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13 );
});

test( 'dtbrfs: lower_unit_no_trans (kd=1, N=3)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = lower_unit_no_trans;
	AB = new Float64Array( [ 0, 2, 0, 5, 0, 0 ] );
	B = new Float64Array( [ 1, 4, 13 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'lower', 'no-transpose', 'unit', 3, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12 );
});

test( 'dtbrfs: upper_unit_trans (kd=1, N=3)', function t() {
	var result;
	var tc;
	var AB;
	var B;
	var X;

	tc = upper_unit_trans;
	AB = new Float64Array( [ 0, 0, 2, 0, 4, 0 ] );
	B = new Float64Array( [ 1, 4, 11 ] );
	X = new Float64Array( tc.x );
	result = callDtbrfs( 'upper', 'transpose', 'unit', 3, 1, 1, AB, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12 );
});
