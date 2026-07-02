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
* @param {number} ar - ar
* @param {number} ai - ai
* @param {number} br - br
* @param {number} bi - bi
* @returns {integer} info status code
*/
function zhetrs( ar, ai, br, bi ) {
	return base( ar, ai, br, bi );
}


// EXPORTS //

export default zhetrs;
