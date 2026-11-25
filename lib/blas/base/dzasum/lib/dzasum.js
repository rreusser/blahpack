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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Takes the sum of the (|Re(.)| + |Im(.)|)'s of a complex vector and returns a double precision result.
*
* @param {NonNegativeInteger} N - number of elements in input vector(s)
* @param {Complex128Array} x - zx
* @param {integer} strideX - stride length for `x`
* @returns {number} sum of absolute values
*/
function dzasum( N, x, strideX ) {
	const offsetX = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX );
}


// EXPORTS //

export default dzasum;
