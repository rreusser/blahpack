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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetf2 from '../../zhetf2/lib/base.js';
import zlahef from '../../zlahef/lib/base.js';


// VARIABLES //

var NB = 32;


// MAIN //

/**
* Computes the factorization of a complex Hermitian matrix using Bunch-Kaufman.
* diagonal pivoting: A = U_D_U^H or A = L_D_L^H.
*
* Uses blocked algorithm (zlahef) for large matrices and unblocked (zhetf2)
* for small trailing/leading submatrices.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'` indicating upper or lower triangular storage
* @param {integer} N - order of the matrix
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Int32Array} IPIV - output pivot indices
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @returns {integer} info value
*/
function zhetrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var ldwork;
	var result;
	var iinfo;
	var info;
	var nb;
	var kb;
	var W;
	var k;
	var j;

	info = 0;
	if ( N === 0 ) {
		return 0;
	}

	nb = NB;
	if ( nb > 1 && nb < N ) {
		ldwork = N;
	} else {
		nb = N;
	}

	if ( uplo === 'upper' ) {
		k = N;
		while ( k >= 1 ) {
			if ( k > nb ) {
				W = new Complex128Array( ldwork * nb );
				result = zlahef( 'upper', k, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				iinfo = zhetf2( 'upper', k, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );
				kb = k;
			}
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo;
			}
			k -= kb;
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( k <= N - nb - 1 ) {
				W = new Complex128Array( ldwork * nb );
				result = zlahef( 'lower', N - k, nb, A, strideA1, strideA2, offsetA + (k * strideA1) + (k * strideA2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV), W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				iinfo = zhetf2( 'lower', N - k, A, strideA1, strideA2, offsetA + (k * strideA1) + (k * strideA2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV) );
				kb = N - k;
			}
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo + k;
			}
			// Adjust IPIV for lower: offset indices by k
			for ( j = k; j < k + kb; j++ ) {
				if ( IPIV[ offsetIPIV + (j * strideIPIV) ] >= 0 ) {
					IPIV[ offsetIPIV + (j * strideIPIV) ] += k;
				} else {
					IPIV[ offsetIPIV + (j * strideIPIV) ] = ~( ( ~IPIV[ offsetIPIV + (j * strideIPIV) ] ) + k );
				}
			}
			k += kb;
		}
	}

	return info;
}


// EXPORTS //

export default zhetrf;
