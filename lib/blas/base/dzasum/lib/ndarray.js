/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the sum of the absolute values of the real and imaginary components of a complex vector.
*
* `dzasum` takes the sum of `(|Re(.)| + |Im(.)|)` for each element and returns a double-precision result.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride in complex elements
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} sum of absolute values
*/
function dzasum( N, zx, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, zx, strideX, offsetX );
}


// EXPORTS //

export default dzasum;
