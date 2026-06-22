/**
 * Computes a partial factorization of a real symmetric matrix A using the.
 * Bunch-Kaufman diagonal pivoting method. This is the blocked panel
 * factorization used by dsytrf.
 *
 * The routine factorizes NB columns of A and returns the number of columns
 * factored in the return value's `kb` field.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {NonNegativeInteger} nb - maximum number of columns to factor
 * @param {Float64Array} A - input/output symmetric matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Int32Array} IPIV - pivot index output array, length N
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @param {Float64Array} W - workspace matrix, dimensions N x NB
 * @param {integer} strideW1 - stride of the first dimension of W
 * @param {integer} strideW2 - stride of the second dimension of W
 * @param {NonNegativeInteger} offsetW - index offset for W
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Object} result - { info, kb } where info=0 on success, kb=columns factored
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a partial factorization of a real symmetric matrix A using the.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} W - workspace matrix, dimensions N x NB
* @param {integer} strideW1 - stride of the first dimension of W
* @param {integer} strideW2 - stride of the second dimension of W
* @param {NonNegativeInteger} offsetW - index offset for W
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {Object} result - { info, kb } where info=0 on success, kb=columns factored
*/
function dlasyf( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nb < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nb ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW );
}


// EXPORTS //

export default dlasyf;
