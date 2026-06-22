/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import dlag2 from './../lib/ndarray.js';

// FIXTURES //

import real_eigenvalues_identity_b from './fixtures/real_eigenvalues_identity_b.json' with { type: 'json' };
import complex_eigenvalues from './fixtures/complex_eigenvalues.json' with { type: 'json' };
import diagonal from './fixtures/diagonal.json' with { type: 'json' };
import upper_tri_b from './fixtures/upper_tri_b.json' with { type: 'json' };
import small_b_diagonal from './fixtures/small_b_diagonal.json' with { type: 'json' };
import s1_leq_s2 from './fixtures/s1_leq_s2.json' with { type: 'json' };
import s1_gt_s2 from './fixtures/s1_gt_s2.json' with { type: 'json' };
import large_a from './fixtures/large_a.json' with { type: 'json' };
import negative_eigenvalues from './fixtures/negative_eigenvalues.json' with { type: 'json' };
import pp_gt_abi22 from './fixtures/pp_gt_abi22.json' with { type: 'json' };
import small_a from './fixtures/small_a.json' with { type: 'json' };
import both_b_diag_small from './fixtures/both_b_diag_small.json' with { type: 'json' };
import b_offdiag from './fixtures/b_offdiag.json' with { type: 'json' };
import large_eigenvalue_scaling from './fixtures/large_eigenvalue_scaling.json' with { type: 'json' };
import complex_nontrivial_b from './fixtures/complex_nontrivial_b.json' with { type: 'json' };
import negative_b_diag from './fixtures/negative_b_diag.json' with { type: 'json' };
import b22_small from './fixtures/b22_small.json' with { type: 'json' };
import large_pp from './fixtures/large_pp.json' with { type: 'json' };
import tiny_pp_qq from './fixtures/tiny_pp_qq.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import ascale_gt1_bsize_gt1 from './fixtures/ascale_gt1_bsize_gt1.json' with { type: 'json' };
import wsize_gt1_eigenvalue1 from './fixtures/wsize_gt1_eigenvalue1.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Helper to call dlag2 with column-major 2x2 matrices.
*
* @private
* @param {Array} aVals - [a11, a21, a12, a22] column-major
* @param {Array} bVals - [b11, b21, b12, b22] column-major
* @param {number} safmin - safe minimum
* @returns {Object} result with scale1, scale2, wr1, wr2, wi
*/
function callDlag2( aVals, bVals, safmin ) {
	var A = new Float64Array( aVals );
	var B = new Float64Array( bVals );
	return dlag2( A, 1, 2, 0, B, 1, 2, 0, safmin );
}

var SAFMIN = FLOAT64_SMALLEST_NORMAL;

// TESTS //

test( 'dlag2 is a function', function t() {
	assert.equal( typeof dlag2, 'function' );
});

test( 'dlag2: real_eigenvalues_identity_B', function t() {
	var result = callDlag2([ 4.0, 2.0, 1.0, 3.0 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = real_eigenvalues_identity_b;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi should be zero for real eigenvalues' );
});

test( 'dlag2: complex_eigenvalues', function t() {
	var result = callDlag2([ 1.0, 2.0, -5.0, 1.0 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = complex_eigenvalues;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assertClose( result.wi, tc.wi, 1e-14, 'wi' );
	assert.ok( result.wi > 0.0, 'wi should be positive for complex eigenvalues' );
});

test( 'dlag2: diagonal', function t() {
	var result = callDlag2([ 5.0, 0.0, 0.0, 3.0 ], [ 2.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = diagonal;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: upper_tri_B', function t() {
	var result = callDlag2([ 3.0, 1.0, 1.0, 2.0 ], [ 2.0, 0.0, 1.0, 3.0 ], SAFMIN);
	var tc = upper_tri_b;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: small_B_diagonal', function t() {
	var result = callDlag2([ 1.0, 1.0, 1.0, 1.0 ], [ 1.0e-200, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = small_b_diagonal;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-10, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: s1_leq_s2', function t() {
	var result = callDlag2([ 0.1, 2.0, 3.0, 5.0 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = s1_leq_s2;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: s1_gt_s2', function t() {
	var result = callDlag2([ 10.0, 1.0, 1.0, 0.5 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = s1_gt_s2;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: large_A', function t() {
	var result = callDlag2([ 1.0e100, 2.0e100, 3.0e100, 4.0e100 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = large_a;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: negative_eigenvalues', function t() {
	var result = callDlag2([ -2.0, 1.0, 1.0, -3.0 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = negative_eigenvalues;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: pp_gt_abi22', function t() {
	var result = callDlag2([ 6.0, 0.1, 1.0, 2.0 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = pp_gt_abi22;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: small_A', function t() {
	var result = callDlag2([ 1.0e-200, 2.0e-200, 3.0e-200, 4.0e-200 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = small_a;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: both_B_diag_small', function t() {
	var result = callDlag2([ 1.0, 0.5, 0.5, 1.0 ], [ 1.0e-200, 0.0, 0.0, 1.0e-200 ], SAFMIN);
	var tc = both_b_diag_small;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: B_offdiag', function t() {
	var result = callDlag2([ 2.0, 0.0, 0.0, 3.0 ], [ 1.0, 0.0, 0.5, 1.0 ], SAFMIN);
	var tc = b_offdiag;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: large_eigenvalue_scaling', function t() {
	var result = callDlag2([ 1.0e150, 0.0, 0.0, 2.0e150 ], [ 1.0e-10, 0.0, 0.0, 1.0e-10 ], SAFMIN);
	var tc = large_eigenvalue_scaling;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: complex_nontrivial_B', function t() {
	var result = callDlag2([ 1.0, 3.0, -2.0, 1.0 ], [ 2.0, 0.0, 1.0, 2.0 ], SAFMIN);
	var tc = complex_nontrivial_b;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assertClose( result.wi, tc.wi, 1e-14, 'wi' );
});

test( 'dlag2: negative_B_diag', function t() {
	var result = callDlag2([ 3.0, 1.0, 1.0, 2.0 ], [ -1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = negative_b_diag;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: b22_small', function t() {
	var result = callDlag2([ 2.0, 1.0, 1.0, 3.0 ], [ 1.0, 0.0, 0.0, 1.0e-200 ], SAFMIN);
	var tc = b22_small;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-10, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: large_pp', function t() {
	var result = callDlag2([ 1.0, 0.0, 0.0, 1.0 ], [ 1.0e-155, 0.0, 0.0, 1.0e-155 ], SAFMIN);
	var tc = large_pp;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: tiny_pp_qq', function t() {
	var result = callDlag2([ 1.0e-200, 1.0e-200, 1.0e-200, 1.0e-200 ], [ 1.0, 0.0, 1.0, 1.0 ], SAFMIN);
	var tc = tiny_pp_qq;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: identity', function t() {
	var result = callDlag2([ 1.0, 0.0, 0.0, 1.0 ], [ 1.0, 0.0, 0.0, 1.0 ], SAFMIN);
	var tc = identity;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: ascale_gt1_bsize_gt1', function t() {
	var result = callDlag2([ 0.4, 0.0, 0.0, 0.3 ], [ 2.0, 0.0, 0.0, 3.0 ], SAFMIN);
	var tc = ascale_gt1_bsize_gt1;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: wsize_gt1_eigenvalue1', function t() {
	var result = callDlag2([ 1.0, 0.0, 0.0, 0.5 ], [ 1.0e-100, 0.0, 0.0, 1.0e-100 ], SAFMIN);
	var tc = wsize_gt1_eigenvalue1;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: supports non-unit strides', function t() {
	var result;
	var tc;
	var A;
	var B;

	A = new Float64Array( [ 4.0, -1.0, 2.0, -1.0, 1.0, -1.0, 3.0, -1.0 ] );
	B = new Float64Array( [ 1.0, -1.0, 0.0, -1.0, 0.0, -1.0, 1.0, -1.0 ] );
	result = dlag2( A, 2, 4, 0, B, 2, 4, 0, SAFMIN );
	tc = real_eigenvalues_identity_b;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});

test( 'dlag2: supports offsets', function t() {
	var result;
	var tc;
	var A;
	var B;

	A = new Float64Array( [ -1.0, -1.0, 4.0, 2.0, 1.0, 3.0 ] );
	B = new Float64Array( [ -1.0, -1.0, 1.0, 0.0, 0.0, 1.0 ] );
	result = dlag2( A, 1, 2, 2, B, 1, 2, 2, SAFMIN );
	tc = real_eigenvalues_identity_b;
	assertClose( result.scale1, tc.scale1, 1e-14, 'scale1' );
	assertClose( result.scale2, tc.scale2, 1e-14, 'scale2' );
	assertClose( result.wr1, tc.wr1, 1e-14, 'wr1' );
	assertClose( result.wr2, tc.wr2, 1e-14, 'wr2' );
	assert.equal( result.wi, tc.wi, 'wi' );
});
