/**
 * Performs the matrix-vector operation:.
 * `y := alpha*A*x + beta * y`
 * where A is an N-by-N symmetric matrix, x and y are N-element vectors,
 * and alpha and beta are scalars.
 *
 *
 * @param {string} uplo - specifies whether the upper or lower triangular part of A is stored (`'upper'` or `'lower'`)
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {number} alpha - scalar multiplier for A*x
 * @param {Float64Array} A - input matrix
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @param {Float64Array} x - input vector
 * @param {integer} strideX - stride length for `x`
 * @param {NonNegativeInteger} offsetX - starting index for `x`
 * @param {number} beta - scalar multiplier for y
 * @param {Float64Array} y - input/output vector
 * @param {integer} strideY - stride length for `y`
 * @param {NonNegativeInteger} offsetY - starting index for `y`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Float64Array} `y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the matrix-vector operation `y = alpha*A*x + beta*y` where `A` is an `N` by `N` symmetric matrix, `x` and `y` are `N` element vectors, and `alpha` and `beta` are scalars.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is used
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - output vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be non-zero
* @throws {RangeError} thirteenth argument must be non-zero
* @returns {Float64Array} `y`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 1, 2, 2, 3 ] );
* var x = new Float64Array( [ 1, 1 ] );
* var y = new Float64Array( [ 0, 0 ] );
*
* dsymv( 'upper', 2, 1.0, A, 1, 2, 0, x, 1, 0, 0.0, y, 1, 0 );
* // y => <Float64Array>[ 3, 5 ]
*/
function dsymv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
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
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
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

export default dsymv;
