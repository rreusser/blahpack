

// MODULES //

import base from './base.js';


// MAIN //

/**
* Compute the eigenvalues and eigenvectors of a 2-by-2 complex symmetric matrix.
*
* @param {Complex128} a - the (1,1) element of the input matrix
* @param {Complex128} b - the (1,2) and (2,1) element of the input matrix
* @param {Complex128} c - the (2,2) element of the input matrix
* @returns {Object} object with fields `rt1r`, `rt1i`, `rt2r`, `rt2i`, `evscalr`, `evscali`, `cs1r`, `cs1i`, `sn1r`, `sn1i`
*/
function zlaesy( a, b, c ) {
	return base( a, b, c );
}


// EXPORTS //

export default zlaesy;
