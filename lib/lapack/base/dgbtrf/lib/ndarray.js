/**
 * Computes an LU factorization of a real M-by-N band matrix A using partial.
 * pivoting with row interchanges (blocked algorithm).
 *
 * This is the blocked version calling Level 3 BLAS. For small bandwidth
 * (NB <= 1 or NB > KL), it falls through to the unblocked dgbtf2.
 *
 * IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
 *
 *
 * @param {NonNegativeInteger} M - number of rows of matrix A
 * @param {NonNegativeInteger} N - number of columns of matrix A
 * @param {NonNegativeInteger} kl - number of subdiagonals
 * @param {NonNegativeInteger} ku - number of superdiagonals
 * @param {Float64Array} AB - band matrix in band storage
 * @param {integer} strideAB1 - stride of the first dimension of AB
 * @param {integer} strideAB2 - stride of the second dimension of AB
 * @param {NonNegativeInteger} offsetAB - starting index for AB
 * @param {Int32Array} IPIV - pivot index output array, length min(M,N)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
 * @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization of a real M-by-N band matrix A using partial.
*
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Float64Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Int32Array} IPIV - pivot index output array, length min(M,N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based)
*/
function dgbtrf( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV );
}


// EXPORTS //

export default dgbtrf;
