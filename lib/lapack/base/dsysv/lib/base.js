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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrf from '../../dsytrf/lib/base.js';
import dsytrs2 from '../../dsytrs2/lib/base.js';


// MAIN //

/**
* Solves a real symmetric indefinite system of linear equations A * X = B.
* using the Bunch-Kaufman diagonal pivoting method.
*
* The factorization has the form:
*   A = U _ D _ U^T  (if uplo = 'U')
*   A = L _ D _ L^T  (if uplo = 'L')
*
* where U (or L) is a product of permutation and unit upper (lower) triangular
* matrices, and D is symmetric and block diagonal with 1-by-1 and 2-by-2
* diagonal blocks.
*
* The factored form of A is then used to solve the system A * X = B via
* dsytrs2.
*
* IPIV is an output array that receives 0-based pivot indices from dsytrf.
* Negative values indicate 2x2 pivots (using bitwise NOT encoding).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - input/output N-by-N symmetric matrix; on exit, block diagonal matrix D and multipliers for the factorization
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
* @returns {integer} info - 0 if successful, k>0 if D(k-1,k-1) is exactly zero
*/
function dsysv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var WORK;
	var info;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Factorize A = U*D*U^T or A = L*D*L^T
	info = dsytrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );

	if ( info === 0 ) {
		// Allocate workspace for dsytrs2 (needs N elements)
		WORK = new Float64Array( N );

		// Solve using the factorization
		dsytrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, 1, 0 );
	}

	return info;
}


// EXPORTS //

export default dsysv;
