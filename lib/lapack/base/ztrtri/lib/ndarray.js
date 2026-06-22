/**
 * Computes the inverse of a complex upper or lower triangular matrix.
 *
 * Uses a blocked algorithm (Level 3 BLAS) for large matrices and
 * falls back to the unblocked algorithm (ztrti2) for small matrices.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`
 * @param {string} diag - `'unit'` or `'non-unit'`
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Complex128Array} A - input/output triangular matrix (overwritten with inverse)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @throws {TypeError} Second argument must be a valid diagonal type
 * @returns {integer} info - 0 if successful, k>0 if A(k,k) is zero
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a complex upper or lower triangular matrix.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output triangular matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid diagonal type
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, k>0 if A(k,k) is zero
*/
function ztrtri( uplo, diag, N, A, strideA1, strideA2, offsetA ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( uplo, diag, N, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default ztrtri;
