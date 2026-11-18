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
* @param {Float64Array} out - output array; on return `out[0]=cs`, `out[1]=sn`
* @returns {Float64Array} `out`
*/
function dlartgs( x, y, sigma, out ) {
	return base( x, y, sigma, out );
}


// EXPORTS //

export default dlartgs;
