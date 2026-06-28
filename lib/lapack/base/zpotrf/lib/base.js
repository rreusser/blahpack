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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zpotrf2 from '../../zpotrf2/lib/base.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var NB = 64; // Block size (hardcoded, replaces ILAENV query)
var CONE = new Complex128( 1.0, 0.0 );
var MCONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite.
* matrix A using a blocked algorithm.
*
* The factorization has the form:
* `A = U^H*U`,  if uplo = 'upper', or
* A = L*L^H,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular.
*
* This is the blocked version of the algorithm, calling Level 3 BLAS.
* For small matrices (N <= NB), it delegates to zpotrf2.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input/output Hermitian positive definite matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function zpotrf( uplo, N, A, strideA1, strideA2, offsetA ) {
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
		return zpotrf2( uplo, N, A, sa1, sa2, offsetA );
	}

	if ( upper ) {
		// Compute the Cholesky factorization A = U^H * U
		for ( j = 0; j < N; j += NB ) {
			// Update and factorize the current diagonal block
			jb = Math.min( NB, N - j );

			zherk( 'upper', 'conjugate-transpose', jb, j, -1.0,
				A, sa1, sa2, offsetA + (j * sa2),
				1.0,
				A, sa1, sa2, offsetA + (j * sa1) + (j * sa2)
			);
			info = zpotrf2( 'upper', jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
			if ( info !== 0 ) {
				return info + j;
			}
			if ( j + jb < N ) {
				// Update the off-diagonal block
				zgemm( 'conjugate-transpose', 'no-transpose', jb, N - j - jb, j, MCONE,
					A, sa1, sa2, offsetA + (j * sa2),
					A, sa1, sa2, offsetA + (( j + jb ) * sa2),
					CONE,
					A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2)
				);
				ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', jb, N - j - jb, CONE,
					A, sa1, sa2, offsetA + (j * sa1) + (j * sa2),
					A, sa1, sa2, offsetA + (j * sa1) + (( j + jb ) * sa2)
				);
			}
		}
	} else {
		// Compute the Cholesky factorization A = L * L^H
		for ( j = 0; j < N; j += NB ) {
			// Update and factorize the current diagonal block
			jb = Math.min( NB, N - j );

			zherk( 'lower', 'no-transpose', jb, j, -1.0,
				A, sa1, sa2, offsetA + (j * sa1),
				1.0,
				A, sa1, sa2, offsetA + (j * sa1) + (j * sa2)
			);
			info = zpotrf2( 'lower', jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
			if ( info !== 0 ) {
				return info + j;
			}
			if ( j + jb < N ) {
				// Update the off-diagonal block
				zgemm( 'no-transpose', 'conjugate-transpose', N - j - jb, jb, j, MCONE,
					A, sa1, sa2, offsetA + (( j + jb ) * sa1),
					A, sa1, sa2, offsetA + (j * sa1),
					CONE,
					A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2)
				);
				ztrsm( 'right', 'lower', 'conjugate-transpose', 'non-unit', N - j - jb, jb, CONE,
					A, sa1, sa2, offsetA + (j * sa1) + (j * sa2),
					A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2)
				);
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zpotrf;
