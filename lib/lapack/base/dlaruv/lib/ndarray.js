
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns a vector of n random real numbers from a uniform (0,1) distribution.
*
* Uses a multiplicative congruential method with modulus 2^48 and multiplier
* 33952834046453. The 48-bit integers are stored in 4 integer array elements
* with 12 bits per element.
*
* @param {Int32Array} iseed - seed array of 4 integers (each 0..4095, iseed[3] odd)
* @param {integer} strideISEED - stride for iseed
* @param {NonNegativeInteger} offsetISEED - offset for iseed
* @param {NonNegativeInteger} N - number of random numbers to generate (N <= 128)
* @param {Float64Array} x - output array
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - offset for x
*/
function dlaruv( iseed, strideISEED, offsetISEED, N, x, strideX, offsetX ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( iseed, strideISEED, offsetISEED, N, x, strideX, offsetX ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaruv;
