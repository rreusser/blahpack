/**
 * Initializes a complex matrix to BETA on the diagonal and ALPHA on the.
 * off-diagonals.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`, otherwise full
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {Complex128} alpha - complex off-diagonal value
 * @param {Complex128} beta - complex diagonal value
 * @param {Complex128Array} A - input/output matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Complex128Array} A
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Initializes a complex matrix to BETA on the diagonal and ALPHA on the.
*
* @param {string} uplo - `'upper'` or `'lower'`, otherwise full
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128} alpha - complex off-diagonal value
* @param {Complex128} beta - complex diagonal value
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {Complex128Array} A
*/
function zlaset( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA ) {
	if ( uplo !== 'upper' && uplo !== 'lower' && uplo !== 'all' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zlaset;
