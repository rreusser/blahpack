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
* Computes 2-by-2 orthogonal matrices U, V, and Q, and applies them to matrices A and B such that the rows of the transformed A and B are parallel.
*
* @param {boolean} upper - = `true`: the input matrices A and B are upper triangular. = `false`: the input matrices A and B are lower triangular.
* @param {number} a1 - on entry, A1, A2 and A3 are elements of the input 2-by-2 upper (lower) triangular matrix A.
* @param {number} a2 - on entry, A1, A2 and A3 are elements of the input 2-by-2 upper (lower) triangular matrix A.
* @param {number} a3 - on entry, A1, A2 and A3 are elements of the input 2-by-2 upper (lower) triangular matrix A.
* @param {number} b1 - on entry, B1, B2 and B3 are elements of the input 2-by-2 upper (lower) triangular matrix B.
* @param {number} b2 - on entry, B1, B2 and B3 are elements of the input 2-by-2 upper (lower) triangular matrix B.
* @param {number} b3 - on entry, B1, B2 and B3 are elements of the input 2-by-2 upper (lower) triangular matrix B.
* @param {Float64Array} csu - output (length-1 array): `csu`
* @param {Float64Array} snu - output (length-1 array): the desired orthogonal matrix U
* @param {Float64Array} csv - output (length-1 array): `csv`
* @param {Float64Array} snv - output (length-1 array): the desired orthogonal matrix V
* @param {Float64Array} csq - output (length-1 array): `csq`
* @param {Float64Array} snq - output (length-1 array): the desired orthogonal matrix Q
*/
function dlags2( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq ) { // eslint-disable-line max-len, max-params
	return base( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq );
}


// EXPORTS //

export default dlags2;
