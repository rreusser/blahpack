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
* Computes the Schur factorization of a real 2-by-2 nonsymmetric matrix in standard form.
*
* @param {Float64Array} A - the (1,1) element of the matrix
* @param {Float64Array} B - the (1,2) element of the matrix
* @param {Float64Array} C - the (2,1) element of the matrix
* @param {Float64Array} D - the (2,2) element of the matrix
* @param {Float64Array} rt1r - output (length-1 array): `rt1r`
* @param {Float64Array} rt1i - output (length-1 array): `rt1i`
* @param {Float64Array} rt2r - output (length-1 array): `rt2r`
* @param {Float64Array} rt2i - output (length-1 array): the real and imaginary parts of the eigenvalues
* @param {Float64Array} cs - output (length-1 array): `cs`
* @param {Float64Array} sn - output (length-1 array): parameters of the rotation matrix
*/
function dlanv2( A, B, C, D, rt1r, rt1i, rt2r, rt2i, cs, sn ) {
	return base( A, B, C, D, rt1r, rt1i, rt2r, rt2i, cs, sn );
}


// EXPORTS //

export default dlanv2;
