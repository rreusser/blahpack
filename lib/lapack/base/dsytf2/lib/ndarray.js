/**
 * Computes the factorization of a real symmetric matrix A using the.
 * Bunch-Kaufman diagonal pivoting method:
 *
 * `A = U*D*U^T  or  A = L*D*L^T`
 *
 * where U (or L) is a product of permutation and unit upper (lower)
 * triangular matrices, and D is symmetric and block diagonal with
 * 1-by-1 and 2-by-2 diagonal blocks.
 *
 * IPIV stores 0-based pivot indices. If `IPIV[k]` >= 0, then a 1x1 pivot
 * was used and rows/columns k and `IPIV[k]` were interchanged.
 * If `IPIV[k]` < 0 (for a 2x2 pivot), then `IPIV[k]` = `IPIV[k±1]` = -(p+1)
 * where p is the 0-based row/column that was interchanged.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} A - input/output symmetric matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Int32Array} IPIV - pivot index output array, length N
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the factorization of a real symmetric matrix A using the.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
*/
function dsytf2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );
}


// EXPORTS //

export default dsytf2;
