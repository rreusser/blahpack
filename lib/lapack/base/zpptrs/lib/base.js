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

import ztpsv from '../../../../blas/base/ztpsv/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations `A * X = B` with a complex Hermitian positive definite matrix `A` in packed storage using the Cholesky factorization `A = U**H * U` or `A = L * L**H` computed by zpptrf.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular factor is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - packed triangular factor (from zpptrf)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} B - right-hand side matrix, overwritten with solution on exit
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zpptrs( uplo, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB ) {
	var i;

	// Quick return if possible:
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U**H * U.
		for ( i = 0; i < nrhs; i += 1 ) {
			// Solve U**H * Y = B, overwriting B with Y:
			ztpsv( 'upper', 'conjugate-transpose', 'non-unit', N, AP, strideAP, offsetAP, B, strideB1, offsetB + ( i * strideB2 ) );

			// Solve U * X = Y, overwriting B with X:
			ztpsv( 'upper', 'no-transpose', 'non-unit', N, AP, strideAP, offsetAP, B, strideB1, offsetB + ( i * strideB2 ) );
		}
	} else {
		// Solve A*X = B where A = L * L**H.
		for ( i = 0; i < nrhs; i += 1 ) {
			// Solve L * Y = B, overwriting B with Y:
			ztpsv( 'lower', 'no-transpose', 'non-unit', N, AP, strideAP, offsetAP, B, strideB1, offsetB + ( i * strideB2 ) );

			// Solve L**H * X = Y, overwriting B with X:
			ztpsv( 'lower', 'conjugate-transpose', 'non-unit', N, AP, strideAP, offsetAP, B, strideB1, offsetB + ( i * strideB2 ) );
		}
	}

	return 0;
}


// EXPORTS //

export default zpptrs;
