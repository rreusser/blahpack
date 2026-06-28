
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a vector of real plane rotations to elements of two real vectors.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
* ( x(i) ) := (  c(i)  s(i) ) ( x(i) )
* ( y(i) )    ( -s(i)  c(i) ) ( y(i) )
* ```
*
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {integer} strideC - `c` stride length
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} s - array of sines of the plane rotations
* @param {integer} strideS - `s` stride length
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlartv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC, s, strideS, offsetS ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC, s, strideS, offsetS ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlartv;
