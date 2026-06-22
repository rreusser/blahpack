/**
 * Applies a plane rotation, where the cos (C) is real and the sin (S) is.
 * complex, to a pair of complex vectors CX and CY:
 *
 * `CX(i) =  C*CX(i) + S*CY(i)`
 * `CY(i) = -conjg(S)*CX(i) + C*CY(i)`
 *
 *
 * @param {NonNegativeInteger} N - number of complex elements
 * @param {Complex128Array} cx - first input/output array
 * @param {integer} strideX - stride for `cx` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `cx` (in complex elements)
 * @param {Complex128Array} cy - second input/output array
 * @param {integer} strideY - stride for `cy` (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for `cy` (in complex elements)
 * @param {number} c - cosine of rotation (real)
 * @param {Float64Array} s - sine of rotation (complex, 2-element array [re, im])
 * @returns {Complex128Array} cx
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a plane rotation, where the cos (C) is real and the sin (S) is.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} cx - first input/output array
* @param {integer} strideX - stride for `cx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `cx` (in complex elements)
* @param {Complex128Array} cy - second input/output array
* @param {integer} strideY - stride for `cy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `cy` (in complex elements)
* @param {number} c - cosine of rotation (real)
* @param {Float64Array} s - sine of rotation (complex, 2-element array [re, im])
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} cx
*/
function zrot( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s );
}


// EXPORTS //

export default zrot;
