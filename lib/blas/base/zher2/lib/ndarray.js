/**
 * Perform Hermitian rank-2 update:.
 * `A := alpha*x*conj(y)^T + conj(alpha)*y*conj(x)^T + A`
 * where A is an N-by-N Hermitian matrix and x, y are N-element vectors.
 *
 *
 * @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128} alpha - complex scalar
 * @param {Complex128Array} x - complex input vector
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @param {Complex128Array} y - complex input vector
 * @param {integer} strideY - stride for y (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
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
* Performs the Hermitian rank 2 operation `A = alpha*x*conj(y)^T + conj(alpha)*y*conj(x)^T + A` where `A` is an `N` by `N` Hermitian matrix, `x` and `y` are `N` element complex vectors, and `alpha` is a complex scalar.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is used
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} x - first input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Complex128Array} y - second input vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be non-zero
* @throws {RangeError} eighth argument must be non-zero
* @returns {Complex128Array} `A`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
*
* var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
* var x = new Complex128Array( [ 1, 0, 0, 1 ] );
* var y = new Complex128Array( [ 0, 1, 1, 0 ] );
* var alpha = new Complex128( 1, 0 );
*
* zher2( 'upper', 2, alpha, x, 1, 0, y, 1, 0, A, 1, 2, 0 );
*/
function zher2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	if ( N === 0 ) {
		return A;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	return base( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zher2;
