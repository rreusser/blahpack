/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {number} sa - sa
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zdrscl( N, sa, x, strideX ) {
	var ox;

	ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, sa, x, strideX, ox );
}


// EXPORTS //

export default zdrscl;
