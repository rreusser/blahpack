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

/* eslint-disable max-len, max-params */

// MODULES //

import zpotrf from '../../zpotrf/lib/base.js';
import zpotrs from '../../zpotrs/lib/base.js';


// MAIN //

/**
* Computes the solution to a complex system of linear equations A*X = B.
* where A is an N-by-N Hermitian positive definite matrix and X and B
* are N-by-NRHS matrices.
*
* The Cholesky decomposition is used to factor A as:
* `A = U^H*U`,  if uplo = 'upper', or
* `A = L*L^H`,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular. The factored
* form of A is then used to solve the system A*X = B.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - input/output matrix; on exit, the Cholesky factor
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - input/output N-by-NRHS matrix; on exit, the solution X
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if A is not positive definite
*/
function zposv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var info;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Compute the Cholesky factorization A = U^H*U or A = L*L^H.
	info = zpotrf( uplo, N, A, strideA1, strideA2, offsetA );

	if ( info === 0 ) {
		// Solve the system using the factorization.
		zpotrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
	}

	return info;
}


// EXPORTS //

export default zposv;
