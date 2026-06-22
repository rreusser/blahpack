/**
 * Interchange two complex double-precision vectors.
 *
 *
 * @param {PositiveInteger} N - number of complex elements
 * @param {Complex128Array} zx - first complex input vector
 * @param {integer} strideX - stride for `zx` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
 * @param {Complex128Array} zy - second complex input vector
 * @param {integer} strideY - stride for `zy` (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
 * @returns {Complex128Array} `zx`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Interchange two complex double-precision vectors.
*
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128Array} zx - first complex input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - second complex input vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `zx`
*/
function zswap( N, zx, strideX, offsetX, zy, strideY, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return zx;
	}
	return base( N, zx, strideX, offsetX, zy, strideY, offsetY );
}


// EXPORTS //

export default zswap;
