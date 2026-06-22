/**
 * Applies a plane rotation.
 *
 *
 * @param {NonNegativeInteger} N - number of indexed elements
 * @param {Float64Array} x - first input array
 * @param {integer} strideX - `x` stride length
 * @param {NonNegativeInteger} offsetX - starting index for `x`
 * @param {Float64Array} y - second input array
 * @param {integer} strideY - `y` stride length
 * @param {NonNegativeInteger} offsetY - starting index for `y`
 * @param {number} c - cosine of the angle of rotation
 * @param {number} s - sine of the angle of rotation
 * @returns {Float64Array} `y`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a plane rotation.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {number} c - cosine of the angle of rotation
* @param {number} s - sine of the angle of rotation
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} `y`
*/
function drot( N, x, strideX, offsetX, y, strideY, offsetY, c, s ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return y;
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, c, s );
}


// EXPORTS //

export default drot;
