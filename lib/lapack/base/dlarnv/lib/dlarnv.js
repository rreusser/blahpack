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
* @param {integer} idist - idist
* @param {Int32Array} iseed - iseed
* @param {integer} strideISEED - strideISEED
* @param {NonNegativeInteger} N - N
* @param {Float64Array} x - x
* @param {integer} stride - stride
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlarnv( idist, iseed, strideISEED, N, x, stride ) {
	var oiseed;
	var ox;

	oiseed = stride2offset( N, strideISEED );
	ox = stride2offset( N, stride );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( idist, iseed, strideISEED, oiseed, N, x, stride, ox );
}


// EXPORTS //

export default dlarnv;
