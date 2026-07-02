/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {number} a - a
* @param {number} b - b
* @returns {Float64Array} output array
*/
function dlantr( a, b ) {
	return base( a, b );
}


// EXPORTS //

export default dlantr;
