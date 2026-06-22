// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsyl from './../lib/ndarray.js';

// FIXTURES //

import nn_basic_2x2 from './fixtures/nn_basic_2x2.json' with { type: 'json' };
import nn_isgn__1 from './fixtures/nn_isgn_-1.json' with { type: 'json' };
import cn_basic from './fixtures/cn_basic.json' with { type: 'json' };
import nc_basic from './fixtures/nc_basic.json' with { type: 'json' };
import cc_basic from './fixtures/cc_basic.json' with { type: 'json' };
import m_0 from './fixtures/m_0.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import m_1_n_1 from './fixtures/m_1_n_1.json' with { type: 'json' };
import nn_3x3 from './fixtures/nn_3x3.json' with { type: 'json' };
import cn_3x3 from './fixtures/cn_3x3.json' with { type: 'json' };
import cc_isgn__1_3x3 from './fixtures/cc_isgn_-1_3x3.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build the standard 2x2 test matrices A, B, C for the complex Sylvester tests.
* Returns { A, B, C } as Complex128Arrays with Float64Array views.
* Uses LDA=MAXN=3 in Fortran, but JS uses compact N=2 (stride = 1, N).
*/
function build2x2() {
	var N = 2;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	// A(0,0) = (1, 0.5)
	Av[ (0 + 0*N)*2 ] = 1.0; Av[ (0 + 0*N)*2 + 1 ] = 0.5;
	// A(0,1) = (0.3, 0.1)
	Av[ (0 + 1*N)*2 ] = 0.3; Av[ (0 + 1*N)*2 + 1 ] = 0.1;
	// A(1,1) = (3, -0.5)
	Av[ (1 + 1*N)*2 ] = 3.0; Av[ (1 + 1*N)*2 + 1 ] = -0.5;

	var B = new Complex128Array( N * N );
	var Bv = reinterpret( B, 0 );
	// B(0,0) = (2, 0.3)
	Bv[ (0 + 0*N)*2 ] = 2.0; Bv[ (0 + 0*N)*2 + 1 ] = 0.3;
	// B(0,1) = (0.4, -0.2)
	Bv[ (0 + 1*N)*2 ] = 0.4; Bv[ (0 + 1*N)*2 + 1 ] = -0.2;
	// B(1,1) = (4, 0.7)
	Bv[ (1 + 1*N)*2 ] = 4.0; Bv[ (1 + 1*N)*2 + 1 ] = 0.7;

	var C = new Complex128Array( N * N );
	var Cv = reinterpret( C, 0 );
	// C(0,0) = (5, 1)
	Cv[ (0 + 0*N)*2 ] = 5.0; Cv[ (0 + 0*N)*2 + 1 ] = 1.0;
	// C(0,1) = (6, -1)
	Cv[ (0 + 1*N)*2 ] = 6.0; Cv[ (0 + 1*N)*2 + 1 ] = -1.0;
	// C(1,0) = (7, 2)
	Cv[ (1 + 0*N)*2 ] = 7.0; Cv[ (1 + 0*N)*2 + 1 ] = 2.0;
	// C(1,1) = (8, -2)
	Cv[ (1 + 1*N)*2 ] = 8.0; Cv[ (1 + 1*N)*2 + 1 ] = -2.0;

	return { A: A, B: B, C: C, Cv: Cv, N: N };
}

/**
* Build the 3x3 test matrices for larger tests.
*/
function build3x3() {
	var N = 3;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	Av[ (0 + 0*N)*2 ] = 1.0; Av[ (0 + 0*N)*2 + 1 ] = 0.5;
	Av[ (0 + 1*N)*2 ] = 0.3; Av[ (0 + 1*N)*2 + 1 ] = 0.1;
	Av[ (0 + 2*N)*2 ] = 0.1; Av[ (0 + 2*N)*2 + 1 ] = -0.05;
	Av[ (1 + 1*N)*2 ] = 2.0; Av[ (1 + 1*N)*2 + 1 ] = -0.3;
	Av[ (1 + 2*N)*2 ] = 0.2; Av[ (1 + 2*N)*2 + 1 ] = 0.15;
	Av[ (2 + 2*N)*2 ] = 3.0; Av[ (2 + 2*N)*2 + 1 ] = 0.8;

	var B = new Complex128Array( N * N );
	var Bv = reinterpret( B, 0 );
	Bv[ (0 + 0*N)*2 ] = 4.0; Bv[ (0 + 0*N)*2 + 1 ] = -0.2;
	Bv[ (0 + 1*N)*2 ] = 0.5; Bv[ (0 + 1*N)*2 + 1 ] = 0.3;
	Bv[ (0 + 2*N)*2 ] = 0.2; Bv[ (0 + 2*N)*2 + 1 ] = -0.1;
	Bv[ (1 + 1*N)*2 ] = 5.0; Bv[ (1 + 1*N)*2 + 1 ] = 0.4;
	Bv[ (1 + 2*N)*2 ] = 0.3; Bv[ (1 + 2*N)*2 + 1 ] = 0.2;
	Bv[ (2 + 2*N)*2 ] = 6.0; Bv[ (2 + 2*N)*2 + 1 ] = -0.6;

	var C = new Complex128Array( N * N );
	var Cv = reinterpret( C, 0 );
	Cv[ (0 + 0*N)*2 ] = 1.0; Cv[ (0 + 0*N)*2 + 1 ] = 2.0;
	Cv[ (0 + 1*N)*2 ] = 3.0; Cv[ (0 + 1*N)*2 + 1 ] = -1.0;
	Cv[ (0 + 2*N)*2 ] = 5.0; Cv[ (0 + 2*N)*2 + 1 ] = 0.5;
	Cv[ (1 + 0*N)*2 ] = 2.0; Cv[ (1 + 0*N)*2 + 1 ] = 4.0;
	Cv[ (1 + 1*N)*2 ] = 4.0; Cv[ (1 + 1*N)*2 + 1 ] = -2.0;
	Cv[ (1 + 2*N)*2 ] = 6.0; Cv[ (1 + 2*N)*2 + 1 ] = 1.0;
	Cv[ (2 + 0*N)*2 ] = 3.0; Cv[ (2 + 0*N)*2 + 1 ] = 6.0;
	Cv[ (2 + 1*N)*2 ] = 5.0; Cv[ (2 + 1*N)*2 + 1 ] = -3.0;
	Cv[ (2 + 2*N)*2 ] = 7.0; Cv[ (2 + 2*N)*2 + 1 ] = 1.5;

	return { A: A, B: B, C: C, Cv: Cv, N: N };
}

// TESTS //

test( 'ztrsyl: NN basic 2x2', function t() {
	var tc = nn_basic_2x2;
	var m = build2x2();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: NN isgn=-1', function t() {
	var tc = nn_isgn__1;
	var m = build2x2();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'no-transpose', -1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: CN basic (conjugate transpose A)', function t() {
	var tc = cn_basic;
	var m = build2x2();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'conjugate-transpose', 'no-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: NC basic (conjugate transpose B)', function t() {
	var tc = nc_basic;
	var m = build2x2();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'conjugate-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: CC basic (conjugate transpose both)', function t() {
	var tc = cc_basic;
	var m = build2x2();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'conjugate-transpose', 'conjugate-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: M=0 quick return', function t() {
	var tc = m_0;
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, 0, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'ztrsyl: N=0 quick return', function t() {
	var tc = n_0;
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	var C = new Complex128Array( 4 );
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, 2, 0, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'ztrsyl: M=1 N=1', function t() {
	var tc = m_1_n_1;
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var Av = reinterpret( A, 0 );
	var Bv = reinterpret( B, 0 );
	var Cv = reinterpret( C, 0 );
	Av[ 0 ] = 2.0; Av[ 1 ] = 1.0;
	Bv[ 0 ] = 3.0; Bv[ 1 ] = -1.0;
	Cv[ 0 ] = 10.0; Cv[ 1 ] = 5.0;
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, 1, 1, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: NN 3x3', function t() {
	var tc = nn_3x3;
	var m = build3x3();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: CN 3x3', function t() {
	var tc = cn_3x3;
	var m = build3x3();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'conjugate-transpose', 'no-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

test( 'ztrsyl: CC isgn=-1 3x3', function t() {
	var tc = cc_isgn__1_3x3;
	var m = build3x3();
	var scale = new Float64Array( 1 );

	var info = ztrsyl( 'conjugate-transpose', 'conjugate-transpose', -1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );

	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( Array.from( m.Cv ), tc.C, 1e-12, 'C' );
});

/**
* Build 2x2 matrices where A(k,k) + sgn*B(l,l) is near zero to trigger
* the da11 <= smin perturbation branch and info=1 return.
* A(0,0) = (eps, 0), B(0,0) = (-eps, 0) with isgn=+1 => a11 ~ 0
*/
function buildNearSingular() {
	var N = 2;
	var eps = 1e-320;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	Av[ (0 + 0*N)*2 ] = eps; Av[ (0 + 0*N)*2 + 1 ] = 0.0;
	Av[ (0 + 1*N)*2 ] = 0.1; Av[ (0 + 1*N)*2 + 1 ] = 0.05;
	Av[ (1 + 1*N)*2 ] = 2.0; Av[ (1 + 1*N)*2 + 1 ] = 0.0;

	var B = new Complex128Array( N * N );
	var Bv = reinterpret( B, 0 );
	Bv[ (0 + 0*N)*2 ] = -eps; Bv[ (0 + 0*N)*2 + 1 ] = 0.0;
	Bv[ (0 + 1*N)*2 ] = 0.2; Bv[ (0 + 1*N)*2 + 1 ] = -0.1;
	Bv[ (1 + 1*N)*2 ] = 3.0; Bv[ (1 + 1*N)*2 + 1 ] = 0.0;

	var C = new Complex128Array( N * N );
	var Cv = reinterpret( C, 0 );
	Cv[ (0 + 0*N)*2 ] = 1.0; Cv[ (0 + 0*N)*2 + 1 ] = 0.5;
	Cv[ (0 + 1*N)*2 ] = 2.0; Cv[ (0 + 1*N)*2 + 1 ] = -0.3;
	Cv[ (1 + 0*N)*2 ] = 3.0; Cv[ (1 + 0*N)*2 + 1 ] = 1.0;
	Cv[ (1 + 1*N)*2 ] = 4.0; Cv[ (1 + 1*N)*2 + 1 ] = -1.0;

	return { A: A, B: B, C: C, Cv: Cv, N: N };
}

test( 'ztrsyl: NN near-singular - da11 perturbation', function t() {
	var m = buildNearSingular();
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );
	// info=1 indicates perturbation was needed
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
	assert.ok( scale[ 0 ] > 0 && scale[ 0 ] <= 1.0, 'scale should be in (0, 1]' );
});

test( 'ztrsyl: CN near-singular - da11 perturbation with conj transpose A', function t() {
	var m = buildNearSingular();
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'conjugate-transpose', 'no-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
	assert.ok( scale[ 0 ] > 0 && scale[ 0 ] <= 1.0, 'scale should be in (0, 1]' );
});

test( 'ztrsyl: CC near-singular - da11 perturbation with conj transpose both', function t() {
	var m = buildNearSingular();
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'conjugate-transpose', 'conjugate-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
	assert.ok( scale[ 0 ] > 0 && scale[ 0 ] <= 1.0, 'scale should be in (0, 1]' );
});

test( 'ztrsyl: NC near-singular - da11 perturbation with conj transpose B', function t() {
	var m = buildNearSingular();
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'no-transpose', 'conjugate-transpose', 1, m.N, m.N, m.A, 1, m.N, 0, m.B, 1, m.N, 0, m.C, 1, m.N, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
	assert.ok( scale[ 0 ] > 0 && scale[ 0 ] <= 1.0, 'scale should be in (0, 1]' );
});

/**
* Build matrices where the RHS vector (vec) is very large relative to the
* near-zero diagonal element, triggering the scaloc scaling (da11 < 1, db > bignum*da11).
*/
function buildScalocTrigger() {
	// Need: da11 = |A(k,k) + sgn*B(l,l)| <= smin triggers perturbation to smin = EPS*max(||A||,||B||)
	// Then: db > bignum * smin requires C values ~ 3e275
	// A diagonal near-zero, off-diagonal ~ 1 so max(||A||)=1, smin=EPS
	var N = 2;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	Av[ (0 + 0*N)*2 ] = 0.0; Av[ (0 + 0*N)*2 + 1 ] = 0.0;
	Av[ (0 + 1*N)*2 ] = 1.0; Av[ (0 + 1*N)*2 + 1 ] = 0.0;
	Av[ (1 + 1*N)*2 ] = 5.0; Av[ (1 + 1*N)*2 + 1 ] = 0.0;

	var B = new Complex128Array( N * N );
	var Bv = reinterpret( B, 0 );
	Bv[ (0 + 0*N)*2 ] = 0.0; Bv[ (0 + 0*N)*2 + 1 ] = 0.0;
	Bv[ (0 + 1*N)*2 ] = 1.0; Bv[ (0 + 1*N)*2 + 1 ] = 0.0;
	Bv[ (1 + 1*N)*2 ] = 5.0; Bv[ (1 + 1*N)*2 + 1 ] = 0.0;

	var C = new Complex128Array( N * N );
	var Cv = reinterpret( C, 0 );
	// C(M-1,0) = large value to trigger scaloc at k=M-1=1, l=0 in NN path
	// Actually for NN: k goes from M-1 down to 0. At k=1, l=0:
	// suml = zdotu(0,...) = 0, sumr = zdotu(0,...) = 0
	// vec = C(1,0) = large. A(1,1)+B(0,0) = 5+0 = 5. da11=5 > smin, no perturbation needed.
	// At k=0, l=0: A(0,0)+B(0,0) = 0. da11=0 <= smin => perturbation to smin~EPS
	// vec = C(0,0) - zdotu(1, A(0,1), C(1,0)) - zdotu(0,...) = C(0,0) - A(0,1)*C(1,0)
	// Make C(0,0) large and C(1,0) such that vec remains large
	Cv[ (0 + 0*N)*2 ] = 1e276; Cv[ (0 + 0*N)*2 + 1 ] = 1e276;
	Cv[ (0 + 1*N)*2 ] = 1.0; Cv[ (0 + 1*N)*2 + 1 ] = 0.0;
	Cv[ (1 + 0*N)*2 ] = 0.0; Cv[ (1 + 0*N)*2 + 1 ] = 0.0;
	Cv[ (1 + 1*N)*2 ] = 1.0; Cv[ (1 + 1*N)*2 + 1 ] = 0.0;

	return { A: A, B: B, C: C, Cv: Cv, N: N };
}

// Tests using 2x2 matrices with A(0,0)=B(0,0)=0 and large C to trigger scaloc
test( 'ztrsyl: NN scaloc - overflow protection scaling', function t() {
	// 2x2: A(0,0)+B(0,0)=0 => perturbed. Large C triggers scaloc.
	var A = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var B = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var C = new Complex128Array( [ 2e276, 2e276, 1, 0, 0, 0, 1, 0 ] );
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'no-transpose', 'no-transpose', 1, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
});

test( 'ztrsyl: CN scaloc - overflow protection with conj transpose A', function t() {
	var A = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var B = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var C = new Complex128Array( [ 2e276, 2e276, 1, 0, 0, 0, 1, 0 ] );
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'conjugate-transpose', 'no-transpose', 1, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
});

test( 'ztrsyl: CC scaloc - overflow protection with conj transpose both', function t() {
	var A = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var B = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var C = new Complex128Array( [ 2e276, 2e276, 1, 0, 0, 0, 1, 0 ] );
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'conjugate-transpose', 'conjugate-transpose', 1, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
});

test( 'ztrsyl: NC scaloc - overflow protection with conj transpose B', function t() {
	var A = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var B = new Complex128Array( [ 0, 0, 0, 0, 1, 0, 5, 0 ] );
	var C = new Complex128Array( [ 2e276, 2e276, 1, 0, 0, 0, 1, 0 ] );
	var scale = new Float64Array( 1 );
	var info = ztrsyl( 'no-transpose', 'conjugate-transpose', 1, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, scale );
	assert.strictEqual( info, 1, 'info should be 1 (perturbed)' );
});
