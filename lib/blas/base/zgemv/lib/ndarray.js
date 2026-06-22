/**
 * Perform one of the complex matrix-vector operations:.
 * y := alpha_A_x + beta_y,   or   y := alpha_A**T_x + beta_y,   or
 * y := alpha*A**H_x + beta_y
 *
 *
 * @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Complex128} alpha - complex scalar
 * @param {Complex128Array} A - complex input matrix
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Complex128Array} x - complex input vector
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @param {Complex128} beta - complex scalar
 * @param {Complex128Array} y - complex input/output vector
 * @param {integer} strideY - stride for y (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
 * @throws {TypeError} First argument must be a valid transpose operation
 * @returns {Complex128Array} `y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the complex matrix-vector operations `y = alpha*A*x + beta*y`, `y = alpha*A^T*x + beta*y`, or `y = alpha*A^H*x + beta*y`.
*
* @param {string} trans - specifies whether `A` should be transposed, conjugate-transposed, or not transposed
* @param {NonNegativeInteger} M - number of rows in the matrix `A`
* @param {NonNegativeInteger} N - number of columns in the matrix `A`
* @param {Complex128} alpha - scalar constant
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} x - first input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Complex128} beta - scalar constant
* @param {Complex128Array} y - second input vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} tenth argument must be non-zero
* @throws {RangeError} fourteenth argument must be non-zero
* @returns {Complex128Array} `y`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
*
* var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
* var y = new Complex128Array( 2 );
* var alpha = new Complex128( 1.0, 0.0 );
* var beta = new Complex128( 0.0, 0.0 );
*
* zgemv( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
*/
function zgemv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( strideY === 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be non-zero. Value: `%d`.', strideY ) );
	}
	if ( M === 0 || N === 0 ) {
		return y;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	return base( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY );
}


// EXPORTS //

export default zgemv;
