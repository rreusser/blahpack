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

import dpbtrf from '../../dpbtrf/lib/base.js';
import dpbtrs from '../../dpbtrs/lib/base.js';


// MAIN //

/**
* Computes the solution to a real system of linear equations A * X = B.
* where A is an N-by-N symmetric positive definite band matrix and X and B
* are N-by-NRHS matrices.
*
* The Cholesky decomposition is used to factor A as:
* `A = U**T*U`,  if uplo = 'upper', or
* A = L*L**T,  if uplo = 'lower',
* where U is an upper triangular band matrix, and L is a lower triangular
* band matrix. The factored form of A is then used to solve the system.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - number of linear equations / order of A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} AB - on entry, the upper or lower triangle of A in band storage; on exit, the triangular factor U or L
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} B - on entry, the RHS matrix B; on exit, the solution matrix X
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @returns {integer} info - 0 if successful, >0 if the leading minor of order info is not positive definite
*/
function dpbsv( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ) {
	var info;

	// Compute the Cholesky factorization A = U**T*U or A = L*L**T:
	info = dpbtrf( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB );
	if ( info === 0 ) {
		// Solve the system A*X = B, overwriting B with X:
		info = dpbtrs( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB );
	}

	return info;
}


// EXPORTS //

export default dpbsv;
