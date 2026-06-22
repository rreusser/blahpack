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

// VARIABLES //

var BLOCK_SIZE = 32;


// MAIN //

/**
* Performs a series of row interchanges on a matrix `A` using pivot indices stored in `IPIV`.
*
* @private
* @param {PositiveInteger} N - number of columns in `A`
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {NonNegativeInteger} k1 - index of first row to interchange
* @param {NonNegativeInteger} k2 - index of last row to interchange
* @param {integer} inck - direction in which to apply pivots (-1 to apply pivots in reverse order; otherwise, apply in provided order)
* @param {Int32Array} IPIV - vector of pivot indices
* @param {integer} strideIPIV - `IPIV` stride length
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {Float64Array} permuted matrix `A`
*/
function dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV ) {
	var nrows;
	var n32;
	var tmp;
	var row;
	var ia1;
	var ia2;
	var ip;
	var i;
	var j;
	var k;
	var n;
	var o;

	// Compute the number of rows to be interchanged:
	if ( inck > 0 ) {
		nrows = k2 - k1;
	} else {
		nrows = k1 - k2;
	}
	nrows += 1;

	// Use loop tiling (BLOCK_SIZE-column blocks) for cache-efficient column-major access:
	n32 = ( ( N / BLOCK_SIZE ) | 0 ) * BLOCK_SIZE;
	if ( n32 !== 0 ) {
		for ( j = 0; j < n32; j += BLOCK_SIZE ) {
			ip = offsetIPIV;
			for ( i = 0, k = k1; i < nrows; i++, k += inck ) {
				row = IPIV[ ip ];
				if ( row !== k ) {
					ia1 = offsetA + ( k * strideA1 );
					ia2 = offsetA + ( row * strideA1 );
					for ( n = j; n < j + BLOCK_SIZE; n++ ) {
						o = n * strideA2;
						tmp = A[ ia1 + o ];
						A[ ia1 + o ] = A[ ia2 + o ];
						A[ ia2 + o ] = tmp;
					}
				}
				ip += strideIPIV;
			}
		}
	}
	if ( n32 !== N ) {
		ip = offsetIPIV;
		for ( i = 0, k = k1; i < nrows; i++, k += inck ) {
			row = IPIV[ ip ];
			if ( row !== k ) {
				ia1 = offsetA + ( k * strideA1 );
				ia2 = offsetA + ( row * strideA1 );
				for ( n = n32; n < N; n++ ) {
					o = n * strideA2;
					tmp = A[ ia1 + o ];
					A[ ia1 + o ] = A[ ia2 + o ];
					A[ ia2 + o ] = tmp;
				}
			}
			ip += strideIPIV;
		}
	}
	return A;
}


// EXPORTS //

export default dlaswp;
