/**
 * Finds the index of the element having the maximum sum of absolute values of.
 * real and imaginary parts in a double-precision complex vector.
 *
 *
 * @param {NonNegativeInteger} N - number of complex elements
 * @param {Complex128Array} zx - complex input vector
 * @param {integer} strideX - stride in complex elements
 * @param {NonNegativeInteger} offsetX - starting index (in complex elements)
 * @returns {integer} 0-based index of the max element, or -1 if N < 1
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Finds the index of the element having the maximum sum of absolute values of.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride in complex elements
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function izamax( N, zx, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, zx, strideX, offsetX );
}


// EXPORTS //

export default izamax;
