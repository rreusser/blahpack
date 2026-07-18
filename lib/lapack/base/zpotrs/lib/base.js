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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

const CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Solves a system of linear equations A_X = B with a Hermitian positive.
* definite matrix A using the Cholesky factorization A = U^H_U or A = L*L^H
* computed by zpotrf.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - the Cholesky factor (from zpotrf)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zpotrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U^H*U.

		// Solve U^H * Y = B (forward substitution with conjugate transpose)
		ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', N, nrhs, CONE,
			A, strideA1, strideA2, offsetA,
			B, strideB1, strideB2, offsetB
		);

		// Solve U * X = Y (back substitution)
		ztrsm( 'left', 'upper', 'no-transpose', 'non-unit', N, nrhs, CONE,
			A, strideA1, strideA2, offsetA,
			B, strideB1, strideB2, offsetB
		);
	} else {
		// Solve A*X = B where A = L*L^H.

		// Solve L * Y = B (forward substitution)
		ztrsm( 'left', 'lower', 'no-transpose', 'non-unit', N, nrhs, CONE,
			A, strideA1, strideA2, offsetA,
			B, strideB1, strideB2, offsetB
		);

		// Solve L^H * X = Y (back substitution with conjugate transpose)
		ztrsm( 'left', 'lower', 'conjugate-transpose', 'non-unit', N, nrhs, CONE,
			A, strideA1, strideA2, offsetA,
			B, strideB1, strideB2, offsetB
		);
	}

	return 0;
}


// EXPORTS //

export default zpotrs;
