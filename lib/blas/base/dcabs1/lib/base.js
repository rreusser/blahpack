/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MAIN //

/**
* Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.
*
* @private
* @param {Float64Array} z - complex number [real, imag]
* @returns {number} |Re(z)| + |Im(z)|
*/
function dcabs1( z ) {
	return Math.abs( z[ 0 ] ) + Math.abs( z[ 1 ] );
}


// EXPORTS //

export default dcabs1;
