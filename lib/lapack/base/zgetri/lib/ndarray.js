/**
 * Computes the inverse of a matrix using the LU factorization computed by zgetrf.
 *
 * This method inverts U and then computes inv(A) by solving the system
 * inv(A)*L = inv(U) for inv(A).
 *
 * IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
 *
 *
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128Array} A - input/output matrix; on entry, the L and U factors from zgetrf; on exit, the inverse
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
 * @param {Complex128Array} WORK - workspace array of length at least max(1, lwork)
 * @param {integer} strideWork - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
 * @param {integer} lwork - length of the WORK array (complex elements); should be at least N for unblocked, N*NB for blocked
 * @returns {integer} info - 0 if successful, k>0 if U(k,k) is exactly zero (singular)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a matrix using the LU factorization computed by zgetrf.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output matrix; on entry, the L and U factors from zgetrf; on exit, the inverse
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} WORK - workspace array of length at least max(1, lwork)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - length of the WORK array (complex elements); should be at least N for unblocked, N*NB for blocked
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if U(k,k) is exactly zero (singular)
*/
function zgetri( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, lwork ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, lwork );
}


// EXPORTS //

export default zgetri;
