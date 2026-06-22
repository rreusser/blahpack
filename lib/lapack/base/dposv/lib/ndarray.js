/**
 * Computes the solution to a real system of linear equations A*X = B.
 * where A is an N-by-N symmetric positive definite matrix and X and B
 * are N-by-NRHS matrices.
 *
 * The Cholesky decomposition is used to factor A as:
 * `A = U^T*U`,  if uplo = 'upper', or
 * `A = L*L^T`,  if uplo = 'lower',
 * where U is upper triangular and L is lower triangular. The factored
 * form of A is then used to solve the system A*X = B.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {NonNegativeInteger} nrhs - number of right-hand side columns
 * @param {Float64Array} A - input/output matrix; on exit, the Cholesky factor
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Float64Array} B - input/output N-by-NRHS matrix; on exit, the solution X
 * @param {integer} strideB1 - stride of the first dimension of B
 * @param {integer} strideB2 - stride of the second dimension of B
 * @param {NonNegativeInteger} offsetB - index offset for B
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, k>0 if A is not positive definite
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the solution to a real system of linear equations `A*X = B` where `A` is a symmetric positive definite matrix.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} A - input/output matrix (factored on output)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 4, 2, 2, 5 ] );
* var B = new Float64Array( [ 1, 0 ] );
*
* var info = dposv( 'upper', 2, 1, A, 1, 2, 0, B, 1, 1, 0 );
* // info => 0
*/
function dposv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default dposv;
