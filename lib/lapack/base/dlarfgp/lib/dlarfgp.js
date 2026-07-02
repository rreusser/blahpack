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
* Generates a real elementary reflector `H` of order `N` with non-negative `beta`.
*
* @param {NonNegativeInteger} N - order of the reflector
* @param {Float64Array} alpha - on entry, the scalar `alpha`; on exit, the scalar `beta` (non-negative)
* @param {NonNegativeInteger} offsetAlpha - index into `alpha`
* @param {Float64Array} x - input array, overwritten with `v` on exit
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} tau - output scalar
* @param {NonNegativeInteger} offsetTau - index into `tau`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {void}
*/
function dlarfgp( N, alpha, offsetAlpha, x, strideX, tau, offsetTau ) {
	var ox;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	ox = stride2offset( N, strideX );
	base( N, alpha, offsetAlpha, x, strideX, ox, tau, offsetTau );
}


// EXPORTS //

export default dlarfgp;
