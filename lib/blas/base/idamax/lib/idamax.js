
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Float64Array} x - x
* @param {integer} strideX - strideX
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function idamax( N, x, strideX ) {
	var ox;

	ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox );
}


// EXPORTS //

export default idamax;
