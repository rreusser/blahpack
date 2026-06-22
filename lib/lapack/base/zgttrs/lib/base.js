/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import zgtts2 from './../../zgtts2/lib/base.js';


// MAIN //

/**
* Solves one of the systems of equations A_X = B, A^T_X = B, or A^H*X = B.
* with a complex tridiagonal matrix A using the LU factorization computed by zgttrf.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   `trans` is a long-form string: 'no-transpose', 'transpose', or 'conjugate-transpose'.
* -   INFO is returned: 0 = success.
*
* @private
* @param {string} trans - 'no-transpose' for A*X=B, 'transpose' for A^T*X=B, 'conjugate-transpose' for A^H*X=B
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} DL - multipliers from LU factorization (length N-1)
* @param {integer} strideDL - stride for `DL` (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for `DL` (complex elements)
* @param {Complex128Array} d - diagonal of U (length N)
* @param {integer} strideD - stride for `d` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `d` (complex elements)
* @param {Complex128Array} DU - first superdiagonal of U (length N-1)
* @param {integer} strideDU - stride for `DU` (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for `DU` (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal of U (length N-2)
* @param {integer} strideDU2 - stride for `DU2` (complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2` (complex elements)
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} B - right hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of `B` (Float64 elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (Float64 elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (Float64 elements)
* @returns {integer} info - 0 if successful
*/
function zgttrs( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var itrans;

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Decode TRANS
	if ( trans === 'no-transpose' ) {
		itrans = 0;
	} else if ( trans === 'transpose' ) {
		itrans = 1;
	} else {
		itrans = 2;
	}

	// Call zgtts2 to solve the system (no blocking needed in JS)
	zgtts2( itrans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );

	return 0;
}


// EXPORTS //

export default zgttrs;
