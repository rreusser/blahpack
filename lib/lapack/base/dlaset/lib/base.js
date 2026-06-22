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

// MAIN //

/**
* Initializes an M-by-N matrix A to BETA on the diagonal and ALPHA on the.
* off-diagonals.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, otherwise full matrix
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {number} alpha - off-diagonal value
* @param {number} beta - diagonal value
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @returns {Float64Array} A
*/
function dlaset( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA ) {
	var idx;
	var mn;
	var i;
	var j;

	mn = Math.min( M, N );

	if ( uplo === 'upper' ) {
		// Set the strictly upper triangular part to ALPHA.
		for ( j = 1; j < N; j++ ) {
			idx = offsetA + (j * strideA2);
			for ( i = 0; i < Math.min( j, M ); i++ ) {
				A[ idx ] = alpha;
				idx += strideA1;
			}
		}
	} else if ( uplo === 'lower' ) {
		// Set the strictly lower triangular part to ALPHA.
		for ( j = 0; j < mn; j++ ) {
			idx = offsetA + (( j + 1 ) * strideA1) + (j * strideA2);
			for ( i = j + 1; i < M; i++ ) {
				A[ idx ] = alpha;
				idx += strideA1;
			}
		}
	} else {
		// Set the full matrix to ALPHA.
		for ( j = 0; j < N; j++ ) {
			idx = offsetA + (j * strideA2);
			for ( i = 0; i < M; i++ ) {
				A[ idx ] = alpha;
				idx += strideA1;
			}
		}
	}

	// Set the diagonal to BETA.
	idx = offsetA;
	for ( i = 0; i < mn; i++ ) {
		A[ idx ] = beta;
		idx += strideA1 + strideA2;
	}

	return A;
}


// EXPORTS //

export default dlaset;
