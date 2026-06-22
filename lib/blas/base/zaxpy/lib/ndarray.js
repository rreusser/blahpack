/**
 * Scales a complex double-precision vector by a complex constant and adds.
 * the result to another complex double-precision vector: y := alpha*x + y.
 *
 *
 * @param {PositiveInteger} N - number of complex elements
 * @param {Complex128} za - complex scalar
 * @param {Complex128Array} zx - input vector
 * @param {integer} strideX - stride for `zx` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
 * @param {Complex128Array} zy - input/output vector
 * @param {integer} strideY - stride for `zy` (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
 * @returns {Complex128Array} `zy`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scales a complex double-precision vector by a complex constant and adds.
*
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128} za - complex scalar
* @param {Complex128Array} zx - input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - input/output vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `zy`
*/
function zaxpy( N, za, zx, strideX, offsetX, zy, strideY, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return zy;
	}
	return base( N, za, zx, strideX, offsetX, zy, strideY, offsetY );
}


// EXPORTS //

export default zaxpy;
