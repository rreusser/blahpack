/**
 * Reduces a real general matrix to upper Hessenberg form using blocked algorithm.
 *
 *
 * @param {integer} N - order of the matrix
 * @param {integer} ilo - lower index of the balanced matrix
 * @param {integer} ihi - upper index of the balanced matrix
 * @param {Float64Array} A - input/output matrix
 * @param {integer} strideA1 - first stride of A
 * @param {integer} strideA2 - second stride of A
 * @param {integer} offsetA - offset into A
 * @param {Float64Array} TAU - output array of scalar factors
 * @param {integer} strideTAU - stride of TAU
 * @param {integer} offsetTAU - offset into TAU
 * @param {Float64Array} WORK - workspace array
 * @param {integer} strideWork - stride of WORK
 * @param {integer} offsetWork - offset into WORK
 * @returns {integer} info value
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduce a general matrix to upper Hessenberg form (blocked).
*
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - input array
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - output array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	var minWork = Math.max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base(N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dgehrd;
