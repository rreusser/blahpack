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

import dlauu2 from '../../dlauu2/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// VARIABLES //

var NB = 32; // Block size for blocked algorithm


// MAIN //

/**
* Computes the product of a triangular matrix with its transpose.
*
* If UPLO = 'U', computes `U*U^T` (upper triangular input, result is upper triangle of symmetric product).
* If UPLO = 'L', computes L^T*L (lower triangular input, result is upper triangle stored in lower).
*
* On exit, the upper (or lower) triangle of A is overwritten with the
* upper (or lower) triangle of the product.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the triangular matrix
* @param {Float64Array} A - input/output triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} info - 0 if successful
*/
function dlauum( uplo, N, A, strideA1, strideA2, offsetA ) {
	var upper;
	var sa1;
	var sa2;
	var ib;
	var i;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;

	// Use unblocked code for small matrices
	if ( NB <= 1 || NB >= N ) {
		return dlauu2( uplo, N, A, sa1, sa2, offsetA );
	}

	// Blocked algorithm
	if ( upper ) {
		// Compute U * U^T by blocks
		for ( i = 0; i < N; i += NB ) {
			ib = Math.min( NB, N - i );

			// Update the leading i rows of the current block column:

			// A(0:i-1, i:i+ib-1) := A(0:i-1, i:i+ib-1) * U(i:i+ib-1, i:i+ib-1)^T
			dtrmm( 'right', 'upper', 'transpose', 'non-unit', i, ib, 1.0, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2), A, sa1, sa2, offsetA + (i * sa2) );

			// Compute the product of the diagonal block:

			// A(i:i+ib-1, i:i+ib-1) := U(i:i+ib-1, i:i+ib-1) * U(i:i+ib-1, i:i+ib-1)^T
			dlauu2( 'upper', ib, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2) );

			if ( i + ib < N ) {
				// Update the leading i rows using remaining columns:
				// A(0:i-1, i:i+ib-1) += A(0:i-1, i+ib:N-1) * A(i:i+ib-1, i+ib:N-1)^T
				dgemm( 'no-transpose', 'transpose', i, ib, N - i - ib, 1.0, A, sa1, sa2, offsetA + (( i + ib ) * sa2), A, sa1, sa2, offsetA + (i * sa1) + (( i + ib ) * sa2), 1.0, A, sa1, sa2, offsetA + (i * sa2) );

				// Rank-ib update of diagonal block:

				// A(i:i+ib-1, i:i+ib-1) += A(i:i+ib-1, i+ib:N-1) * A(i:i+ib-1, i+ib:N-1)^T
				dsyrk( 'upper', 'no-transpose', ib, N - i - ib, 1.0, A, sa1, sa2, offsetA + (i * sa1) + (( i + ib ) * sa2), 1.0, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2) );
			}
		}
	} else {
		// Compute L^T * L by blocks
		for ( i = 0; i < N; i += NB ) {
			ib = Math.min( NB, N - i );

			// Update the leading i columns of the current block row:

			// A(i:i+ib-1, 0:i-1) := L(i:i+ib-1, i:i+ib-1)^T * A(i:i+ib-1, 0:i-1)
			dtrmm( 'left', 'lower', 'transpose', 'non-unit', ib, i, 1.0, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2), A, sa1, sa2, offsetA + (i * sa1) );

			// Compute the product of the diagonal block:

			// A(i:i+ib-1, i:i+ib-1) := L(i:i+ib-1, i:i+ib-1)^T * L(i:i+ib-1, i:i+ib-1)
			dlauu2( 'lower', ib, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2) );

			if ( i + ib < N ) {
				// Update the leading i columns using remaining rows:
				// A(i:i+ib-1, 0:i-1) += A(i+ib:N-1, i:i+ib-1)^T * A(i+ib:N-1, 0:i-1)
				dgemm( 'transpose', 'no-transpose', ib, i, N - i - ib, 1.0, A, sa1, sa2, offsetA + (( i + ib ) * sa1) + (i * sa2), A, sa1, sa2, offsetA + (( i + ib ) * sa1), 1.0, A, sa1, sa2, offsetA + (i * sa1) );

				// Rank-ib update of diagonal block:

				// A(i:i+ib-1, i:i+ib-1) += A(i+ib:N-1, i:i+ib-1)^T * A(i+ib:N-1, i:i+ib-1)
				dsyrk( 'lower', 'transpose', ib, N - i - ib, 1.0, A, sa1, sa2, offsetA + (( i + ib ) * sa1) + (i * sa2), 1.0, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dlauum;
