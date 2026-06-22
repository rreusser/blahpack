/**
 * Computes one dqds transform in ping-pong form without a shift.
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
 * @returns {Object} object with properties: dmin, dmin1, dmin2, dn, dnm1, dnm2
 */

/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes one dqds transform in ping-pong form without a shift.
*
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - input/output array
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @param {integer} pp - ping-pong flag (0 or 1)
* @returns {Object} object with properties: dmin, dmin1, dmin2, dn, dnm1, dnm2
*/
function dlasq6( i0, n0, z, stride, offset, pp ) {
	return base( i0, n0, z, stride, offset, pp );
}


// EXPORTS //

export default dlasq6;
