/**
 * Initializes an M-by-N matrix A to BETA on the diagonal and ALPHA on the.
 * off-diagonals.
 *
 *
 * @param {string} uplo - `'upper'` or `'lower'`, otherwise full matrix
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {number} alpha - off-diagonal value
 * @param {number} beta - diagonal value
 * @param {Float64Array} A - input/output matrix
 * @param {integer} strideA1 - stride of the first dimension of `A`
 * @param {integer} strideA2 - stride of the second dimension of `A`
 * @param {NonNegativeInteger} offsetA - starting index for `A`
 * @throws {TypeError} First argument must be a valid matrix triangle
 * @returns {Float64Array} A
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Initializes an M-by-N matrix A to BETA on the diagonal and ALPHA on the.
*
* @param {string} uplo - `'upper'` or `'lower'`, otherwise full matrix
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {number} alpha - off-diagonal value
* @param {number} beta - diagonal value
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {Float64Array} A
*/
function dlaset( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA ) {
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

export default dlaset;
