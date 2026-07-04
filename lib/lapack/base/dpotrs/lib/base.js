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

import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations A_X = B with a symmetric positive.
* definite matrix A using the Cholesky factorization A = U^T_U or A = L*L^T
* computed by dpotrf.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - the Cholesky factor (from dpotrf)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 if successful
*/
function dpotrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U^T*U.

		// Solve U^T * Y = B (forward substitution)
		dtrsm( 'left', 'upper', 'transpose', 'non-unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve U * X = Y (back substitution)
		dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);
	} else {
		// Solve A*X = B where A = L*L^T.

		// Solve L * Y = B (forward substitution)
		dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve L^T * X = Y (back substitution)
		dtrsm( 'left', 'lower', 'transpose', 'non-unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);
	}

	return 0;
}


// EXPORTS //

export default dpotrs;
