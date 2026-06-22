/**
 * Compute the conjugate dot product of two complex vectors:.
 * `ZDOTC = conj(X)^T*Y = sum_i conj(x_i)*y_i`
 *
 *
 * @param {NonNegativeInteger} N - number of complex elements
 * @param {Complex128Array} x - first complex input vector
 * @param {integer} strideX - stride for `x` (in complex elements)
 * @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
 * @param {Complex128Array} y - second complex input vector
 * @param {integer} strideY - stride for `y` (in complex elements)
 * @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
 * @returns {Complex128} conjugate dot product
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the conjugate dot product of two complex vectors:.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - first complex input vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second complex input vector
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128} conjugate dot product
*/
function zdotc( N, x, strideX, offsetX, y, strideY, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return new Complex128( 0.0, 0.0 );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY );
}


// EXPORTS //

export default zdotc;
