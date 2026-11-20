/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Takes the sum of the absolute values of a complex vector and returns a.
* double precision result.
*
* Based on DZASUM from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for `CX` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `CX` (in complex elements)
* @returns {number} sum of absolute values
*/
function dzsum1( N, x, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX );
}


// EXPORTS //

export default dzsum1;
