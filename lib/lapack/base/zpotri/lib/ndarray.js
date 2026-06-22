/**
 * Computes the inverse of a complex Hermitian positive definite matrix using.
 * its Cholesky factorization computed by zpotrf.
 *
 * The inverse is computed by first inverting the triangular Cholesky factor
 * (ztrtri), then forming the product of the inverted factor with its
 * conjugate transpose (zlauum).
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128Array} A - input/output matrix; on entry, the triangular factor from zpotrf; on exit, the inverse
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} status code - 0 indicates success, k > 0 indicates the k-th diagonal element of the triangular factor is zero and the matrix is singular
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a complex Hermitian positive definite matrix using.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output matrix; on entry, the triangular factor from zpotrf; on exit, the inverse
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code - 0 indicates success, k > 0 indicates the k-th diagonal element of the triangular factor is zero and the matrix is singular
*/
function zpotri( uplo, N, A, strideA1, strideA2, offsetA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zpotri;
