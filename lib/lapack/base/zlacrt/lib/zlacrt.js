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
* Applies a plane rotation to two complex vectors where both the cosine and sine of the rotation are complex.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} cx - first complex input/output vector
* @param {integer} strideX - `cx` stride length (in complex elements)
* @param {Complex128Array} cy - second complex input/output vector
* @param {integer} strideY - `cy` stride length (in complex elements)
* @param {Complex128} c - complex cosine of the rotation
* @param {Complex128} s - complex sine of the rotation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} `cx`
*/
function zlacrt( N, cx, strideX, cy, strideY, c, s ) {
	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, cx, strideX, ox, cy, strideY, oy, c, s );
}


// EXPORTS //

export default zlacrt;
