/**
 * Computes an LQ factorization of a complex M-by-N matrix A = L * Q.
 * using blocked Householder reflections.
 *
 *
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {Complex128Array} A - input matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
 * @param {Complex128Array} TAU - output array of scalar factors
 * @param {integer} strideTAU - stride length for `TAU` (in complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
 * @param {Complex128Array} WORK - workspace array
 * @param {integer} strideWORK - stride length for `WORK` (in complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LQ factorization of a complex M-by-N matrix A = L.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zgelqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default zgelqf;
