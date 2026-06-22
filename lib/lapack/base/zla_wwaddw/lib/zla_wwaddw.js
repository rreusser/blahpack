/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Adds a complex vector in doubled-single precision representation.
*
* @param {NonNegativeInteger} N - number of elements
* @param {Complex128Array} x - high-order part of the doubled-single accumulation vector
* @param {integer} strideX - stride length for `x`
* @param {Complex128Array} y - low-order part of the doubled-single accumulation vector
* @param {integer} strideY - stride length for `y`
* @param {Complex128Array} w - vector to be added
* @param {integer} strideW - stride length for `w`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Complex128Array} `x`
*/
function zlaWwaddw( N, x, strideX, y, strideY, w, strideW ) {
	var ox;
	var oy;
	var ow;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	ow = stride2offset( N, strideW );
	base( N, x, strideX, ox, y, strideY, oy, w, strideW, ow );
	return x;
}


// EXPORTS //

export default zlaWwaddw;
