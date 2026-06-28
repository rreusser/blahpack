/**
 * Computes all the singular values of a real upper bidiagonal matrix of.
 * order N. The singular values are computed to high relative accuracy,
 * in the absence of denormalization, underflow, and overflow.
 *
 * The algorithm is the dqds procedure (differential quotient-difference
 * with shifts).
 *
 *
 * @param {NonNegativeInteger} N - number of rows and columns
 * @param {Float64Array} d - diagonal elements of the bidiagonal matrix, length N
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Float64Array} e - off-diagonal elements of the bidiagonal matrix, length N-1
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @param {Float64Array} WORK - workspace array of length at least 4*N
 * @param {integer} strideWORK - stride length for `WORK`
 * @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
 * @returns {integer} info - status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all the singular values of a real upper bidiagonal matrix of.
*
* @param {NonNegativeInteger} N - number of rows and columns
* @param {Float64Array} d - diagonal elements of the bidiagonal matrix, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements of the bidiagonal matrix, length N-1
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} WORK - workspace array of length at least 4*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} info - status code (0 = success)
*/
function dlasq1( N, d, strideD, offsetD, e, strideE, offsetE, WORK, strideWORK, offsetWORK ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, 4 * N );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( N, d, strideD, offsetD, e, strideE, offsetE, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dlasq1;
