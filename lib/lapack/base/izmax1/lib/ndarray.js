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
* Finds the index of the first vector element of maximum absolute value.
*
* Based on IZAMAX from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* Returns a 0-based index (Fortran returns 1-based).
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for `ZX` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `ZX` (in complex elements)
* @returns {integer} 0-based index of the element with maximum absolute value
*/
function izmax1( N, x, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX );
}


// EXPORTS //

export default izmax1;
