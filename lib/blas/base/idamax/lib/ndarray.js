
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Finds the index of the first element having the maximum absolute value.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} strideX - strideX length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function idamax( N, x, strideX, offsetX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX );
}


// EXPORTS //

export default idamax;
