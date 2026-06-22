/**
 * Perform Hermitian rank-1 update:.
 * `A := alpha*x*x^H + A`
 * where A is an N-by-N Hermitian matrix, x is an N-element vector,
 * and alpha is a real scalar.
 *
 *
 * @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {number} alpha - real scalar
 * @param {Complex128Array} x - complex input vector
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @param {Complex128Array} A - Hermitian matrix (updated in place)
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
* Performs the Hermitian rank 1 operation `A = alpha*x*x^H + A` where `A` is an `N` by `N` Hermitian matrix, `x` is an `N` element complex vector, and `alpha` is a real scalar.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is used
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - real scalar constant
* @param {Complex128Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be non-zero
* @returns {Complex128Array} `A`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
* var x = new Complex128Array( [ 1, 0, 0, 1 ] );
*
* zher( 'upper', 2, 1.0, x, 1, 0, A, 1, 2, 0 );
*/
function zher( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( N === 0 || alpha === 0.0 ) {
		return A;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	return base( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zher;
