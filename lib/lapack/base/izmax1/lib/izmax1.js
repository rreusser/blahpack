
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} ZX - ZX
* @param {integer} strideZX - strideZX
* @returns {integer} 0-based index of the element with maximum absolute value
*/
function izmax1( N, ZX, strideZX ) {
	var ozx;

	ozx = stride2offset( N, strideZX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, ZX, strideZX, ozx );
}


// EXPORTS //

export default izmax1;
