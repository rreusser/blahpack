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
* Updates a sum of squares represented in scaled form.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - input array
* @param {integer} strideX - `x` stride length
* @param {Float64Array} scale - input/output (length-1 array): input scale
* @param {Float64Array} sumsq - input/output (length-1 array): input sum of squares
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlassq( N, x, strideX, scale, sumsq ) {
	const ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, scale, sumsq );
}


// EXPORTS //

export default zlassq;
