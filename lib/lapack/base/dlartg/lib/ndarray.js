/**
 * Generates a plane rotation so that:.
 *
 * \[  c  s \] . \[ f \] = \[ r \]
 * \[ -s  c \]   \[ g \]   \[ 0 \]
 *
 * where c^2 + s^2 = 1.
 *
 * ## Notes
 *
 * -   The mathematical formulas used are:
 *     -   r = sign(f) * sqrt(f^2 + g^2)
 *     -   c = f / r
 *     -   s = g / r
 *
 *     Hence c >= 0.
 *
 * -   The algorithm incorporates scaling to avoid overflow or underflow.
 *
 * -   If g = 0, then c = 1 and s = 0.
 *
 * -   If f = 0 and g != 0, then c = 0 and s = sign(1, g).
 *
 *
 * @param {number} f - first component of the vector to be rotated
 * @param {number} g - second component of the vector to be rotated
 * @param {Float64Array} out - output: out[0]=c, out[1]=s, out[2]=r
 * @returns {Float64Array} out
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Generates a plane rotation so that:.
*
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} out - output: out[0]=c, out[1]=s, out[2]=r
* @returns {Float64Array} out
*/
function dlartg( f, g, out ) {
	return base( f, g, out );
}


// EXPORTS //

export default dlartg;
