/**
 * Computes the Cholesky factorization of a complex Hermitian positive definite.
 * matrix A using the unblocked algorithm (Level 2 BLAS).
 *
 * The factorization has the form:
 * `A = U^H*U`,  if uplo = 'upper', or
 * A = L*L^H,  if uplo = 'lower',
 * where U is upper triangular and L is lower triangular.
 *
 *
 * @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {Complex128Array} A - input/output Hermitian matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
 */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a Hermitian positive definite matrix `A` (unblocked algorithm, complex double-precision).
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* var A = new Complex128Array( [ 4, 0, 2, 1, 2, -1, 5, 0 ] );
*
* var info = zpotf2( 'upper', 2, A, 1, 2, 0 );
* // info => 0
*/
function zpotf2( uplo, N, A, strideA1, strideA2, offsetA ) {
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

export default zpotf2;
