// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyev from './../lib/ndarray.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlascl from './../../dlascl/lib/base.js';
import dscal from '../../../blas/dscal/lib/base.js';
import { importWithDependencies } from '../../../../test/harness/constants.js';

// FIXTURES //

import jobz_v_uplo_l_4x4 from './fixtures/jobz_v_uplo_l_4x4.json' with { type: 'json' };
import jobz_v_uplo_u_4x4 from './fixtures/jobz_v_uplo_u_4x4.json' with { type: 'json' };
import jobz_n_uplo_l_4x4 from './fixtures/jobz_n_uplo_l_4x4.json' with { type: 'json' };
import jobz_n_uplo_u_4x4 from './fixtures/jobz_n_uplo_u_4x4.json' with { type: 'json' };
import jobz_v_uplo_l_3x3 from './fixtures/jobz_v_uplo_l_3x3.json' with { type: 'json' };
import jobz_v_uplo_u_3x3 from './fixtures/jobz_v_uplo_u_3x3.json' with { type: 'json' };
import n1_jobz_v from './fixtures/n1_jobz_v.json' with { type: 'json' };
import n1_jobz_n from './fixtures/n1_jobz_n.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import diagonal_4x4 from './fixtures/diagonal_4x4.json' with { type: 'json' };
import jobz_n_uplo_l_3x3 from './fixtures/jobz_n_uplo_l_3x3.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Returns a column-major matrix stored in a Float64Array.
*
* @param {Array<Array<number>>} mat - 2D array (row-major)
* @returns {Float64Array} column-major flat array
*/
function colMajor( mat ) {
	const m = mat.length;
	const n = mat[ 0 ].length;
	const out = new Float64Array( m * n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			out[ j * m + i ] = mat[ i ][ j ];
		}
	}
	return out;
}

/**
* Checks that Z^T * Z = I (orthogonality).
*/
function assertOrthogonal( Z, N, tol, msg ) {
	let i, j, k, sum;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				// Z is column-major: Z[k + i*N] is row k, col i
				sum += Z[ k + i * N ] * Z[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, tol, msg + ': Z^T*Z[' + i + ',' + j + '] should be 1' );
			} else {
				assert.ok( Math.abs( sum ) < tol, msg + ': Z^T*Z[' + i + ',' + j + '] should be 0, got ' + sum );
			}
		}
	}
}

/**
* Checks that A * Z = Z * diag(W) (eigendecomposition).
* A_orig is column-major N-by-N, Z is column-major N-by-N, W is length-N.
*/
function assertEigendecomp( A_orig, Z, W, N, tol, msg ) {
	let az_ij, zw_ij, i, j, k;
	// For each column j of Z (eigenvector j), check A * z_j = w_j * z_j
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// (A * Z)_{i,j} = sum_k A_{i,k} * Z_{k,j}
			az_ij = 0.0;
			for ( k = 0; k < N; k++ ) {
				az_ij += A_orig[ i + k * N ] * Z[ k + j * N ];
			}
			// (Z * diag(W))_{i,j} = Z_{i,j} * W_j
			zw_ij = Z[ i + j * N ] * W[ j ];
			assertClose( az_ij, zw_ij, tol, msg + ': A*Z vs Z*diag(W) at (' + i + ',' + j + ')' );
		}
	}
}

/**
* The 4x4 symmetric test matrix used in fixtures.
*/
function matrix4x4() {
	return colMajor([
		[ 4.0, 1.0, 2.0, 0.5 ],
		[ 1.0, 5.0, 1.0, 1.5 ],
		[ 2.0, 1.0, 6.0, 0.5 ],
		[ 0.5, 1.5, 0.5, 7.0 ]
	]);
}

/**
* The 3x3 symmetric test matrix used in fixtures.
*/
function matrix3x3() {
	return colMajor([
		[ 5.0, 1.0, 2.0 ],
		[ 1.0, 4.0, 1.0 ],
		[ 2.0, 1.0, 6.0 ]
	]);
}

// TESTS //

test( 'dsyev: JOBZ=V, UPLO=L, 4x4 SPD — eigenvalues + eigenvectors', function t() {
	const tc = jobz_v_uplo_l_4x4;
	const A_orig = matrix4x4();
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 4 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'lower', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dsyev: JOBZ=V, UPLO=U, 4x4 SPD — eigenvalues + eigenvectors', function t() {
	const tc = jobz_v_uplo_u_4x4;
	const A_orig = matrix4x4();
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 4 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'upper', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dsyev: JOBZ=N, UPLO=L, 4x4 — eigenvalues only', function t() {
	const tc = jobz_n_uplo_l_4x4;
	const A = matrix4x4();
	const W = new Float64Array( 4 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('no-vectors', 'lower', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsyev: JOBZ=N, UPLO=U, 4x4 — eigenvalues only', function t() {
	const tc = jobz_n_uplo_u_4x4;
	const A = matrix4x4();
	const W = new Float64Array( 4 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('no-vectors', 'upper', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsyev: JOBZ=V, UPLO=L, 3x3 — eigenvalues + eigenvectors', function t() {
	const tc = jobz_v_uplo_l_3x3;
	const A_orig = matrix3x3();
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 3 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 3, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 3, 1e-12, 'eigendecomp' );
});

test( 'dsyev: JOBZ=V, UPLO=U, 3x3 — eigenvalues + eigenvectors', function t() {
	const tc = jobz_v_uplo_u_3x3;
	const A_orig = matrix3x3();
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 3 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'upper', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 3, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 3, 1e-12, 'eigendecomp' );
});

test( 'dsyev: N=1, JOBZ=V — single eigenvalue', function t() {
	const tc = n1_jobz_v;
	const A = new Float64Array( [ 3.5 ] );
	const W = new Float64Array( 1 );
	const WORK = new Float64Array( 10 );

	const info = dsyev('compute-vectors', 'lower', 1, A, 1, 1, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
	assertClose( A[ 0 ], tc.a11, 1e-15, 'a11' );
});

test( 'dsyev: N=1, JOBZ=N — single eigenvalue', function t() {
	const tc = n1_jobz_n;
	const A = new Float64Array( [ 7.25 ] );
	const W = new Float64Array( 1 );
	const WORK = new Float64Array( 10 );

	const info = dsyev('no-vectors', 'upper', 1, A, 1, 1, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
});

test( 'dsyev: N=0 — quick return', function t() {
	const tc = n0;
	const A = new Float64Array( 1 );
	const W = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );

	const info = dsyev('compute-vectors', 'lower', 0, A, 1, 1, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'dsyev: JOBZ=V, UPLO=L, diagonal 4x4 — sorted eigenvalues', function t() {
	const tc = diagonal_4x4;
	const A_orig = colMajor([
		[ 3.0, 0.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 4.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 2.0 ]
	]);
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 4 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'lower', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-14, 'eigenvalues' );
	assertOrthogonal( A, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 4, 1e-13, 'eigendecomp' );
});

test( 'dsyev: JOBZ=N, UPLO=L, 3x3 — eigenvalues only', function t() {
	const tc = jobz_n_uplo_l_3x3;
	const A = matrix3x3();
	const W = new Float64Array( 3 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('no-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsyev: JOBZ=V, scaling path — tiny matrix elements (near underflow)', function t() {
	// Matrix with very small elements to trigger the scale-up path
	const scale = 1e-154; // below sqrt(smlnum)
	const A_orig = colMajor([
		[ 4.0 * scale, 1.0 * scale, 2.0 * scale ],
		[ 1.0 * scale, 5.0 * scale, 1.0 * scale ],
		[ 2.0 * scale, 1.0 * scale, 6.0 * scale ]
	]);
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 3 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	// Eigenvalues should be scale * eigenvalues_of_unscaled
	// Check ascending order
	assert.ok( W[ 0 ] <= W[ 1 ], 'ascending order' );
	assert.ok( W[ 1 ] <= W[ 2 ], 'ascending order' );
	// Verify eigendecomposition: A * Z = Z * diag(W)
	assertOrthogonal( A, 3, 1e-10, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 3, 1e-8, 'eigendecomp' );
});

test( 'dsyev: JOBZ=V, scaling path — large matrix elements (near overflow)', function t() {
	// Matrix with very large elements to trigger the scale-down path
	const scale = 1e154; // above sqrt(bignum)
	const A_orig = colMajor([
		[ 4.0 * scale, 1.0 * scale, 2.0 * scale ],
		[ 1.0 * scale, 5.0 * scale, 1.0 * scale ],
		[ 2.0 * scale, 1.0 * scale, 6.0 * scale ]
	]);
	const A = new Float64Array( A_orig );
	const W = new Float64Array( 3 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('compute-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	// Check ascending order
	assert.ok( W[ 0 ] <= W[ 1 ], 'ascending order' );
	assert.ok( W[ 1 ] <= W[ 2 ], 'ascending order' );
	// Verify eigendecomposition
	assertOrthogonal( A, 3, 1e-10, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 3, 1e-8, 'eigendecomp' );
});

test( 'dsyev: JOBZ=N, scaling path — tiny matrix elements', function t() {
	// Eigenvalues only with scaling
	const scale = 1e-154;
	const A = colMajor([
		[ 4.0 * scale, 1.0 * scale ],
		[ 1.0 * scale, 5.0 * scale ]
	]);
	const W = new Float64Array( 2 );
	const WORK = new Float64Array( 200 );

	const info = dsyev('no-vectors', 'lower', 2, A, 1, 2, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	// 2x2 symmetric: eigenvalues are (9 +/- sqrt(5))/2 * scale
	// = (4+5)/2 +/- sqrt((4-5)^2/4 + 1) * scale
	// = 4.5 +/- sqrt(1.25) * scale
	const expected0 = ( 4.5 - Math.sqrt( 1.25 ) ) * scale;
	const expected1 = ( 4.5 + Math.sqrt( 1.25 ) ) * scale;
	assertClose( W[ 0 ], expected0, 1e-10, 'w0' );
	assertClose( W[ 1 ], expected1, 1e-10, 'w1' );
});

// Ticket 0089 //

// Reference thresholds (data/lapack-3.12.0/SRC/dsyev.f): SAFMIN = DLAMCH( 'S' ) = 2^-1022 and EPS = DLAMCH( 'P' ) = 2^-52 give SMLNUM = 2^-970, RMIN = SQRT( SMLNUM ) = 2^-485 and RMAX = SQRT( BIGNUM ) = 2^485. With DLAMCH( 'E' ) = 2^-53 they would be 2^-484.5 and 2^484.5 instead.
const RMIN_P = Math.pow( 2.0, -485 );
const RMAX_P = Math.pow( 2.0, 485 );

/**
* Runs dsyev on T = s * tridiag( 1, 2, 1 ) stored as a full 3x3 matrix (lower), through a module whose scaling dependencies are spied on.
*
* @private
* @param {Function} mod - dsyev base implementation
* @param {number} s - scale of the matrix ( max|T| = 2s )
* @returns {Object} info and eigenvalues
*/
function run( mod, s ) {
	const A = new Float64Array( [ 2.0 * s, s, 0.0, s, 2.0 * s, s, 0.0, s, 2.0 * s ] );
	const w = new Float64Array( 3 );
	const info = mod( 'compute-vectors', 'lower', 3, A, 1, 3, 0, w, 1, 0, new Float64Array( 100 ), 1, 0 );
	return { 'info': info, 'w': w };
}

/**
* Asserts that `w` holds the eigenvalues of s * tridiag( 1, 2, 1 ), i.e. s * ( 2 - sqrt(2) ), 2s, s * ( 2 + sqrt(2) ).
*
* @private
* @param {Float64Array} w - computed eigenvalues
* @param {number} s - scale
* @param {string} msg - message
*/
function assertSpectrum( w, s, msg ) {
	const ref = [ s * ( 2.0 - Math.SQRT2 ), 2.0 * s, s * ( 2.0 + Math.SQRT2 ) ];
	let i;
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( w[ i ] - ref[ i ] ) <= 1e-13 * ref[ i ], msg + ': w[' + i + '] expected ' + ref[ i ] + ', got ' + w[ i ] ); // eslint-disable-line max-len
	}
}

test( 'dsyev: matrix norm between the DLAMCH(P) and DLAMCH(E) RMIN/RMAX thresholds is not rescaled (ticket 0089)', async function t() {
	const calls = [];
	const mod = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dlascl/lib/base.js': function spyDlascl() {
			calls.push( 'dlascl' );
			return dlascl.apply( null, arguments );
		},
		'../../../blas/dscal/lib/base.js': function spyDscal() {
			calls.push( 'dscal' );
			return dscal.apply( null, arguments );
		}
	}) ).default;
	let out;
	let s;

	// Control: max|T| = 0.5 * RMIN_P is below both thresholds, so the matrix is rescaled.
	s = 0.25 * RMIN_P;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (control)' );
	assert.ok( calls.length > 0, 'rescaled (control)' );
	assertSpectrum( out.w, s, 'control' );

	// max|T| = 1.2 * RMIN_P lies in ( RMIN_P, RMIN_E ) = ( 1, 1.414 ) * RMIN_P: no rescaling.
	s = 0.6 * RMIN_P;
	calls.length = 0;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (below RMIN_E)' );
	assert.deepEqual( calls, [], 'not rescaled (below RMIN_E)' );
	assertSpectrum( out.w, s, 'below RMIN_E' );

	// max|T| = 0.9 * RMAX_P lies in ( RMAX_E, RMAX_P ) = ( 0.707, 1 ) * RMAX_P: no rescaling.
	s = 0.45 * RMAX_P;
	calls.length = 0;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (above RMAX_E)' );
	assert.deepEqual( calls, [], 'not rescaled (above RMAX_E)' );
	assertSpectrum( out.w, s, 'above RMAX_E' );
});
