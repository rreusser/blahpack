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
* Generates a plane rotation with non-negative diagonal.
*
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} out - output array; on return `out[0]=cs`, `out[1]=sn`, `out[2]=r`
* @returns {Float64Array} `out`
*/
function dlartgp( f, g, out ) {
	return base( f, g, out );
}


// EXPORTS //

export default dlartgp;
