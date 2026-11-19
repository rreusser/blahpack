/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Computes one dqds transform in ping-pong form with a shift.
 *
 * ## Notes
 *
 * -   I0 and N0 are 1-based indices (Fortran convention).
 * -   Z is a flat array of length >= 4*N0 storing interleaved q/e values.
 * -   PP is 0 for ping, 1 for pong.
 * -   The routine modifies Z in-place and returns output scalars as an object.
 *
 *
 * @param {integer} i0 - first index (1-based)
 * @param {integer} n0 - last index (1-based)
 * @param {Float64Array} z - input/output array
 * @param {integer} stride - stride length for `z`
 * @param {NonNegativeInteger} offset - starting index for `z`
 * @param {integer} pp - ping-pong flag (0 or 1)
 * @param {number} tau - shift value
 * @param {number} sigma - accumulated shift
 * @param {boolean} ieee - flag for IEEE arithmetic
 * @param {number} eps - machine epsilon
 * @returns {Object} object with properties: dmin, dmin1, dmin2, dn, dnm1, dnm2
 */

/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes one dqds transform in ping-pong form with a shift.
*
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - input/output array
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {integer} pp - ping-pong flag (0 or 1)
* @param {number} tau - shift value
* @param {number} sigma - accumulated shift
* @param {Float64Array} dmin - output (length-1 array): minimum value of d
* @param {Float64Array} dmin1 - output (length-1 array): minimum value of d, excluding D( N0 )
* @param {Float64Array} dmin2 - output (length-1 array): minimum value of d, excluding D( N0 ) and D( N0-1 )
* @param {Float64Array} dn - output (length-1 array): d(N0), the last value of d
* @param {Float64Array} dnm1 - output (length-1 array): d(N0-1)
* @param {Float64Array} dnm2 - output (length-1 array): d(N0-2)
* @param {boolean} ieee - flag for IEEE arithmetic
* @param {number} eps - machine epsilon
* @returns {void}
*/
function dlasq5( i0, n0, z, strideZ, offsetZ, pp, tau, sigma, dmin, dmin1, dmin2, dn, dnm1, dnm2, ieee, eps ) {
	return base( i0, n0, z, strideZ, offsetZ, pp, tau, sigma, dmin, dmin1, dmin2, dn, dnm1, dnm2, ieee, eps );
}


// EXPORTS //

export default dlasq5;
