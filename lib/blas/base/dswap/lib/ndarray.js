
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Interchange two double-precision floating-point vectors.
*
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - output array
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} `y`
*/
function dswap( N, x, strideX, offsetX, y, strideY, offsetY ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY ); // eslint-disable-line max-len
}


// EXPORTS //

export default dswap;
