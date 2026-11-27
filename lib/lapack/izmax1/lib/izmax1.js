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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Finds the index of the first vector element of maximum absolute value.
*
* @param {NonNegativeInteger} N - the number of elements in the vector ZX.
* @param {Complex128Array} x - ZX
* @param {integer} strideX - strideZX
* @returns {integer} 0-based index of the element with maximum absolute value
*/
function izmax1( N, x, strideX ) {

	const ozx = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ozx );
}


// EXPORTS //

export default izmax1;
