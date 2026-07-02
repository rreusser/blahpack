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
 * Computes sqrt(x^2 + y^2 + z^2) safely, avoiding unnecessary overflow.
 * and underflow.
 *
 *
 * @param {number} x - first value
 * @param {number} y - second value
 * @param {number} z - third value
 * @returns {number} sqrt(x^2 + y^2 + z^2)
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes sqrt(x^2 + y^2 + z^2) safely, avoiding unnecessary overflow.
*
* @param {number} x - first value
* @param {number} y - second value
* @param {number} z - third value
* @returns {number} sqrt(x^2 + y^2 + z^2)
*/
function dlapy3( x, y, z ) {
	return base( x, y, z );
}


// EXPORTS //

export default dlapy3;
