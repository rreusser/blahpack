/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggev from '../lib/ndarray.js';

/**
* Allocates a complex workspace of the minimum size required by zggev.
*/
function makeWork( N ) {
	return new Complex128Array( N + Math.max( 1, ( N * 32 ) + ( 33 * 32 ) ) );
}

/**
* Allocates a real workspace of the minimum size required by zggev.
*/
function makeRWork( N ) {
	return new Float64Array( Math.max( 1, 8 * N ) );
}

// Load fixture

// FIXTURES //

import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import right_evec_3x3 from './fixtures/right_evec_3x3.json' with { type: 'json' };
import both_evec_3x3 from './fixtures/both_evec_3x3.json' with { type: 'json' };
import eig_only_3x3 from './fixtures/eig_only_3x3.json' with { type: 'json' };
import diagonal_2x2 from './fixtures/diagonal_2x2.json' with { type: 'json' };
import n_eq_1_noevec from './fixtures/n_eq_1_noevec.json' with { type: 'json' };
import left_evec_2x2 from './fixtures/left_evec_2x2.json' with { type: 'json' };
/**
* Assert that two floating-point numbers are close.
*/
function assertClose( actual, expected, tol, msg ) {
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected 0, got ' + actual );
		return;
	}
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* Assert that two complex arrays are close, element by element.
* Operates on a Float64 view of the complex array.
*/
function assertComplexArrayClose( actual, offsetActual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ offsetActual + i ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

test( 'zggev: N=0 quick return', function t() {

	const ALPHA = new Complex128Array( 1 );
	const BETA = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const VR = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const info = zggev( 'none', 'none', 0, A, 1, 1, 0, B, 1, 1, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, makeWork( 0 ), 1, 0, makeRWork( 0 ), 1, 0);
	assert.strictEqual( info, 0 );
});

test( 'zggev: N=1 with eigenvectors', function t() {

	const tc = n_eq_1;
	const N = 1;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const VLv = reinterpret( VL, 0 );
	const VRv = reinterpret( VR, 0 );
	const tol = 1e-13;
	Av[ 0 ] = 3.0;
	Av[ 1 ] = 1.0;
	Bv[ 0 ] = 2.0;
	Bv[ 1 ] = 0.5;
	const info = zggev( 'compute', 'compute', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
	assertComplexArrayClose( VLv, 0, tc.VL, tol, 'VL' );
	assertComplexArrayClose( VRv, 0, tc.VR, tol, 'VR' );
});

test( 'zggev: 3x3 right eigenvectors only', function t() {

	const tc = right_evec_3x3;
	const N = 3;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const VRv = reinterpret( VR, 0 );
	const tol = 1e-12;
	Av[ 0 ] = 2.0;
	Av[ 1 ] = 1.0;
	Av[ 2 ] = 1.0;
	Av[ 3 ] = -1.0;
	Av[ 4 ] = 0.5;
	Av[ 5 ] = 0.5;
	Av[ 6 ] = 1.0;
	Av[ 7 ] = 0.5;
	Av[ 8 ] = 3.0;
	Av[ 9 ] = 0.0;
	Av[ 10 ] = 0.5;
	Av[ 11 ] = -0.5;
	Av[ 12 ] = 0.5;
	Av[ 13 ] = -0.5;
	Av[ 14 ] = 1.0;
	Av[ 15 ] = 1.0;
	Av[ 16 ] = 4.0;
	Av[ 17 ] = -1.0;
	Bv[ 0 ] = 3.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.5;
	Bv[ 3 ] = -0.5;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.5;
	Bv[ 6 ] = 1.0;
	Bv[ 7 ] = 0.5;
	Bv[ 8 ] = 2.0;
	Bv[ 9 ] = 1.0;
	Bv[ 10 ] = 0.5;
	Bv[ 11 ] = 0.0;
	Bv[ 12 ] = 0.5;
	Bv[ 13 ] = 0.5;
	Bv[ 14 ] = 1.0;
	Bv[ 15 ] = 0.0;
	Bv[ 16 ] = 1.0;
	Bv[ 17 ] = 0.5;
	const info = zggev( 'none', 'compute', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
	assertComplexArrayClose( VRv, 0, tc.VR_col1, tol, 'VR_col1' );
	assertComplexArrayClose( VRv, 2 * N, tc.VR_col2, tol, 'VR_col2' );
	assertComplexArrayClose( VRv, 4 * N, tc.VR_col3, tol, 'VR_col3' );
});

test( 'zggev: 3x3 both eigenvectors', function t() {

	const tc = both_evec_3x3;
	const N = 3;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const VLv = reinterpret( VL, 0 );
	const VRv = reinterpret( VR, 0 );
	const tol = 1e-12;
	Av[ 0 ] = 2.0;
	Av[ 1 ] = 1.0;
	Av[ 2 ] = 1.0;
	Av[ 3 ] = -1.0;
	Av[ 4 ] = 0.5;
	Av[ 5 ] = 0.5;
	Av[ 6 ] = 1.0;
	Av[ 7 ] = 0.5;
	Av[ 8 ] = 3.0;
	Av[ 9 ] = 0.0;
	Av[ 10 ] = 0.5;
	Av[ 11 ] = -0.5;
	Av[ 12 ] = 0.5;
	Av[ 13 ] = -0.5;
	Av[ 14 ] = 1.0;
	Av[ 15 ] = 1.0;
	Av[ 16 ] = 4.0;
	Av[ 17 ] = -1.0;
	Bv[ 0 ] = 3.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.5;
	Bv[ 3 ] = -0.5;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.5;
	Bv[ 6 ] = 1.0;
	Bv[ 7 ] = 0.5;
	Bv[ 8 ] = 2.0;
	Bv[ 9 ] = 1.0;
	Bv[ 10 ] = 0.5;
	Bv[ 11 ] = 0.0;
	Bv[ 12 ] = 0.5;
	Bv[ 13 ] = 0.5;
	Bv[ 14 ] = 1.0;
	Bv[ 15 ] = 0.0;
	Bv[ 16 ] = 1.0;
	Bv[ 17 ] = 0.5;
	const info = zggev( 'compute', 'compute', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
	assertComplexArrayClose( VLv, 0, tc.VL_col1, tol, 'VL_col1' );
	assertComplexArrayClose( VLv, 2 * N, tc.VL_col2, tol, 'VL_col2' );
	assertComplexArrayClose( VLv, 4 * N, tc.VL_col3, tol, 'VL_col3' );
	assertComplexArrayClose( VRv, 0, tc.VR_col1, tol, 'VR_col1' );
	assertComplexArrayClose( VRv, 2 * N, tc.VR_col2, tol, 'VR_col2' );
	assertComplexArrayClose( VRv, 4 * N, tc.VR_col3, tol, 'VR_col3' );
});

test( 'zggev: 3x3 eigenvalues only', function t() {

	const tc = eig_only_3x3;
	const N = 3;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const tol = 1e-12;
	Av[ 0 ] = 2.0;
	Av[ 1 ] = 1.0;
	Av[ 2 ] = 1.0;
	Av[ 3 ] = -1.0;
	Av[ 4 ] = 0.5;
	Av[ 5 ] = 0.5;
	Av[ 6 ] = 1.0;
	Av[ 7 ] = 0.5;
	Av[ 8 ] = 3.0;
	Av[ 9 ] = 0.0;
	Av[ 10 ] = 0.5;
	Av[ 11 ] = -0.5;
	Av[ 12 ] = 0.5;
	Av[ 13 ] = -0.5;
	Av[ 14 ] = 1.0;
	Av[ 15 ] = 1.0;
	Av[ 16 ] = 4.0;
	Av[ 17 ] = -1.0;
	Bv[ 0 ] = 3.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.5;
	Bv[ 3 ] = -0.5;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.5;
	Bv[ 6 ] = 1.0;
	Bv[ 7 ] = 0.5;
	Bv[ 8 ] = 2.0;
	Bv[ 9 ] = 1.0;
	Bv[ 10 ] = 0.5;
	Bv[ 11 ] = 0.0;
	Bv[ 12 ] = 0.5;
	Bv[ 13 ] = 0.5;
	Bv[ 14 ] = 1.0;
	Bv[ 15 ] = 0.0;
	Bv[ 16 ] = 1.0;
	Bv[ 17 ] = 0.5;
	const info = zggev( 'none', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
});

test( 'zggev: 2x2 diagonal', function t() {

	const tc = diagonal_2x2;
	const N = 2;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const VLv = reinterpret( VL, 0 );
	const VRv = reinterpret( VR, 0 );
	const tol = 1e-13;
	Av[ 0 ] = 4.0;
	Av[ 1 ] = 0.0;
	Av[ 2 ] = 0.0;
	Av[ 3 ] = 0.0;
	Av[ 4 ] = 0.0;
	Av[ 5 ] = 0.0;
	Av[ 6 ] = 6.0;
	Av[ 7 ] = 0.0;
	Bv[ 0 ] = 2.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 3.0;
	Bv[ 7 ] = 0.0;
	const info = zggev( 'compute', 'compute', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
	assertComplexArrayClose( VLv, 0, tc.VL_col1, tol, 'VL_col1' );
	assertComplexArrayClose( VLv, 2 * N, tc.VL_col2, tol, 'VL_col2' );
	assertComplexArrayClose( VRv, 0, tc.VR_col1, tol, 'VR_col1' );
	assertComplexArrayClose( VRv, 2 * N, tc.VR_col2, tol, 'VR_col2' );
});

test( 'zggev: N=1 no eigenvectors', function t() {

	const tc = n_eq_1_noevec;
	const N = 1;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const tol = 1e-13;
	Av[ 0 ] = 5.0;
	Av[ 1 ] = 2.0;
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 0.0;
	const info = zggev( 'none', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
});

test( 'zggev: 2x2 left eigenvectors only', function t() {

	const tc = left_evec_2x2;
	const N = 2;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const VLv = reinterpret( VL, 0 );
	const tol = 1e-12;
	Av[ 0 ] = 1.0;
	Av[ 1 ] = 2.0;
	Av[ 2 ] = 0.5;
	Av[ 3 ] = 0.5;
	Av[ 4 ] = 3.0;
	Av[ 5 ] = -1.0;
	Av[ 6 ] = 4.0;
	Av[ 7 ] = 1.0;
	Bv[ 0 ] = 2.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 1.0;
	Bv[ 5 ] = 1.0;
	Bv[ 6 ] = 3.0;
	Bv[ 7 ] = -0.5;
	const info = zggev( 'compute', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, tc.info );
	assertComplexArrayClose( ALPHAv, 0, tc.alpha, tol, 'alpha' );
	assertComplexArrayClose( BETAv, 0, tc.beta, tol, 'beta' );
	assertComplexArrayClose( VLv, 0, tc.VL_col1, tol, 'VL_col1' );
	assertComplexArrayClose( VLv, 2 * N, tc.VL_col2, tol, 'VL_col2' );
});

test( 'zggev: small entries trigger anrm < smlnum scaling', function t() {

	const N = 2;
	const LDA = N;
	const scale = 1e-300;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const tol = 1e-10;
	Av[ 0 ] = 4.0 * scale;
	Av[ 1 ] = 0.0;
	Av[ 2 ] = 0.0;
	Av[ 3 ] = 0.0;
	Av[ 4 ] = 0.0;
	Av[ 5 ] = 0.0;
	Av[ 6 ] = 6.0 * scale;
	Av[ 7 ] = 0.0;
	Bv[ 0 ] = 2.0 * scale;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 3.0 * scale;
	Bv[ 7 ] = 0.0;
	const info = zggev( 'none', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, 0, 'info' );
	assertClose( ALPHAv[0] / BETAv[0], 2.0, tol, 'eigenvalue 0 ratio' );
	assertClose( ALPHAv[2] / BETAv[2], 2.0, tol, 'eigenvalue 1 ratio' );
});

test( 'zggev: large entries trigger anrm > bignum scaling', function t() {

	const N = 2;
	const LDA = N;
	const scale = 1e+300;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const tol = 1e-10;
	Av[ 0 ] = 4.0 * scale;
	Av[ 1 ] = 0.0;
	Av[ 2 ] = 0.0;
	Av[ 3 ] = 0.0;
	Av[ 4 ] = 0.0;
	Av[ 5 ] = 0.0;
	Av[ 6 ] = 6.0 * scale;
	Av[ 7 ] = 0.0;
	Bv[ 0 ] = 2.0 * scale;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 3.0 * scale;
	Bv[ 7 ] = 0.0;
	const info = zggev( 'none', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, 0, 'info' );
	assertClose( ALPHAv[0] / BETAv[0], 2.0, tol, 'eigenvalue 0 ratio' );
	assertClose( ALPHAv[2] / BETAv[2], 2.0, tol, 'eigenvalue 1 ratio' );
});

test( 'zggev: small B entries trigger bnrm < smlnum scaling', function t() {

	const N = 2;
	const LDA = N;
	const scale = 1e-300;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	Av[ 0 ] = 4.0;
	Av[ 1 ] = 0.0;
	Av[ 2 ] = 0.0;
	Av[ 3 ] = 0.0;
	Av[ 4 ] = 0.0;
	Av[ 5 ] = 0.0;
	Av[ 6 ] = 6.0;
	Av[ 7 ] = 0.0;
	Bv[ 0 ] = 2.0 * scale;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 3.0 * scale;
	Bv[ 7 ] = 0.0;
	const info = zggev( 'none', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, 0, 'info' );
});

test( 'zggev: large B entries trigger bnrm > bignum scaling', function t() {

	const N = 2;
	const LDA = N;
	const scale = 1e+300;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	Av[ 0 ] = 4.0;
	Av[ 1 ] = 0.0;
	Av[ 2 ] = 0.0;
	Av[ 3 ] = 0.0;
	Av[ 4 ] = 0.0;
	Av[ 5 ] = 0.0;
	Av[ 6 ] = 6.0;
	Av[ 7 ] = 0.0;
	Bv[ 0 ] = 2.0 * scale;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 3.0 * scale;
	Bv[ 7 ] = 0.0;
	const info = zggev( 'none', 'none', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, 0, 'info' );
});

test( 'zggev: both A and B scaled (small A, large B) with eigenvectors', function t() { // eslint-disable-line max-len

	const N = 2;
	const LDA = N;
	const A = new Complex128Array( LDA * N );
	const B = new Complex128Array( LDA * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const ALPHAv = reinterpret( ALPHA, 0 );
	const BETAv = reinterpret( BETA, 0 );
	const tol = 1e-8;
	Av[ 0 ] = 1e-300;
	Av[ 1 ] = 0.0;
	Av[ 2 ] = 0.0;
	Av[ 3 ] = 0.0;
	Av[ 4 ] = 0.0;
	Av[ 5 ] = 0.0;
	Av[ 6 ] = 2e-300;
	Av[ 7 ] = 0.0;
	Bv[ 0 ] = 1e+300;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 0.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 0.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 1e+300;
	Bv[ 7 ] = 0.0;
	const info = zggev( 'compute', 'compute', N, A, 1, LDA, 0, B, 1, LDA, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, makeWork( N ), 1, 0, makeRWork( N ), 1, 0);
	assert.strictEqual( info, 0, 'info' );
	assert.ok( isFinite( ALPHAv[0] ), 'alpha[0] is finite' );
	assert.ok( isFinite( BETAv[0] ), 'beta[0] is finite' );
});
