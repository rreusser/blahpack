/**
 * Scale a complex double-precision vector by a complex constant.
 *
 *
 * @param {PositiveInteger} N - number of complex elements
 * @param {Complex128} za - complex scalar
 * @param {Complex128Array} zx - complex input vector
 * @param {integer} strideX - stride for `zx` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
 * @returns {Complex128Array} `zx`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scale a complex double-precision vector by a complex constant.
*
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128} za - complex scalar
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `zx`
*/
function zscal( N, za, zx, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return zx;
	}
	return base( N, za, zx, strideX, offsetX );
}


// EXPORTS //

export default zscal;
