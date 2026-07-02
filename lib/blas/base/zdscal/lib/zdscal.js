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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scale a complex double-precision vector by a double-precision constant.
*
* @param {PositiveInteger} N - number of complex elements
* @param {number} da - real scalar multiplier
* @param {Complex128Array} zx - input array
* @param {integer} strideX - `zx` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zdscal( N, da, zx, strideX ) {
	var oz = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, da, zx, strideX, oz );
}


// EXPORTS //

export default zdscal;
