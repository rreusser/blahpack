/**
 * Computes the inverse of a real symmetric positive definite matrix using.
 * its Cholesky factorization computed by dpotrf.
 *
 * The inverse is computed by first inverting the triangular Cholesky factor
 * (dtrtri), then forming the product of the inverted factor with its
 * transpose (dlauum).
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} A - input/output matrix; on entry, the triangular factor from dpotrf; on exit, the inverse
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} status code - 0 indicates success, k > 0 indicates the k-th diagonal element of the triangular factor is zero and the matrix is singular
 */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric positive definite matrix `A` using its Cholesky factorization.
*
* @param {string} uplo - specifies whether the upper or lower triangular factor is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output matrix (Cholesky factor on input, inverse on output)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* // Pre-factored 2x2 SPD matrix (upper Cholesky factor):
* var A = new Float64Array( [ 2, 1, 0, 2 ] );
*
* var info = dpotri( 'upper', 2, A, 1, 2, 0 );
* // info => 0
*/
function dpotri( uplo, N, A, strideA1, strideA2, offsetA ) {
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

export default dpotri;
