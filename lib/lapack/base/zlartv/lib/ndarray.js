

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Apply a vector of complex plane rotations with real cosines to two complex vectors.
*
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Complex128Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Complex128Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {integer} strideC - `c` stride length
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} s - array of complex sines of the plane rotations
* @param {integer} strideS - `s` stride length
* @param {NonNegativeInteger} offsetS - starting index for `s`
*/
function zlartv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC, s, strideS, offsetS ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC, s, strideS, offsetS ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlartv;
