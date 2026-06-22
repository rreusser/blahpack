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

import dsptrf from '../../dsptrf/lib/base.js';
import dsptrs from '../../dsptrs/lib/base.js';


// MAIN //

/**
* Computes the solution to a real system of linear equations `A * X = B`.
* where `A` is an N-by-N symmetric matrix stored in packed format and `X`
* and `B` are N-by-NRHS matrices.
*
* The diagonal pivoting method is used to factor A as
* `A = U * D * U^T`,  if uplo = 'upper', or
* `A = L * D * L^T`,  if uplo = 'lower',
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, D is symmetric and block diagonal with 1-by-1
* and 2-by-2 diagonal blocks. The factored form of A is then used to
* solve the system of equations A * X = B.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - input/output packed symmetric matrix; on exit, the block diagonal matrix D and the multipliers used to obtain U or L
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Int32Array} IPIV - output pivot indices, length N
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} B - input/output N-by-NRHS matrix; on exit, the solution X
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
*/
function dspsv( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var info;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Compute the factorization A = U*D*U^T or A = L*D*L^T.
	info = dsptrf( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV );

	if ( info === 0 ) {
		// Solve the system A*X = B, overwriting B with X.
		dsptrs( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
	}

	return info;
}


// EXPORTS //

export default dspsv;
