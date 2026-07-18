/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Generates a complex elementary reflector with non-negative beta.
*
* @param {NonNegativeInteger} N - order of the reflector
* @param {Complex128Array} alpha - complex scalar, overwritten with beta
* @param {NonNegativeInteger} offsetAlpha - starting index for `alpha` (in complex elements)
* @param {Complex128Array} x - complex vector, overwritten with `v`
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {Complex128Array} tau - output complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for `tau` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
*/
function zlarfgp( N, alpha, offsetAlpha, x, strideX, tau, offsetTau ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	const ox = stride2offset( N - 1, strideX );
	return base( N, alpha, offsetAlpha, x, strideX, ox, tau, offsetTau );
}


// EXPORTS //

export default zlarfgp;
