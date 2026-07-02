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
* Multiplies a double-precision floating-point vector by a constant.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {number} alpha - scalar
* @param {Float64Array} x - input array
* @param {integer} strideX - `x` stride length
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} input array
*/
function dscal( N, alpha, x, strideX ) {
	var ox;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	ox = stride2offset( N, strideX );
	return base( N, alpha, x, strideX, ox );
}


// EXPORTS //

export default dscal;
