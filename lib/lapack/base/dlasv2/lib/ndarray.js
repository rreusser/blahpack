/**
 * Returns |a| with the sign of b (Fortran SIGN intrinsic).
 *
 *
 * @param {number} a - magnitude source
 * @param {number} b - sign source
 * @returns {number} |a| * sign(b)
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the singular value decomposition of a 2-by-2 triangular matrix:.
*
* @param {number} f - the (1,1) element
* @param {number} g - the (1,2) element
* @param {number} h - the (2,2) element
* @returns {Object} object with fields { ssmin, ssmax, snr, csr, snl, csl }
*/
function dlasv2( f, g, h ) {
	return base( f, g, h );
}


// EXPORTS //

export default dlasv2;
