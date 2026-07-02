/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Conjugate a complex vector in-place.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - input array
* @param {integer} stride - `x` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zlacgv( N, x, stride ) {
	var ox = stride2offset( N, stride );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, stride, ox );
}


// EXPORTS //

export default zlacgv;
