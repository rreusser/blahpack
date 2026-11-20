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
* Computes the Euclidean norm of a complex double-precision floating-point vector.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Complex128Array} x - input array
* @param {integer} strideX - stride length (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {number} Euclidean norm
*/
function dznrm2( N, x, strideX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const ox = stride2offset( N, strideX );
	return base( N, x, strideX, ox );
}


// EXPORTS //

export default dznrm2;
