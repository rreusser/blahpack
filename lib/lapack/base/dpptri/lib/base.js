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

import dtptri from '../../dtptri/lib/base.js';
import dspr from '../../../../blas/base/dspr/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dtpmv from '../../../../blas/base/dtpmv/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric positive definite matrix using the Cholesky factorization `A = U^T * U` or `A = L * L^T` computed by dpptrf, where the matrix is stored in packed format.
*
* ## Notes
*
* -   The packed triangular matrix `AP` is stored column-wise in a linear array of length `N*(N+1)/2`.
* -   For upper triangular: column `j` occupies positions `jc` to `jc+j` (0-based), where `jc = j*(j+1)/2`.
* -   For lower triangular: column `j` starts at `jj = j*(2*N-j+1)/2` (0-based).
* -   On exit, `AP` is overwritten with the upper or lower triangle of the inverse.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix, dimension `N*(N+1)/2`
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {integer} info - `0` if successful; `k > 0` if the `k`-th diagonal element of the triangular factor is zero (1-based)
*/
function dpptri( uplo, N, AP, strideAP, offsetAP ) {
	var info;
	var ajj;
	var jjn;
	var jc;
	var jj;
	var sa;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	sa = strideAP;

	// Invert the triangular Cholesky factor U or L...
	info = dtptri( uplo, 'non-unit', N, AP, sa, offsetAP );
	if ( info > 0 ) {
		return info;
	}

	if ( uplo === 'upper' ) {
		// Compute the product inv(U) * inv(U)^T.
		// Fortran uses 1-based JJ starting at 0, JC = JJ+1:
		//   JJ = 0; DO J=1..N: JC=JJ+1; JJ=JJ+J; ...
		// In 0-based indexing:
		//   jj (diagonal of col j) = j*(j+1)/2 + j = (j+2)*(j+1)/2 - 1
		//   jc (start of col j) = j*(j+1)/2
		jj = -1; // will become 0 after first increment
		for ( j = 0; j < N; j++ ) {
			jc = jj + 1; // 0-based start of column j
			jj += j + 1; // 0-based diagonal of column j

			// dspr: AP := 1.0 * AP[jc..jc+j-1] * AP[jc..jc+j-1]^T + AP
			if ( j > 0 ) {
				dspr( 'upper', j, 1.0, AP, sa, offsetAP + ( jc * sa ), AP, sa, offsetAP );
			}

			// Scale column j by the diagonal element
			ajj = AP[ offsetAP + ( jj * sa ) ];
			dscal( j + 1, ajj, AP, sa, offsetAP + ( jc * sa ) );
		}
	} else {
		// Compute the product inv(L)^T * inv(L).
		// Fortran 1-based: JJ=1; DO J=1..N: JJN=JJ+N-J+1; ...
		// In 0-based: jj = 0 (diagonal of column 0 in lower packed)
		jj = 0;
		for ( j = 0; j < N; j++ ) {
			jjn = jj + N - j; // start of next column (diagonal of column j+1)

			// AP(jj) = dot(N-j, AP(jj:), AP(jj:))
			AP[ offsetAP + ( jj * sa ) ] = ddot( N - j, AP, sa, offsetAP + ( jj * sa ), AP, sa, offsetAP + ( jj * sa ) );

			// Apply dtpmv on subdiagonal elements of column j
			if ( j < N - 1 ) {
				dtpmv( 'lower', 'transpose', 'non-unit', N - j - 1, AP, sa, offsetAP + ( jjn * sa ), AP, sa, offsetAP + ( ( jj + 1 ) * sa ) );
			}

			jj = jjn;
		}
	}
	return 0;
}


// EXPORTS //

export default dpptri;
