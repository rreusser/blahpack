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
* Compute the eigenvalues and eigenvectors of a 2-by-2 complex symmetric matrix.
*
* @param {Complex128} a - the (1,1) element of the input matrix
* @param {Complex128} b - the (1,2) and (2,1) element of the input matrix
* @param {Complex128} c - the (2,2) element of the input matrix
* @param {Complex128Array} rt1 - output (length-1 array): the eigenvalue of larger modulus
* @param {NonNegativeInteger} offsetRt1 - starting index for `rt1` (in complex elements)
* @param {Complex128Array} rt2 - output (length-1 array): the eigenvalue of smaller modulus
* @param {NonNegativeInteger} offsetRt2 - starting index for `rt2` (in complex elements)
* @param {Complex128Array} evscal - output (length-1 array): the complex value by which the eigenvector matrix was scaled to make it orthonormal
* @param {NonNegativeInteger} offsetEvscal - starting index for `evscal` (in complex elements)
* @param {Complex128Array} cs1 - output (length-1 array): `cs1`
* @param {NonNegativeInteger} offsetCs1 - starting index for `cs1` (in complex elements)
* @param {Complex128Array} sn1 - output (length-1 array): if EVSCAL .NE
* @param {NonNegativeInteger} offsetSn1 - starting index for `sn1` (in complex elements)
* @returns {void}
*/
function zlaesy( a, b, c, rt1, offsetRt1, rt2, offsetRt2, evscal, offsetEvscal, cs1, offsetCs1, sn1, offsetSn1 ) {
	return base( a, b, c, rt1, offsetRt1, rt2, offsetRt2, evscal, offsetEvscal, cs1, offsetCs1, sn1, offsetSn1 );
}


// EXPORTS //

export default zlaesy;
