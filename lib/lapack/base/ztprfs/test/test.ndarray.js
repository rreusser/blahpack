// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztpmv from './../../../../blas/base/ztpmv/lib/base.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import ztprfs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_conj_trans from './fixtures/lower_conj_trans.json' with { type: 'json' };
import upper_unit_no_trans from './fixtures/upper_unit_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import lower_unit_conj_trans from './fixtures/lower_unit_conj_trans.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import upper_unit_conj_trans from './fixtures/upper_unit_conj_trans.json' with { type: 'json' };
import lower_unit_no_trans from './fixtures/lower_unit_no_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Creates workspace arrays for ztprfs.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @returns {Object} workspace object with WORK and RWORK
*/
function createWorkspace( N ) {
	return {
		WORK: new Complex128Array( 2 * N ),
		RWORK: new Float64Array( N )
	};
}

/**
* Calls ztprfs with column-major packed layout and returns FERR, BERR, info.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {string} diag - 'non-unit' or 'unit'
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AP - packed triangular matrix
* @param {Complex128Array} B - right-hand side, col-major, N x nrhs
* @param {Complex128Array} X - solution, col-major, N x nrhs
* @returns {Object} { info, ferr, berr }
*/
function callZtprfs( uplo, trans, diag, N, nrhs, AP, B, X ) {
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var ws = createWorkspace( N );
	var info = ztprfs(
		uplo, trans, diag, N, nrhs,
		AP, 1, 0,
		B, 1, N, 0,
		X, 1, N, 0,
		FERR, 1, 0,
		BERR, 1, 0,
		ws.WORK, 1, 0,
		ws.RWORK, 1, 0
	);
	return { info: info, ferr: FERR, berr: BERR };
}

// TESTS //

test( 'ztprfs: upper_no_trans', function t() {
	var result;
	var tc = upper_no_trans;
	var AP = new Complex128Array( [ 2, 1, 1, 0.5, 4, -1, 3, 2, 5, 0, 6, -0.5 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'upper', 'no-transpose', 'non-unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: lower_conj_trans', function t() {
	var result;
	var tc = lower_conj_trans;
	var AP = new Complex128Array( [ 2, 1, 1, -0.5, 3, 2, 4, 1, 5, -1, 6, 0.5 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'lower', 'conjugate-transpose', 'non-unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: upper_unit_no_trans', function t() {
	var result;
	var tc = upper_unit_no_trans;
	var AP = new Complex128Array( [ 1, 0, 2, 1, 1, 0, 3, -0.5, 4, 1, 1, 0 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'upper', 'no-transpose', 'unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'upper', 'no-transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-11, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: lower_no_trans', function t() {
	var result;
	var tc = lower_no_trans;
	var AP = new Complex128Array( [ 3, 1, 2, -0.5, 1, 2, 5, 0, 4, -1, 7, 0.5 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'lower', 'no-transpose', 'non-unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'lower', 'no-transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: multi_rhs', function t() {
	var result;
	var tc = multi_rhs;
	var AP = new Complex128Array( [ 2, 1, 1, 0.5, 4, -1, 3, 2, 5, 0, 6, -0.5 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'upper', 'no-transpose', 'non-unit', 3, AP, 1, 0, B, 1, 0 );
	zcopy( 3, X, 1, 3, B, 1, 3 );
	ztpmv( 'upper', 'no-transpose', 'non-unit', 3, AP, 1, 0, B, 1, 3 );
	result = callZtprfs( 'upper', 'no-transpose', 'non-unit', 3, 2, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr[0] should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.berr[ 1 ] < 1e-13, 'berr[1] should be small, got ' + result.berr[ 1 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr[0] should be small, got ' + result.ferr[ 0 ] );
	assert.ok( result.ferr[ 1 ] < 1e-12, 'ferr[1] should be small, got ' + result.ferr[ 1 ] );
});

test( 'ztprfs: n_zero', function t() {
	var tc = n_zero;
	var AP = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var X = new Complex128Array( 1 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var info = ztprfs(
		'upper', 'no-transpose', 'non-unit', 0, 1,
		AP, 1, 0,
		B, 1, 1, 0,
		X, 1, 1, 0,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'ztprfs: n_one', function t() {
	var result;
	var tc = n_one;
	var AP = new Complex128Array( [ 5, 2 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 1, X, 1, 0, B, 1, 0 );
	ztpmv( 'upper', 'no-transpose', 'non-unit', 1, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'upper', 'no-transpose', 'non-unit', 1, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: lower_unit_conj_trans', function t() {
	var result;
	var tc = lower_unit_conj_trans;
	var AP = new Complex128Array( [ 1, 0, 2, 1, 3, -0.5, 1, 0, 5, 0.5, 1, 0 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'lower', 'conjugate-transpose', 'unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'lower', 'conjugate-transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-11, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: upper_conj_trans', function t() {
	var result;
	var tc = upper_conj_trans;
	var AP = new Complex128Array( [ 2, 1, 1, 0.5, 4, -1, 3, 2, 5, 0, 6, -0.5 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'upper', 'conjugate-transpose', 'non-unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: upper_unit_conj_trans', function t() {
	var result;
	var tc = upper_unit_conj_trans;
	var AP = new Complex128Array( [ 1, 0, 2, 1, 1, 0, 3, -0.5, 4, 1, 1, 0 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'upper', 'conjugate-transpose', 'unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'upper', 'conjugate-transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-11, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'ztprfs: lower_unit_no_trans', function t() {
	var result;
	var tc = lower_unit_no_trans;
	var AP = new Complex128Array( [ 1, 0, 2, 1, 3, -0.5, 1, 0, 5, 0.5, 1, 0 ] );
	var X = new Complex128Array( tc.x );
	var B = new Complex128Array( tc.x.length );
	zcopy( 3, X, 1, 0, B, 1, 0 );
	ztpmv( 'lower', 'no-transpose', 'unit', 3, AP, 1, 0, B, 1, 0 );
	result = callZtprfs( 'lower', 'no-transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be small, got ' + result.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-11, 'ferr should be small, got ' + result.ferr[ 0 ] );
});
