/**
 * Multiplies a vector `x` by a constant `alpha` and adds the result to `y`.
 *
 *
 * @param {PositiveInteger} N - number of indexed elements
 * @param {number} alpha - scalar constant
 * @param {Float64Array} x - input array
 * @param {integer} strideX - `x` stride length
 * @param {NonNegativeInteger} offsetX - starting `x` index
 * @param {Float64Array} y - output array
 * @param {integer} strideY - `y` stride length
 * @param {NonNegativeInteger} offsetY - starting `y` index
 * @returns {Float64Array} output array
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a vector `x` by a constant `alpha` and adds the result to `y`.
*
* @param {PositiveInteger} N - number of indexed elements
* @param {number} alpha - scalar constant
* @param {Float64Array} x - input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} y - output array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} output array
*/
function daxpy( N, alpha, x, strideX, offsetX, y, strideY, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return y;
	}
	return base( N, alpha, x, strideX, offsetX, y, strideY, offsetY );
}


// EXPORTS //

export default daxpy;
