/**
 * CABS1: |re(z)| + |im(z)| — used for pivot selection.
 *
 *
 * @param {Float64Array} v - Float64 view
 * @param {integer} idx - Float64 index of real part
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {number} sum of absolute values of real and imaginary parts
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a partial factorization of a complex symmetric matrix A using the.
* Bunch-Kaufman diagonal pivoting method.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nb - maximum number of columns to factor
* @param {Complex128Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Complex128Array} W - workspace matrix, dimensions N x NB
* @param {integer} strideW1 - stride of the first dimension of W (complex elements)
* @param {integer} strideW2 - stride of the second dimension of W (complex elements)
* @param {NonNegativeInteger} offsetW - index offset for W (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {Object} result - { info, kb } where info=0 on success, kb=columns factored
*/
function zlasyf( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW ) {
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

export default zlasyf;
