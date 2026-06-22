/**
 * Solves a system of linear equations A_X = B with a real symmetric matrix A.
 * using the factorization A = U_D_U^T or A = L_D*L^T computed by dsytrf.
 *
 * IPIV uses the same 0-based convention as dsytf2/dsytrf:
 *
 * -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`
 * -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = ~kp (bitwise NOT of 0-based index)
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {NonNegativeInteger} nrhs - number of right-hand side vectors
 * @param {Float64Array} A - factored matrix from dsytrf (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {Int32Array} IPIV - pivot indices from dsytrf
 * @param {integer} strideIPIV - stride for IPIV
 * @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
 * @param {Float64Array} B - input/output right-hand side / solution matrix
 * @param {integer} strideB1 - stride of the first dimension of B
 * @param {integer} strideB2 - stride of the second dimension of B
 * @param {NonNegativeInteger} offsetB - index offset for B
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} info - 0 on success
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a system of linear equations A.
*
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Float64Array} A - factored matrix from dsytrf (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot indices from dsytrf
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 on success
*/
function dsytrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default dsytrs;
