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
* Returns a vector of n random real numbers from a uniform distribution.
*
* @param {Int32Array} iseed - on entry, the seed of the random number generator; the array elements must be between 0 and 4095, and ISEED(4) must be odd. On exit, the seed is updated (0-based).
* @param {integer} strideISEED - stride length for `iseed`
* @param {NonNegativeInteger} N - the number of random numbers to be generated.
* @param {Float64Array} x - the generated random numbers.
* @param {integer} strideX - stride length for `x`
* @returns {Float64Array} `x`
*/
function dlaruv( iseed, strideISEED, N, x, strideX ) {

	const oiseed = stride2offset( 4, strideISEED );
	const ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( iseed, strideISEED, oiseed, N, x, strideX, ox );
}


// EXPORTS //

export default dlaruv;
