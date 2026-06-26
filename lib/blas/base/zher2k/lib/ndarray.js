/**
 * Performs one of the Hermitian rank-2k operations:.
 * C := alpha_A_B^H + conj(alpha)_B_A^H + beta_C,  or
 * C := alpha_A^H_B + conj(alpha)_B^H_A + beta_C
 * where alpha is a complex scalar, beta is a REAL scalar, C is an N-by-N
 * Hermitian matrix (stored as Complex128Array), and A and B are N-by-K
 * matrices in the first case and K-by-N matrices in the second case.
 *
 * Only the upper or lower triangular part of C is updated.
 * The diagonal of C is always real after the update.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
 * @param {NonNegativeInteger} N - order of matrix C
 * @param {NonNegativeInteger} K - number of columns of A,B (if trans = 'no-transpose') or rows (if trans = 'conjugate-transpose')
 * @param {Complex128} alpha - complex scalar multiplier
 * @param {Complex128Array} A - complex input matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
 * @param {Complex128Array} B - complex input matrix
 * @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
 * @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
 * @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
 * @param {number} beta - REAL scalar multiplier for C
 * @param {Complex128Array} C - input/output Hermitian matrix (only upper or lower triangle accessed)
 * @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
 * @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
 * @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @throws {TypeError} Second argument must be a valid transpose operation
 * @returns {Complex128Array} `C`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the Hermitian rank-2k update C := alpha_A_B^H + conj(alpha)_B_A^H + beta_C or C := alpha_A^H_B + conj(alpha)_B^H_A + beta_C.
*
* @param {string} uplo - specifies whether the upper or lower triangle of C is stored
* @param {string} trans - specifies the operation ('no-transpose' or 'conjugate-transpose')
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - dimension parameter
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} A - first complex input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - second complex input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {number} beta - real scalar constant
* @param {Complex128Array} C - complex Hermitian output matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {Complex128Array} `C`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Complex128 = require( '@stdlib/complex/float64/ctor' );
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
* var B = new Complex128Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5 ] );
* var C = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
*
* zher2k( 'upper', 'no-transpose', 3, 2, new Complex128( 1.0, 0.0 ), A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 );
*/
function zher2k( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( N === 0 ) {
		return C;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	if ( strideB1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideB1 ) );
	}
	if ( strideB2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideB2 ) );
	}
	if ( strideC1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be non-zero. Value: `%d`.', strideC1 ) );
	}
	if ( strideC2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be non-zero. Value: `%d`.', strideC2 ) );
	}
	return base( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC );
}


// EXPORTS //

export default zher2k;
