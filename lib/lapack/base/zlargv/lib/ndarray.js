
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates a vector of complex plane rotations with real cosines and complex sines.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
*   (        c(i)   s(i) ) ( x(i) ) = ( r(i) )
*   ( -conj(s(i))   c(i) ) ( y(i) ) = (   0  )
* ```
*
* On exit, `x` is overwritten by `r`, `y` is overwritten by the complex
* sines, and `c` receives the real cosines of the plane rotations.
*
* @param {NonNegativeInteger} N - number of plane rotations to generate
* @param {Complex128Array} x - input/output complex vector x
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - input/output complex vector y
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Float64Array} c - output vector for cosines
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @returns {void}
*/
function zlargv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlargv;
