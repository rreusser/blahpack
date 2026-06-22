/**
 * Computes row and column scalings to equilibrate a complex Hermitian positive definite band matrix and reduce its condition number.
 *
 * ## Notes
 *
 * -   `S(i) = 1 / sqrt( real(A(i,i)) )`. The choice of S puts the condition number of
 *     `B = S*A*S` within a factor N of the smallest possible condition number.
 *
 *
 * @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {NonNegativeInteger} kd - number of superdiagonals (if upper) or subdiagonals (if lower)
 * @param {Complex128Array} AB - input band matrix in band storage
 * @param {integer} strideAB1 - stride of the first dimension of `AB`
 * @param {integer} strideAB2 - stride of the second dimension of `AB`
 * @param {NonNegativeInteger} offsetAB - starting index for `AB`
 * @param {Float64Array} s - output scale factors, length N
 * @param {integer} strideS - stride for `s`
 * @param {NonNegativeInteger} offsetS - starting index for `s`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Object} result with `info`, `scond`, and `amax` properties
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes row and column scalings to equilibrate a complex Hermitian positive definite band matrix and reduce its condition number.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (if upper) or subdiagonals (if lower)
* @param {Complex128Array} AB - input band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} s - output scale factors, length N
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @returns {Object} result with `info`, `scond`, and `amax` properties
*/
function zpbequ( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, s, strideS, offsetS ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, s, strideS, offsetS );
}


// EXPORTS //

export default zpbequ;
