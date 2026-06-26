/**
 * Performs one of the matrix-matrix operations.
 * B := alpha_op(A)_B,  or  B := alpha_B_op(A)
 *
 * where alpha is a scalar, B is an M-by-N matrix, A is a unit or
 * non-unit, upper or lower triangular matrix, and op(A) is A or A**T.
 *
 *
 * @param {string} side - `'left'` or `'right'`
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} transa - `'no-transpose'` or `'transpose'`
 * @param {string} diag - `'unit'` or `'non-unit'`
 * @param {NonNegativeInteger} M - number of rows of B
 * @param {NonNegativeInteger} N - number of columns of B
 * @param {number} alpha - scalar multiplier
 * @param {Float64Array} A - triangular matrix
 * @param {integer} strideA1 - stride of first dim of A
 * @param {integer} strideA2 - stride of second dim of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} B - matrix, modified in-place
 * @param {integer} strideB1 - stride of first dim of B
 * @param {integer} strideB2 - stride of second dim of B
 * @param {NonNegativeInteger} offsetB - starting index for B
 * @throws {TypeError} First argument must be a valid operation side
 * @throws {TypeError} Second argument must be a valid matrix triangle
 * @throws {TypeError} Third argument must be a valid transpose operation
 * @throws {TypeError} Fourth argument must be a valid diagonal type
 * @returns {Float64Array} B
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-matrix operations B := alpha_op(A)_B or B := alpha_B_op(A), where A is a triangular matrix.
*
* @param {string} side - specifies whether op(A) appears on the left or right of B
* @param {string} uplo - specifies whether A is upper or lower triangular
* @param {string} transa - specifies the form of op(A)
* @param {string} diag - specifies whether A is unit or non-unit triangular
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar constant
* @param {Float64Array} A - input triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {Float64Array} `B`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 2.0, 0.0, 3.0, 5.0 ] );
* var B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
*
* dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 3, 1.0, A, 1, 2, 0, B, 1, 2, 0 );
*/
function dtrmm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( transa ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', transa ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return B;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideB1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be non-zero. Value: `%d`.', strideB1 ) );
	}
	if ( strideB2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be non-zero. Value: `%d`.', strideB2 ) );
	}
	return base( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );
}


// EXPORTS //

export default dtrmm;
