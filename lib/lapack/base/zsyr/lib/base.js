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

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs the complex symmetric rank-1 operation:.
* A := alpha_x_x^T + A
*
* where alpha is a complex scalar, x is an N element complex vector, and A is
* an N by N complex symmetric matrix.
*
* NOTE: This is a SYMMETRIC (not Hermitian) update — it uses x_x^T, NOT x_x^H.
* The difference is that x is NOT conjugated.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} A - complex symmetric matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} `A`
*/
function zsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	var alphaR;
	var alphaI;
	var tempR;
	var tempI;
	var sa1;
	var sa2;
	var Av;
	var xv;
	var oA;
	var sx;
	var ix;
	var jx;
	var ai;
	var i;
	var j;

	if ( N === 0 ) {
		return A;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );

	// Quick return if alpha is zero
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return A;
	}

	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );

	oA = offsetA * 2;
	sx = strideX * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	if ( uplo === 'upper' ) {
		// Upper triangle: A(i,j) for i <= j
		jx = offsetX * 2;
		for ( j = 0; j < N; j++ ) {
			// Check if x[jx] is nonzero
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
				// Temp = alpha * x[jx] (complex multiply, NO conjugation)
				tempR = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
				tempI = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);

				ix = offsetX * 2;
				ai = oA + (j * sa2);
				for ( i = 0; i <= j; i++ ) {
					// A[i,j] += x[ix] * temp (complex multiply, NOT conjugated)
					Av[ ai ] += (xv[ ix ] * tempR) - (xv[ ix + 1 ] * tempI);
					Av[ ai + 1 ] += (xv[ ix ] * tempI) + (xv[ ix + 1 ] * tempR);
					ix += sx;
					ai += sa1;
				}
			}
			jx += sx;
		}
	} else {
		// Lower triangle: A(i,j) for i >= j
		jx = offsetX * 2;
		for ( j = 0; j < N; j++ ) {
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
				// Temp = alpha * x[jx] (complex multiply, NO conjugation)
				tempR = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
				tempI = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);

				ix = jx;
				ai = oA + (j * sa1) + (j * sa2);
				for ( i = j; i < N; i++ ) {
					// A[i,j] += x[ix] * temp (complex multiply, NOT conjugated)
					Av[ ai ] += (xv[ ix ] * tempR) - (xv[ ix + 1 ] * tempI);
					Av[ ai + 1 ] += (xv[ ix ] * tempI) + (xv[ ix + 1 ] * tempR);
					ix += sx;
					ai += sa1;
				}
			}
			jx += sx;
		}
	}
	return A;
}


// EXPORTS //

export default zsyr;
