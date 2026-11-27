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
* Computes 2-by-2 unitary matrices U, V, and Q for the generalized upper (lower) triangular form.
*
* @param {boolean} upper - whether the input matrices are upper triangular
* @param {number} a1 - (1,1) element of A (real)
* @param {Complex128} a2 - off-diagonal element of A (complex)
* @param {number} a3 - (2,2) element of A (real)
* @param {number} b1 - (1,1) element of B (real)
* @param {Complex128} b2 - off-diagonal element of B (complex)
* @param {number} b3 - (2,2) element of B (real)
* @param {Float64Array} csu - output (length-1 array): `csu`
* @param {Complex128Array} snu - output (length-1 array): the desired unitary matrix U
* @param {Float64Array} csv - output (length-1 array): `csv`
* @param {Complex128Array} snv - output (length-1 array): the desired unitary matrix V
* @param {Float64Array} csq - output (length-1 array): `csq`
* @param {Complex128Array} snq - output (length-1 array): the desired unitary matrix Q
*/
function zlags2( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq ) { // eslint-disable-line max-len, max-params
	return base( upper, a1, a2, a3, b1, b2, b3, csu, snu, 0, csv, snv, 0, csq, snq, 0 );
}


// EXPORTS //

export default zlags2;
