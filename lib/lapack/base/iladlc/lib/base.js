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

// MAIN //

/**
* Scans a real matrix for its last non-zero column.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} 0-based index of last non-zero column, or -1 if none
*/
function iladlc( M, N, A, strideA1, strideA2, offsetA ) {
	var i;
	var j;

	if ( N === 0 ) {
		return -1;
	}

	// Quick test for the common case where one corner is non-zero.
	if ( A[ offsetA + (( N - 1 ) * strideA2) ] !== 0.0 ||
		A[ offsetA + (( M - 1 ) * strideA1) + (( N - 1 ) * strideA2) ] !== 0.0 ) {
		return N - 1;
	}

	// Scan each column from the end, returning with the first non-zero.
	for ( j = N - 1; j >= 0; j-- ) {
		for ( i = 0; i < M; i++ ) {
			if ( A[ offsetA + (i * strideA1) + (j * strideA2) ] !== 0.0 ) {
				return j;
			}
		}
	}
	return -1;
}


// EXPORTS //

export default iladlc;
