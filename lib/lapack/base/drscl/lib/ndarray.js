/**
 * Scales a vector by the reciprocal of a scalar, performing the scaling.
 * carefully to avoid overflow/underflow.
 *
 * Computes x <- x / sa by iteratively multiplying by safe scale factors.
 *
 *
 * @param {NonNegativeInteger} N - number of elements
 * @param {number} sa - scalar divisor
 * @param {Float64Array} x - input/output array
 * @param {integer} strideX - stride length for `x`
 * @param {NonNegativeInteger} offsetX - starting index for `x`
 * @returns {Float64Array} input array
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scales a vector by the reciprocal of a scalar, performing the scaling.
*
* @param {NonNegativeInteger} N - number of elements
* @param {number} sa - scalar divisor
* @param {Float64Array} x - input/output array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} input array
*/
function drscl( N, sa, x, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( N, sa, x, strideX, offsetX );
}


// EXPORTS //

export default drscl;
