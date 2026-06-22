

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dtprfs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };
import upper_unit_no_trans from './fixtures/upper_unit_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import lower_unit_trans from './fixtures/lower_unit_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import upper_unit_trans from './fixtures/upper_unit_trans.json' with { type: 'json' };
import lower_unit_no_trans from './fixtures/lower_unit_no_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Creates workspace arrays for dtprfs.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @returns {Object} workspace object with WORK and IWORK
*/
function createWorkspace( N ) {
	return {
		WORK: new Float64Array( 3 * N ),
		IWORK: new Int32Array( N )
	};
}

/**
* Calls dtprfs with column-major packed layout and returns FERR, BERR, info.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {string} diag - 'non-unit' or 'unit'
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AP - packed triangular matrix
* @param {Float64Array} B - right-hand side, col-major, N x nrhs
* @param {Float64Array} X - solution, col-major, N x nrhs
* @returns {Object} { info, ferr, berr }
*/
function callDtprfs( uplo, trans, diag, N, nrhs, AP, B, X ) {
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var ws = createWorkspace( N );
	var info = dtprfs(
		uplo, trans, diag, N, nrhs,
		AP, 1, 0,           // AP: packed, stride 1
		B, 1, N, 0,         // B: col-major strides
		X, 1, N, 0,         // X: col-major strides
		FERR, 1, 0,
		BERR, 1, 0,
		ws.WORK, 1, 0,
		ws.IWORK, 1, 0
	);
	return { info: info, ferr: FERR, berr: BERR };
}

// TESTS //

test( 'dtprfs: upper_no_trans', function t() {
	var tc = upper_no_trans;
	// A = [2 1 3; 0 4 5; 0 0 6] packed upper = [2, 1, 4, 3, 5, 6]
	var AP = new Float64Array([ 2, 1, 4, 3, 5, 6 ]);
	var B = new Float64Array([ 13, 23, 18 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: lower_trans', function t() {
	var tc = lower_trans;
	// L = [2 0 0; 1 4 0; 3 5 6] packed lower = [2, 1, 3, 4, 5, 6]
	var AP = new Float64Array([ 2, 1, 3, 4, 5, 6 ]);
	var B = new Float64Array([ 13, 23, 18 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'lower', 'transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: upper_unit_no_trans', function t() {
	var tc = upper_unit_no_trans;
	// A = [1 2 3; 0 1 4; 0 0 1] packed upper = [1, 2, 1, 3, 4, 1]
	var AP = new Float64Array([ 1, 2, 1, 3, 4, 1 ]);
	var B = new Float64Array([ 14, 14, 3 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'upper', 'no-transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: lower_no_trans', function t() {
	var tc = lower_no_trans;
	// L = [3 0 0; 2 5 0; 1 4 7] packed lower = [3, 2, 1, 5, 4, 7]
	var AP = new Float64Array([ 3, 2, 1, 5, 4, 7 ]);
	var B = new Float64Array([ 3, 12, 30 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'lower', 'no-transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: multi_rhs', function t() {
	var tc = multi_rhs;
	// A = [2 1 3; 0 4 5; 0 0 6] packed upper = [2, 1, 4, 3, 5, 6]
	var AP = new Float64Array([ 2, 1, 4, 3, 5, 6 ]);
	// B is 3x2 col-major: [13,23,18, 31,50,36]
	var B = new Float64Array([ 13, 23, 18, 31, 50, 36 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'upper', 'no-transpose', 'non-unit', 3, 2, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.equal( result.berr[ 1 ], tc.berr[ 1 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr[0] should be small, got ' + result.ferr[ 0 ] );
	assert.ok( result.ferr[ 1 ] < 1e-13, 'ferr[1] should be small, got ' + result.ferr[ 1 ] );
});

test( 'dtprfs: n_zero', function t() {
	var tc = n_zero;
	var AP = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var X = new Float64Array( 1 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var IWORK = new Int32Array( 1 );
	var info = dtprfs(
		'upper', 'no-transpose', 'non-unit', 0, 1,
		AP, 1, 0,
		B, 1, 1, 0,
		X, 1, 1, 0,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		IWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'dtprfs: n_one', function t() {
	var tc = n_one;
	var AP = new Float64Array([ 5.0 ]);
	var B = new Float64Array([ 15.0 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'upper', 'no-transpose', 'non-unit', 1, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: lower_unit_trans', function t() {
	var tc = lower_unit_trans;
	// L = [1 0 0; 2 1 0; 3 5 1] packed lower = [1, 2, 3, 1, 5, 1]
	var AP = new Float64Array([ 1, 2, 3, 1, 5, 1 ]);
	var B = new Float64Array([ 14, 17, 3 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'lower', 'transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: upper_trans', function t() {
	var tc = upper_trans;
	// A = [2 1 3; 0 4 5; 0 0 6] packed upper = [2, 1, 4, 3, 5, 6]
	var AP = new Float64Array([ 2, 1, 4, 3, 5, 6 ]);
	var B = new Float64Array([ 2, 9, 31 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'upper', 'transpose', 'non-unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-13, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: upper_unit_trans', function t() {
	var tc = upper_unit_trans;
	// A = [1 2 3; 0 1 4; 0 0 1] packed upper = [1, 2, 1, 3, 4, 1]
	var AP = new Float64Array([ 1, 2, 1, 3, 4, 1 ]);
	var B = new Float64Array([ 1, 4, 14 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'upper', 'transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});

test( 'dtprfs: lower_unit_no_trans', function t() {
	var tc = lower_unit_no_trans;
	// L = [1 0 0; 2 1 0; 3 5 1] packed lower = [1, 2, 3, 1, 5, 1]
	var AP = new Float64Array([ 1, 2, 3, 1, 5, 1 ]);
	var B = new Float64Array([ 1, 4, 16 ]);
	var X = new Float64Array( tc.x );
	var result = callDtprfs( 'lower', 'no-transpose', 'unit', 3, 1, AP, B, X );
	assert.equal( result.info, tc.info );
	assert.equal( result.berr[ 0 ], tc.berr[ 0 ] );
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] );
});
