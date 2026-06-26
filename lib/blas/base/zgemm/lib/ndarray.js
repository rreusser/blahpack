/**
 * Perform one of the complex matrix-matrix operations:.
 * C := alpha_op(A)_op(B) + beta*C
 * where op(X) is one of X, X**T, or X**H.
 *
 *
 * @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
 * @param {string} transb - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
 * @param {NonNegativeInteger} M - rows of op(A) and C
 * @param {NonNegativeInteger} N - columns of op(B) and C
 * @param {NonNegativeInteger} K - columns of op(A) / rows of op(B)
 * @param {Complex128} alpha - complex scalar
 * @param {Complex128Array} A - complex input matrix
 * @param {integer} strideA1 - first dimension stride of A
 * @param {integer} strideA2 - second dimension stride of A
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Complex128Array} B - complex input matrix
 * @param {integer} strideB1 - first dimension stride of B
 * @param {integer} strideB2 - second dimension stride of B
 * @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
 * @param {Complex128} beta - complex scalar
 * @param {Complex128Array} C - complex input/output matrix
 * @param {integer} strideC1 - first dimension stride of C
 * @param {integer} strideC2 - second dimension stride of C
 * @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
 * @throws {TypeError} First argument must be a valid transpose operation
 * @throws {TypeError} Second argument must be a valid transpose operation
 * @returns {Complex128Array} C
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the complex matrix-matrix operations `C = alpha*op(A)*op(B) + beta*C` where op(X) is one of `op(X) = X`, `op(X) = X^T`, or `op(X) = X^H`.
*
* @param {string} transa - specifies the operation for matrix `A`
* @param {string} transb - specifies the operation for matrix `B`
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - inner dimension
* @param {Complex128} alpha - scalar constant
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128} beta - scalar constant
* @param {Complex128Array} C - output matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @returns {Complex128Array} `C`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
*
* var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
* var B = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
* var C = new Complex128Array( 4 );
* var alpha = new Complex128( 1, 0 );
* var beta = new Complex128( 0, 0 );
*
* zgemm( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 );
*/
function zgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	if ( !isMatrixTranspose( transa ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', transa ) );
	}
	if ( !isMatrixTranspose( transb ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', transb ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( M === 0 || N === 0 ) {
		return C;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideB1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideB1 ) );
	}
	if ( strideB2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be non-zero. Value: `%d`.', strideB2 ) );
	}
	if ( strideC1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be non-zero. Value: `%d`.', strideC1 ) );
	}
	if ( strideC2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be non-zero. Value: `%d`.', strideC2 ) );
	}
	return base( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC );
}


// EXPORTS //

export default zgemm;
