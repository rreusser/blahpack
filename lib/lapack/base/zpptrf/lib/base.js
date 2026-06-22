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

/* eslint-disable max-len */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zhpr from '../../../../blas/base/zhpr/lib/base.js';
import ztpsv from '../../../../blas/base/ztpsv/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite matrix stored in packed format.
*
* The factorization has the form
* `A = U^H * U` if `uplo = 'upper'`, or
* `A = L * L^H` if `uplo = 'lower'`,
* where `U` is upper triangular and `L` is lower triangular.
*
* @private
* @param {string} uplo - specifies whether the upper (`'upper'`) or lower (`'lower'`) triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} AP - packed triangular matrix `A`
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @returns {integer} info - 0 if successful, `k > 0` if the leading minor of order `k` is not positive definite
*/
function zpptrf( uplo, N, AP, strideAP, offsetAP ) {
	var APv;
	var ajj;
	var sap;
	var oAP;
	var jj;
	var jc;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	APv = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oAP = offsetAP * 2;

	if ( uplo === 'upper' ) {
		// Compute the Cholesky factorization A = U^H * U.

		// Upper packed storage (0-based): column j has elements at positions
		// jc..jc+j-1 (off-diagonals) and jj (diagonal), where
		// jc = j*(j+1)/2 and jj = jc + j = (j+1)*(j+2)/2 - 1.
		jj = 0;
		for ( j = 0; j < N; j++ ) {
			jc = jj - j;

			// Compute elements 0:j-1 of column j.
			if ( j > 0 ) {
				ztpsv( 'upper', 'conjugate-transpose', 'non-unit', j, AP, strideAP, offsetAP, AP, strideAP, offsetAP + ( jc * strideAP ) );
			}

			// Compute U(j,j) and test for non-positive-definiteness.
			// AJJ = DBLE(AP(JJ)) - DBLE(ZDOTC(J-1, AP(JC), 1, AP(JC), 1))
			ajj = APv[ oAP + ( jj * sap ) ] - real( zdotc( j, AP, strideAP, offsetAP + ( jc * strideAP ), AP, strideAP, offsetAP + ( jc * strideAP ) ) );
			if ( ajj <= 0.0 ) {
				APv[ oAP + ( jj * sap ) ] = ajj;
				APv[ oAP + ( jj * sap ) + 1 ] = 0.0;
				return j + 1;
			}
			APv[ oAP + ( jj * sap ) ] = Math.sqrt( ajj );
			APv[ oAP + ( jj * sap ) + 1 ] = 0.0;

			// Advance jj to the diagonal of the next column.
			jj += j + 2;
		}
	} else {
		// Compute the Cholesky factorization A = L * L^H.

		// Lower packed storage (0-based): column j has the diagonal at position
		// jj, followed by N-j-1 sub-diagonal elements.
		jj = 0;
		for ( j = 0; j < N; j++ ) {
			// Compute L(j,j) and test for non-positive-definiteness.
			ajj = APv[ oAP + ( jj * sap ) ];
			if ( ajj <= 0.0 ) {
				APv[ oAP + ( jj * sap ) ] = ajj;
				APv[ oAP + ( jj * sap ) + 1 ] = 0.0;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			APv[ oAP + ( jj * sap ) ] = ajj;
			APv[ oAP + ( jj * sap ) + 1 ] = 0.0;

			// Compute elements j+1:N-1 of column j and update the trailing submatrix.
			if ( j < N - 1 ) {
				zdscal( N - j - 1, 1.0 / ajj, AP, strideAP, offsetAP + ( ( jj + 1 ) * strideAP ) );
				zhpr( 'lower', N - j - 1, -1.0, AP, strideAP, offsetAP + ( ( jj + 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( jj + N - j ) * strideAP ) );
				jj += N - j;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zpptrf;
