/**
 * Updates a sum of squares represented in scaled form.
 *
 * Returns updated (scale, sumsq) such that:
 * `scale^2*sumsq = old_scale^2*old_sumsq + sum(|x_i|^2)`
 *
 *
 * @param {NonNegativeInteger} N - number of complex elements
 * @param {Complex128Array} x - complex input vector
 * @param {integer} stride - stride in complex elements
 * @param {NonNegativeInteger} offset - starting index (in complex elements)
 * @param {number} scale - input scale
 * @param {number} sumsq - input sum of squares
 * @returns {Object} object with `scl` and `sumsq` properties
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Updates a sum of squares represented in scaled form.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - complex input vector
* @param {integer} stride - stride in complex elements
* @param {NonNegativeInteger} offset - starting index (in complex elements)
* @param {number} scale - input scale
* @param {number} sumsq - input sum of squares
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Object} object with `scl` and `sumsq` properties
*/
function zlassq( N, x, stride, offset, scale, sumsq ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, stride, offset, scale, sumsq );
}


// EXPORTS //

export default zlassq;
