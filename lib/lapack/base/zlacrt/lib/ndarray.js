/**
* Applies a plane rotation to two complex vectors, where both the cosine
* and sine of the rotation are complex.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} cx - first complex input/output vector
* @param {integer} strideX - stride for `cx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `cx` (in complex elements)
* @param {Complex128Array} cy - second complex input/output vector
* @param {integer} strideY - stride for `cy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `cy` (in complex elements)
* @param {Complex128} c - complex cosine of the rotation
* @param {Complex128} s - complex sine of the rotation
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `cx`
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a plane rotation to two complex vectors where both the cosine and sine of the rotation are complex.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} cx - first complex input/output vector
* @param {integer} strideX - stride for `cx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `cx` (in complex elements)
* @param {Complex128Array} cy - second complex input/output vector
* @param {integer} strideY - stride for `cy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `cy` (in complex elements)
* @param {Complex128} c - complex cosine of the rotation
* @param {Complex128} s - complex sine of the rotation
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `cx`
*/
function zlacrt( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return cx;
	}
	return base( N, cx, strideX, offsetX, cy, strideY, offsetY, c, s );
}


// EXPORTS //

export default zlacrt;
