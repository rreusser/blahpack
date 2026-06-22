/**
 * Computes an LU factorization of a general complex M-by-N matrix A using.
 * partial pivoting with row interchanges (blocked algorithm).
 *
 * The factorization has the form `A = P*L*U` where P is a permutation
 * matrix, L is lower triangular with unit diagonal elements, and U is upper
 * triangular.
 *
 * Uses zgetrf2 for panel factorizations, then zlaswp + ztrsm + zgemm for
 * trailing matrix updates.
 *
 * IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
 *
 *
 * @param {NonNegativeInteger} M - number of rows of matrix A
 * @param {NonNegativeInteger} N - number of columns of matrix A
 * @param {Complex128Array} A - input/output complex matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
 * @param {Int32Array} IPIV - pivot index output array, length min(M,N) (0-based)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based singularity index)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization of a general complex M-by-N matrix A using.
*
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {Complex128Array} A - input/output complex matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Int32Array} IPIV - pivot index output array, length min(M,N) (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based singularity index)
*/
function zgetrf( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );
}


// EXPORTS //

export default zgetrf;
