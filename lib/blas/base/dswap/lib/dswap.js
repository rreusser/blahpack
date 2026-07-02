/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
* @param {Float64Array} x - x
* @param {integer} strideX - strideX
* @param {Float64Array} y - y
* @param {integer} strideY - strideY
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} output array
*/
function dswap( N, x, strideX, y, strideY ) {
	var ox;
	var oy;

	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy );
}


// EXPORTS //

export default dswap;
