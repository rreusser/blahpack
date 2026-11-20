/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import base from './base.js';


// MAIN //

/**
* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem.
*
* @param {number} x - the `(1,1)` entry of an upper bidiagonal matrix
* @param {number} y - the `(1,2)` entry of an upper bidiagonal matrix
* @param {number} sigma - shift
* @param {Float64Array} cs - output (length-1 array): the cosine of the rotation
* @param {Float64Array} sn - output (length-1 array): the sine of the rotation
*/
function dlartgs( x, y, sigma, cs, sn ) {
	return base( x, y, sigma, cs, sn );
}


// EXPORTS //

export default dlartgs;
