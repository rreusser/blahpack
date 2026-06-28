/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

// MODULES //

import dtfsm from '../../dtfsm/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations `A * X = B` with a symmetric positive.
* definite matrix A stored in Rectangular Full Packed (RFP) format, using the
* Cholesky factorization `A = U^T * U` or `A = L * L^T` computed by dpftrf.
*
* @private
* @param {string} transr - specifies the storage format of A (`'no-transpose'` or `'transpose'`)
* @param {string} uplo - specifies whether the upper or lower triangular factor is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - RFP array of length N*(N+1)/2 (Cholesky factor from dpftrf)
* @param {integer} strideA - stride for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - N-by-NRHS right-hand side matrix, overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} status code (0 = success)
*/
function dpftrs( transr, uplo, N, nrhs, A, strideA, offsetA, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'lower' ) {
		// Solve A*X = B where A = L*L^T.

		// Solve L * Y = B (forward substitution)
		dtfsm( transr, 'left', 'lower', 'no-transpose', 'non-unit', N, nrhs, 1.0, A, strideA, offsetA, B, strideB1, strideB2, offsetB );

		// Solve L^T * X = Y (back substitution)
		dtfsm( transr, 'left', 'lower', 'transpose', 'non-unit', N, nrhs, 1.0, A, strideA, offsetA, B, strideB1, strideB2, offsetB );
	} else {
		// Solve A*X = B where A = U^T*U.

		// Solve U^T * Y = B (forward substitution)
		dtfsm( transr, 'left', 'upper', 'transpose', 'non-unit', N, nrhs, 1.0, A, strideA, offsetA, B, strideB1, strideB2, offsetB );

		// Solve U * X = Y (back substitution)
		dtfsm( transr, 'left', 'upper', 'no-transpose', 'non-unit', N, nrhs, 1.0, A, strideA, offsetA, B, strideB1, strideB2, offsetB );
	}

	return 0;
}


// EXPORTS //

export default dpftrs;
