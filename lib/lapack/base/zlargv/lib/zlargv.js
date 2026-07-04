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
* Generates a vector of complex plane rotations with real cosines and complex sines.
*
* @param {NonNegativeInteger} N - number of plane rotations to generate
* @param {Complex128Array} x - input/output complex vector x
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {Complex128Array} y - input/output complex vector y
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {Float64Array} c - output vector for cosines
* @param {integer} strideC - stride for `c`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlargv( N, x, strideX, y, strideY, c, strideC ) {
	var ox = stride2offset( N, strideX );
	var oy = stride2offset( N, strideY );
	var oc = stride2offset( N, strideC );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy, c, strideC, oc );
}


// EXPORTS //

export default zlargv;
