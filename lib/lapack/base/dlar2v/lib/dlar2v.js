/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices.
*
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Float64Array} x - first input array
* @param {Float64Array} y - second input array
* @param {Float64Array} z - third input array
* @param {integer} strideXYZ - stride length for `x`, `y`, and `z`
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {Float64Array} s - array of sines of the plane rotations
* @param {integer} strideCS - stride length for `c` and `s`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlar2v( N, x, y, z, strideXYZ, c, s, strideCS ) {
	var oxyz = stride2offset( N, strideXYZ );
	var ocs = stride2offset( N, strideCS );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	base( N, x, strideXYZ, oxyz, y, strideXYZ, oxyz, z, strideXYZ, oxyz, c, strideCS, ocs, s, strideCS, ocs );
}


// EXPORTS //

export default dlar2v;
