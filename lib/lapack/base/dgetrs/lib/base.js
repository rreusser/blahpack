/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dlaswp from '../../dlaswp/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations A_X = B or A^T_X = B with a general.
* N-by-N matrix A using the LU factorization computed by dgetrf/dgetrf2.
*
* IPIV must contain 0-based pivot indices (as produced by dgetrf/dgetrf2).
*
* @private
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - LU-factored N-by-N matrix (from dgetrf)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot indices from dgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 if successful
*/
function dgetrs( trans, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( trans === 'no-transpose' ) {
		// Solve A * X = B.

		// Apply row interchanges to the right-hand sides.
		dlaswp( nrhs, B, strideB1, strideB2, offsetB, 0, N - 1, 1, IPIV, strideIPIV, offsetIPIV );

		// Solve L * Y = P * B (forward substitution, L is unit lower triangular)
		dtrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve U * X = Y (back substitution)
		dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);
	} else {
		// Solve A^T * X = B.

		// Solve U^T * Y = B (forward substitution with U transposed)
		dtrsm( 'left', 'upper', 'transpose', 'non-unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Solve L^T * X = Y (back substitution with L transposed, unit diagonal)
		dtrsm( 'left', 'lower', 'transpose', 'unit', N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

		// Apply row interchanges in reverse order
		dlaswp( nrhs, B, strideB1, strideB2, offsetB, N - 1, 0, -1, IPIV, -strideIPIV, offsetIPIV + ( ( N - 1 ) * strideIPIV ) );
	}

	return 0;
}


// EXPORTS //

export default dgetrs;
