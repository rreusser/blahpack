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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a plane rotation, where the cos (C) is real and the sin (S) is.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - input array
* @param {integer} strideX - `cx` stride length
* @param {Complex128Array} y - input array
* @param {integer} strideY - `cy` stride length
* @param {number} c - cosine of rotation (real)
* @param {Complex128} s - sine of rotation
* @returns {Complex128Array} output array
*/
function zrot( N, x, strideX, y, strideY, c, s ) {
	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// The base kernel takes the sine as an [re, im] pair (its internal callers pass zlartg's output in place):
	return base( N, x, strideX, ox, y, strideY, oy, c, new Float64Array( [ real( s ), imag( s ) ] ) );
}


// EXPORTS //

export default zrot;
