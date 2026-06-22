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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetrf from '../../zhetrf/lib/base.js';
import zhetrs from '../../zhetrs/lib/base.js';
import zhetrs2 from '../../zhetrs2/lib/base.js';


// MAIN //

/**
* Computes the solution to a complex system of linear equations A*X = B,
* where A is an N-by-N Hermitian matrix and X and B are N-by-NRHS matrices.
*
* The diagonal pivoting method is used to factor A as:
*   A = U * D * U^H  (if uplo = 'U'), or
*   A = L * D * L^H  (if uplo = 'L'),
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is Hermitian and block diagonal with 1-by-1
* and 2-by-2 diagonal blocks.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {integer} N - order of the matrix A
* @param {integer} nrhs - number of right hand sides
* @param {Complex128Array} A - input/output matrix A (N x N)
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Int32Array} IPIV - output pivot indices
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @param {Complex128Array} B - input/output right hand side / solution
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {integer} offsetB - offset into B
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride of WORK
* @param {integer} offsetWORK - offset into WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info - 0 if successful, >0 if D(i,i) is zero
*/
function zhesv( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork ) {
	var info;

	if ( N === 0 ) {
		return 0;
	}

	// Factor A
	info = zhetrf( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );

	if ( info === 0 ) {
		// Solve using the factorization
		if ( lwork < N ) {
			// Use zhetrs (no extra workspace needed)
			zhetrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB );
		} else {
			// Use zhetrs2 (faster, uses workspace for zsyconv)
			zhetrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK );
		}
	}

	return info;
}


// EXPORTS //

export default zhesv;
