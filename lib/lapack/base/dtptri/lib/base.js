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

import dtpmv from '../../../../blas/base/dtpmv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real upper or lower triangular matrix in packed storage.
*
* ## Notes
*
* -   The packed triangular matrix `AP` is stored column-wise in a linear array of length `N*(N+1)/2`.
* -   For upper triangular: `AP(i + j*(j+1)/2) = A(i,j)` for `0 <= i <= j`.
* -   For lower triangular: `AP(i-j + j*(2*N-j-1)/2) = A(i,j)` for `j <= i < N`.
* -   On exit, `AP` is overwritten with the inverse of the original matrix.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix, dimension `N*(N+1)/2`
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {integer} info - `0` if successful, `k` if `A(k,k)` is exactly zero (1-based)
*/
function dtptri( uplo, diag, N, AP, strideAP, offsetAP ) {
	var jclast;
	var nounit;
	var upper;
	var ajj;
	var jc;
	var jj;
	var j;
	var k;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	nounit = ( diag === 'non-unit' );

	// Check for singularity if non-unit...
	if ( nounit ) {
		if ( upper ) {
			jj = -1;
			for ( k = 0; k < N; k++ ) {
				jj += k + 1;
				if ( AP[ offsetAP + ( jj * strideAP ) ] === 0.0 ) {
					return k + 1;
				}
			}
		} else {
			jj = 0;
			for ( k = 0; k < N; k++ ) {
				if ( AP[ offsetAP + ( jj * strideAP ) ] === 0.0 ) {
					return k + 1;
				}
				jj += N - k;
			}
		}
	}

	if ( upper ) {
		// Compute inverse of upper triangular matrix...
		jc = 0;
		for ( j = 0; j < N; j++ ) {
			if ( nounit ) {
				AP[ offsetAP + ( ( jc + j ) * strideAP ) ] = 1.0 / AP[ offsetAP + ( ( jc + j ) * strideAP ) ];
				ajj = -AP[ offsetAP + ( ( jc + j ) * strideAP ) ];
			} else {
				ajj = -1.0;
			}

			// Compute elements 0:j-1 of j-th column...
			dtpmv( 'upper', 'no-transpose', diag, j, AP, strideAP, offsetAP, AP, strideAP, offsetAP + ( jc * strideAP ) );
			dscal( j, ajj, AP, strideAP, offsetAP + ( jc * strideAP ) );
			jc += j + 1;
		}
	} else {
		// Compute inverse of lower triangular matrix...
		jc = ( ( N * ( N + 1 ) ) / 2 ) - 1;
		for ( j = N - 1; j >= 0; j-- ) {
			if ( nounit ) {
				AP[ offsetAP + ( jc * strideAP ) ] = 1.0 / AP[ offsetAP + ( jc * strideAP ) ];
				ajj = -AP[ offsetAP + ( jc * strideAP ) ];
			} else {
				ajj = -1.0;
			}
			if ( j < N - 1 ) {
				// Compute elements j+1:N-1 of j-th column...
				dtpmv( 'lower', 'no-transpose', diag, N - j - 1, AP, strideAP, offsetAP + ( jclast * strideAP ), AP, strideAP, offsetAP + ( ( jc + 1 ) * strideAP ) );
				dscal( N - j - 1, ajj, AP, strideAP, offsetAP + ( ( jc + 1 ) * strideAP ) );
			}
			jclast = jc;
			jc -= ( N - j + 1 );
		}
	}
	return 0;
}


// EXPORTS //

export default dtptri;
