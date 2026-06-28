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

// MAIN //

/**
* Copies all or part of a matrix `A` to another matrix `B`.
*
* @private
* @param {string} uplo - specifies whether to copy the upper triangle, lower triangle, or all of `A`
* @param {NonNegativeInteger} M - number of rows in `A`
* @param {NonNegativeInteger} N - number of columns in `A`
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float64Array} B - output matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - index offset for `B`
* @returns {Float64Array} `B`
*/
function dlacpy( uplo, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var da0;
	var db0;
	var i;
	var j;

	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			da0 = offsetA + ( j * strideA2 );
			db0 = offsetB + ( j * strideB2 );
			for ( i = 0; i <= j && i < M; i++ ) {
				B[ db0 + ( i * strideB1 ) ] = A[ da0 + ( i * strideA1 ) ];
			}
		}
	} else if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j++ ) {
			da0 = offsetA + ( j * strideA2 );
			db0 = offsetB + ( j * strideB2 );
			for ( i = j; i < M; i++ ) {
				B[ db0 + ( i * strideB1 ) ] = A[ da0 + ( i * strideA1 ) ];
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			da0 = offsetA + ( j * strideA2 );
			db0 = offsetB + ( j * strideB2 );
			for ( i = 0; i < M; i++ ) {
				B[ db0 + ( i * strideB1 ) ] = A[ da0 + ( i * strideA1 ) ];
			}
		}
	}
	return B;
}


// EXPORTS //

export default dlacpy;
