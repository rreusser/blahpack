/**
 * Performs one of the symmetric rank-k operations:.
 * C := alpha_A_A^T + beta_C,  or  C := alpha_A^T_A + beta_C
 * where alpha and beta are scalars, C is an N-by-N symmetric matrix,
 * and A is an N-by-K matrix in the first case and a K-by-N matrix in
 * the second case. Only the upper or lower triangular part of C is
 * updated.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} trans - `'no-transpose'` or `'transpose'`
 * @param {NonNegativeInteger} N - order of matrix C
 * @param {NonNegativeInteger} K - number of columns of A (if trans = 'no-transpose') or rows (if trans = 'transpose')
 * @param {number} alpha - scalar multiplier for A*A^T or A^T*A
 * @param {Float64Array} A - input matrix
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - index offset for A
 * @param {number} beta - scalar multiplier for C
 * @param {Float64Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
 * @param {integer} strideC1 - stride of the first dimension of C
 * @param {integer} strideC2 - stride of the second dimension of C
 * @param {NonNegativeInteger} offsetC - index offset for C
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @throws {TypeError} Second argument must be a valid transpose operation
 * @returns {Float64Array} `C`
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
* Performs the symmetric rank-k update C := alpha_A_A^T + beta_C or C := alpha_A^T_A + beta_C.
*
* @param {string} uplo - specifies whether the upper or lower triangle of C is stored
* @param {string} trans - specifies whether to use A or A^T
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (or rows if transposed)
* @param {number} alpha - scalar constant
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} beta - scalar constant
* @param {Float64Array} C - symmetric output matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {Float64Array} `C`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
* var C = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
*
* dsyrk( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
*/
function dsyrk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
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

export default dsyrk;
