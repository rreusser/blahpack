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
* Multiplies a vector by the reciprocal of a real scalar.
*
* @param {NonNegativeInteger} N - the number of components of the vector x.
* @param {number} sa - the scalar a which is used to divide each component of x.
* @param {Complex128Array} x - the n-element vector x.
* @param {integer} strideX - stride length for `x`
* @returns {Complex128Array} output array
*/
function zdrscl( N, sa, x, strideX ) {

	const ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, sa, x, strideX, ox );
}


// EXPORTS //

export default zdrscl;
