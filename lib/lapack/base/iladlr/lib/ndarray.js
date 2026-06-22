/**
 * Scans a real matrix for its last non-zero row.
 *
 *
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {Float64Array} A - input matrix
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @returns {integer} 0-based index of last non-zero row, or -1 if none
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scans a real matrix for its last non-zero row.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} 0-based index of last non-zero row, or -1 if none
*/
function iladlr( M, N, A, strideA1, strideA2, offsetA ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return -1;
	}
	return base( M, N, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default iladlr;
