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
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform Hermitian rank-2 update:.
* `A := alpha*x*conj(y)^T + conj(alpha)*y*conj(x)^T + A`
* where A is an N-by-N Hermitian matrix and x, y are N-element vectors.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} y - complex input vector
* @param {integer} strideY - stride for y (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
* @param {Complex128Array} A - Hermitian matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} `A`
*/
function zher2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var alphaR;
	var alphaI;
	var sa1;
	var sa2;
	var Av;
	var xv;
	var yv;
	var oA;
	var oX;
	var oY;
	var sx;
	var sy;
	var ix;
	var iy;
	var jx;
	var jy;
	var ai;
	var tr;
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
	yv = reinterpret( y, 0 );

	oA = offsetA * 2;
	oX = offsetX * 2;
	oY = offsetY * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	sy = strideY * 2;

	if ( uplo === 'upper' ) {
		// Upper triangle
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j++ ) {
			// Check if x[jx] or y[jy] is nonzero
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ||
				yv[ jy ] !== 0.0 || yv[ jy + 1 ] !== 0.0 ) {
				// temp1 = alpha * conj(y[jy])
				temp1R = (alphaR * yv[ jy ]) + (alphaI * yv[ jy + 1 ]);
				temp1I = -(alphaR * yv[ jy + 1 ]) + (alphaI * yv[ jy ]);

				// temp2 = conj(alpha * x[jx]) = conj(alpha) * conj(x[jx])
				tr = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
				temp2I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
				temp2R = tr;
				temp2I = -temp2I;

				ix = oX;
				iy = oY;
				ai = oA + (j * sa2); // column j
				for ( i = 0; i < j; i++ ) {
					// A[i,j] += x[ix] * temp1 + y[iy] * temp2
					Av[ ai ] += (xv[ ix ] * temp1R) - (xv[ ix + 1 ] * temp1I) +
						(yv[ iy ] * temp2R) - (yv[ iy + 1 ] * temp2I);
					Av[ ai + 1 ] += (xv[ ix ] * temp1I) + (xv[ ix + 1 ] * temp1R) +
						(yv[ iy ] * temp2I) + (yv[ iy + 1 ] * temp2R);
					ix += sx;
					iy += sy;
					ai += sa1;
				}
				// Diagonal: A(j,j) = real(A(j,j)) + real(x[jx]*temp1 + y[jy]*temp2)
				Av[ ai ] = Av[ ai ] +
					( (xv[ jx ] * temp1R) - (xv[ jx + 1 ] * temp1I) ) +
					( (yv[ jy ] * temp2R) - (yv[ jy + 1 ] * temp2I) );
				Av[ ai + 1 ] = 0.0;
			} else {
				// Ensure diagonal is real
				ai = oA + (j * sa1) + (j * sa2);
				Av[ ai + 1 ] = 0.0;
			}
			jx += sx;
			jy += sy;
		}
	} else {
		// Lower triangle
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j++ ) {
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ||
				yv[ jy ] !== 0.0 || yv[ jy + 1 ] !== 0.0 ) {
				// temp1 = alpha * conj(y[jy])
				temp1R = (alphaR * yv[ jy ]) + (alphaI * yv[ jy + 1 ]);
				temp1I = -(alphaR * yv[ jy + 1 ]) + (alphaI * yv[ jy ]);

				// temp2 = conj(alpha * x[jx])
				tr = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
				temp2I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
				temp2R = tr;
				temp2I = -temp2I;

				// Diagonal: A(j,j) = real(A(j,j)) + real(x[jx]*temp1 + y[jy]*temp2)
				ai = oA + (j * sa1) + (j * sa2);
				Av[ ai ] = Av[ ai ] +
					( (xv[ jx ] * temp1R) - (xv[ jx + 1 ] * temp1I) ) +
					( (yv[ jy ] * temp2R) - (yv[ jy + 1 ] * temp2I) );
				Av[ ai + 1 ] = 0.0;

				ix = jx + sx;
				iy = jy + sy;
				ai += sa1; // move to A(j+1, j)
				for ( i = j + 1; i < N; i++ ) {
					// A[i,j] += x[ix] * temp1 + y[iy] * temp2
					Av[ ai ] += (xv[ ix ] * temp1R) - (xv[ ix + 1 ] * temp1I) +
						(yv[ iy ] * temp2R) - (yv[ iy + 1 ] * temp2I);
					Av[ ai + 1 ] += (xv[ ix ] * temp1I) + (xv[ ix + 1 ] * temp1R) +
						(yv[ iy ] * temp2I) + (yv[ iy + 1 ] * temp2R);
					ix += sx;
					iy += sy;
					ai += sa1;
				}
			} else {
				// Ensure diagonal is real
				ai = oA + (j * sa1) + (j * sa2);
				Av[ ai + 1 ] = 0.0;
			}
			jx += sx;
			jy += sy;
		}
	}
	return A;
}


// EXPORTS //

export default zher2;
