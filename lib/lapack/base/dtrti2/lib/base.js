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

import dtrmv from '../../../../blas/base/dtrmv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real upper or lower triangular matrix.
* using the unblocked algorithm.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input/output triangular matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} info - 0 if successful
*/
function dtrti2( uplo, diag, N, A, strideA1, strideA2, offsetA ) {
	var nounit;
	var upper;
	var sa1;
	var sa2;
	var ajj;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	nounit = ( diag === 'non-unit' );
	sa1 = strideA1;
	sa2 = strideA2;

	if ( upper ) {
		// Compute inverse of upper triangular matrix
		for ( j = 0; j < N; j++ ) {
			if ( nounit ) {
				A[ offsetA + (j * sa1) + (j * sa2) ] = 1.0 / A[ offsetA + (j * sa1) + (j * sa2) ];
				ajj = -A[ offsetA + (j * sa1) + (j * sa2) ];
			} else {
				ajj = -1.0;
			}

			// Compute elements 0:j-1 of j-th column
			dtrmv( 'upper', 'no-transpose', diag, j, A, sa1, sa2, offsetA, A, sa1, offsetA + (j * sa2) );
			dscal( j, ajj, A, sa1, offsetA + (j * sa2) );
		}
	} else {
		// Compute inverse of lower triangular matrix
		for ( j = N - 1; j >= 0; j-- ) {
			if ( nounit ) {
				A[ offsetA + (j * sa1) + (j * sa2) ] = 1.0 / A[ offsetA + (j * sa1) + (j * sa2) ];
				ajj = -A[ offsetA + (j * sa1) + (j * sa2) ];
			} else {
				ajj = -1.0;
			}
			if ( j < N - 1 ) {
				// Compute elements j+1:N-1 of j-th column
				dtrmv( 'lower', 'no-transpose', diag, N - j - 1, A, sa1, sa2, offsetA + (( j + 1 ) * sa1) + (( j + 1 ) * sa2), A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2) );
				dscal( N - j - 1, ajj, A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dtrti2;
