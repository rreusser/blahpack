
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @param {Complex128Array} y - y
* @param {integer} strideY - strideY
* @returns {Complex128} unconjugated dot product
*/
function zdotu( N, x, strideX, y, strideY ) {
	var ox;
	var oy;

	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy );
}


// EXPORTS //

export default zdotu;
