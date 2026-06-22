
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Adds a complex vector W into a doubled-single accumulation vector (X, Y).
*
* @param {NonNegativeInteger} N - length of vectors X, Y, and W
* @param {Complex128Array} x - first part of the doubled-single accumulation vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second part of the doubled-single accumulation vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} w - vector to be added
* @param {integer} strideW - stride length for `w` (in complex elements)
* @param {NonNegativeInteger} offsetW - starting index for `w` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `x`
*/
function zlaWwaddw( N, x, strideX, offsetX, y, strideY, offsetY, w, strideW, offsetW ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	base( N, x, strideX, offsetX, y, strideY, offsetY, w, strideW, offsetW );
	return x;
}


// EXPORTS //

export default zlaWwaddw;
