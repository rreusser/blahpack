
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztrrfs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_conj_trans from './fixtures/lower_conj_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import lower_unit_conj_trans from './fixtures/lower_unit_conj_trans.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import upper_unit_conj_trans from './fixtures/upper_unit_conj_trans.json' with { type: 'json' };
import lower_unit_no_trans from './fixtures/lower_unit_no_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Creates workspace arrays for ztrrfs.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @returns {Object} workspace object with WORK and RWORK
*/
function createWorkspace( N ) {
	return {
		'WORK': new Complex128Array( 2 * N ),
		'RWORK': new Float64Array( N )
	};
}

/**
* Calls ztrrfs with column-major layout and returns FERR, BERR, info.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {string} diag - 'non-unit' or 'unit'
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - triangular matrix, col-major, N x N
* @param {Complex128Array} B - right-hand side, col-major, N x nrhs
* @param {Complex128Array} X - solution, col-major, N x nrhs
* @returns {Object} result object
*/
function callZtrrfs( uplo, trans, diag, N, nrhs, A, B, X ) {
	var result;
	var FERR;
	var BERR;
	var info;
	var ws;

	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	ws = createWorkspace( N );
	info = ztrrfs( uplo, trans, diag, N, nrhs, A, 1, N, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, ws.WORK, 1, 0, ws.RWORK, 1, 0 ); // eslint-disable-line max-len
	result = {
		'info': info,
		'ferr': FERR,
		'berr': BERR
	};
	return result;
}

// TESTS //

test( 'ztrrfs: upper_no_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = upper_no_trans;
	A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
	B = new Complex128Array( [ 6, 4, 9, 3, 6, 1 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: lower_conj_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = lower_conj_trans;
	A = new Complex128Array( [ 2, 1, 1, 2, 3, 1, 0, 0, 4, 1, 5, 2, 0, 0, 0, 0, 6, 1 ] );
	B = new Complex128Array( [ 7, -7, 11, -9, 5, -7 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: upper_unit_diag', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = upper_unit_diag;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0, 3, 2, 4, 1, 1, 0 ] );
	B = new Complex128Array( [ 14, 8, 14, 3, 3, 0 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'upper', 'no-transpose', 'unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: lower_no_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = lower_no_trans;
	A = new Complex128Array( [ 3, 1, 2, 1, 1, 1, 0, 0, 5, 2, 4, 1, 0, 0, 0, 0, 7, 1 ] );
	B = new Complex128Array( [ 3, 1, 7, 3, 12, 3 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'lower', 'no-transpose', 'non-unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: multi_rhs', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = multi_rhs;
	A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
	B = new Complex128Array( [ 6, 4, 9, 3, 6, 1, 7, 5, 15, -1, 7, -5 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'upper', 'no-transpose', 'non-unit', 3, 2, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.equal( result.berr[ 1 ], tc.berr[ 1 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr[0] should be small, got ' + result.ferr[ 0 ] );
	assert.ok( result.ferr[ 1 ] < 1e-13, 'ferr[1] should be small, got ' + result.ferr[ 1 ] );
});

test( 'ztrrfs: n_zero', function t() {
	var RWORK;
	var FERR;
	var BERR;
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var X;

	tc = n_zero;
	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	X = new Complex128Array( 1 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	info = ztrrfs( 'upper', 'no-transpose', 'non-unit', 0, 1, A, 1, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'ztrrfs: nrhs_zero', function t() {
	var RWORK;
	var FERR;
	var BERR;
	var WORK;
	var info;
	var tc;
	var A;
	var B;
	var X;

	tc = nrhs_zero;
	A = new Complex128Array( 9 );
	B = new Complex128Array( 9 );
	X = new Complex128Array( 9 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	info = ztrrfs( 'upper', 'no-transpose', 'non-unit', 3, 0, A, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'ztrrfs: lower_unit_conj_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = lower_unit_conj_trans;
	A = new Complex128Array( [ 1, 0, 2, 1, 3, 2, 0, 0, 1, 0, 5, 1, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 6, -3, 6, -1, 1, 0 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'lower', 'conjugate-transpose', 'unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: upper_conj_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = upper_conj_trans;
	A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
	B = new Complex128Array( [ 2, -1, 5, -3, 14, -4 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: upper_unit_conj_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = upper_unit_conj_trans;
	A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0, 3, 2, 4, 1, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 3, -1, 8, -3 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'upper', 'conjugate-transpose', 'unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztrrfs: lower_unit_no_trans', function t() {
	var result;
	var tc;
	var A;
	var B;
	var X;

	tc = lower_unit_no_trans;
	A = new Complex128Array( [ 1, 0, 2, 1, 3, 2, 0, 0, 1, 0, 5, 1, 0, 0, 0, 0, 1, 0 ] );
	B = new Complex128Array( [ 1, 0, 3, 1, 9, 3 ] );
	X = new Complex128Array( tc.x );
	result = callZtrrfs( 'lower', 'no-transpose', 'unit', 3, 1, A, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});
