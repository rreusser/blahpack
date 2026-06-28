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

/* eslint-disable max-len */

// MODULES //

import ddot from '../../../../blas/base/ddot/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dspr from '../../../../blas/base/dspr/lib/base.js';
import dtpsv from '../../../../blas/base/dtpsv/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite matrix stored in packed format.
*
* The factorization has the form
* `A = U^T * U` if `uplo = 'upper'`, or
* `A = L * L^T` if `uplo = 'lower'`,
* where `U` is upper triangular and `L` is lower triangular.
*
* @private
* @param {string} uplo - specifies whether the upper (`'upper'`) or lower (`'lower'`) triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} AP - packed triangular matrix `A`
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {integer} info - 0 if successful, `k > 0` if the leading minor of order `k` is not positive definite
*/
function dpptrf( uplo, N, AP, strideAP, offsetAP ) {
	var ajj;
	var jj;
	var jc;
	var sa;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	sa = strideAP;

	if ( uplo === 'upper' ) {
		// Compute the Cholesky factorization A = U^T * U.

		// Upper packed storage (0-based): column j has elements at positions
		// jc..jc+j-1 (off-diagonals) and jj (diagonal), where
		// jc = j*(j+1)/2 and jj = jc + j = (j+1)*(j+2)/2 - 1.
		jj = 0;
		for ( j = 0; j < N; j += 1 ) {
			jc = jj - j;

			// Compute elements 0:j-1 of column j.
			if ( j > 0 ) {
				dtpsv( 'upper', 'transpose', 'non-unit', j, AP, sa, offsetAP, AP, sa, offsetAP + ( jc * sa ) );
			}

			// Compute U(j,j) and test for non-positive-definiteness.
			ajj = AP[ offsetAP + ( jj * sa ) ] - ddot( j, AP, sa, offsetAP + ( jc * sa ), AP, sa, offsetAP + ( jc * sa ) );
			if ( ajj <= 0.0 ) {
				AP[ offsetAP + ( jj * sa ) ] = ajj;
				return j + 1;
			}
			AP[ offsetAP + ( jj * sa ) ] = Math.sqrt( ajj );

			// Advance jj to the diagonal of the next column.
			jj += j + 2;
		}
	} else {
		// Compute the Cholesky factorization A = L * L^T.

		// Lower packed storage (0-based): column j has the diagonal at position
		// jj, followed by N-j-1 sub-diagonal elements.
		jj = 0;
		for ( j = 0; j < N; j += 1 ) {
			// Compute L(j,j) and test for non-positive-definiteness.
			ajj = AP[ offsetAP + ( jj * sa ) ];
			if ( ajj <= 0.0 ) {
				AP[ offsetAP + ( jj * sa ) ] = ajj;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			AP[ offsetAP + ( jj * sa ) ] = ajj;

			// Compute elements j+1:N-1 of column j and update the trailing submatrix.
			if ( j < N - 1 ) {
				dscal( N - j - 1, 1.0 / ajj, AP, sa, offsetAP + ( ( jj + 1 ) * sa ) );
				dspr( 'lower', N - j - 1, -1.0, AP, sa, offsetAP + ( ( jj + 1 ) * sa ), AP, sa, offsetAP + ( ( jj + N - j ) * sa ) );
				jj += N - j;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dpptrf;
