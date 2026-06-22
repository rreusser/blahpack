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

// MODULES //

import ddot from '../../../../blas/base/ddot/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes the product of an upper or lower triangular matrix with its.
* transpose (unblocked algorithm).
*
* If UPLO = 'U', computes `U*U^T` (upper triangle of result stored in A).
* If UPLO = 'L', computes L^T*L (lower triangle of result stored in A).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the triangular matrix
* @param {Float64Array} A - input/output triangular matrix (overwritten with result)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} info - 0 if successful
*/
function dlauu2( uplo, N, A, strideA1, strideA2, offsetA ) {
	var upper;
	var aii;
	var sa1;
	var sa2;
	var i;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;

	if ( upper ) {
		// Compute U * U^T
		for ( i = 0; i < N; i++ ) {
			aii = A[ offsetA + (i * sa1) + (i * sa2) ];
			if ( i < N - 1 ) {
				// A(i,i) = dot product of row i from diagonal onward:
				// ddot( N-i, A(i,i), LDA, A(i,i), LDA )
				// In row i, columns i..N-1 are accessed with stride sa2
				A[ offsetA + (i * sa1) + (i * sa2) ] = ddot(N - i, A, sa2, offsetA + (i * sa1) + (i * sa2), A, sa2, offsetA + (i * sa1) + (i * sa2));

				// Update rows 0..i-1 of column i:

				// dgemv('no-transpose', i, N-i-1, 1.0, A(0,i+1), LDA, A(i,i+1), LDA, aii, A(0,i), 1)
				dgemv('no-transpose', i, N - i - 1, 1.0, A, sa1, sa2, offsetA + (( i + 1 ) * sa2),       // A(:, i+1)
					A, sa2, offsetA + (i * sa1) + (( i + 1 ) * sa2),  // A(i, i+1:) stride=sa2
					aii, A, sa1, offsetA + (i * sa2)                      // A(:, i) stride=sa1
				);
			} else {
				// Last column: just scale A(:,N-1) by aii
				// dscal( N, aii, A(0,i), 1 )
				dscal( N, aii, A, sa1, offsetA + (i * sa2) );
			}
		}
	} else {
		// Compute L^T * L
		for ( i = 0; i < N; i++ ) {
			aii = A[ offsetA + (i * sa1) + (i * sa2) ];
			if ( i < N - 1 ) {
				// A(i,i) = dot product of column i from diagonal onward:
				// ddot( N-i, A(i,i), 1, A(i,i), 1 )
				// In column i, rows i..N-1 are accessed with stride sa1
				A[ offsetA + (i * sa1) + (i * sa2) ] = ddot(N - i, A, sa1, offsetA + (i * sa1) + (i * sa2), A, sa1, offsetA + (i * sa1) + (i * sa2));

				// Update columns 0..i-1 of row i:

				// dgemv('transpose', N-i-1, i, 1.0, A(i+1,0), LDA, A(i+1,i), 1, aii, A(i,0), LDA)
				dgemv('transpose', N - i - 1, i, 1.0, A, sa1, sa2, offsetA + (( i + 1 ) * sa1),       // A(i+1, :)
					A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2),  // A(i+1:, i) stride=sa1
					aii, A, sa2, offsetA + (i * sa1)                      // A(i, :) stride=sa2
				);
			} else {
				// Last row: just scale A(N-1,:) by aii
				// dscal( N, aii, A(i,0), LDA )
				dscal( N, aii, A, sa2, offsetA + (i * sa1) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dlauu2;
