/**
 * Solves one of the systems of equations:.
 * A_x = b,  or  A__T_x = b,  or  A*_H_x = b
 * where b and x are N element complex vectors and A is an N by N unit or
 * non-unit, upper or lower triangular band matrix, with (K+1) diagonals.
 *
 * Band storage: for upper triangular, the j-th column of A is stored in the
 * j-th column of the band array, with diagonal at row K (0-based).
 * For lower triangular, diagonal at row 0.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
 * @param {string} diag - `'unit'` or `'non-unit'`
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {NonNegativeInteger} K - number of super/sub-diagonals
 * @param {Complex128Array} A - band matrix in band storage
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Complex128Array} x - input/output vector (b on entry, x on exit)
 * @param {integer} strideX - stride for x (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @throws {TypeError} Second argument must be a valid transpose operation
 * @throws {TypeError} Third argument must be a valid diagonal type
 * @returns {Complex128Array} `x`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves one of the systems of equations `A*x = b`, `A**T*x = b`, or `A**H*x = b` where `A` is an `N` by `N` upper or lower triangular band complex matrix with `K+1` diagonals.
*
* @param {string} uplo - specifies whether `A` is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether `A` is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} x - input/output vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} eleventh argument must be non-zero
* @returns {Complex128Array} `x`
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* var AB = new Complex128Array( 8 );
* var x = new Complex128Array( [ 1, 0, 1, 1 ] );
*
* ztbsv( 'upper', 'no-transpose', 'non-unit', 2, 1, AB, 1, 2, 0, x, 1, 0 );
*/
function ztbsv( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( N === 0 ) {
		return x;
	}
	if ( strideA1 === 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be non-zero. Value: `%d`.', strideA1 ) );
	}
	if ( strideA2 === 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be non-zero. Value: `%d`.', strideA2 ) );
	}
	return base( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX );
}


// EXPORTS //

export default ztbsv;
