/**
 * Computes the value of the one-norm, Frobenius norm, infinity-norm, or the.
 * largest absolute value of any element of a complex Hermitian matrix.
 *
 * For a Hermitian matrix, the one-norm equals the infinity-norm.
 *
 * ## Notes
 *
 * -   The diagonal elements of a Hermitian matrix are real; only their real
 * part is used in the max-norm and Frobenius-norm calculations.
 *
 * -   The off-diagonal elements are complex; their complex modulus is used.
 *
 *
 * @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Complex128Array} A - complex Hermitian matrix
 * @param {integer} strideA1 - first dimension stride for A (in complex elements)
 * @param {integer} strideA2 - second dimension stride for A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Float64Array} WORK - workspace array (length >= N for `'one-norm'`/`'inf-norm'` norms)
 * @param {integer} strideWORK - stride for WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @throws {TypeError} Second argument must be a valid matrix triangle
 * @returns {number} norm value
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the value of the one-norm, Frobenius norm, infinity-norm, or the.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - complex Hermitian matrix
* @param {integer} strideA1 - first dimension stride for A (in complex elements)
* @param {integer} strideA2 - second dimension stride for A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace array (length >= N for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} first argument must be a valid norm type
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {number} norm value
*/
function zlanhe( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) {
	if ( norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'max' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm type. Value: `%s`.', norm ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	return base( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default zlanhe;
