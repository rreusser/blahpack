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
* Compute |re|^2 + |im|^2.
*
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} sum of squares
*/
function zlartg( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR ) {
	return base( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR );
}


// EXPORTS //

export default zlartg;
