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
 * Returns sqrt(x**2 + y**2), taking care not to cause unnecessary.
 * overflow and unnecessary underflow.
 *
 *
 * @param {number} x - first value
 * @param {number} y - second value
 * @returns {number} sqrt(x**2 + y**2)
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Returns sqrt(x.
*
* @param {number} x - first value
* @param {number} y - second value
* @returns {number} sqrt(x**2 + y**2)
*/
function dlapy2( x, y ) {
	return base( x, y );
}


// EXPORTS //

export default dlapy2;
