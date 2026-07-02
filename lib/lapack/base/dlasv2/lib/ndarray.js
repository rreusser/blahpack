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
