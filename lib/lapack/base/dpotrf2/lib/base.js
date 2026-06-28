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

import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite.
* matrix A using the recursive algorithm.
*
* The factorization has the form:
* `A = U^T*U`,  if uplo = 'upper', or
* A = L*L^T,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular.
*
* This is the recursive version of the algorithm. It divides the matrix
* into four submatrices and recursively factors.
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
function dpotrf2( uplo, N, A, strideA1, strideA2, offsetA ) {
	var upper;
	var iinfo;
	var sa1;
	var sa2;
	var n1;
	var n2;

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;

	if ( N === 0 ) {
		return 0;
	}

	// Base case: 1x1 matrix
	if ( N === 1 ) {
		if ( A[ offsetA ] <= 0.0 || A[ offsetA ] !== A[ offsetA ] ) {
			return 1;
		}
		A[ offsetA ] = Math.sqrt( A[ offsetA ] );
		return 0;
	}

	// Recursive case: split into n1 and n2
	n1 = ( N / 2 ) | 0;
	n2 = N - n1;

	// Factor A11
	iinfo = dpotrf2( uplo, n1, A, sa1, sa2, offsetA );
	if ( iinfo !== 0 ) {
		return iinfo;
	}

	if ( upper ) {
		// Solve U11^T * A12 = A12 (update off-diagonal block)
		dtrsm( 'left', 'upper', 'transpose', 'non-unit', n1, n2, 1.0, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + (n1 * sa2));

		// Update A22: A22 -= A12^T * A12
		dsyrk( uplo, 'transpose', n2, n1, -1.0, A, sa1, sa2, offsetA + (n1 * sa2), 1.0, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2));

		// Factor A22
		iinfo = dpotrf2( uplo, n2, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2) );
		if ( iinfo !== 0 ) {
			return iinfo + n1;
		}
	} else {
		// Solve A21 * L11^T = A21 (update off-diagonal block)
		dtrsm( 'right', 'lower', 'transpose', 'non-unit', n2, n1, 1.0, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + (n1 * sa1));

		// Update A22: A22 -= A21 * A21^T
		dsyrk( uplo, 'no-transpose', n2, n1, -1.0, A, sa1, sa2, offsetA + (n1 * sa1), 1.0, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2));

		// Factor A22
		iinfo = dpotrf2( uplo, n2, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2) );
		if ( iinfo !== 0 ) {
			return iinfo + n1;
		}
	}
	return 0;
}


// EXPORTS //

export default dpotrf2;
