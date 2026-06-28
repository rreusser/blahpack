
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns a vector of n random real numbers from a uniform or normal distribution.
*
* @param {integer} idist - distribution type: 1=uniform(0,1), 2=uniform(-1,1), 3=normal(0,1)
* @param {Int32Array} iseed - seed array of 4 integers
* @param {integer} strideISEED - stride for iseed
* @param {NonNegativeInteger} offsetISEED - offset for iseed
* @param {NonNegativeInteger} N - number of random numbers to generate
* @param {Float64Array} x - output array
* @param {integer} stride - stride for x
* @param {NonNegativeInteger} offset - offset for x
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlarnv( idist, iseed, strideISEED, offsetISEED, N, x, stride, offset ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( idist, iseed, strideISEED, offsetISEED, N, x, stride, offset ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarnv;
