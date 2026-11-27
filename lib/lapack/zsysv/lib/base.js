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

import zsytrf from '../../zsytrf/lib/base.js';
import zsytrs from '../../zsytrs/lib/base.js';
import zsytrs2 from '../../zsytrs2/lib/base.js';


// MAIN //

/**
* Solves a complex symmetric indefinite system of linear equations A * X = B.
* using the Bunch-Kaufman diagonal pivoting method.
*
* The factorization has the form:
*   A = U _ D _ U^T  (if uplo = 'U')
*   A = L _ D _ L^T  (if uplo = 'L')
*
* where U (or L) is a product of permutation and unit upper (lower) triangular
* matrices, and D is symmetric and block diagonal with 1-by-1 and 2-by-2
* diagonal blocks.
*
* The factored form of A is then used to solve the system A * X = B: as in
* the reference, with zsytrs2 when the workspace has at least `N` elements,
* and with zsytrs (which needs no workspace) otherwise.
*
* IPIV is an output array that receives 0-based pivot indices from zsytrf.
* Negative values indicate 2x2 pivots (using bitwise NOT encoding).
*
* @private
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - input/output N-by-N symmetric matrix; on exit, block diagonal matrix D and multipliers for the factorization
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - output pivot indices (0-based), length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Complex128Array} B - input/output N-by-NRHS matrix; on exit, the solution X
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {Complex128Array} WORK - workspace, handed whole to zsytrf; base.js never allocates. Length from `offsetWork` must be at least `1`; a length of at least `N*NB` (NB from ILAENV for zsytrf, 64) enables the full blocked factorization (a shorter one a smaller block size or the unblocked factorization), and a length of at least `N` the zsytrs2 solve (a shorter one the zsytrs solve).
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - index offset for `WORK`
* @returns {integer} info - 0 if successful, k>0 if D(k-1,k-1) is exactly zero
*/
function zsysv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	let lwork;

	if ( N === 0 ) {
		return 0;
	}

	// Factorize A = U*D*U^T or A = L*D*L^T, with the whole of WORK (as the reference does):
	const info = zsytrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );

	if ( info === 0 ) {
		// As in the reference, solve with zsytrs2 (which needs an N-length workspace) when WORK has room for it, else with zsytrs:
		lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
		if ( lwork < N ) {
			zsytrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
		} else {
			zsytrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork );
		}
	}

	return info;
}


// EXPORTS //

export default zsysv;
