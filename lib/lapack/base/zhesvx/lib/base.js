/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import zlacpy from '../../zlacpy/lib/base.js';
import zlanhe from '../../zlanhe/lib/base.js';
import zhetrf from '../../zhetrf/lib/base.js';
import zhetrs from '../../zhetrs/lib/base.js';
import zhecon from '../../zhecon/lib/base.js';
import zherfs from '../../zherfs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Solves a complex Hermitian indefinite system of linear equations A_X = B.
_ using the diagonal pivoting factorization A = U_D_U^H or A = L_D*L^H,
* and provides an estimate of the condition number and error bounds.
*
* NOTE: HERMITIAN (not symmetric). Uses conjugate transpose.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of RHS columns
* @param {Complex128Array} A - Hermitian matrix A
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {NonNegativeInteger} offsetA - offset into A
* @param {Complex128Array} AF - factored form of A
* @param {integer} strideAF1 - first stride of AF
* @param {integer} strideAF2 - second stride of AF
* @param {NonNegativeInteger} offsetAF - offset into AF
* @param {Int32Array} IPIV - pivot indices
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - offset for IPIV
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {NonNegativeInteger} offsetB - offset into B
* @param {Complex128Array} X - solution matrix (output)
* @param {integer} strideX1 - first stride of X
* @param {integer} strideX2 - second stride of X
* @param {NonNegativeInteger} offsetX - offset into X
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - offset for FERR
* @param {Float64Array} BERR - backward error bounds (length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - offset for BERR
* @param {Complex128Array} WORK - caller-owned complex workspace of at least `max(1,2*N)` elements from `offsetWork` (base.js never allocates); zhetrf self-allocates its blocked workspace, so the `N*NB` best-performance size does not apply here
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {Float64Array} RWORK - caller-owned real workspace of at least `N` elements from `offsetRWork` (base.js never allocates)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @returns {integer} info - 0 on success, k>0 if singular, N+1 if ill-conditioned
*/
function zhesvx( fact, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var nofact;
	var anorm;
	var info;

	info = 0;
	nofact = ( fact === 'not-factored' );

	if ( N === 0 ) {
		return 0;
	}

	if ( nofact ) {
		// Copy A to AF
		zlacpy( uplo, N, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF );
		info = zhetrf( uplo, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			rcond[ 0 ] = 0.0;
			return info;
		}
	}

	// Compute infinity-norm of A. ZLANHE uses the caller-owned RWORK (real,
	// length N) as scratch; it initializes every entry before reading, and
	// this completes before ZHERFS reuses RWORK, so the two never overlap.
	anorm = zlanhe( 'inf-norm', uplo, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );

	// Estimate reciprocal condition number
	zhecon( uplo, N, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork );

	// Copy B to X
	zlacpy( 'all', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );

	// Solve A*X = B
	zhetrs( uplo, N, nrhs, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Iterative refinement
	zherfs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Check condition
	if ( rcond[ 0 ] < EPS ) {
		info = N + 1;
	}

	return info;
}


// EXPORTS //

export default zhesvx;
