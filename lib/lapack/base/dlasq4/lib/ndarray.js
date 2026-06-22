/**
 * Computes an approximation TAU to the smallest eigenvalue using values of d.
 * from the previous transform. Used by the dqds algorithm (bidiagonal SVD).
 *
 *
 * @param {integer} i0 - first index (1-based)
 * @param {integer} n0 - last index (1-based)
 * @param {Float64Array} z - qd array
 * @param {integer} stride - stride length for `z`
 * @param {NonNegativeInteger} offset - starting index for `z`
 * @param {integer} pp - ping-pong flag (0 or 1)
 * @param {integer} n0in - value of n0 at start of eigtest
 * @param {number} dmin - minimum value of d
 * @param {number} dmin1 - minimum value of d, excluding d(n0)
 * @param {number} dmin2 - minimum value of d, excluding d(n0) and d(n0-1)
 * @param {number} dn - d(n0)
 * @param {number} dn1 - d(n0-1)
 * @param {number} dn2 - d(n0-2)
 * @param {number} tau - (input, unused — kept for API compat)
 * @param {integer} ttype - shift type from previous call
 * @param {number} g - damping parameter preserved between calls
 * @returns {Object} object with `tau` (shift), `ttype` (shift type), and `g` (updated damping)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes an approximation TAU to the smallest eigenvalue using values of d.
*
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - qd array
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @param {integer} pp - ping-pong flag (0 or 1)
* @param {integer} n0in - value of n0 at start of eigtest
* @param {number} dmin - minimum value of d
* @param {number} dmin1 - minimum value of d, excluding d(n0)
* @param {number} dmin2 - minimum value of d, excluding d(n0) and d(n0-1)
* @param {number} dn - d(n0)
* @param {number} dn1 - d(n0-1)
* @param {number} dn2 - d(n0-2)
* @param {number} tau - (input, unused — kept for API compat)
* @param {integer} ttype - shift type from previous call
* @param {number} g - damping parameter preserved between calls
* @returns {Object} object with `tau` (shift), `ttype` (shift type), and `g` (updated damping)
*/
function dlasq4( i0, n0, z, stride, offset, pp, n0in, dmin, dmin1, dmin2, dn, dn1, dn2, tau, ttype, g ) {
	return base( i0, n0, z, stride, offset, pp, n0in, dmin, dmin1, dmin2, dn, dn1, dn2, tau, ttype, g );
}


// EXPORTS //

export default dlasq4;
