
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {number} sa - sa
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @returns {Complex128Array} output array
*/
function zdrscl( N, sa, x, strideX ) {
	var ox;

	ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, sa, x, strideX, ox );
}


// EXPORTS //

export default zdrscl;
