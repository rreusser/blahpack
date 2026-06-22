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
* Perform Hermitian rank-1 update:.
* `A := alpha*x*x^H + A`
* where A is an N-by-N Hermitian matrix, x is an N-element vector,
* and alpha is a real scalar.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - real scalar
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} A - Hermitian matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} `A`
*/
function zher( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	var tempR;
	var tempI;
	var sa1;
	var sa2;
	var Av;
	var xv;
	var oA;
	var oX;
	var sx;
	var jx;
	var ix;
	var ai;
	var i;
	var j;

	if ( N === 0 || alpha === 0.0 ) {
		return A;
	}

	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );

	oA = offsetA * 2;
	oX = offsetX * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;

	if ( uplo === 'upper' ) {
		// Upper triangle
		jx = oX;
		for ( j = 0; j < N; j++ ) {
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
				// Temp = alpha * conj(x[j])
				tempR = alpha * xv[ jx ];
				tempI = -(alpha * xv[ jx + 1 ]);

				ix = oX;
				ai = oA + (j * sa2); // column j, row 0
				for ( i = 0; i < j; i++ ) {
					// A[i,j] += x[i] * temp
					Av[ ai ] += (xv[ ix ] * tempR) - (xv[ ix + 1 ] * tempI);
					Av[ ai + 1 ] += (xv[ ix ] * tempI) + (xv[ ix + 1 ] * tempR);
					ix += sx;
					ai += sa1;
				}
				// Diagonal: A(j,j) = real(A(j,j)) + real(x[j] * temp)
				Av[ ai ] += ( (xv[ jx ] * tempR) - (xv[ jx + 1 ] * tempI) );
				Av[ ai + 1 ] = 0.0;
			} else {
				// Ensure diagonal is real
				ai = oA + (j * sa1) + (j * sa2);
				Av[ ai + 1 ] = 0.0;
			}
			jx += sx;
		}
	} else {
		// Lower triangle
		jx = oX;
		for ( j = 0; j < N; j++ ) {
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
				// Temp = alpha * conj(x[j])
				tempR = alpha * xv[ jx ];
				tempI = -(alpha * xv[ jx + 1 ]);

				// Diagonal: A(j,j) = real(A(j,j)) + real(x[j] * temp)
				ai = oA + (j * sa1) + (j * sa2);
				Av[ ai ] += ( (xv[ jx ] * tempR) - (xv[ jx + 1 ] * tempI) );
				Av[ ai + 1 ] = 0.0;

				ix = jx + sx;
				ai += sa1; // move to A(j+1, j)
				for ( i = j + 1; i < N; i++ ) {
					// A[i,j] += x[i] * temp
					Av[ ai ] += (xv[ ix ] * tempR) - (xv[ ix + 1 ] * tempI);
					Av[ ai + 1 ] += (xv[ ix ] * tempI) + (xv[ ix + 1 ] * tempR);
					ix += sx;
					ai += sa1;
				}
			} else {
				// Ensure diagonal is real
				ai = oA + (j * sa1) + (j * sa2);
				Av[ ai + 1 ] = 0.0;
			}
			jx += sx;
		}
	}
	return A;
}


// EXPORTS //

export default zher;
