/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaln2 from './../lib/ndarray.js';

// FIXTURES //

import _1x1_real_basic from './fixtures/1x1_real_basic.json' with { type: 'json' };
import _1x1_complex_basic from './fixtures/1x1_complex_basic.json' with { type: 'json' };
import _2x2_real_notrans from './fixtures/2x2_real_notrans.json' with { type: 'json' };
import _2x2_real_trans from './fixtures/2x2_real_trans.json' with { type: 'json' };
import _1x1_real_singular from './fixtures/1x1_real_singular.json' with { type: 'json' };
import _2x2_complex_notrans from './fixtures/2x2_complex_notrans.json' with { type: 'json' };
import _2x2_complex_trans from './fixtures/2x2_complex_trans.json' with { type: 'json' };
import _1x1_real_nontrivial_ca_d1 from './fixtures/1x1_real_nontrivial_ca_d1.json' with { type: 'json' };
import _2x2_real_wr_shift from './fixtures/2x2_real_wr_shift.json' with { type: 'json' };
import _1x1_complex_singular from './fixtures/1x1_complex_singular.json' with { type: 'json' };
import _2x2_real_smin_positive from './fixtures/2x2_real_smin_positive.json' with { type: 'json' };
import _2x2_real_all_small from './fixtures/2x2_real_all_small.json' with { type: 'json' };
import _2x2_complex_all_small from './fixtures/2x2_complex_all_small.json' with { type: 'json' };
import _2x2_real_diff_d from './fixtures/2x2_real_diff_d.json' with { type: 'json' };
import _1x1_real_scaling from './fixtures/1x1_real_scaling.json' with { type: 'json' };
import _1x1_complex_scaling from './fixtures/1x1_complex_scaling.json' with { type: 'json' };
import _2x2_real_offdiag_pivot from './fixtures/2x2_real_offdiag_pivot.json' with { type: 'json' };
import _2x2_complex_offdiag_pivot from './fixtures/2x2_complex_offdiag_pivot.json' with { type: 'json' };
import _1x1_real_ltrans from './fixtures/1x1_real_ltrans.json' with { type: 'json' };
import _2x2_real_icmax2 from './fixtures/2x2_real_icmax2.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	var diff = Math.abs( actual - expected );
	var denom = Math.max( Math.abs( expected ), 1.0 );
	var relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

// TESTS //

test( 'dlaln2 is a function', function t() {
	assert.strictEqual( typeof dlaln2, 'function' );
});

test( 'dlaln2: 1x1 real system (basic)', function t() {
	var tc = _1x1_real_basic;
	var A = new Float64Array( [ 3.0, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 10.0, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 1, 0.0, 2.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-14, 'X[0]' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 complex system (basic)', function t() {
	var tc = _1x1_complex_basic;
	var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 1.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.Xre, 1e-14, 'Xre' );
	assertClose( X[ 2 ], tc.Xim, 1e-14, 'Xim' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real system, no transpose', function t() {
	var tc = _2x2_real_notrans;
	// A = [[2, 1], [0, 3]] column-major
	var A = new Float64Array( [ 2.0, 0.0, 1.0, 3.0 ] );
	var B = new Float64Array( [ 7.0, 6.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real system, transposed', function t() {
	var tc = _2x2_real_trans;
	// A = [[2, 0], [1, 3]] col-major => A(1,1)=2, A(2,1)=1, A(1,2)=0, A(2,2)=3
	var A = new Float64Array( [ 2.0, 1.0, 0.0, 3.0 ] );
	var B = new Float64Array( [ 5.0, 9.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( true, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 real near-singular (info=1)', function t() {
	var tc = _1x1_real_singular;
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-10, 'X11' );
	assertClose( res.xnorm, tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 complex system, no transpose', function t() {
	var tc = _2x2_complex_notrans;
	// A = [[4, 1], [0, 3]] column-major
	var A = new Float64Array( [ 4.0, 0.0, 1.0, 3.0 ] );
	// B has B(1,1)=1, B(2,1)=2 (real col), B(1,2)=0.5, B(2,2)=1 (imag col)
	var B = new Float64Array( [ 1.0, 2.0, 0.5, 1.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 1.0, 2.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-14, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-14, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-14, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-14, 'X2im' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 complex system, transposed', function t() {
	var tc = _2x2_complex_trans;
	// A = [[4, 0], [1, 3]] col-major
	var A = new Float64Array( [ 4.0, 1.0, 0.0, 3.0 ] );
	var B = new Float64Array( [ 1.0, 2.0, 0.5, 1.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( true, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 1.0, 2.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-14, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-14, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-14, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-14, 'X2im' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 real with non-trivial ca and d1', function t() {
	var tc = _1x1_real_nontrivial_ca_d1;
	var A = new Float64Array( [ 5.0, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 7.0, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 1, 0.0, 3.0, A, 1, 2, 0, 4.0, 0.0, B, 1, 2, 0, 2.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-14, 'X11' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real with wr shift', function t() {
	var tc = _2x2_real_wr_shift;
	// A = [[2, 1], [0, 3]] col-major
	var A = new Float64Array( [ 2.0, 0.0, 1.0, 3.0 ] );
	var B = new Float64Array( [ 5.0, 9.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 2.0, B, 1, 2, 0, 3.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 complex near-singular (info=1)', function t() {
	var tc = _1x1_complex_singular;
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.Xre, 1e-10, 'Xre' );
	assertClose( X[ 2 ], tc.Xim, 1e-10, 'Xim' );
	assertClose( res.xnorm, tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 real with smin > 0', function t() {
	var tc = _2x2_real_smin_positive;
	var A = new Float64Array( [ 2.0, 0.0, 1.0, 3.0 ] );
	var B = new Float64Array( [ 7.0, 6.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 1.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real all small coefficients', function t() {
	var tc = _2x2_real_all_small;
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	var B = new Float64Array( [ 1.0, 1.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 0.0, 1e-300, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-10, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-10, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 complex all small coefficients', function t() {
	var tc = _2x2_complex_all_small;
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	var B = new Float64Array( [ 1.0, 1.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 2, 0.0, 1e-300, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-10, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-10, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-10, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-10, 'X2im' );
	assertClose( res.xnorm, tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 real with different D values', function t() {
	var tc = _2x2_real_diff_d;
	// A = [[5, 3], [1, 4]] col-major
	var A = new Float64Array( [ 5.0, 1.0, 3.0, 4.0 ] );
	var B = new Float64Array( [ 10.0, 20.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 0.0, 2.0, A, 1, 2, 0, 2.0, 3.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 real scaling trigger (large B, small coeff)', function t() {
	var tc = _1x1_real_scaling;
	var A = new Float64Array( [ 1e-305, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 1e+300, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 1, 0.0, 1.0, A, 1, 2, 0, 0.0, 0.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-10, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-10, 'X11' );
	assertClose( res.xnorm, tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 1x1 complex scaling trigger', function t() {
	var tc = _1x1_complex_scaling;
	var A = new Float64Array( [ 1e-305, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 1e+300, 0.0, 1e+300, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 1, 2, 0.0, 1.0, A, 1, 2, 0, 0.0, 0.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-10, 'scale' );
	assertClose( X[ 0 ], tc.Xre, 1e-10, 'Xre' );
	assertClose( X[ 2 ], tc.Xim, 1e-10, 'Xim' );
	assertClose( res.xnorm, tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 real off-diagonal pivot', function t() {
	var tc = _2x2_real_offdiag_pivot;
	var A = new Float64Array( [ 1.0, 10.0, 0.5, 1.0 ] );
	var B = new Float64Array( [ 3.0, 5.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 complex off-diagonal pivot', function t() {
	var tc = _2x2_complex_offdiag_pivot;
	var A = new Float64Array( [ 1.0, 10.0, 0.5, 1.0 ] );
	var B = new Float64Array( [ 3.0, 5.0, 1.0, 2.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 1.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-13, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-13, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-13, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-13, 'X2im' );
	assertClose( res.xnorm, tc.XNORM, 1e-13, 'xnorm' );
});

test( 'dlaln2: 1x1 real with ltrans=true', function t() {
	var tc = _1x1_real_ltrans;
	var A = new Float64Array( [ 3.0, 0.0, 0.0, 0.0 ] );
	var B = new Float64Array( [ 10.0, 0.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( true, 1, 1, 0.0, 2.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-14, 'X11' );
	assertClose( res.xnorm, tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real icmax=2 (upper-right pivot)', function t() {
	var tc = _2x2_real_icmax2;
	var A = new Float64Array( [ 0.1, 0.1, 20.0, 0.2 ] );
	var B = new Float64Array( [ 4.0, 8.0, 0.0, 0.0 ] );
	var X = new Float64Array( 4 );
	var res;

	res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0 );
	assert.strictEqual( res.info, tc.INFO );
	assertClose( res.scale, tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-12, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-12, 'X2' );
	assertClose( res.xnorm, tc.XNORM, 1e-12, 'xnorm' );
});
