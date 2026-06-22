/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbev from './../lib/ndarray.js';

// FIXTURES //

import jobz_v_uplo_u_kd2_n5 from './fixtures/jobz_v_uplo_u_kd2_n5.json' with { type: 'json' };
import jobz_v_uplo_l_kd2_n5 from './fixtures/jobz_v_uplo_l_kd2_n5.json' with { type: 'json' };
import jobz_n_uplo_u_kd2_n5 from './fixtures/jobz_n_uplo_u_kd2_n5.json' with { type: 'json' };
import jobz_n_uplo_l_kd2_n5 from './fixtures/jobz_n_uplo_l_kd2_n5.json' with { type: 'json' };
import jobz_v_uplo_u_kd1_n4 from './fixtures/jobz_v_uplo_u_kd1_n4.json' with { type: 'json' };
import jobz_v_uplo_l_kd1_n4 from './fixtures/jobz_v_uplo_l_kd1_n4.json' with { type: 'json' };
import jobz_n_uplo_u_kd1_n4 from './fixtures/jobz_n_uplo_u_kd1_n4.json' with { type: 'json' };
import jobz_v_uplo_u_kd3_n6 from './fixtures/jobz_v_uplo_u_kd3_n6.json' with { type: 'json' };
import jobz_v_uplo_l_kd3_n6 from './fixtures/jobz_v_uplo_l_kd3_n6.json' with { type: 'json' };
import n1_jobz_v_lower from './fixtures/n1_jobz_v_lower.json' with { type: 'json' };
import n1_jobz_v_upper_kd2 from './fixtures/n1_jobz_v_upper_kd2.json' with { type: 'json' };
import n1_jobz_n from './fixtures/n1_jobz_n.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import diagonal_jobz_v from './fixtures/diagonal_jobz_v.json' with { type: 'json' };
import diagonal_jobz_n from './fixtures/diagonal_jobz_n.json' with { type: 'json' };
import jobz_n_uplo_l_kd3_n6 from './fixtures/jobz_n_uplo_l_kd3_n6.json' with { type: 'json' };

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
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Checks that Z^T * Z = I (orthogonality).
* Z is column-major N-by-N with strides (1, N).
*/
function assertOrthogonal( Z, N, tol, msg ) {
	var sum;
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Z[ k + i * N ] * Z[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, tol, msg + ': Z^T*Z[' + i + ',' + j + '] should be 1' ); // eslint-disable-line max-len
			} else {
				assert.ok( Math.abs( sum ) < tol, msg + ': Z^T*Z[' + i + ',' + j + '] should be 0, got ' + sum ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Builds a full N-by-N symmetric matrix from upper band storage.
*
* Upper band: AB has KD+1 rows, N columns (column-major, LDAB = KD+1).
* AB(kd+1+i-j, j) = A(i,j) for max(1,j-kd) <= i <= j (1-based)
*
* @param {Float64Array} AB - band storage
* @param {integer} N - order
* @param {integer} kd - number of superdiagonals
* @returns {Float64Array} full matrix (column-major, N-by-N)
*/
function upperBandToFull( AB, N, kd ) {
	var ldab = kd + 1;
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - kd ); i <= j; i++ ) {
			out[ i + j * N ] = AB[ ( kd + i - j ) + j * ldab ];
			out[ j + i * N ] = out[ i + j * N ]; // symmetric
		}
	}
	return out;
}

/**
* Builds a full N-by-N symmetric matrix from lower band storage.
*
* Lower band: AB has KD+1 rows, N columns (column-major, LDAB = KD+1).
* AB(1+i-j, j) = A(i,j) for j <= i <= min(n, j+kd) (1-based)
*
* @param {Float64Array} AB - band storage
* @param {integer} N - order
* @param {integer} kd - number of subdiagonals
* @returns {Float64Array} full matrix (column-major, N-by-N)
*/
function lowerBandToFull( AB, N, kd ) {
	var ldab = kd + 1;
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min( N - 1, j + kd ); i++ ) {
			out[ i + j * N ] = AB[ ( i - j ) + j * ldab ];
			out[ j + i * N ] = out[ i + j * N ]; // symmetric
		}
	}
	return out;
}

/**
* Checks that A _ Z = Z _ diag(W) (eigendecomposition).
*/
function assertEigendecomp( A, Z, W, N, tol, msg ) {
	var az_ij;
	var zw_ij;
	var i;
	var j;
	var k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			az_ij = 0.0;
			for ( k = 0; k < N; k++ ) {
				az_ij += A[ i + k * N ] * Z[ k + j * N ];
			}
			zw_ij = Z[ i + j * N ] * W[ j ];
			assertClose( az_ij, zw_ij, tol, msg + ': A*Z vs Z*diag(W) at (' + i + ',' + j + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Upper band storage for 5x5 matrix with KD=2.
*
* Matrix:
*   4  1  2  0  0
*   1  5  3  1  0
*   2  3  6  2  1
*   0  1  2  7  3
*   0  0  1  3  8
*
* LDAB=3, stored column-major:
*   Row 0 (2nd superdiag): _, _, 2, 1, 1
*   Row 1 (1st superdiag): *, 1, 3, 2, 3
*   Row 2 (diagonal):      4, 5, 6, 7, 8
*/
function upperBand_kd2_n5() {
	var AB = new Float64Array( 3 * 5 );

	// Col 0
	AB[ 2 ] = 4.0;

	// Col 1
	AB[ 3 + 1 ] = 1.0; AB[ 3 + 2 ] = 5.0;

	// Col 2
	AB[ 6 + 0 ] = 2.0; AB[ 6 + 1 ] = 3.0; AB[ 6 + 2 ] = 6.0;

	// Col 3
	AB[ 9 + 0 ] = 1.0; AB[ 9 + 1 ] = 2.0; AB[ 9 + 2 ] = 7.0;

	// Col 4
	AB[ 12 + 0 ] = 1.0; AB[ 12 + 1 ] = 3.0; AB[ 12 + 2 ] = 8.0;
	return AB;
}

/**
* Lower band storage for 5x5 matrix with KD=2 (same matrix).
*
* LDAB=3, stored column-major:
*   Row 0 (diagonal):      4, 5, 6, 7, 8
*   Row 1 (1st subdiag):   1, 3, 2, 3, _
_   Row 2 (2nd subdiag):   2, 1, 1, _, *
*/
function lowerBand_kd2_n5() {
	var AB = new Float64Array( 3 * 5 );

	// Col 0
	AB[ 0 ] = 4.0; AB[ 1 ] = 1.0; AB[ 2 ] = 2.0;

	// Col 1
	AB[ 3 ] = 5.0; AB[ 4 ] = 3.0; AB[ 5 ] = 1.0;

	// Col 2
	AB[ 6 ] = 6.0; AB[ 7 ] = 2.0; AB[ 8 ] = 1.0;

	// Col 3
	AB[ 9 ] = 7.0; AB[ 10 ] = 3.0;

	// Col 4
	AB[ 12 ] = 8.0;
	return AB;
}

/**
* Upper band storage for 4x4 tridiagonal matrix with KD=1.
*
* Matrix:
*   4  1  0  0
*   1  5  2  0
*   0  2  6  3
*   0  0  3  7
*
* LDAB=2:
*   Row 0 (1st superdiag): *, 1, 2, 3
*   Row 1 (diagonal):      4, 5, 6, 7
*/
function upperBand_kd1_n4() {
	var AB = new Float64Array( 2 * 4 );
	AB[ 1 ] = 4.0;
	AB[ 2 ] = 1.0; AB[ 3 ] = 5.0;
	AB[ 4 ] = 2.0; AB[ 5 ] = 6.0;
	AB[ 6 ] = 3.0; AB[ 7 ] = 7.0;
	return AB;
}

/**
* Lower band storage for 4x4 tridiagonal matrix with KD=1 (same matrix).
*
* LDAB=2:
*   Row 0 (diagonal):      4, 5, 6, 7
*   Row 1 (1st subdiag):   1, 2, 3, *
*/
function lowerBand_kd1_n4() {
	var AB = new Float64Array( 2 * 4 );
	AB[ 0 ] = 4.0; AB[ 1 ] = 1.0;
	AB[ 2 ] = 5.0; AB[ 3 ] = 2.0;
	AB[ 4 ] = 6.0; AB[ 5 ] = 3.0;
	AB[ 6 ] = 7.0;
	return AB;
}

/**
* Upper band storage for 6x6 matrix with KD=3.
*
* Matrix:
*   5  2  1  3  0  0
*   2  6  3  1  2  0
*   1  3  7  2  3  1
*   3  1  2  8  1  2
*   0  2  3  1  9  3
*   0  0  1  2  3 10
*
* LDAB=4:
*   Row 0 (3rd superdiag): _, _, _, 3, 2, 1
_   Row 1 (2nd superdiag): _, _, 1, 1, 3, 2
_   Row 2 (1st superdiag): _, 2, 3, 2, 1, 3
*   Row 3 (diagonal):      5, 6, 7, 8, 9,10
*/
function upperBand_kd3_n6() {
	var AB = new Float64Array( 4 * 6 );

	// Col 0
	AB[ 3 ] = 5.0;

	// Col 1
	AB[ 4 + 2 ] = 2.0; AB[ 4 + 3 ] = 6.0;

	// Col 2
	AB[ 8 + 1 ] = 1.0; AB[ 8 + 2 ] = 3.0; AB[ 8 + 3 ] = 7.0;

	// Col 3
	AB[ 12 + 0 ] = 3.0; AB[ 12 + 1 ] = 1.0; AB[ 12 + 2 ] = 2.0; AB[ 12 + 3 ] = 8.0;

	// Col 4
	AB[ 16 + 0 ] = 2.0; AB[ 16 + 1 ] = 3.0; AB[ 16 + 2 ] = 1.0; AB[ 16 + 3 ] = 9.0;

	// Col 5
	AB[ 20 + 0 ] = 1.0; AB[ 20 + 1 ] = 2.0; AB[ 20 + 2 ] = 3.0; AB[ 20 + 3 ] = 10.0; // eslint-disable-line max-len
	return AB;
}

/**
* Lower band storage for 6x6 matrix with KD=3 (same matrix).
*
* LDAB=4:
*   Row 0 (diagonal):      5, 6, 7, 8, 9,10
*   Row 1 (1st subdiag):   2, 3, 2, 1, 3, _
_   Row 2 (2nd subdiag):   1, 1, 3, 2, _, _
_   Row 3 (3rd subdiag):   3, 2, 1, _, _, _
*/
function lowerBand_kd3_n6() {
	var AB = new Float64Array( 4 * 6 );

	// Col 0
	AB[ 0 ] = 5.0; AB[ 1 ] = 2.0; AB[ 2 ] = 1.0; AB[ 3 ] = 3.0;

	// Col 1
	AB[ 4 ] = 6.0; AB[ 5 ] = 3.0; AB[ 6 ] = 1.0; AB[ 7 ] = 2.0;

	// Col 2
	AB[ 8 ] = 7.0; AB[ 9 ] = 2.0; AB[ 10 ] = 3.0; AB[ 11 ] = 1.0;

	// Col 3
	AB[ 12 ] = 8.0; AB[ 13 ] = 1.0; AB[ 14 ] = 2.0;

	// Col 4
	AB[ 16 ] = 9.0; AB[ 17 ] = 3.0;

	// Col 5
	AB[ 20 ] = 10.0;
	return AB;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dsbev: JOBZ=V, UPLO=U, KD=2, N=5 — eigenvalues + eigenvectors', function t() { // eslint-disable-line max-len
	var Afull;
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_v_uplo_u_kd2_n5;
	AB = upperBand_kd2_n5();
	Afull = upperBandToFull( new Float64Array( AB ), 5, 2 );
	W = new Float64Array( 5 );
	Z = new Float64Array( 25 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'upper', 5, 2, AB, 1, 3, 0, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 5, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 5, 1e-12, 'eigendecomp' );
});

test( 'dsbev: JOBZ=V, UPLO=L, KD=2, N=5 — eigenvalues + eigenvectors', function t() { // eslint-disable-line max-len
	var Afull;
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_v_uplo_l_kd2_n5;
	AB = lowerBand_kd2_n5();
	Afull = lowerBandToFull( new Float64Array( AB ), 5, 2 );
	W = new Float64Array( 5 );
	Z = new Float64Array( 25 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'lower', 5, 2, AB, 1, 3, 0, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 5, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 5, 1e-12, 'eigendecomp' );
});

test( 'dsbev: JOBZ=N, UPLO=U, KD=2, N=5 — eigenvalues only', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_n_uplo_u_kd2_n5;
	AB = upperBand_kd2_n5();
	W = new Float64Array( 5 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'no-vectors', 'upper', 5, 2, AB, 1, 3, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsbev: JOBZ=N, UPLO=L, KD=2, N=5 — eigenvalues only', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_n_uplo_l_kd2_n5;
	AB = lowerBand_kd2_n5();
	W = new Float64Array( 5 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'no-vectors', 'lower', 5, 2, AB, 1, 3, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsbev: JOBZ=V, UPLO=U, KD=1, N=4 — tridiagonal with eigenvectors', function t() { // eslint-disable-line max-len
	var Afull;
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_v_uplo_u_kd1_n4;
	AB = upperBand_kd1_n4();
	Afull = upperBandToFull( new Float64Array( AB ), 4, 1 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'upper', 4, 1, AB, 1, 2, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dsbev: JOBZ=V, UPLO=L, KD=1, N=4 — tridiagonal with eigenvectors', function t() { // eslint-disable-line max-len
	var Afull;
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_v_uplo_l_kd1_n4;
	AB = lowerBand_kd1_n4();
	Afull = lowerBandToFull( new Float64Array( AB ), 4, 1 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'lower', 4, 1, AB, 1, 2, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 4, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-12, 'eigendecomp' );
});

test( 'dsbev: JOBZ=N, UPLO=U, KD=1, N=4 — eigenvalues only', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_n_uplo_u_kd1_n4;
	AB = upperBand_kd1_n4();
	W = new Float64Array( 4 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'no-vectors', 'upper', 4, 1, AB, 1, 2, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsbev: JOBZ=V, UPLO=U, KD=3, N=6 — wider bandwidth', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_v_uplo_u_kd3_n6;
	AB = upperBand_kd3_n6();
	Afull = upperBandToFull( new Float64Array( AB ), 6, 3 );
	W = new Float64Array( 6 );
	Z = new Float64Array( 36 );
	WORK = new Float64Array( 200 );
	info = dsbev( 'compute-vectors', 'upper', 6, 3, AB, 1, 4, 0, W, 1, 0, Z, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 6, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 6, 1e-12, 'eigendecomp' );
});

test( 'dsbev: JOBZ=V, UPLO=L, KD=3, N=6 — wider bandwidth', function t() {
	var Afull;
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_v_uplo_l_kd3_n6;
	AB = lowerBand_kd3_n6();
	Afull = lowerBandToFull( new Float64Array( AB ), 6, 3 );
	W = new Float64Array( 6 );
	Z = new Float64Array( 36 );
	WORK = new Float64Array( 200 );
	info = dsbev( 'compute-vectors', 'lower', 6, 3, AB, 1, 4, 0, W, 1, 0, Z, 1, 6, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
	assertOrthogonal( Z, 6, 1e-13, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 6, 1e-12, 'eigendecomp' );
});

test( 'dsbev: N=1, JOBZ=V, UPLO=L — single eigenvalue with eigenvector', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = n1_jobz_v_lower;
	AB = new Float64Array( [ 3.5 ] );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dsbev( 'compute-vectors', 'lower', 1, 0, AB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
	assertClose( Z[ 0 ], tc.z11, 1e-15, 'z11' );
});

test( 'dsbev: N=1, JOBZ=V, UPLO=U, KD=2 — upper band single element', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = n1_jobz_v_upper_kd2;
	AB = new Float64Array( 3 );
	AB[ 2 ] = 7.25;
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dsbev( 'compute-vectors', 'upper', 1, 2, AB, 1, 3, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
	assertClose( Z[ 0 ], tc.z11, 1e-15, 'z11' );
});

test( 'dsbev: N=1, JOBZ=N — single eigenvalue only', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = n1_jobz_n;
	AB = new Float64Array( [ 9.0 ] );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dsbev( 'no-vectors', 'upper', 1, 0, AB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( W[ 0 ], tc.w1, 1e-15, 'w1' );
});

test( 'dsbev: N=0 — quick return', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = n0;
	AB = new Float64Array( 1 );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsbev( 'compute-vectors', 'upper', 0, 0, AB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsbev: KD=0 (diagonal), JOBZ=V — sorted eigenvalues + eigenvectors', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = diagonal_jobz_v;
	AB = new Float64Array( [ 3.0, 1.0, 4.0, 2.0 ] );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'upper', 4, 0, AB, 1, 1, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-14, 'eigenvalues' );
	assertOrthogonal( Z, 4, 1e-13, 'orthogonality' );
});

test( 'dsbev: KD=0 (diagonal), JOBZ=N — eigenvalues only', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = diagonal_jobz_n;
	AB = new Float64Array( [ 3.0, 1.0, 4.0, 2.0 ] );
	W = new Float64Array( 4 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'no-vectors', 'lower', 4, 0, AB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-14, 'eigenvalues' );
});

test( 'dsbev: JOBZ=N, UPLO=L, KD=3, N=6 — eigenvalues only', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var W;
	var Z;

	tc = jobz_n_uplo_l_kd3_n6;
	AB = lowerBand_kd3_n6();
	W = new Float64Array( 6 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 200 );
	info = dsbev( 'no-vectors', 'lower', 6, 3, AB, 1, 4, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( W ), tc.w, 1e-13, 'eigenvalues' );
});

test( 'dsbev: scaling path — tiny matrix elements (near underflow)', function t() { // eslint-disable-line max-len
	var scale;
	var Afull;
	var WORK;
	var info;
	var AB;
	var W;
	var Z;

	scale = 1e-154;
	AB = new Float64Array( 3 * 4 );
	AB[ 1 ] = 4.0 * scale;
	AB[ 2 ] = 1.0 * scale;
	AB[ 3 ] = 5.0 * scale;
	AB[ 4 ] = 2.0 * scale;
	AB[ 5 ] = 6.0 * scale;
	AB[ 6 ] = 3.0 * scale;
	AB[ 7 ] = 7.0 * scale;
	Afull = upperBandToFull( new Float64Array( AB ), 4, 1 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'upper', 4, 1, AB, 1, 2, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.ok( W[ 0 ] <= W[ 1 ], 'ascending order' );
	assert.ok( W[ 1 ] <= W[ 2 ], 'ascending order' );
	assert.ok( W[ 2 ] <= W[ 3 ], 'ascending order' );
	assertOrthogonal( Z, 4, 1e-10, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-8, 'eigendecomp' );
});

test( 'dsbev: scaling path — large matrix elements (near overflow)', function t() { // eslint-disable-line max-len
	var scale;
	var Afull;
	var WORK;
	var info;
	var AB;
	var W;
	var Z;

	scale = 1e154;
	AB = new Float64Array( 3 * 4 );
	AB[ 0 ] = 4.0 * scale;
	AB[ 1 ] = 1.0 * scale;
	AB[ 2 ] = 5.0 * scale;
	AB[ 3 ] = 2.0 * scale;
	AB[ 4 ] = 6.0 * scale;
	AB[ 5 ] = 3.0 * scale;
	AB[ 6 ] = 7.0 * scale;
	Afull = lowerBandToFull( new Float64Array( AB ), 4, 1 );
	W = new Float64Array( 4 );
	Z = new Float64Array( 16 );
	WORK = new Float64Array( 100 );
	info = dsbev( 'compute-vectors', 'lower', 4, 1, AB, 1, 2, 0, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.ok( W[ 0 ] <= W[ 1 ], 'ascending order' );
	assert.ok( W[ 1 ] <= W[ 2 ], 'ascending order' );
	assert.ok( W[ 2 ] <= W[ 3 ], 'ascending order' );
	assertOrthogonal( Z, 4, 1e-10, 'orthogonality' );
	assertEigendecomp( Afull, Z, W, 4, 1e-8, 'eigendecomp' );
});
