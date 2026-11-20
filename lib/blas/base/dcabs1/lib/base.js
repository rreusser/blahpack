/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.
*
* @private
* @param {Complex128} z - complex number
* @returns {number} |Re(z)| + |Im(z)|
*/
function dcabs1( z ) {
	return Math.abs( real( z ) ) + Math.abs( imag( z ) );
}


// EXPORTS //

export default dcabs1;
