/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq4 from './../lib/index.js';

// FIXTURES //

import dmin_negative from './fixtures/dmin_negative.json' with { type: 'json' };
import dmin_zero from './fixtures/dmin_zero.json' with { type: 'json' };
import case2_ttype_neg2 from './fixtures/case2_ttype_neg2.json' with { type: 'json' };
import case3_ttype_neg3 from './fixtures/case3_ttype_neg3.json' with { type: 'json' };
import case4_dmin_eq_dn from './fixtures/case4_dmin_eq_dn.json' with { type: 'json' };
import case4_dmin_eq_dn1 from './fixtures/case4_dmin_eq_dn1.json' with { type: 'json' };
import case5_dmin_eq_dn2 from './fixtures/case5_dmin_eq_dn2.json' with { type: 'json' };
import case6_no_info from './fixtures/case6_no_info.json' with { type: 'json' };
import case6_ttype_neg6 from './fixtures/case6_ttype_neg6.json' with { type: 'json' };
import case6_ttype_neg18 from './fixtures/case6_ttype_neg18.json' with { type: 'json' };
import case7_one_deflated from './fixtures/case7_one_deflated.json' with { type: 'json' };
import case9_dmin1_ne_dn1 from './fixtures/case9_dmin1_ne_dn1.json' with { type: 'json' };
import case9_dmin1_eq_dn1 from './fixtures/case9_dmin1_eq_dn1.json' with { type: 'json' };
import case10_two_deflated from './fixtures/case10_two_deflated.json' with { type: 'json' };
import case11_two_deflated_fallback from './fixtures/case11_two_deflated_fallback.json' with { type: 'json' };
import case12_many_deflated from './fixtures/case12_many_deflated.json' with { type: 'json' };
import pp1_case2 from './fixtures/pp1_case2.json' with { type: 'json' };
import case4_early_return from './fixtures/case4_early_return.json' with { type: 'json' };
import case5_early_return from './fixtures/case5_early_return.json' with { type: 'json' };
import case3_dn_gt_b1 from './fixtures/case3_dn_gt_b1.json' with { type: 'json' };
import case7_b2_zero from './fixtures/case7_b2_zero.json' with { type: 'json' };
import case8_gap2_negative from './fixtures/case8_gap2_negative.json' with { type: 'json' };
import case10_b2_zero from './fixtures/case10_b2_zero.json' with { type: 'json' };
import case2_gap2_neg from './fixtures/case2_gap2_neg.json' with { type: 'json' };
import case5_short_array from './fixtures/case5_short_array.json' with { type: 'json' };
import true_case2 from './fixtures/true_case2.json' with { type: 'json' };
import case3_a2_gt_b1b2 from './fixtures/case3_a2_gt_b1b2.json' with { type: 'json' };
import case4_dn1_branch from './fixtures/case4_dn1_branch.json' with { type: 'json' };
import case4_rayleigh from './fixtures/case4_rayleigh.json' with { type: 'json' };
import case7_gap2_positive from './fixtures/case7_gap2_positive.json' with { type: 'json' };
import case10_gap2_positive from './fixtures/case10_gap2_positive.json' with { type: 'json' };
import case5_rayleigh from './fixtures/case5_rayleigh.json' with { type: 'json' };
import case4_loop_return from './fixtures/case4_loop_return.json' with { type: 'json' };
import case5_loop_return from './fixtures/case5_loop_return.json' with { type: 'json' };
import case10_loop_return from './fixtures/case10_loop_return.json' with { type: 'json' };
import case10_gap2_neg from './fixtures/case10_gap2_neg.json' with { type: 'json' };

// FUNCTIONS //

/**
* Creates a Float64Array of given length filled with a value.
*/
function filled( len, val ) {
	var z = new Float64Array( len );
	var i;
	for ( i = 0; i < len; i++ ) {
		z[ i ] = val;
	}
	return z;
}

/**
* Checks result against fixture values.
*/
function checkResult( result, tc, tol ) {
	var relErr;

	// Check ttype (integer, exact)
	assert.strictEqual( result.ttype, tc.ttype, 'ttype mismatch: expected ' + tc.ttype + ', got ' + result.ttype ); // eslint-disable-line max-len

	// Check tau
	if ( tc.tau === 0.0 ) {
		assert.ok( Math.abs( result.tau ) <= tol, 'tau: expected ~0, got ' + result.tau ); // eslint-disable-line max-len
	} else {
		relErr = Math.abs( result.tau - tc.tau ) / Math.abs( tc.tau );
		assert.ok( relErr <= tol, 'tau: expected ' + tc.tau + ', got ' + result.tau + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
	}
	// Check g
	if ( tc.g === 0.0 ) {
		assert.ok( Math.abs( result.g ) <= tol, 'g: expected ~0, got ' + result.g );
	} else {
		relErr = Math.abs( result.g - tc.g ) / Math.abs( tc.g );
		assert.ok( relErr <= tol, 'g: expected ' + tc.g + ', got ' + result.g + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dlasq4: main export is a function', function t() {
	assert.strictEqual( typeof dlasq4, 'function' );
});

test( 'dlasq4: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlasq4.ndarray, 'function' );
});

test( 'dlasq4: dmin_negative (ttype=-1)', function t() {
	var result;
	var tc;
	var z;

	tc = dmin_negative;
	z = filled( 100, 1.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, -0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: dmin_zero (ttype=-1)', function t() {
	var result;
	var tc;
	var z;

	tc = dmin_zero;
	z = filled( 100, 1.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case2_ttype_neg2 — Cases 2/3 with gap analysis', function t() {
	var result;
	var tc;
	var z;

	tc = case2_ttype_neg2;
	z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 1.0;
	z[ 10 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 0.5, 3.0, 0.5, 2.0, 3.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case3_ttype_neg3 — Case 3, gap1 <= 0', function t() {
	var result;
	var tc;
	var z;

	tc = case3_ttype_neg3;
	z = filled( 100, 4.0 );
	z[ 16 ] = 2.0;
	z[ 14 ] = 2.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 2.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 3.5, 3.5, 4.5, 3.5, 3.5, 4.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dmin_eq_dn — Case 4 with dmin=dn', function t() {
	var result;
	var tc;
	var z;

	tc = case4_dmin_eq_dn;
	z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 1.5;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.2;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 2.0, 0.5, 1.0, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dmin_eq_dn1 — Case 4 with dmin=dn1', function t() {
	var result;
	var tc;
	var z;

	tc = case4_dmin_eq_dn1;
	z = filled( 100, 4.0 );
	z[ 19 ] = 1.0;
	z[ 17 ] = 1.5;
	z[ 15 ] = 1.0;
	z[ 13 ] = 2.0;
	z[ 11 ] = 1.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 1.5;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.2;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 2.0, 1.0, 0.5, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_dmin_eq_dn2 — Case 5', function t() {
	var result;
	var tc;
	var z;

	tc = case5_dmin_eq_dn2;
	z = filled( 100, 4.0 );
	z[ 19 ] = 1.0;
	z[ 17 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 13 ] = 1.0;
	z[ 11 ] = 1.0;
	z[ 9 ] = 1.0;
	z[ 7 ] = 1.5;
	z[ 5 ] = 1.0;
	z[ 4 ] = 1.0;
	z[ 3 ] = 1.0;
	z[ 2 ] = 1.0;
	z[ 1 ] = 1.0;
	z[ 0 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case6_no_info — Case 6, fresh g', function t() {
	var result;
	var tc;
	var z;

	tc = case6_no_info;
	z = filled( 100, 4.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 1.0, 2.0, 3.0, 2.0, 3.0, 4.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case6_ttype_neg6 — Case 6, previous ttype=-6 updates g', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case6_ttype_neg6;
	z = filled( 100, 4.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 1.0, 2.0, 3.0, 2.0, 3.0, 4.0, 0.0, -6, 0.5 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case6_ttype_neg18 — Case 6, previous ttype=-18 resets g', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case6_ttype_neg18;
	z = filled( 100, 4.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 1.0, 2.0, 3.0, 2.0, 3.0, 4.0, 0.0, -18, 0.5 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case7_one_deflated — Case 7 (n0in=n0+1)', function t() {
	var result;
	var tc;
	var z;

	tc = case7_one_deflated;
	z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 2.0;
	z[ 12 ] = 1.0;
	z[ 10 ] = 1.5;
	z[ 8 ] = 1.0;
	z[ 6 ] = 2.0;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.5;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.8, 1.5, 1.0, 0.8, 1.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case9_dmin1_ne_dn1 — Case 9 (dmin1 != dn1)', function t() {
	var result;
	var tc;
	var z;

	tc = case9_dmin1_ne_dn1;
	z = filled( 100, 4.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.9, 1.5, 1.0, 0.8, 1.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case9_dmin1_eq_dn1 — Case 9 (dmin1=dn1, s=half*dmin1)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case9_dmin1_eq_dn1;
	z = filled( 100, 4.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.8, 1.6, 1.0, 0.8, 1.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_two_deflated — Case 10 (n0in=n0+2)', function t() {
	var result;
	var tc;
	var z;

	tc = case10_two_deflated;
	z = filled( 100, 4.0 );
	z[ 14 ] = 0.3;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 1.5;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.2;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case11_two_deflated_fallback — Case 11 (ttype=-11)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case11_two_deflated_fallback;
	z = filled( 100, 4.0 );
	z[ 14 ] = 2.0;
	z[ 12 ] = 4.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case12_many_deflated — Case 12 (n0in>n0+2)', function t() {
	var result;
	var tc;
	var z;

	tc = case12_many_deflated;
	z = filled( 100, 4.0 );
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 8, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: pp1_case2 — PP=1 (pong)', function t() {
	var result;
	var tc;
	var z;

	tc = pp1_case2;
	z = filled( 100, 4.0 );
	z[ 17 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 13 ] = 1.0;
	z[ 11 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 1, 5, 0.5, 0.5, 3.0, 0.5, 2.0, 3.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_early_return — Z(NN-5) > Z(NN-7) triggers early return', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case4_early_return;
	z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 5.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 2.0, 0.5, 1.0, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_early_return — Z(NP-8) > B2', function t() {
	var result;
	var tc;
	var z;

	tc = case5_early_return;
	z = filled( 100, 4.0 );
	z[ 17 ] = 1.0;
	z[ 13 ] = 0.5;
	z[ 11 ] = 10.0;
	z[ 15 ] = 0.5;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case3_dn_gt_b1 — Case 3 with dn > b1', function t() {
	var result;
	var tc;
	var z;

	tc = case3_dn_gt_b1;
	z = filled( 100, 4.0 );
	z[ 16 ] = 0.01;
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.01;
	z[ 10 ] = 0.01;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case7_b2_zero — b2=0 early exit', function t() {
	var result;
	var tc;
	var z;

	tc = case7_b2_zero;
	z = filled( 100, 4.0 );
	z[ 14 ] = 0.0;
	z[ 12 ] = 2.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.8, 1.5, 1.0, 0.8, 1.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case8_gap2_negative — ttype=-7/8 with gap2<=0', function t() {
	var result;
	var tc;
	var z;

	tc = case8_gap2_negative;
	z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.5;
	z[ 8 ] = 1.0;
	z[ 6 ] = 2.0;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.5;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.1, 0.8, 0.1, 1.0, 0.8, 0.1, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_b2_zero — Case 10 with b2=0', function t() {
	var result;
	var tc;
	var z;

	tc = case10_b2_zero;
	z = filled( 100, 4.0 );
	z[ 14 ] = 0.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case2_gap2_neg — Case 2 with gap2<=0', function t() {
	var result;
	var tc;
	var z;

	tc = case2_gap2_neg;
	z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 1.0;
	z[ 10 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_short_array — Case 5 with n0-i0<=2', function t() {
	var result;
	var tc;
	var z;

	tc = case5_short_array;
	z = filled( 100, 4.0 );
	z[ 17 ] = 1.0;
	z[ 13 ] = 0.5;
	z[ 11 ] = 0.3;
	z[ 15 ] = 0.5;
	result = dlasq4.ndarray( 3, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: true_case2 — ttype=-2 with gap1>0 and gap1>b1', function t() {
	var result;
	var tc;
	var z;

	tc = true_case2;
	z = filled( 100, 4.0 );
	z[ 16 ] = 0.01;
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.01;
	z[ 10 ] = 0.01;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.005, 0.005, 10.0, 0.005, 0.005, 10.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case3_a2_gt_b1b2 — Case 3 with a2 > b1+b2', function t() {
	var result;
	var tc;
	var z;

	tc = case3_a2_gt_b1b2;
	z = filled( 100, 4.0 );
	z[ 16 ] = 0.01;
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.5;
	z[ 10 ] = 0.01;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.45, 0.45, 0.6, 0.45, 0.45, 0.6, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dn1_branch — Case 4 via dn1 branch', function t() {
	var result;
	var tc;
	var z;

	tc = case4_dn1_branch;
	z = filled( 100, 2.0 );
	z[ 17 ] = 3.0;
	z[ 15 ] = 1.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 2.0;
	z[ 6 ] = 1.0;
	z[ 4 ] = 2.0;
	z[ 2 ] = 1.0;
	z[ 0 ] = 2.0;
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 1.0, 0.3, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_rayleigh — Case 4 with a2<CNST1 (Rayleigh bound)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case4_rayleigh;
	z = filled( 100, 10.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 0.1;
	z[ 12 ] = 1.0;
	z[ 10 ] = 0.1;
	z[ 8 ] = 10.0;
	z[ 6 ] = 0.1;
	z[ 4 ] = 10.0;
	z[ 2 ] = 0.1;
	z[ 0 ] = 10.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.1, 1.5, 2.0, 0.1, 1.0, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case7_gap2_positive — Case 7 with gap2>0', function t() {
	var result;
	var tc;
	var z;

	tc = case7_gap2_positive;
	z = filled( 100, 4.0 );
	z[ 14 ] = 0.5;
	z[ 12 ] = 4.0;
	z[ 10 ] = 0.5;
	z[ 8 ] = 4.0;
	z[ 6 ] = 0.5;
	z[ 4 ] = 4.0;
	z[ 2 ] = 0.5;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.5, 0.5, 10.0, 1.0, 0.5, 10.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_gap2_positive — Case 10 with gap2>0', function t() {
	var result;
	var tc;
	var z;

	tc = case10_gap2_positive;
	z = filled( 100, 4.0 );
	z[ 14 ] = 0.1;
	z[ 12 ] = 4.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 0.5;
	z[ 4 ] = 4.0;
	z[ 2 ] = 0.5;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 2.0, 1.0, 0.8, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_rayleigh — Case 5 with a2<CNST1 (Rayleigh bound)', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case5_rayleigh;
	z = filled( 100, 10.0 );
	z[ 17 ] = 10.0;
	z[ 13 ] = 10.0;
	z[ 11 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 6 ] = 0.1;
	z[ 4 ] = 10.0;
	z[ 2 ] = 0.1;
	z[ 0 ] = 10.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 5.0, 3.0, 5.0, 8.0, 0.3, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_loop_return — Case 4 loop Z(I4)>Z(I4-2) return', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case4_loop_return;
	z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 2.0;
	z[ 6 ] = 5.0;
	z[ 4 ] = 2.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 0.3, 1.0, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_loop_return — Case 5 loop Z(I4)>Z(I4-2) return', function t() { // eslint-disable-line max-len
	var result;
	var tc;
	var z;

	tc = case5_loop_return;
	z = filled( 100, 2.0 );
	z[ 17 ] = 2.0;
	z[ 13 ] = 2.0;
	z[ 11 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 6 ] = 1.0;
	z[ 4 ] = 2.0;
	z[ 2 ] = 5.0;
	z[ 0 ] = 2.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 5.0, 3.0, 5.0, 8.0, 0.3, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_loop_return — Case 10 loop return', function t() {
	var result;
	var tc;
	var z;

	tc = case10_loop_return;
	z = filled( 100, 2.0 );
	z[ 14 ] = 0.1;
	z[ 12 ] = 2.0;
	z[ 10 ] = 2.0;
	z[ 8 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_gap2_neg — Case 10 with gap2<=0', function t() {
	var result;
	var tc;
	var z;

	tc = case10_gap2_neg;
	z = filled( 100, 4.0 );
	z[ 14 ] = 0.1;
	z[ 12 ] = 4.0;
	z[ 10 ] = 0.1;
	z[ 8 ] = 0.1;
	z[ 6 ] = 0.5;
	z[ 4 ] = 4.0;
	z[ 2 ] = 0.5;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dn1_np_return — Case 4 dmin=dn1, Z(np-4)>Z(np-2) return', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 15 ] = 5.0;
	z[ 17 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 1.0, 0.3, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	assert.strictEqual( result.ttype, -4 );
	assert.strictEqual( result.tau, 0.0 );
});

test( 'dlasq4: case4_dn1_nn9_return — Case 4 dmin=dn1, Z(nn-9)>Z(nn-11) return', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 15 ] = 1.0;
	z[ 17 ] = 2.0;
	z[ 10 ] = 5.0;
	z[ 8 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 1.0, 0.3, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	assert.strictEqual( result.ttype, -4 );
	assert.strictEqual( result.tau, 0.0 );
});

test( 'dlasq4: case4_b2_zero — Case 4 dmin=dn with b2=0 (Z(nn-5)=0)', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 0.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 0.3, 1.0, 2.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	assert.strictEqual( result.ttype, -4 );
	assert.ok( result.tau > 0.0, 'tau should be positive (Rayleigh bound used)' );
});

test( 'dlasq4: case5_b2_zero_loop — Case 5 b2=0 break in approximation loop', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = filled( 100, 4.0 );
	z[ 19 ] = 1.0;
	z[ 17 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 13 ] = 1.0;
	z[ 11 ] = 1.0;
	z[ 9 ] = 1.0;
	z[ 7 ] = 1.5;
	z[ 5 ] = 1.0;
	z[ 4 ] = 1.0;
	z[ 3 ] = 1.0;
	z[ 2 ] = 1.0;
	z[ 1 ] = 1.0;
	z[ 0 ] = 1.0;
	z[ 6 ] = 0.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	assert.strictEqual( result.ttype, -5 );
	assert.strictEqual( result.tau, 0.125 );
});

test( 'dlasq4: case7_convergence_break — Case 7 b2 convergence break', function t() { // eslint-disable-line max-len
	var result;
	var i4;
	var z;

	z = filled( 200, 2.0 );
	z[ 118 ] = 1.0;
	z[ 116 ] = 2.0;
	for ( i4 = 111; i4 >= 3; i4 -= 4 ) {
		z[ i4 ] = 1.0;
		z[ i4 - 2 ] = 2.0;
	}
	result = dlasq4.ndarray( 1, 30, z, 1, 0, 0, 31, 0.5, 0.5, 10.0, 1.0, 0.5, 10.0, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	assert.strictEqual( result.ttype, -7 );
	assert.ok( result.tau > 0.0, 'tau should be positive' );
});

test( 'dlasq4: case10_true_gap2_neg — Case 10 with truly negative gap2', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = filled( 100, 4.0 );
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.1;
	z[ 10 ] = 0.1;
	z[ 8 ] = 4.0;
	z[ 6 ] = 1.0;
	z[ 4 ] = 2.0;
	z[ 2 ] = 1.0;
	result = dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, 0.0, 0, 0.0 ); // eslint-disable-line max-len
	assert.strictEqual( result.ttype, -10 );
	assert.ok( result.tau > 0.0, 'tau should be positive' );
});
