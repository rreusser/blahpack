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
 * Tests for NaN by comparing two arguments for inequality.
 *
 *
 * @param {number} din1 - first value
 * @param {number} din2 - second value
 * @returns {boolean} true if din1 !== din2
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Tests for NaN by comparing two arguments for inequality.
*
* @param {number} din1 - first value
* @param {number} din2 - second value
* @returns {boolean} true if din1 !== din2
*/
function dlaisnan( din1, din2 ) {
	return base( din1, din2 );
}


// EXPORTS //

export default dlaisnan;
