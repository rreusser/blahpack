/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Returns updated scale and sum-of-squares in scaled form.
 *
 * The return value satisfies:
 * `scale_out^2*sumsq_out = x(1)^2 + ... + x(n)^2 + scale_in^2*sumsq_in`
 *
 * Uses Blue's safe-scaling algorithm to avoid overflow/underflow.
 *
 *
 * @param {NonNegativeInteger} N - number of elements
 * @param {Float64Array} x - input array
 * @param {integer} stride - stride length for `x`
 * @param {NonNegativeInteger} offset - starting index for `x`
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
* Returns updated scale and sum-of-squares in scaled form.
*
* @param {integer} N - number of elements
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} scale - input/output (length-1 array): input scale
* @param {Float64Array} sumsq - input/output (length-1 array): input sum of squares
* @throws {RangeError} first argument must be a nonnegative integer
*/
function dlassq( N, x, strideX, offsetX, scale, sumsq ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, scale, sumsq );
}


// EXPORTS //

export default dlassq;
