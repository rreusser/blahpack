/**
 * Computes the sum of absolute values of a double-precision floating-point vector.
 *
 *
 * @param {NonNegativeInteger} N - number of indexed elements
 * @param {Float64Array} x - input array
 * @param {integer} stride - stride length for `x`
 * @param {NonNegativeInteger} offset - starting index for `x`
 * @returns {number} sum of absolute values
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the sum of absolute values of a double-precision floating-point vector.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} stride - stride length for `x`
* @param {NonNegativeInteger} offset - starting index for `x`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {number} sum of absolute values
*/
function dasum( N, x, stride, offset ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	return base( N, x, stride, offset );
}


// EXPORTS //

export default dasum;
