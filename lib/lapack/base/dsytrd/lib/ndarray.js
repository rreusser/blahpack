/**
 * Reduces a real symmetric matrix A to real symmetric tridiagonal form T.
 * by an orthogonal similarity transformation: `Q__T*A*Q = T`.
 *
 * Uses the blocked algorithm: reduces NB columns at a time using dlatrd
 * (panel factorization) and dsyr2k (trailing matrix update), then finishes
 * the remaining block with dsytd2 (unblocked).
 *
 * If UPLO = 'U', the matrix Q is represented as a product of elementary
 * reflectors `Q = H(n-1)*...*H(2)*H(1)`.
 * If UPLO = 'L', the matrix Q is represented `as Q = H(1)*H(2)*...*H(n-1)`.
 *
 *
 * @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Float64Array} A - input/output symmetric matrix; on exit contains tridiagonal form and reflectors
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @param {Float64Array} d - output array for the diagonal elements of T (length N)
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Float64Array} e - output array for the off-diagonal elements of T (length N-1)
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @param {Float64Array} TAU - output array for the scalar factors of the reflectors (length N-1)
 * @param {integer} strideTAU - stride length for `TAU`
 * @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric matrix A to real symmetric tridiagonal form T.
*
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix; on exit contains tridiagonal form and reflectors
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} d - output array for the diagonal elements of T (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array for the off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAU - output array for the scalar factors of the reflectors (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dsytrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base(uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU );
}


// EXPORTS //

export default dsytrd;
