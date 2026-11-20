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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns a vector of complex random numbers from a uniform or normal distribution.
*
* @param {integer} idist - distribution type: 1=uniform(0,1), 2=uniform(-1,1), 3=normal(0,1), 4=uniform disc, 5=uniform circle
* @param {Int32Array} iseed - seed array of 4 integers
* @param {integer} strideISEED - stride for iseed
* @param {NonNegativeInteger} offsetISEED - offset for iseed
* @param {NonNegativeInteger} N - number of complex random numbers to generate
* @param {Complex128Array} x - output array
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - offset for x (in complex elements)
* @returns {Complex128Array} x is modified in place
*/
function zlarnv( idist, iseed, strideISEED, offsetISEED, N, x, strideX, offsetX ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( idist, iseed, strideISEED, offsetISEED, N, x, strideX, offsetX ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlarnv;
