
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {Int32Array} iseed - iseed
* @param {integer} strideISEED - strideISEED
* @param {NonNegativeInteger} N - N
* @param {Float64Array} x - x
* @param {integer} strideX - strideX
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlaruv( iseed, strideISEED, N, x, strideX ) {
	var oiseed;
	var ox;

	oiseed = stride2offset( N, strideISEED );
	ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( iseed, strideISEED, oiseed, N, x, strideX, ox );
}


// EXPORTS //

export default dlaruv;
