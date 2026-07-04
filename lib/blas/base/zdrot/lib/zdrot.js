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
* Applies a real plane rotation to a pair of complex double-precision vectors:.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} zx - input array
* @param {integer} strideX - `zx` stride length
* @param {Complex128Array} zy - input array
* @param {integer} strideY - `zy` stride length
* @param {number} c - cosine of rotation (real)
* @param {number} s - sine of rotation (real)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zdrot( N, zx, strideX, zy, strideY, c, s ) {
	var oz = stride2offset( N, strideX );
	var oz = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, zx, strideX, oz, zy, strideY, oz, c, s );
}


// EXPORTS //

export default zdrot;
