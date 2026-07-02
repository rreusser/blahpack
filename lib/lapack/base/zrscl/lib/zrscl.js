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
* Multiplies a complex vector by the reciprocal of a complex scalar.
*
* @param {NonNegativeInteger} N - number of elements
* @param {Complex128} a - complex scalar divisor
* @param {Complex128Array} x - input/output complex vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} input array
*/
function zrscl( N, a, x, strideX ) {
	var ox;

	ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, a, x, strideX, ox );
}


// EXPORTS //

export default zrscl;
