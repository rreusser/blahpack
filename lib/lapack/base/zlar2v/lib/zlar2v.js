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
* @param {Complex128Array} y - second input array (elements assumed real)
* @param {Complex128Array} z - third input array (complex)
* @param {integer} strideXYZ - stride length for `x`, `y`, and `z` (in complex elements)
* @param {Float64Array} c - array of cosines of the plane rotations (real)
* @param {Complex128Array} s - array of sines of the plane rotations (complex)
* @param {integer} strideCS - stride length for `c` and `s`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlar2v( N, x, y, z, strideXYZ, c, s, strideCS ) {
	const oxyz = stride2offset( N, strideXYZ );
	const ocs = stride2offset( N, strideCS );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	base( N, x, strideXYZ, oxyz, y, strideXYZ, oxyz, z, strideXYZ, oxyz, c, strideCS, ocs, s, strideCS, ocs );
}


// EXPORTS //

export default zlar2v;
