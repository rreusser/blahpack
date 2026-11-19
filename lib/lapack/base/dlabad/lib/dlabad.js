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
* Takes the square root of the overflow and underflow thresholds if the.
* exponent range is very large.
*
* @param {Float64Array} small - input/output (length-1 array): underflow threshold as computed by dlamch
* @param {Float64Array} large - input/output (length-1 array): overflow threshold as computed by dlamch
* @returns {void}
*/
function dlabad( small, large ) {
	return base( small, large );
}


// EXPORTS //

export default dlabad;
