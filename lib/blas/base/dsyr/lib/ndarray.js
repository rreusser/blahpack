/**
 * Performs the symmetric rank 1 operation:.
 * A := alpha_x_x**T + A,
 * where alpha is a real scalar, x is an N element vector, and A is an
 * N by N symmetric matrix.
 *
 *
 * @param {string} uplo - specifies whether the upper or lower triangle is used (`'upper'` or `'lower'`)
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {number} alpha - scalar multiplier
 * @param {Float64Array} x - input vector
 * @param {integer} strideX - `x` stride length
 * @param {NonNegativeInteger} offsetX - starting `x` index
 * @param {Float64Array} A - input/output symmetric matrix
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Float64Array} `A`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the symmetric rank 1 operation `A = alpha*x*x^T + A` where `A` is an `N` by `N` symmetric matrix, `x` is an `N` element vector, and `alpha` is a scalar.
*
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is used
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be non-zero
* @returns {Float64Array} `A`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 1, 0, 0, 1 ] );
* var x = new Float64Array( [ 1, 2 ] );
*
* dsyr( 'upper', 2, 1.0, x, 1, 0, A, 1, 2, 0 );
* // A => <Float64Array>[ 2, 0, 2, 5 ]
*/
function dsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
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

export default dsyr;
