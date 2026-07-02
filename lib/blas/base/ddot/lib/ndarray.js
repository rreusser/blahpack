/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the dot product of two double-precision floating-point vectors.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {number} dot product
*/
function ddot( N, x, strideX, offsetX, y, strideY, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY );
}


// EXPORTS //

export default ddot;
