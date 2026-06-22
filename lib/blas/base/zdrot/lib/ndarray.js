/**
 * Applies a real plane rotation to a pair of complex double-precision vectors:.
 *
 * `zx(i) = c*zx(i) + s*zy(i)`
 * `zy(i) = c*zy(i) - s*zx(i)`
 *
 * where c and s are real scalars (cosine and sine of a Givens rotation).
 *
 *
 * @param {NonNegativeInteger} N - number of complex elements
 * @param {Complex128Array} zx - first complex input/output vector
 * @param {integer} strideX - stride for `zx` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
 * @param {Complex128Array} zy - second complex input/output vector
 * @param {integer} strideY - stride for `zy` (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
 * @param {number} c - cosine of rotation (real)
 * @param {number} s - sine of rotation (real)
 * @returns {Complex128Array} `zx`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real plane rotation to a pair of complex double-precision vectors:.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} zx - first complex input/output vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - second complex input/output vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @param {number} c - cosine of rotation (real)
* @param {number} s - sine of rotation (real)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `zx`
*/
function zdrot( N, zx, strideX, offsetX, zy, strideY, offsetY, c, s ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return zx;
	}
	return base( N, zx, strideX, offsetX, zy, strideY, offsetY, c, s );
}


// EXPORTS //

export default zdrot;
