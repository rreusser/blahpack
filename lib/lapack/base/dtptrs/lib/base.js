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

import dtpsv from '../../../../blas/base/dtpsv/lib/base.js';


// MAIN //

/**
* Solves a triangular system of the form `A*X = B`, `A^T*X = B`, or `A^H*X = B`.
*
* A is a triangular matrix of order N stored in packed format, and B is an
* N-by-NRHS matrix. A check is made to verify that A is nonsingular.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} trans - specifies the operation (`'no-transpose'` or `'transpose'`)
* @param {string} diag - specifies whether the matrix is unit triangular (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - packed triangular matrix A, dimension `N*(N+1)/2`
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} B - right-hand side matrix, overwritten with solution on exit
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} info - 0 if successful, k if `A[k-1,k-1]` is zero (1-based)
*/
function dtptrs( uplo, trans, diag, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB ) {
	var nounit;
	var upper;
	var jc;
	var j;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	nounit = ( diag === 'non-unit' );

	// Check for singularity...
	if ( nounit ) {
		if ( upper ) {
			jc = 0;
			for ( j = 0; j < N; j += 1 ) {
				if ( AP[ offsetAP + ( ( jc + j ) * strideAP ) ] === 0.0 ) {
					return j + 1;
				}
				jc += j + 1;
			}
		} else {
			jc = 0;
			for ( j = 0; j < N; j += 1 ) {
				if ( AP[ offsetAP + ( jc * strideAP ) ] === 0.0 ) {
					return j + 1;
				}
				jc += N - j;
			}
		}
	}

	// Solve A * x = b, A^T * x = b, or A^H * x = b for each right-hand side...
	for ( j = 0; j < nrhs; j += 1 ) {
		dtpsv( uplo, trans, diag, N, AP, strideAP, offsetAP, B, strideB1, offsetB + ( j * strideB2 ) );
	}
	return 0;
}


// EXPORTS //

export default dtptrs;
