/**
 * Computes the inverse of a matrix using the LU factorization computed by dgetrf.
 *
 * This method inverts U and then computes inv(A) by solving the system
 * inv(A)*L = inv(U) for inv(A).
 *
 * IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
 *
 *
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} A - input/output matrix; on entry, the L and U factors from dgetrf; on exit, the inverse
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Int32Array} IPIV - pivot indices from dgetrf (0-based)
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
 * @param {Float64Array} WORK - workspace array of length at least max(1, lwork)
 * @param {integer} strideWork - stride for WORK
 * @param {NonNegativeInteger} offsetWork - starting index for WORK
 * @param {integer} lwork - length of the WORK array; should be at least N for unblocked, N*NB for blocked
 * @returns {integer} info - 0 if successful, k>0 if U(k,k) is exactly zero (singular)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a matrix using the LU factorization computed by dgetrf.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output matrix; on entry, the L and U factors from dgetrf; on exit, the inverse
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} IPIV - pivot indices from dgetrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Float64Array} WORK - workspace array of length at least max(1, lwork)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of the WORK array; should be at least N for unblocked, N*NB for blocked
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if U(k,k) is exactly zero (singular)
*/
function dgetri( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, lwork ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, lwork );
}


// EXPORTS //

export default dgetri;
