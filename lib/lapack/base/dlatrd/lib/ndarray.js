/**
 * Reduces NB rows and columns of a real symmetric matrix A to symmetric.
 * tridiagonal form by an orthogonal similarity transformation `Q__T*A*Q`,
 * and returns the matrices V and W which are needed to apply the
 * transformation to the unreduced part of A.
 *
 * If UPLO = 'U', DLATRD reduces the last NB rows and columns of a matrix,
 * of which the upper triangle is supplied;
 * if UPLO = 'L', DLATRD reduces the first NB rows and columns of a matrix,
 * of which the lower triangle is supplied.
 *
 * This is an auxiliary routine called by DSYTRD.
 *
 *
 * @param {string} uplo - specifies whether the upper or lower triangular part of A is stored (`'upper'` or `'lower'`)
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {integer} nb - number of rows and columns to reduce
 * @param {Float64Array} A - input matrix (N-by-N, symmetric)
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @param {Float64Array} e - off-diagonal elements (length N-1)
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @param {Float64Array} TAU - scalar factors of the elementary reflectors (length N-1)
 * @param {integer} strideTAU - stride length for `TAU`
 * @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
 * @param {Float64Array} W - output matrix (N-by-NB)
 * @param {integer} strideW1 - stride of the first dimension of `W`
 * @param {integer} strideW2 - stride of the second dimension of `W`
 * @param {NonNegativeInteger} offsetW - starting index for `W`
 * @throws {TypeError} First argument must be a valid matrix triangle
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces NB rows and columns of a real symmetric matrix A to symmetric.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of A is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {integer} nb - number of rows and columns to reduce
* @param {Float64Array} A - input matrix (N-by-N, symmetric)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAU - scalar factors of the elementary reflectors (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} W - output matrix (N-by-NB)
* @param {integer} strideW1 - stride of the first dimension of `W`
* @param {integer} strideW2 - stride of the second dimension of `W`
* @param {NonNegativeInteger} offsetW - starting index for `W`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
*/
function dlatrd( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW ) {
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
	return base( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW );
}


// EXPORTS //

export default dlatrd;
