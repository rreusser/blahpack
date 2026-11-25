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
* Finds the index of the first element having maximum absolute value.
*
* @param {NonNegativeInteger} N - number of elements in input vector(s)
* @param {Float64Array} x - storage spacing between elements of DX.
* @param {integer} strideX - stride length for `x`
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function idamax( N, x, strideX ) {

	const ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox );
}


// EXPORTS //

export default idamax;
