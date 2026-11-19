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
* Computes the singular values of a 2-by-2 triangular matrix.
*
* @param {number} f - the (1,1) element
* @param {number} g - the (1,2) element
* @param {number} h - the (2,2) element
* @param {Float64Array} ssmin - output (length-1 array): the smaller singular value
* @param {Float64Array} ssmax - output (length-1 array): the larger singular value
* @returns {void}
*/
function dlas2( f, g, h, ssmin, ssmax ) {
	return base( f, g, h, ssmin, ssmax );
}


// EXPORTS //

export default dlas2;
