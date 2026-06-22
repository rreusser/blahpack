/**
 * Performs one of the Hermitian rank-k operations:.
 * C := alpha_A_A^H + beta_C,  or  C := alpha_A^H_A + beta_C
 * where alpha and beta are REAL scalars, C is an N-by-N Hermitian matrix
 * (stored as Complex128Array), and A is an N-by-K matrix in the first case
 * and a K-by-N matrix in the second case.
 *
 * Only the upper or lower triangular part of C is updated.
 * The diagonal of C is always real after the update.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} trans - `'no-transpose'` for A*A^H, `'conjugate-transpose'` for A^H*A
 * @param {NonNegativeInteger} N - order of matrix C
 * @param {NonNegativeInteger} K - number of columns of A (if trans = 'no-transpose') or rows (if trans = 'conjugate-transpose')
 * @param {number} alpha - real scalar multiplier
 * @param {Complex128Array} A - complex input matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
 * @param {number} beta - real scalar multiplier
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
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the Hermitian rank-k update C := alpha_A_A^H + beta_C or C := alpha_A^H_A + beta_C (complex double-precision).
*
* @param {string} uplo - specifies whether the upper or lower triangle of C is stored
* @param {string} trans - specifies the operation ('no-transpose' or 'conjugate-transpose')
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - dimension parameter
* @param {number} alpha - real scalar constant
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
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
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
* var C = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
*
* zherk( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
*/
function zherk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
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
	if ( strideC1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be non-zero. Value: `%d`.', strideC1 ) );
	}
	if ( strideC2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be non-zero. Value: `%d`.', strideC2 ) );
	}
	return base( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC );
}


// EXPORTS //

export default zherk;
