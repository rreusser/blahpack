/**
 * Computes an LU factorization of a real M-by-N band matrix A using partial.
 * pivoting with row interchanges (unblocked algorithm).
 *
 * The factorization has the form `A = P*L*U` where P is a permutation
 * matrix, L is lower triangular with unit diagonal, and U is upper triangular.
 *
 * The band matrix A is stored in band format:
 * AB(kl+ku+1+i-j, j) = A(i,j) for max(1,j-ku) <= i <= min(m,j+kl)
 * (using 1-based Fortran indexing). In the JS stride/offset API,
 * rows map to strideAB1, columns to strideAB2.
 *
 * On entry, the first KL rows of AB need not be set (fill-in space for U).
 * On exit, the factored form is stored with:
 *
 * -   U as an upper triangular band matrix with KL+KU superdiagonals
 * -   L multipliers stored below the diagonal
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
function dgbtf2( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV ) {
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

export default dgbtf2;
