
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates a vector of real plane rotations (Givens rotations).
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
*   (  c(i)  s(i) ) ( x(i) ) = ( a(i) )
*   ( -s(i)  c(i) ) ( y(i) ) = (   0  )
* ```
*
* On exit, `x` is overwritten by `a`, `y` is overwritten by the sines,
* and `c` receives the cosines of the plane rotations.
*
* @param {NonNegativeInteger} N - number of plane rotations to generate
* @param {Float64Array} x - input/output vector x
* @param {integer} strideX - stride for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - input/output vector y
* @param {integer} strideY - stride for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} c - output vector for cosines
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlargv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlargv;
