/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

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
* @param {Float64Array} p - output (length-1 array): `p`
* @param {Float64Array} q - output (length-1 array): the scalars p and q in the above expression
* @returns {void}
*/
function dladiv( a, b, c, d, p, q ) {
	return base( a, b, c, d, p, q );
}


// EXPORTS //

export default dladiv;
