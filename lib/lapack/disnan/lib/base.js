/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MAIN //

/**
* Tests whether a double-precision floating-point number is NaN.
*
* @private
* @param {number} din - value to test
* @returns {boolean} true if NaN, false otherwise
*/
function disnan( din ) {
	return din !== din;
}


// EXPORTS //

export default disnan;
