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
* Computes the inner product of two vectors with extended precision accumulation and result.
*
* @param {NonNegativeInteger} N - number of elements in input vector(s)
* @param {Float64Array} x - first input vector, with N elements (accumulated in double precision).
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} y - second input vector, with N elements.
* @param {integer} strideY - stride length for `y`
* @returns {number} dot product
*/
function dsdot( N, x, strideX, y, strideY ) {

	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy );
}


// EXPORTS //

export default dsdot;
