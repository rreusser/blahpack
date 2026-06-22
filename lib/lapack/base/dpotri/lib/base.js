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

// MODULES //

import dtrtri from '../../dtrtri/lib/base.js';
import dlauum from '../../dlauum/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric positive definite matrix using.
* its Cholesky factorization computed by dpotrf.
*
* The inverse is computed by first inverting the triangular Cholesky factor
* (dtrtri), then forming the product of the inverted factor with its
* transpose (dlauum).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output matrix; on entry, the triangular factor from dpotrf; on exit, the inverse
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} status code - 0 indicates success, k > 0 indicates the k-th diagonal element of the triangular factor is zero and the matrix is singular
*/
function dpotri( uplo, N, A, strideA1, strideA2, offsetA ) {
	var info;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	// Invert the triangular Cholesky factor...
	info = dtrtri( uplo, 'non-unit', N, A, strideA1, strideA2, offsetA );
	if ( info > 0 ) {
		return info;
	}

	// Form inv(U) * inv(U)**T or inv(L)**T * inv(L)...
	info = dlauum( uplo, N, A, strideA1, strideA2, offsetA );
	return info;
}


// EXPORTS //

export default dpotri;
