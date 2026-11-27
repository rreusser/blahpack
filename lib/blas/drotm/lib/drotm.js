/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a modified Givens plane rotation.
*
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {Float64Array} param - parameters for the modified Givens transformation
* @param {integer} strideParam - stride length for `param`
* @returns {Float64Array} `y`
*/
function drotm( N, x, strideX, y, strideY, param, strideParam ) {
	const oparam = stride2offset( 5, strideParam );
	const ox = stride2offset( N, strideX );
	const oy = stride2offset( N, strideY );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, x, strideX, ox, y, strideY, oy, param, strideParam, oparam );
}


// EXPORTS //

export default drotm;
