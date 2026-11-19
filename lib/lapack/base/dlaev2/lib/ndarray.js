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
* Computes the eigendecomposition of a 2-by-2 symmetric matrix.
*
* @param {number} a - (1,1) element of the 2-by-2 matrix
* @param {number} b - (1,2) element (also (2,1)) of the 2-by-2 matrix
* @param {number} c - (2,2) element of the 2-by-2 matrix
* @param {Float64Array} rt1 - output (length-1 array): the eigenvalue of larger absolute value
* @param {Float64Array} rt2 - output (length-1 array): the eigenvalue of smaller absolute value
* @param {Float64Array} cs1 - output (length-1 array): `cs1`
* @param {Float64Array} sn1 - output (length-1 array): the vector (CS1, SN1) is a unit right eigenvector for RT1
* @returns {void}
*/
function dlaev2( a, b, c, rt1, rt2, cs1, sn1 ) {
	return base( a, b, c, rt1, rt2, cs1, sn1 );
}


// EXPORTS //

export default dlaev2;
