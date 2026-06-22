/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a vector of real plane rotations to elements of two real vectors.
*
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {Float64Array} s - array of sines of the plane rotations
* @param {integer} strideCS - stride length for `c` and `s`
* @returns {void}
*/
function dlartv( N, x, strideX, y, strideY, c, s, strideCS ) {
	var ocs = stride2offset( N, strideCS );
	var ox = stride2offset( N, strideX );
	var oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	base( N, x, strideX, ox, y, strideY, oy, c, strideCS, ocs, s, strideCS, ocs );
}


// EXPORTS //

export default dlartv;
