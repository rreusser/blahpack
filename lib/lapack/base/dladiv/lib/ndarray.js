/**
 * Internal helper: DLADIV2.
 *
 *
 * @param {number} a - a
 * @param {number} b - b
 * @param {number} c - c
 * @param {number} d - d
 * @param {number} r - r
 * @param {number} t - t
 * @returns {number} result
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Performs complex division in real arithmetic:.
*
* @param {number} a - real part of numerator
* @param {number} b - imaginary part of numerator
* @param {number} c - real part of denominator
* @param {number} d - imaginary part of denominator
* @param {Float64Array} out - output array: out[0]=p, out[1]=q
* @returns {Float64Array} out
*/
function dladiv( a, b, c, d, out ) {
	return base( a, b, c, d, out );
}


// EXPORTS //

export default dladiv;
