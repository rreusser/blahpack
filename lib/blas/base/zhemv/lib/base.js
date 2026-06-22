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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform Hermitian matrix-vector multiplication:.
* `y := alpha*A*x + beta * y`
* where A is an N-by-N Hermitian matrix.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128} beta - complex scalar
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride for y (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
* @returns {Complex128Array} `y`
*/
function zhemv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var alphaR;
	var alphaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var betaR;
	var betaI;
	var aijR;
	var aijI;
	var ajjR;
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
	var i;
	var j;

	if ( N === 0 ) {
		return y;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	// Quick return if alpha=0 and beta=1
	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return y;
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

	// First form y := beta * y
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = oY;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < N; i++ ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				temp1R = (betaR * yv[ iy ]) - (betaI * yv[ iy + 1 ]);
				temp1I = (betaR * yv[ iy + 1 ]) + (betaI * yv[ iy ]);
				yv[ iy ] = temp1R;
				yv[ iy + 1 ] = temp1I;
				iy += sy;
			}
		}
	}

	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	if ( uplo === 'upper' ) {
		// Upper triangle stored
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j++ ) {
			// temp1 = alpha * x[jx]
			temp1R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			temp1I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			temp2R = 0.0;
			temp2I = 0.0;
			ix = oX;
			iy = oY;
			ai = oA + (j * sa2); // column j starts here
			for ( i = 0; i < j; i++ ) {
				aijR = Av[ ai ];
				aijI = Av[ ai + 1 ];

				// y[iy] += temp1 * A[i,j]
				yv[ iy ] += (temp1R * aijR) - (temp1I * aijI);
				yv[ iy + 1 ] += (temp1R * aijI) + (temp1I * aijR);

				// temp2 += conj(A[i,j]) * x[ix]
				temp2R += (aijR * xv[ ix ]) + (aijI * xv[ ix + 1 ]);
				temp2I += (aijR * xv[ ix + 1 ]) - (aijI * xv[ ix ]);
				ix += sx;
				iy += sy;
				ai += sa1;
			}
			// Diagonal element: A(j,j) is real for Hermitian matrix
			ajjR = Av[ ai ]; // real part of A(j,j); imag is 0 for Hermitian

			// y[jy] += temp1 * real(A[j,j]) + alpha * temp2
			yv[ jy ] += (temp1R * ajjR) + ( (alphaR * temp2R) - (alphaI * temp2I) );
			yv[ jy + 1 ] += (temp1I * ajjR) + ( (alphaR * temp2I) + (alphaI * temp2R) );
			jx += sx;
			jy += sy;
		}
	} else {
		// Lower triangle stored
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j++ ) {
			// temp1 = alpha * x[jx]
			temp1R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			temp1I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			temp2R = 0.0;
			temp2I = 0.0;

			// Diagonal element: A(j,j) is real for Hermitian matrix
			ai = oA + (j * sa1) + (j * sa2);
			ajjR = Av[ ai ];
			yv[ jy ] += temp1R * ajjR;
			yv[ jy + 1 ] += temp1I * ajjR;
			ix = jx + sx;
			iy = jy + sy;
			ai += sa1; // move to A(j+1, j)
			for ( i = j + 1; i < N; i++ ) {
				aijR = Av[ ai ];
				aijI = Av[ ai + 1 ];

				// y[iy] += temp1 * A[i,j]
				yv[ iy ] += (temp1R * aijR) - (temp1I * aijI);
				yv[ iy + 1 ] += (temp1R * aijI) + (temp1I * aijR);

				// temp2 += conj(A[i,j]) * x[ix]
				temp2R += (aijR * xv[ ix ]) + (aijI * xv[ ix + 1 ]);
				temp2I += (aijR * xv[ ix + 1 ]) - (aijI * xv[ ix ]);
				ix += sx;
				iy += sy;
				ai += sa1;
			}
			// y[jy] += alpha * temp2
			yv[ jy ] += (alphaR * temp2R) - (alphaI * temp2I);
			yv[ jy + 1 ] += (alphaR * temp2I) + (alphaI * temp2R);
			jx += sx;
			jy += sy;
		}
	}
	return y;
}


// EXPORTS //

export default zhemv;
