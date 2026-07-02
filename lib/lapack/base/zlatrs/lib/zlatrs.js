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
* @param {Float64Array} v - v
* @param {integer} idx - idx
* @returns {number} CABS1 value
*/
function zlatrs( v, idx ) {
	return base( v, idx );
}


// EXPORTS //

export default zlatrs;
