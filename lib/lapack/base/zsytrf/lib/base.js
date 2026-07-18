/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsytf2 from '../../zsytf2/lib/base.js';
import zlasyf from '../../zlasyf/lib/base.js';
const NB = 32;

/**
* Compute the factorization of a complex symmetric matrix using Bunch-Kaufman diagonal pivoting.
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
function zsytrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	let ldwork, result, iinfo, info, nb, kb, W, k, j;
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
				result = zlasyf( 'upper', k, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				iinfo = zsytf2( 'upper', k, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );
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
				result = zlasyf( 'lower', N - k, nb, A, strideA1, strideA2, offsetA + (k * strideA1) + (k * strideA2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV), W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				iinfo = zsytf2( 'lower', N - k, A, strideA1, strideA2, offsetA + (k * strideA1) + (k * strideA2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV) );
				kb = N - k;
			}
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo + k;
			}
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
export default zsytrf;
