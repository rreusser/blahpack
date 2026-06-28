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

import dgetrf from '../../dgetrf/lib/base.js';
import dgetrs from '../../dgetrs/lib/base.js';


// MAIN //

/**
* Computes the solution to a real system of linear equations `A * X = B` where `A` is an N-by-N matrix.
*
* The LU decomposition with partial pivoting and row interchanges is
* used to factor A as `A = P*L*U`, then the factored form of A is
* used to solve the system of equations A * X = B.
*
* IPIV is an output array that receives 0-based pivot indices from dgetrf.
*
* @private
* @param {NonNegativeInteger} N - order of matrix A (number of rows and columns)
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - input/output N-by-N matrix; on exit, L and U factors
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - output pivot indices (0-based), length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - input/output N-by-NRHS matrix; on exit, the solution X
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero
*/
function dgesv( N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var info;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Compute the LU factorization of A
	info = dgetrf( N, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );

	if ( info === 0 ) {
		// Solve the system using the factorization
		dgetrs( 'no-transpose', N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
	}

	return info;
}


// EXPORTS //

export default dgesv;
