/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dgtts2 from './../../dgtts2/lib/base.js';

// MAIN //

/**
* Solves one of the systems of equations A_X = B or A^T_X = B with a.
* tridiagonal matrix A using the LU factorization computed by dgttrf.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   `trans` is a single character: `'no-transpose'` or `'transpose'`.
* -   INFO is returned: 0 = success.
*
* @private
* @param {string} trans - `'no-transpose'` for A*X=B, `'transpose'` for A^T*X=B
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} DL - multipliers from LU factorization (length N-1)
* @param {integer} strideDL - stride length for `DL`
* @param {NonNegativeInteger} offsetDL - starting index for `DL`
* @param {Float64Array} d - diagonal of U (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} DU - first superdiagonal of U (length N-1)
* @param {integer} strideDU - stride length for `DU`
* @param {NonNegativeInteger} offsetDU - starting index for `DU`
* @param {Float64Array} DU2 - second superdiagonal of U (length N-2)
* @param {integer} strideDU2 - stride length for `DU2`
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2`
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} B - right hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} info - 0 if successful
*/
function dgttrs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var itrans;

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Decode TRANS
	if ( trans === 'no-transpose' ) {
		itrans = 0;
	} else {
		itrans = 1;
	}

	// Call dgtts2 to solve the system (no blocking needed in JS)
	dgtts2( itrans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );

	return 0;
}


// EXPORTS //

export default dgttrs;
