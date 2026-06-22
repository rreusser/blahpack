/**
 * Performs the complex symmetric rank-1 operation:.
 * A := alpha_x_x^T + A
 *
 * where alpha is a complex scalar, x is an N element complex vector, and A is
 * an N by N complex symmetric matrix.
 *
 * NOTE: This is a SYMMETRIC (not Hermitian) update — it uses x_x^T, NOT x_x^H.
 * The difference is that x is NOT conjugated.
 *
 *
 * @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128} alpha - complex scalar multiplier
 * @param {Complex128Array} x - complex input vector
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @param {Complex128Array} A - complex symmetric matrix (updated in place)
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Complex128Array} `A`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the complex symmetric rank-1 operation:.
*
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} A - complex symmetric matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {Complex128Array} `A`
*/
function zsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return A;
	}
	return base( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zsyr;
