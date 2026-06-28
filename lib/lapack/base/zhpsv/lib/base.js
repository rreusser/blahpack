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

// MODULES //

import zhptrf from '../../zhptrf/lib/base.js';
import zhptrs from '../../zhptrs/lib/base.js';


// MAIN //

/**
* Computes the solution to a complex system of linear equations `A * X = B` where A is Hermitian in packed storage.
*
* The diagonal pivoting method is used to factor A as `A = U * D * U**H` or `A = L * D * L**H`, where U (or L) is a product of permutation and unit upper (lower) triangular matrices, D is Hermitian and block diagonal with 1-by-1 and 2-by-2 diagonal blocks. The factored form of A is then used to solve the system of equations `A * X = B`.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of the Hermitian matrix A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns in B
* @param {Complex128Array} AP - Hermitian matrix A in packed storage (length `N*(N+1)/2`)
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Int32Array} IPIV - output pivot indices (0-based), length N
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} B - input/output N-by-NRHS matrix; on exit, the solution X
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} info - 0 if successful, k if `D(k-1,k-1)` is exactly zero
*/
function zhpsv( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	var info;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Compute the factorization A = U*D*U**H or A = L*D*L**H:
	info = zhptrf( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV ); // eslint-disable-line max-len

	if ( info === 0 ) {
		// Solve the system A*X = B, overwriting B with X:
		zhptrs( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
	}

	return info;
}


// EXPORTS //

export default zhpsv;
