// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyev from './../lib/ndarray.js';

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
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
	var m = mat.length;
	var n = mat[ 0 ].length;
	var out = new Float64Array( m * n );
	var i;
	var j;
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
	var i;
	var j;
	var k;
	var sum;
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
	var az_ij;
	var zw_ij;
	var i;
	var j;
	var k;
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
	var tc = jobz_v_uplo_l_4x4;
	var A_orig = matrix4x4();
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 4 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'lower', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dsyev: JOBZ=V, UPLO=U, 4x4 SPD — eigenvalues + eigenvectors', function t() {
	var tc = jobz_v_uplo_u_4x4;
	var A_orig = matrix4x4();
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 4 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'upper', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dsyev: JOBZ=N, UPLO=L, 4x4 — eigenvalues only', function t() {
	var tc = jobz_n_uplo_l_4x4;
	var A = matrix4x4();
	var W = new Float64Array( 4 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('no-vectors', 'lower', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsyev: JOBZ=N, UPLO=U, 4x4 — eigenvalues only', function t() {
	var tc = jobz_n_uplo_u_4x4;
	var A = matrix4x4();
	var W = new Float64Array( 4 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('no-vectors', 'upper', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsyev: JOBZ=V, UPLO=L, 3x3 — eigenvalues + eigenvectors', function t() {
	var tc = jobz_v_uplo_l_3x3;
	var A_orig = matrix3x3();
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 3 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 3, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 3, 1e-12, 'eigendecomp' );
});

test( 'dsyev: JOBZ=V, UPLO=U, 3x3 — eigenvalues + eigenvectors', function t() {
	var tc = jobz_v_uplo_u_3x3;
	var A_orig = matrix3x3();
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 3 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'upper', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( A, 3, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 3, 1e-12, 'eigendecomp' );
});

test( 'dsyev: N=1, JOBZ=V — single eigenvalue', function t() {
	var tc = n1_jobz_v;
	var A = new Float64Array( [ 3.5 ] );
	var W = new Float64Array( 1 );
	var WORK = new Float64Array( 10 );
	var info;

	info = dsyev('compute-vectors', 'lower', 1, A, 1, 1, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
	assertClose( A[ 0 ], tc.a11, 1e-15, 'a11' );
});

test( 'dsyev: N=1, JOBZ=N — single eigenvalue', function t() {
	var tc = n1_jobz_n;
	var A = new Float64Array( [ 7.25 ] );
	var W = new Float64Array( 1 );
	var WORK = new Float64Array( 10 );
	var info;

	info = dsyev('no-vectors', 'upper', 1, A, 1, 1, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
});

test( 'dsyev: N=0 — quick return', function t() {
	var tc = n0;
	var A = new Float64Array( 1 );
	var W = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info;

	info = dsyev('compute-vectors', 'lower', 0, A, 1, 1, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'dsyev: JOBZ=V, UPLO=L, diagonal 4x4 — sorted eigenvalues', function t() {
	var tc = diagonal_4x4;
	var A_orig = colMajor([
		[ 3.0, 0.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 4.0, 0.0 ],
		[ 0.0, 0.0, 0.0, 2.0 ]
	]);
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 4 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'lower', 4, A, 1, 4, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-14, 'eigenvalues' );
	assertOrthogonal( A, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( A_orig, A, W, 4, 1e-13, 'eigendecomp' );
});

test( 'dsyev: JOBZ=N, UPLO=L, 3x3 — eigenvalues only', function t() {
	var tc = jobz_n_uplo_l_3x3;
	var A = matrix3x3();
	var W = new Float64Array( 3 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('no-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsyev: JOBZ=V, scaling path — tiny matrix elements (near underflow)', function t() {
	// Matrix with very small elements to trigger the scale-up path
	var scale = 1e-154; // below sqrt(smlnum)
	var A_orig = colMajor([
		[ 4.0 * scale, 1.0 * scale, 2.0 * scale ],
		[ 1.0 * scale, 5.0 * scale, 1.0 * scale ],
		[ 2.0 * scale, 1.0 * scale, 6.0 * scale ]
	]);
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 3 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

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
	var scale = 1e154; // above sqrt(bignum)
	var A_orig = colMajor([
		[ 4.0 * scale, 1.0 * scale, 2.0 * scale ],
		[ 1.0 * scale, 5.0 * scale, 1.0 * scale ],
		[ 2.0 * scale, 1.0 * scale, 6.0 * scale ]
	]);
	var A = new Float64Array( A_orig );
	var W = new Float64Array( 3 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('compute-vectors', 'lower', 3, A, 1, 3, 0, W, 1, 0, WORK, 1, 0 );

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
	var scale = 1e-154;
	var A = colMajor([
		[ 4.0 * scale, 1.0 * scale ],
		[ 1.0 * scale, 5.0 * scale ]
	]);
	var W = new Float64Array( 2 );
	var WORK = new Float64Array( 200 );
	var info;

	info = dsyev('no-vectors', 'lower', 2, A, 1, 2, 0, W, 1, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	// 2x2 symmetric: eigenvalues are (9 +/- sqrt(5))/2 * scale
	// = (4+5)/2 +/- sqrt((4-5)^2/4 + 1) * scale
	// = 4.5 +/- sqrt(1.25) * scale
	var expected0 = ( 4.5 - Math.sqrt( 1.25 ) ) * scale;
	var expected1 = ( 4.5 + Math.sqrt( 1.25 ) ) * scale;
	assertClose( W[ 0 ], expected0, 1e-10, 'w0' );
	assertClose( W[ 1 ], expected1, 1e-10, 'w1' );
});
