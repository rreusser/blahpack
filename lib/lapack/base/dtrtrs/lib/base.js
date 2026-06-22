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

import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';


// MAIN //

/**
* Solves a triangular system of the form:.
* `A*X = B`,  `A^T*X = B`,  or  `A^H * X = B`
* where A is a triangular matrix of order N, and B is an N-by-NRHS matrix.
* A check is made to verify that A is nonsingular.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} A - triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 if successful, k if A(k-1,k-1) is zero
*/
function dtrtrs( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var nounit;
	var sa1;
	var sa2;
	var i;

	nounit = ( diag === 'non-unit' );

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	// Check for singularity.
	if ( nounit ) {
		for ( i = 0; i < N; i++ ) {
			if ( A[ offsetA + (i * sa1) + (i * sa2) ] === 0.0 ) {
				return i + 1;
			}
		}
	}

	// Solve A * X = B, A^T * X = B, or A^H * X = B.
	dtrsm( 'left', uplo, trans, diag, N, nrhs, 1.0, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB);

	return 0;
}


// EXPORTS //

export default dtrtrs;
