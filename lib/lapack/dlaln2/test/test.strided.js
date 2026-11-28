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
	const diff = Math.abs( actual - expected );
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

// TESTS //

test( 'dlaln2 is a function', function t() {
	assert.strictEqual( typeof dlaln2, 'function' );
});

test( 'dlaln2: 1x1 real system (basic)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_real_basic;
	const A = new Float64Array( [ 3.0, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 10.0, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 1, 0.0, 2.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-14, 'X[0]' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 complex system (basic)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_complex_basic;
	const A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 1.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.Xre, 1e-14, 'Xre' );
	assertClose( X[ 2 ], tc.Xim, 1e-14, 'Xim' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real system, no transpose', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_notrans;
	// A = [[2, 1], [0, 3]] column-major
	const A = new Float64Array( [ 2.0, 0.0, 1.0, 3.0 ] );
	const B = new Float64Array( [ 7.0, 6.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real system, transposed', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_trans;
	// A = [[2, 0], [1, 3]] col-major => A(1,1)=2, A(2,1)=1, A(1,2)=0, A(2,2)=3
	const A = new Float64Array( [ 2.0, 1.0, 0.0, 3.0 ] );
	const B = new Float64Array( [ 5.0, 9.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( true, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 real near-singular (info=1)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_real_singular;
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-10, 'X11' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 complex system, no transpose', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_complex_notrans;
	// A = [[4, 1], [0, 3]] column-major
	const A = new Float64Array( [ 4.0, 0.0, 1.0, 3.0 ] );
	// B has B(1,1)=1, B(2,1)=2 (real col), B(1,2)=0.5, B(2,2)=1 (imag col)
	const B = new Float64Array( [ 1.0, 2.0, 0.5, 1.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 1.0, 2.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-14, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-14, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-14, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-14, 'X2im' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 complex system, transposed', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_complex_trans;
	// A = [[4, 0], [1, 3]] col-major
	const A = new Float64Array( [ 4.0, 1.0, 0.0, 3.0 ] );
	const B = new Float64Array( [ 1.0, 2.0, 0.5, 1.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( true, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 1.0, 2.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-14, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-14, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-14, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-14, 'X2im' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 real with non-trivial ca and d1', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_real_nontrivial_ca_d1;
	const A = new Float64Array( [ 5.0, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 7.0, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 1, 0.0, 3.0, A, 1, 2, 0, 4.0, 0.0, B, 1, 2, 0, 2.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-14, 'X11' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real with wr shift', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_wr_shift;
	// A = [[2, 1], [0, 3]] col-major
	const A = new Float64Array( [ 2.0, 0.0, 1.0, 3.0 ] );
	const B = new Float64Array( [ 5.0, 9.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 2.0, B, 1, 2, 0, 3.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 complex near-singular (info=1)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_complex_singular;
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.Xre, 1e-10, 'Xre' );
	assertClose( X[ 2 ], tc.Xim, 1e-10, 'Xim' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 real with smin > 0', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_smin_positive;
	const A = new Float64Array( [ 2.0, 0.0, 1.0, 3.0 ] );
	const B = new Float64Array( [ 7.0, 6.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 1, 1.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real all small coefficients', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_all_small;
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const B = new Float64Array( [ 1.0, 1.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	dlaln2( false, 2, 1, 0.0, 1e-300, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-10, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-10, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 complex all small coefficients', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_complex_all_small;
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const B = new Float64Array( [ 1.0, 1.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	dlaln2( false, 2, 2, 0.0, 1e-300, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-10, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-10, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-10, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-10, 'X2im' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 real with different D values', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_diff_d;
	// A = [[5, 3], [1, 4]] col-major
	const A = new Float64Array( [ 5.0, 1.0, 3.0, 4.0 ] );
	const B = new Float64Array( [ 10.0, 20.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 1, 0.0, 2.0, A, 1, 2, 0, 2.0, 3.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 1x1 real scaling trigger (large B, small coeff)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_real_scaling;
	const A = new Float64Array( [ 1e-305, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 1e+300, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 1, 0.0, 1.0, A, 1, 2, 0, 0.0, 0.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-10, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-10, 'X11' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 1x1 complex scaling trigger', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_complex_scaling;
	const A = new Float64Array( [ 1e-305, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 1e+300, 0.0, 1e+300, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 1, 2, 0.0, 1.0, A, 1, 2, 0, 0.0, 0.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-10, 'scale' );
	assertClose( X[ 0 ], tc.Xre, 1e-10, 'Xre' );
	assertClose( X[ 2 ], tc.Xim, 1e-10, 'Xim' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-10, 'xnorm' );
});

test( 'dlaln2: 2x2 real off-diagonal pivot', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_offdiag_pivot;
	const A = new Float64Array( [ 1.0, 10.0, 0.5, 1.0 ] );
	const B = new Float64Array( [ 3.0, 5.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-14, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-14, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 complex off-diagonal pivot', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_complex_offdiag_pivot;
	const A = new Float64Array( [ 1.0, 10.0, 0.5, 1.0 ] );
	const B = new Float64Array( [ 3.0, 5.0, 1.0, 2.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 1.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1re, 1e-13, 'X1re' );
	assertClose( X[ 1 ], tc.X2re, 1e-13, 'X2re' );
	assertClose( X[ 2 ], tc.X1im, 1e-13, 'X1im' );
	assertClose( X[ 3 ], tc.X2im, 1e-13, 'X2im' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-13, 'xnorm' );
});

test( 'dlaln2: 1x1 real with ltrans=true', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _1x1_real_ltrans;
	const A = new Float64Array( [ 3.0, 0.0, 0.0, 0.0 ] );
	const B = new Float64Array( [ 10.0, 0.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( true, 1, 1, 0.0, 2.0, A, 1, 2, 0, 1.0, 0.0, B, 1, 2, 0, 1.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X11, 1e-14, 'X11' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-14, 'xnorm' );
});

test( 'dlaln2: 2x2 real icmax=2 (upper-right pivot)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const tc = _2x2_real_icmax2;
	const A = new Float64Array( [ 0.1, 0.1, 20.0, 0.2 ] );
	const B = new Float64Array( [ 4.0, 8.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const res = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.strictEqual( res, tc.INFO );
	assertClose( scale[ 0 ], tc.SCALE, 1e-14, 'scale' );
	assertClose( X[ 0 ], tc.X1, 1e-12, 'X1' );
	assertClose( X[ 1 ], tc.X2, 1e-12, 'X2' );
	assertClose( xnorm[ 0 ], tc.XNORM, 1e-12, 'xnorm' );
});

// Expected values below are from reference LAPACK 3.12.0 DLALN2 called with the same arguments.

test( 'dlaln2: 2x2 real, all coefficients below smin with B scaling (info=1)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( 4 );
	const B = new Float64Array( [ 2.0, 1.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 1, 'info' );
	assertClose( scale[ 0 ], 0.5, 1e-15, 'scale' );
	assertClose( xnorm[ 0 ], 2.24711641857789488e+307, 1e-15, 'xnorm' );
	assertClose( X[ 0 ], 2.24711641857789488e+307, 1e-15, 'X1' );
	assertClose( X[ 1 ], 1.12355820928894744e+307, 1e-15, 'X2' );
});

test( 'dlaln2: 2x2 real, all coefficients below a user smin (perturbed, no scaling)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( [ 0.1, 0.3, 0.2, 0.4 ] );
	const B = new Float64Array( [ 2.0, 1.0, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( false, 2, 1, 1.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 1, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale' );
	assert.equal( xnorm[ 0 ], 2.0, 'xnorm' );

	// X = ( scale / smin ) * B:
	assert.equal( X[ 0 ], 2.0, 'X1' );
	assert.equal( X[ 1 ], 1.0, 'X2' );
});

test( 'dlaln2: 2x2 real, tiny pivot U22 forces scaling of the right-hand side', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1e-300 ] );
	const B = new Float64Array( [ 1.0, 1e10, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 0, 'info' );
	assertClose( scale[ 0 ], 1.00000000000000004e-10, 1e-15, 'scale' );
	assertClose( xnorm[ 0 ], 9.99999999999999904e+299, 1e-15, 'xnorm' );
	assertClose( X[ 0 ], 1.00000000000000004e-10, 1e-15, 'X1' );
	assertClose( X[ 1 ], 9.99999999999999904e+299, 1e-15, 'X2' );

	// Residual: A*X = scale*B
	assertClose( A[ 3 ] * X[ 1 ], scale[ 0 ] * B[ 1 ], 1e-15, 'residual row 2' );
});

test( 'dlaln2: 2x2 real, large solution with large coefficients is rescaled', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( [ 1e10, 0.0, 0.0, 1e-290 ] );
	const B = new Float64Array( [ 1.0, 1e10, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( false, 2, 1, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 0, 'info' );
	assertClose( scale[ 0 ] * 1e298, 4.45014771701440277, 1e-15, 'scale' );
	assertClose( xnorm[ 0 ], 4.45014771701440225e+02, 1e-15, 'xnorm' );
	assertClose( X[ 0 ] * 1e308, 4.45014771701440277, 1e-15, 'X1' );
	assertClose( X[ 1 ], 4.45014771701440225e+02, 1e-15, 'X2' );

	// Residual: A*X = scale*B
	assertClose( ( A[ 0 ] * X[ 0 ] ) / ( scale[ 0 ] * B[ 0 ] ), 1.0, 1e-15, 'residual row 1' );
	assertClose( ( A[ 3 ] * X[ 1 ] ) / ( scale[ 0 ] * B[ 1 ] ), 1.0, 1e-15, 'residual row 2' );
});

test( 'dlaln2: 2x2 complex, all coefficients below smin with B scaling (info=1)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( 4 );
	const B = new Float64Array( [ 2.0, 1.0, 0.5, 0.25 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( false, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 1, 'info' );
	assertClose( scale[ 0 ], 4.00000000000000022e-01, 1e-15, 'scale' );
	assertClose( xnorm[ 0 ], 2.24711641857789488e+307, 1e-15, 'xnorm' );
	assertClose( X[ 0 ], 1.79769313486231601e+307, 1e-15, 'X1re' );
	assertClose( X[ 1 ], 8.98846567431158004e+306, 1e-15, 'X2re' );
	assertClose( X[ 2 ], 4.49423283715579002e+306, 1e-15, 'X1im' );
	assertClose( X[ 3 ], 2.24711641857789501e+306, 1e-15, 'X2im' );
});

test( 'dlaln2: 2x2 complex, singular system perturbs U22 to smin (info=1)', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( true, 2, 2, 1e-3, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 1, 'info' );
	assertClose( scale[ 0 ], 0.5, 1e-15, 'scale' );
	assertClose( xnorm[ 0 ], 1000.0, 1e-13, 'xnorm' );
	assertClose( X[ 0 ], -499.5, 1e-13, 'X1re' );
	assertClose( X[ 1 ], 500.0, 1e-13, 'X2re' );
	assertClose( X[ 2 ], -498.5, 1e-13, 'X1im' );
	assertClose( X[ 3 ], 500.0, 1e-13, 'X2im' );
});

test( 'dlaln2: 2x2 complex, large solution with large coefficients is rescaled', function t() {
	const scale = new Float64Array( 1 );
	const xnorm = new Float64Array( 1 );
	const A = new Float64Array( [ 1e10, 0.0, 0.0, 1e-290 ] );
	const B = new Float64Array( [ 1.0, 1e10, 0.0, 0.0 ] );
	const X = new Float64Array( 4 );

	const info = dlaln2( false, 2, 2, 0.0, 1.0, A, 1, 2, 0, 1.0, 1.0, B, 1, 2, 0, 0.0, 0.0, X, 1, 2, 0, scale, xnorm );
	assert.equal( info, 0, 'info' );
	assertClose( scale[ 0 ] * 1e298, 4.45014771701440277, 1e-15, 'scale' );
	assertClose( xnorm[ 0 ], 4.45014771701440225e+02, 1e-15, 'xnorm' );
	assertClose( X[ 0 ] * 1e308, 4.45014771701440277, 1e-15, 'X1re' );
	assertClose( X[ 1 ], 4.45014771701440225e+02, 1e-15, 'X2re' );
	assert.equal( X[ 2 ], 0.0, 'X1im' );
	assert.equal( X[ 3 ], 0.0, 'X2im' );
});
