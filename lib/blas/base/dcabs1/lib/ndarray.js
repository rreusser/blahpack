/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.
 *
 *
 * @param {Float64Array} z - complex number [real, imag]
 * @returns {number} |Re(z)| + |Im(z)|
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.
*
* @param {Float64Array} z - complex number [real, imag]
* @returns {number} |Re(z)| + |Im(z)|
*/
function dcabs1( z ) {
	return base( z );
}


// EXPORTS //

export default dcabs1;
