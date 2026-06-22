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

import ztbsv from '../../../../blas/base/ztbsv/lib/base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite banded system of equations.
* A_X = B using the Cholesky factorization A = U^H_U or A = L*L^H
* computed by zpbtrf.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AB - factored band matrix from zpbtrf
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @param {Complex128Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zpbtrs( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ) {
	var j;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U^H*U
		for ( j = 0; j < nrhs; j++ ) {
			// Solve U^H * y = b(j), result in B(:,j)
			ztbsv( 'upper', 'conjugate-transpose', 'non-unit', N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				B, strideB1, offsetB + (j * strideB2)
			);

			// Solve U * x = y, result in B(:,j)
			ztbsv( 'upper', 'no-transpose', 'non-unit', N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				B, strideB1, offsetB + (j * strideB2)
			);
		}
	} else {
		// Solve A*X = B where A = L*L^H
		for ( j = 0; j < nrhs; j++ ) {
			// Solve L * y = b(j), result in B(:,j)
			ztbsv( 'lower', 'no-transpose', 'non-unit', N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				B, strideB1, offsetB + (j * strideB2)
			);

			// Solve L^H * x = y, result in B(:,j)
			ztbsv( 'lower', 'conjugate-transpose', 'non-unit', N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				B, strideB1, offsetB + (j * strideB2)
			);
		}
	}
	return 0;
}


// EXPORTS //

export default zpbtrs;
