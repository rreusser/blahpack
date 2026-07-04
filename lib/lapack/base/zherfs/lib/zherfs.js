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
* @param {number} re - re
* @param {number} im - im
* @returns {integer} info status code
*/
function zherfs( re, im ) {
	return base( re, im );
}


// EXPORTS //

export default zherfs;
