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

import ddot from '../../../../blas/base/ddot/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite.
* matrix `A` using the unblocked algorithm (Level 2 BLAS).
*
* The factorization has the form:
* `A = U^T*U`,  if uplo = 'upper', or
* A = L*L^T,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function dpotf2( uplo, N, A, strideA1, strideA2, offsetA ) {
	var ajj;
	var sa1;
	var sa2;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Compute the Cholesky factorization A = U^T * U.
		for ( j = 0; j < N; j++ ) {
			// Compute U(j,j) and test for non-positive-definiteness.
			ajj = A[ offsetA + (j * sa1) + (j * sa2) ] - ddot( j, A, sa1, offsetA + (j * sa2), A, sa1, offsetA + (j * sa2) );
			if ( ajj <= 0.0 || ajj !== ajj ) {
				A[ offsetA + (j * sa1) + (j * sa2) ] = ajj;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			A[ offsetA + (j * sa1) + (j * sa2) ] = ajj;

			// Compute elements j+1:N-1 of row j.
			if ( j < N - 1 ) {
				dgemv( 'transpose', j, N - j - 1, -1.0, A, sa1, sa2, offsetA + ((j+1)*sa2), A, sa1, offsetA + (j * sa2), 1.0, A, sa2, offsetA + (j * sa1) + ((j+1)*sa2));
				dscal( N - j - 1, 1.0 / ajj, A, sa2, offsetA + (j * sa1) + ((j+1)*sa2));
			}
		}
	} else {
		// Compute the Cholesky factorization A = L * L^T.
		for ( j = 0; j < N; j++ ) {
			// Compute L(j,j) and test for non-positive-definiteness.
			ajj = A[ offsetA + (j * sa1) + (j * sa2) ] - ddot( j, A, sa2, offsetA + (j * sa1), A, sa2, offsetA + (j * sa1) );
			if ( ajj <= 0.0 || ajj !== ajj ) {
				A[ offsetA + (j * sa1) + (j * sa2) ] = ajj;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			A[ offsetA + (j * sa1) + (j * sa2) ] = ajj;

			// Compute elements j+1:N-1 of column j.
			if ( j < N - 1 ) {
				dgemv( 'no-transpose', N - j - 1, j, -1.0, A, sa1, sa2, offsetA + ((j+1)*sa1), A, sa2, offsetA + (j * sa1), 1.0, A, sa1, offsetA + ((j+1)*sa1) + (j * sa2));
				dscal( N - j - 1, 1.0 / ajj, A, sa1, offsetA + ((j+1)*sa1) + (j * sa2));
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dpotf2;
