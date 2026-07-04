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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Euclidean norm of a complex double-precision floating-point vector.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Complex128Array} zx - input array
* @param {integer} strideX - stride length (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {number} Euclidean norm
*/
function dznrm2( N, zx, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0.0;
	}
	return base( N, zx, strideX, offsetX );
}


// EXPORTS //

export default dznrm2;
