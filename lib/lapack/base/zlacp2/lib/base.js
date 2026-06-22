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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Copies all or part of a real matrix `A` to a complex matrix `B`, setting imaginary parts to zero.
*
* @private
* @param {string} uplo - specifies whether to copy the upper triangle, lower triangle, or all of `A`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input real matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - output complex matrix
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {Complex128Array} `B`
*/
function zlacp2( uplo, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var sb1;
	var sb2;
	var Bv;
	var oB;
	var ia;
	var ib;
	var i;
	var j;

	Bv = reinterpret( B, 0 );
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oB = offsetB * 2;

	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j += 1 ) {
			ia = offsetA + ( j * strideA2 );
			ib = oB + ( j * sb2 );
			for ( i = 0; i <= j && i < M; i += 1 ) {
				Bv[ ib + ( i * sb1 ) ] = A[ ia + ( i * strideA1 ) ];
				Bv[ ib + ( i * sb1 ) + 1 ] = 0.0;
			}
		}
	} else if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j += 1 ) {
			ia = offsetA + ( j * strideA2 );
			ib = oB + ( j * sb2 );
			for ( i = j; i < M; i += 1 ) {
				Bv[ ib + ( i * sb1 ) ] = A[ ia + ( i * strideA1 ) ];
				Bv[ ib + ( i * sb1 ) + 1 ] = 0.0;
			}
		}
	} else {
		for ( j = 0; j < N; j += 1 ) {
			ia = offsetA + ( j * strideA2 );
			ib = oB + ( j * sb2 );
			for ( i = 0; i < M; i += 1 ) {
				Bv[ ib + ( i * sb1 ) ] = A[ ia + ( i * strideA1 ) ];
				Bv[ ib + ( i * sb1 ) + 1 ] = 0.0;
			}
		}
	}
	return B;
}


// EXPORTS //

export default zlacp2;
