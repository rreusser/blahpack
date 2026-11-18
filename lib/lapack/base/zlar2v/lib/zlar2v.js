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
* Applies a vector of complex plane rotations with real cosines from both sides to a sequence of 2-by-2 complex Hermitian matrices.
*
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Complex128Array} x - first input array (elements assumed real)
* @param {integer} strideX - `x` stride length (in complex elements)
* @param {Complex128Array} y - second input array (elements assumed real)
* @param {integer} strideY - `y` stride length (in complex elements)
* @param {Complex128Array} z - third input array (complex)
* @param {integer} strideZ - `z` stride length (in complex elements)
* @param {Float64Array} c - array of cosines of the plane rotations (real)
* @param {integer} strideC - `c` stride length
* @param {Complex128Array} s - array of sines of the plane rotations (complex)
* @param {integer} strideS - `s` stride length (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlar2v( N, x, strideX, y, strideY, z, strideZ, c, strideC, s, strideS ) {
	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	const oz = stride2offset( N, strideZ );
	const oc = stride2offset( N, strideC );
	const os = stride2offset( N, strideS );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	base( N, x, strideX, ox, y, strideY, oy, z, strideZ, oz, c, strideC, oc, s, strideS, os );
}


// EXPORTS //

export default zlar2v;
