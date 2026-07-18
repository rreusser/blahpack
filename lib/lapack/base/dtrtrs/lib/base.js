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
* Solves a triangular system of the form:.
* `A*X = B`,  `A^T*X = B`,  or  `A^H * X = B`
* where A is a triangular matrix of order N, and B is an N-by-NRHS matrix.
* A check is made to verify that A is nonsingular.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 if successful, k if A(k-1,k-1) is zero
*/
function dtrtrs( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	let i;

	const nounit = ( diag === 'non-unit' );

	if ( N === 0 ) {
		return 0;
	}

	const sa1 = strideA1;
	const sa2 = strideA2;

	// Check for singularity.
	if ( nounit ) {
		for ( i = 0; i < N; i++ ) {
			if ( A[ offsetA + (i * sa1) + (i * sa2) ] === 0.0 ) {
				return i + 1;
			}
		}
	}

	// Solve A * X = B, A^T * X = B, or A^H * X = B.
	dtrsm( 'left', uplo, trans, diag, N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

	return 0;
}


// EXPORTS //

export default dtrtrs;
