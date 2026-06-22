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
* Copies a triangular matrix from standard packed format (TP) to full format (TR).
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - input packed triangular matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} A - output matrix in full format
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @returns {integer} status code
*/
function dtpttr( uplo, N, AP, strideAP, offsetAP, A, strideA1, strideA2, offsetA ) { // eslint-disable-line max-len, max-params
	var da;
	var ip;
	var i;
	var j;

	if ( N === 0 ) {
		return 0;
	}
	ip = offsetAP;
	if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j += 1 ) {
			da = offsetA + ( j * strideA2 );
			for ( i = j; i < N; i += 1 ) {
				A[ da + ( i * strideA1 ) ] = AP[ ip ];
				ip += strideAP;
			}
		}
	} else {
		for ( j = 0; j < N; j += 1 ) {
			da = offsetA + ( j * strideA2 );
			for ( i = 0; i <= j; i += 1 ) {
				A[ da + ( i * strideA1 ) ] = AP[ ip ];
				ip += strideAP;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dtpttr;
