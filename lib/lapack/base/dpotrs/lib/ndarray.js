/**
 * Solves a system of linear equations A_X = B with a symmetric positive.
 * definite matrix A using the Cholesky factorization A = U^T_U or A = L*L^T
 * computed by dpotrf.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {NonNegativeInteger} nrhs - number of right-hand side columns
 * @param {Float64Array} A - the Cholesky factor (from dpotrf)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Float64Array} B - right-hand side matrix, overwritten with solution
 * @param {integer} strideB1 - stride of the first dimension of B
 * @param {integer} strideB2 - stride of the second dimension of B
 * @param {NonNegativeInteger} offsetB - index offset for B
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a symmetric positive definite system of linear equations `A*X = B` using the Cholesky factorization computed by dpotrf.
*
* @param {string} uplo - specifies whether the upper or lower triangular factor is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} A - input matrix (Cholesky factor)
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
* // Pre-factored 2x2 SPD matrix and RHS:
* var A = new Float64Array( [ 2, 1, 0, 2 ] );
* var B = new Float64Array( [ 1, 0 ] );
*
* var info = dpotrs( 'upper', 2, 1, A, 1, 2, 0, B, 1, 1, 0 );
* // info => 0
*/
function dpotrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
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

export default dpotrs;
