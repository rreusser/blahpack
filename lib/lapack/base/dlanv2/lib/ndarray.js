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
* Computes the Schur factorization of A real 2-by-2 nonsymmetric matrix in standard form.
*
* @param {number} A - the (1,1) element of the matrix
* @param {number} B - the (1,2) element of the matrix
* @param {number} C - the (2,1) element of the matrix
* @param {number} D - the (2,2) element of the matrix
* @returns {Object} object with fields: `A`, `B`, `C`, `D` (Schur form), `rt1r`, `rt1i`, `rt2r`, `rt2i` (eigenvalues), `cs`, `sn` (rotation)
*/
function dlanv2( A, B, C, D ) {
	return base( A, B, C, D );
}


// EXPORTS //

export default dlanv2;
