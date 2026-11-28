/* eslint-disable no-restricted-syntax */

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
	const z = new Float64Array( len );
	let i;
	for ( i = 0; i < len; i++ ) {
		z[ i ] = val;
	}
	return z;
}

/**
* Checks result against fixture values.
*/
function checkResult( result, tc, tol ) {
	let relErr;

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
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = dmin_negative;
	const z = filled( 100, 1.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, -0.5, 1.0, 1.0, 1.0, 1.0, 1.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: dmin_zero (ttype=-1)', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = dmin_zero;
	const z = filled( 100, 1.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case2_ttype_neg2 — Cases 2/3 with gap analysis', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case2_ttype_neg2;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 1.0;
	z[ 10 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 0.5, 3.0, 0.5, 2.0, 3.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case3_ttype_neg3 — Case 3, gap1 <= 0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case3_ttype_neg3;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 2.0;
	z[ 14 ] = 2.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 2.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 3.5, 3.5, 4.5, 3.5, 3.5, 4.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dmin_eq_dn — Case 4 with dmin=dn', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case4_dmin_eq_dn;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 1.5;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.2;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 2.0, 0.5, 1.0, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dmin_eq_dn1 — Case 4 with dmin=dn1', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case4_dmin_eq_dn1;
	const z = filled( 100, 4.0 );
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
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 2.0, 1.0, 0.5, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_dmin_eq_dn2 — Case 5', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case5_dmin_eq_dn2;
	const z = filled( 100, 4.0 );
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
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case6_no_info — Case 6, fresh g', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case6_no_info;
	const z = filled( 100, 4.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 1.0, 2.0, 3.0, 2.0, 3.0, 4.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case6_ttype_neg6 — Case 6, previous ttype=-6 updates g', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case6_ttype_neg6;
	const z = filled( 100, 4.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = -6;
	g[ 0 ] = 0.5;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 1.0, 2.0, 3.0, 2.0, 3.0, 4.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case6_ttype_neg18 — Case 6, previous ttype=-18 resets g', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case6_ttype_neg18;
	const z = filled( 100, 4.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = -18;
	g[ 0 ] = 0.5;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 1.0, 2.0, 3.0, 2.0, 3.0, 4.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case7_one_deflated — Case 7 (n0in=n0+1)', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case7_one_deflated;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 2.0;
	z[ 12 ] = 1.0;
	z[ 10 ] = 1.5;
	z[ 8 ] = 1.0;
	z[ 6 ] = 2.0;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.8, 1.5, 1.0, 0.8, 1.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case9_dmin1_ne_dn1 — Case 9 (dmin1 != dn1)', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case9_dmin1_ne_dn1;
	const z = filled( 100, 4.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.9, 1.5, 1.0, 0.8, 1.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case9_dmin1_eq_dn1 — Case 9 (dmin1=dn1, s=half*dmin1)', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case9_dmin1_eq_dn1;
	const z = filled( 100, 4.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.8, 1.6, 1.0, 0.8, 1.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_two_deflated — Case 10 (n0in=n0+2)', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case10_two_deflated;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.3;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 1.5;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.2;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case11_two_deflated_fallback — Case 11 (ttype=-11)', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case11_two_deflated_fallback;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 2.0;
	z[ 12 ] = 4.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case12_many_deflated — Case 12 (n0in>n0+2)', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case12_many_deflated;
	const z = filled( 100, 4.0 );
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 8, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: pp1_case2 — PP=1 (pong)', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = pp1_case2;
	const z = filled( 100, 4.0 );
	z[ 17 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 13 ] = 1.0;
	z[ 11 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 1, 5, 0.5, 0.5, 3.0, 0.5, 2.0, 3.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_early_return — Z(NN-5) > Z(NN-7) triggers early return', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case4_early_return;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 5.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 2.0, 0.5, 1.0, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_early_return — Z(NP-8) > B2', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case5_early_return;
	const z = filled( 100, 4.0 );
	z[ 17 ] = 1.0;
	z[ 13 ] = 0.5;
	z[ 11 ] = 10.0;
	z[ 15 ] = 0.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case3_dn_gt_b1 — Case 3 with dn > b1', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case3_dn_gt_b1;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 0.01;
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.01;
	z[ 10 ] = 0.01;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case7_b2_zero — b2=0 early exit', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case7_b2_zero;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.0;
	z[ 12 ] = 2.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.8, 0.8, 1.5, 1.0, 0.8, 1.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case8_gap2_negative — ttype=-7/8 with gap2<=0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case8_gap2_negative;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.5;
	z[ 8 ] = 1.0;
	z[ 6 ] = 2.0;
	z[ 4 ] = 1.0;
	z[ 2 ] = 1.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.1, 0.8, 0.1, 1.0, 0.8, 0.1, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_b2_zero — Case 10 with b2=0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case10_b2_zero;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case2_gap2_neg — Case 2 with gap2<=0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case2_gap2_neg;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 1.0;
	z[ 10 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_short_array — Case 5 with n0-i0<=2', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case5_short_array;
	const z = filled( 100, 4.0 );
	z[ 17 ] = 1.0;
	z[ 13 ] = 0.5;
	z[ 11 ] = 0.3;
	z[ 15 ] = 0.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 3, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: true_case2 — ttype=-2 with gap1>0 and gap1>b1', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = true_case2;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 0.01;
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.01;
	z[ 10 ] = 0.01;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.005, 0.005, 10.0, 0.005, 0.005, 10.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case3_a2_gt_b1b2 — Case 3 with a2 > b1+b2', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case3_a2_gt_b1b2;
	const z = filled( 100, 4.0 );
	z[ 16 ] = 0.01;
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.5;
	z[ 10 ] = 0.01;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.45, 0.45, 0.6, 0.45, 0.45, 0.6, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dn1_branch — Case 4 via dn1 branch', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case4_dn1_branch;
	const z = filled( 100, 2.0 );
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
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 1.0, 0.3, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_rayleigh — Case 4 with a2<CNST1 (Rayleigh bound)', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case4_rayleigh;
	const z = filled( 100, 10.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 0.1;
	z[ 12 ] = 1.0;
	z[ 10 ] = 0.1;
	z[ 8 ] = 10.0;
	z[ 6 ] = 0.1;
	z[ 4 ] = 10.0;
	z[ 2 ] = 0.1;
	z[ 0 ] = 10.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.1, 1.5, 2.0, 0.1, 1.0, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case7_gap2_positive — Case 7 with gap2>0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case7_gap2_positive;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.5;
	z[ 12 ] = 4.0;
	z[ 10 ] = 0.5;
	z[ 8 ] = 4.0;
	z[ 6 ] = 0.5;
	z[ 4 ] = 4.0;
	z[ 2 ] = 0.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 6, 0.5, 0.5, 10.0, 1.0, 0.5, 10.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_gap2_positive — Case 10 with gap2>0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case10_gap2_positive;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.1;
	z[ 12 ] = 4.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 1.0;
	z[ 6 ] = 0.5;
	z[ 4 ] = 4.0;
	z[ 2 ] = 0.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 2.0, 1.0, 0.8, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_rayleigh — Case 5 with a2<CNST1 (Rayleigh bound)', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case5_rayleigh;
	const z = filled( 100, 10.0 );
	z[ 17 ] = 10.0;
	z[ 13 ] = 10.0;
	z[ 11 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 6 ] = 0.1;
	z[ 4 ] = 10.0;
	z[ 2 ] = 0.1;
	z[ 0 ] = 10.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 5.0, 3.0, 5.0, 8.0, 0.3, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_loop_return — Case 4 loop Z(I4)>Z(I4-2) return', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case4_loop_return;
	const z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 8 ] = 2.0;
	z[ 6 ] = 5.0;
	z[ 4 ] = 2.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 0.3, 1.0, 2.0, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case5_loop_return — Case 5 loop Z(I4)>Z(I4-2) return', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case5_loop_return;
	const z = filled( 100, 2.0 );
	z[ 17 ] = 2.0;
	z[ 13 ] = 2.0;
	z[ 11 ] = 1.0;
	z[ 15 ] = 1.0;
	z[ 6 ] = 1.0;
	z[ 4 ] = 2.0;
	z[ 2 ] = 5.0;
	z[ 0 ] = 2.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 5.0, 3.0, 5.0, 8.0, 0.3, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_loop_return — Case 10 loop return', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case10_loop_return;
	const z = filled( 100, 2.0 );
	z[ 14 ] = 0.1;
	z[ 12 ] = 2.0;
	z[ 10 ] = 2.0;
	z[ 8 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case10_gap2_neg — Case 10 with gap2<=0', function t() {
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const tc = case10_gap2_neg;
	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.1;
	z[ 12 ] = 4.0;
	z[ 10 ] = 0.1;
	z[ 8 ] = 0.1;
	z[ 6 ] = 0.5;
	z[ 4 ] = 4.0;
	z[ 2 ] = 0.5;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g );
	const result = {
		'tau': tau[ 0 ],
		'ttype': ttype[ 0 ],
		'g': g[ 0 ]
	}; // eslint-disable-line max-len
	checkResult( result, tc, 1e-14 );
});

test( 'dlasq4: case4_dn1_np_return — Case 4 dmin=dn1, Z(np-4)>Z(np-2) return', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	z[ 15 ] = 5.0;
	z[ 17 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 1.0, 0.3, 2.0, tau, ttype, g ); // eslint-disable-line max-len
	assert.strictEqual( ttype[ 0 ], -4 );
	assert.strictEqual( tau[ 0 ], 0.0 );
});

test( 'dlasq4: case4_dn1_nn9_return — Case 4 dmin=dn1, Z(nn-9)>Z(nn-11) return', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 1.0;
	z[ 12 ] = 2.0;
	z[ 15 ] = 1.0;
	z[ 17 ] = 2.0;
	z[ 10 ] = 5.0;
	z[ 8 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 1.0, 0.3, 2.0, tau, ttype, g ); // eslint-disable-line max-len
	assert.strictEqual( ttype[ 0 ], -4 );
	assert.strictEqual( tau[ 0 ], 0.0 );
});

test( 'dlasq4: case4_b2_zero — Case 4 dmin=dn with b2=0 (Z(nn-5)=0)', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const z = filled( 100, 2.0 );
	z[ 16 ] = 1.0;
	z[ 14 ] = 0.0;
	z[ 12 ] = 2.0;
	z[ 10 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 1.5, 2.0, 0.3, 1.0, 2.0, tau, ttype, g ); // eslint-disable-line max-len
	assert.strictEqual( ttype[ 0 ], -4 );
	assert.ok( tau[ 0 ] > 0.0, 'tau should be positive (Rayleigh bound used)' );
});

test( 'dlasq4: case5_b2_zero_loop — Case 5 b2=0 break in approximation loop', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const z = filled( 100, 4.0 );
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
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.5, 1.5, 1.0, 1.5, 2.0, 0.5, tau, ttype, g ); // eslint-disable-line max-len
	assert.strictEqual( ttype[ 0 ], -5 );
	assert.strictEqual( tau[ 0 ], 0.125 );
});

test( 'dlasq4: case7_convergence_break — Case 7 b2 convergence break', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );
	let i4;

	const z = filled( 200, 2.0 );
	z[ 118 ] = 1.0;
	z[ 116 ] = 2.0;
	for ( i4 = 111; i4 >= 3; i4 -= 4 ) {
		z[ i4 ] = 1.0;
		z[ i4 - 2 ] = 2.0;
	}
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 30, z, 1, 0, 0, 31, 0.5, 0.5, 10.0, 1.0, 0.5, 10.0, tau, ttype, g ); // eslint-disable-line max-len
	assert.strictEqual( ttype[ 0 ], -7 );
	assert.ok( tau[ 0 ] > 0.0, 'tau should be positive' );
});

test( 'dlasq4: case10_true_gap2_neg — Case 10 with truly negative gap2', function t() { // eslint-disable-line max-len
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );

	const z = filled( 100, 4.0 );
	z[ 14 ] = 0.01;
	z[ 12 ] = 0.1;
	z[ 10 ] = 0.1;
	z[ 8 ] = 4.0;
	z[ 6 ] = 1.0;
	z[ 4 ] = 2.0;
	z[ 2 ] = 1.0;
	tau[ 0 ] = 0.0;
	ttype[ 0 ] = 0;
	g[ 0 ] = 0.0;
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 7, 0.5, 0.8, 0.5, 1.0, 0.8, 0.5, tau, ttype, g ); // eslint-disable-line max-len
	assert.strictEqual( ttype[ 0 ], -10 );
	assert.ok( tau[ 0 ] > 0.0, 'tau should be positive' );
});


// FUNCTIONS (loop-exit tests) //

/**
* Builds a 1-based qd array from `[index, value]` pairs (all other entries 1).
*
* @private
* @param {integer} len - length
* @param {Array} pairs - `[ 1-based index, value ]` pairs
* @returns {Float64Array} qd array
*/
function qd( len, pairs ) {
	const z = filled( len, 1.0 );
	let i;
	for ( i = 0; i < pairs.length; i++ ) {
		z[ pairs[ i ][ 0 ] - 1 ] = pairs[ i ][ 1 ];
	}
	return z;
}

/**
* Returns the Rayleigh-quotient shift `gam*(1-sqrt(a2))/(1+a2)` used by cases 4 and 5.
*
* @private
* @param {number} gam - gamma
* @param {number} a2 - scaled norm estimate (after the 1.05 factor)
* @returns {number} shift
*/
function rqShift( gam, a2 ) {
	return gam * ( 1.0 - Math.sqrt( a2 ) ) / ( 1.0 + a2 );
}

/**
* Asserts relative closeness.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	assert.ok( Math.abs( actual - expected ) <= tol * Math.abs( expected ), msg + ': expected ' + expected + ', got ' + actual );
}


// TESTS (loop-exit tests) //

test( 'dlasq4: case 4 (dmin = dn1), loop left at B2 = 0 still scales A2 by CNST3', function t() {
	// N0 = 4, PP = 0, NN = 16: A2 = Z(12)/Z(14) = 0.1, B2 = Z(7)/Z(5) = 0. A2 + B2 = 0.1, the DO 10 loop exits at once (B2 = 0, GO TO 20), then A2 = 1.05*0.1 and TAU = DN1*(1-sqrt(A2))/(1+A2).
	const z = qd( 20, [ [ 12, 0.1 ], [ 14, 1.0 ], [ 7, 0.0 ], [ 5, 1.0 ] ] );
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );
	dlasq4.ndarray( 1, 4, z, 1, 0, 0, 4, 0.5, 0.7, 0.9, 1.0, 0.5, 0.9, tau, ttype, g );
	assert.equal( ttype[ 0 ], -4, 'ttype' );
	assertClose( tau[ 0 ], rqShift( 0.5, 1.05 * 0.1 ), 1e-15, 'tau' );
});

test( 'dlasq4: case 5, loop left at B2 = 0 still scales A2 by CNST3', function t() {
	// N0 = 5, PP = 0, NN = 20: A2 = (Z(12)/Z(14))*(1+Z(16)/Z(18)) = 0.2, B2 = Z(7)/Z(5) = 0, so DO 30 exits at once (GO TO 40), A2 = 1.05*0.2 and TAU = DN2*(1-sqrt(A2))/(1+A2).
	const z = qd( 24, [ [ 12, 0.2 ], [ 14, 1.0 ], [ 16, 0.0 ], [ 18, 1.0 ], [ 7, 0.0 ], [ 5, 1.0 ] ] );
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 0.7, 0.9, 1.0, 2.0, 0.3, tau, ttype, g );
	assert.equal( ttype[ 0 ], -5, 'ttype' );
	assertClose( tau[ 0 ], rqShift( 0.3, 1.05 * 0.2 ), 1e-15, 'tau' );
});

test( 'dlasq4: case 5, loop left by the small-increment test still scales A2 by CNST3', function t() {
	// A2 = 0.2, B2 = Z(7)/Z(5) = 1e-4, A2 = 0.2001. DO 30 at I4 = 3: B1 = 1e-4, B2 = 1e-4*Z(3)/Z(1) = 1e-7, A2 = 0.2001001; 100*max(B2,B1) = 0.01 < A2, so GO TO 40, then A2 = 1.05*A2.
	const z = qd( 24, [ [ 12, 0.2 ], [ 14, 1.0 ], [ 16, 0.0 ], [ 18, 1.0 ], [ 7, 1e-4 ], [ 5, 1.0 ], [ 3, 1e-3 ] ] );
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );
	dlasq4.ndarray( 1, 5, z, 1, 0, 0, 5, 0.3, 0.7, 0.9, 1.0, 2.0, 0.3, tau, ttype, g );
	assert.equal( ttype[ 0 ], -5, 'ttype' );
	assertClose( tau[ 0 ], rqShift( 0.3, 1.05 * ( 0.2 + 1e-4 + 1e-7 ) ), 1e-15, 'tau' );
});

test( 'dlasq4: cases 7/8, loop left by the small-increment test still takes B2 = sqrt(CNST3*B2)', function t() {
	let gap2;
	let s;

	// N0 = 4, N0IN = 5, PP = 0, NN = 16, DMIN1 = DN1, DMIN2 = DN2. B1 = Z(11)/Z(9) = 0.1. DO 50: I4 = 7 -> B1 = 1e-4, B2 = 0.1001; I4 = 3 -> B1 = 1e-9, B2 = 0.1001000001, and 100*max(B1, 1e-4) = 0.01 < B2, so GO TO 60. Then B2 = sqrt(1.05*B2), A2 = DMIN1/(1+B2^2), GAP2 = DMIN2/2 - A2.
	const z = qd( 20, [ [ 11, 0.1 ], [ 9, 1.0 ], [ 7, 1e-3 ], [ 5, 1.0 ], [ 3, 1e-5 ], [ 1, 1.0 ] ] );
	const tau = new Float64Array( 1 );
	const ttype = new Int32Array( 1 );
	const g = new Float64Array( 1 );
	dlasq4.ndarray( 1, 4, z, 1, 0, 0, 5, 0.4, 0.5, 2.0, 0.4, 0.5, 2.0, tau, ttype, g );
	const b2 = Math.sqrt( 1.05 * ( 0.1 + 1e-4 + 1e-9 ) );
	const a2 = 0.5 / ( 1.0 + ( b2 * b2 ) );
	gap2 = ( 0.5 * 2.0 ) - a2;
	s = 0.333 * 0.5;
	assert.ok( gap2 > 0.0 && gap2 > b2 * a2, 'case 7 branch' );
	s = Math.max( s, a2 * ( 1.0 - ( ( 1.01 * a2 ) * ( b2 / gap2 ) * b2 ) ) );
	assert.equal( ttype[ 0 ], -7, 'ttype' );
	assertClose( tau[ 0 ], s, 1e-14, 'tau' );
});
