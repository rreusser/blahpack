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
* Computes the eigendecomposition of a 2-by-2 Hermitian matrix.
*
* @param {Complex128} a - (1,1) element of the 2-by-2 Hermitian matrix
* @param {Complex128} b - (1,2) element of the 2-by-2 Hermitian matrix
* @param {Complex128} c - (2,2) element of the 2-by-2 Hermitian matrix
* @returns {Object} object with `rt1`, `rt2`, `cs1`, `sn1r`, and `sn1i` properties
*/
function zlaev2( a, b, c ) {
	return base( a, b, c );
}


// EXPORTS //

export default zlaev2;
