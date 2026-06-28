
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scales a complex vector by the reciprocal of a real scalar, performing the.
* scaling carefully to avoid overflow/underflow.
*
* Computes x <- x / sa by iteratively multiplying by safe scale factors.
*
* @param {NonNegativeInteger} N - number of elements
* @param {number} sa - real scalar divisor
* @param {Complex128Array} x - input/output complex vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} input array
*/
function zdrscl( N, sa, x, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, sa, x, strideX, offsetX );
}


// EXPORTS //

export default zdrscl;
