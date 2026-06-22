/**
 * Perform Hermitian matrix-vector multiplication:.
 * `y := alpha*A*x + beta * y`
 * where A is an N-by-N Hermitian matrix.
 *
 *
 * @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128} alpha - complex scalar
 * @param {Complex128Array} A - Hermitian matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Complex128Array} x - complex input vector
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @param {Complex128} beta - complex scalar
 * @param {Complex128Array} y - complex input/output vector
 * @param {integer} strideY - stride for y (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Complex128Array} `y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the matrix-vector operation `y = alpha*A*x + beta*y` where `A` is an `N` by `N` Hermitian matrix, `x` and `y` are `N` element complex vectors, and `alpha` and `beta` are complex scalars.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is used
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Complex128} beta - complex scalar constant
* @param {Complex128Array} y - output vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be non-zero
* @throws {RangeError} thirteenth argument must be non-zero
* @returns {Complex128Array} `y`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
*
* var A = new Complex128Array( [ 1, 0, 2, 1, 2, -1, 3, 0 ] );
* var x = new Complex128Array( [ 1, 0, 1, 0 ] );
* var y = new Complex128Array( [ 0, 0, 0, 0 ] );
* var alpha = new Complex128( 1, 0 );
* var beta = new Complex128( 0, 0 );
*
* zhemv( 'upper', 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
*/
function zhemv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	if ( N === 0 ) {
		return y;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	return base( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY );
}


// EXPORTS //

export default zhemv;
