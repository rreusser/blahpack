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

import dtbsv from '../../../../blas/base/dtbsv/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations A_X = B with a symmetric positive.
* definite band matrix A using the Cholesky factorization A = U__T_U or
* A = L*L**T computed by dpbtrf.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} AB - the triangular factor U or L from the Cholesky factorization, in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} B - on entry, the RHS matrix B; on exit, the solution matrix X
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @returns {integer} info - 0 if successful
*/
function dpbtrs( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ) {
	var upper;
	var j;

	// Quick return if possible:
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );

	if ( upper ) {
		// Solve A*X = B where A = U**T * U.
		for ( j = 0; j < nrhs; j++ ) {
			// Solve U**T * X = B, overwriting B with X:
			dtbsv( 'upper', 'transpose', 'non-unit', N, kd, AB, strideAB1, strideAB2, offsetAB, B, strideB1, offsetB + (j * strideB2));

			// Solve U * X = B, overwriting B with X:
			dtbsv( 'upper', 'no-transpose', 'non-unit', N, kd, AB, strideAB1, strideAB2, offsetAB, B, strideB1, offsetB + (j * strideB2));
		}
	} else {
		// Solve A*X = B where A = L * L**T.
		for ( j = 0; j < nrhs; j++ ) {
			// Solve L * X = B, overwriting B with X:
			dtbsv( 'lower', 'no-transpose', 'non-unit', N, kd, AB, strideAB1, strideAB2, offsetAB, B, strideB1, offsetB + (j * strideB2));

			// Solve L**T * X = B, overwriting B with X:
			dtbsv( 'lower', 'transpose', 'non-unit', N, kd, AB, strideAB1, strideAB2, offsetAB, B, strideB1, offsetB + (j * strideB2));
		}
	}

	return 0;
}


// EXPORTS //

export default dpbtrs;
