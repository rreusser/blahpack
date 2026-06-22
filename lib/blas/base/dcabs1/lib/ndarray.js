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
