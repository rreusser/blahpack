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

import dpotrf2 from '../../dpotrf2/lib/base.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded, replaces ILAENV query)


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite.
* matrix A using a blocked algorithm.
*
* The factorization has the form:
* `A = U^T*U`,  if uplo = 'upper', or
* A = L*L^T,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular.
*
* This is the blocked version of the algorithm, calling Level 3 BLAS.
* For small matrices (N <= NB), it delegates to dpotrf2.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function dpotrf( uplo, N, A, strideA1, strideA2, offsetA ) {
	var upper;
	var info;
	var sa1;
	var sa2;
	var jb;
	var j;

	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	// Use unblocked code for small matrices or block size >= N
	if ( NB <= 1 || NB >= N ) {
		return dpotrf2( uplo, N, A, sa1, sa2, offsetA );
	}

	if ( upper ) {
		// Compute the Cholesky factorization A = U^T * U.
		for ( j = 0; j < N; j += NB ) {
			// Update and factorize the current diagonal block and test
			// For non-positive-definiteness.
			jb = Math.min( NB, N - j );

			dsyrk( 'upper', 'transpose', jb, j, -1.0, A, sa1, sa2, offsetA + (j * sa2), 1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2));
			info = dpotrf2( 'upper', jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
			if ( info !== 0 ) {
				return info + j;
			}
			if ( j + jb < N ) {
				// Update the off-diagonal block.
				dgemm( 'transpose', 'no-transpose', jb, N - j - jb, j, -1.0, A, sa1, sa2, offsetA + (j * sa2), A, sa1, sa2, offsetA + (( j + jb ) * sa2), 1.0, A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2));
				dtrsm( 'left', 'upper', 'transpose', 'non-unit', jb, N - j - jb, 1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2));
			}
		}
	} else {
		// Compute the Cholesky factorization A = L * L^T.
		for ( j = 0; j < N; j += NB ) {
			// Update and factorize the current diagonal block.
			jb = Math.min( NB, N - j );

			dsyrk( 'lower', 'no-transpose', jb, j, -1.0, A, sa1, sa2, offsetA + (j * sa1), 1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2));
			info = dpotrf2( 'lower', jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
			if ( info !== 0 ) {
				return info + j;
			}
			if ( j + jb < N ) {
				// Update the off-diagonal block.
				dgemm( 'no-transpose', 'transpose', N - j - jb, jb, j, -1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1), A, sa1, sa2, offsetA + (j * sa1), 1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2));
				dtrsm( 'right', 'lower', 'transpose', 'non-unit', N - j - jb, jb, 1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2));
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dpotrf;
