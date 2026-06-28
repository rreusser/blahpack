
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the unconjugated dot product of two complex vectors:.
* ZDOTU = X^T _ Y = sum_i x_i _ y_i
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - first complex input vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second complex input vector
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128} unconjugated dot product
*/
function zdotu( N, x, strideX, offsetX, y, strideY, offsetY ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, offsetX, y, strideY, offsetY );
}


// EXPORTS //

export default zdotu;
