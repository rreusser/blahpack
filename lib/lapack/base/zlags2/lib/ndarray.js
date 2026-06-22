
// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes 2-by-2 unitary matrices U, V, and Q for the generalized upper (lower) triangular form.
*
* @param {boolean} upper - whether the input matrices are upper triangular
* @param {number} a1 - (1,1) element of A (real)
* @param {Complex128} a2 - off-diagonal element of A (complex)
* @param {number} a3 - (2,2) element of A (real)
* @param {number} b1 - (1,1) element of B (real)
* @param {Complex128} b2 - off-diagonal element of B (complex)
* @param {number} b3 - (2,2) element of B (real)
* @returns {Object} object with properties `csu`, `snuR`, `snuI`, `csv`, `snvR`, `snvI`, `csq`, `snqR`, `snqI`
*/
function zlags2( upper, a1, a2, a3, b1, b2, b3 ) { // eslint-disable-line max-len, max-params
	return base( upper, a1, a2, a3, b1, b2, b3 );
}


// EXPORTS //

export default zlags2;
