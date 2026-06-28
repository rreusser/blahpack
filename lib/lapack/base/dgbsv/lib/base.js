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

import dgbtrf from '../../dgbtrf/lib/base.js';
import dgbtrs from '../../dgbtrs/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations A * X = B where A is an N-by-N band.
* matrix with KL subdiagonals and KU superdiagonals, using the LU
* factorization computed by dgbtrf.
*
* The band matrix A is stored in an array AB with 2*KL+KU+1 rows and N
* columns. The first KL rows are reserved for fill-in during factorization.
*
* On exit, AB contains the LU factors and IPIV contains the (0-based)
* pivot indices. B is overwritten with the solution matrix X.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides (columns of B)
* @param {Float64Array} AB - band matrix in LAPACK band storage (2*KL+KU+1 by N)
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Int32Array} IPIV - pivot index array of length N (output, 0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Float64Array} B - right-hand side matrix (N by NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @returns {integer} info - 0 if successful, >0 if U(i,i) is zero (1-based index)
*/
function dgbsv( N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var info;

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	// Compute the LU factorization of the band matrix A:
	info = dgbtrf( N, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV );

	if ( info === 0 ) {
		// Solve the system A*X = B using the factored form:
		info = dgbtrs( 'no-transpose', N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
	}

	return info;
}


// EXPORTS //

export default dgbsv;
