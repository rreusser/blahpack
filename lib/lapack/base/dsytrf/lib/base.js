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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytf2 from '../../dsytf2/lib/base.js';
import dlasyf from '../../dlasyf/lib/base.js';


// VARIABLES //

var NB = 32; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes the factorization of a real symmetric matrix A using the.
* Bunch-Kaufman diagonal pivoting method (blocked algorithm):
*
* `A = U*D*U^T  or  A = L*D*L^T`
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is symmetric and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* IPIV stores 0-based pivot indices. Positive values indicate 1x1 pivots.
* Negative values ~kp (bitwise NOT of 0-based index) indicate 2x2 pivots.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k-1,k-1) is exactly zero
*/
function dsytrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var ldwork;
	var result;
	var iinfo;
	var info;
	var sa1;
	var sa2;
	var nb;
	var kb;
	var W;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Determine block size
	nb = NB;
	if ( nb > 1 && nb < N ) {
		ldwork = N;
	} else {
		nb = N; // Use unblocked code for everything
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^T using the upper triangle
		// K is the number of remaining rows/columns, starts at N (processes from right to left)
		k = N;
		while ( k >= 1 ) {
			if ( k > nb ) {
				// Use blocked code for this panel
				W = new Float64Array( ldwork * nb );
				result = dlasyf( 'upper', k, nb, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV, W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use unblocked code for the remaining columns
				iinfo = dsytf2( 'upper', k, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV );
				kb = k;
			}

			// Set info if a zero pivot was encountered
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo;
			}

			k -= kb;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle
		k = 0;
		while ( k < N ) {
			if ( k <= N - nb - 1 ) {
				// Use blocked code
				W = new Float64Array( ldwork * nb );
				result = dlasyf( 'lower', N - k, nb, A, sa1, sa2, offsetA + (k * sa1) + (k * sa2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV), W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use unblocked code
				iinfo = dsytf2( 'lower', N - k, A, sa1, sa2, offsetA + (k * sa1) + (k * sa2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV) );
				kb = N - k;
			}

			// Set info
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo + k;
			}

			// Adjust IPIV for the lower case: add offset k
			for ( j = k; j < k + kb; j++ ) {
				if ( IPIV[ offsetIPIV + (j * strideIPIV) ] >= 0 ) {
					IPIV[ offsetIPIV + (j * strideIPIV) ] += k;
				} else {
					// 2x2 pivot: ~kp is 0-based relative to submatrix, need to add k
					// ~kp + k would be wrong. Need: ~(kp + k)
					// Current value = ~kp_local. kp_local = ~current.
					// New value = ~(kp_local + k)
					IPIV[ offsetIPIV + (j * strideIPIV) ] = ~( ( ~IPIV[ offsetIPIV + (j * strideIPIV) ] ) + k );
				}
			}

			k += kb;
		}
	}

	return info;
}


// EXPORTS //

export default dsytrf;
