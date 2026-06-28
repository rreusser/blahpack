/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
* Perform one of the complex matrix-vector operations:.
* y := alpha_A_x + beta_y,   or   y := alpha_A**T_x + beta_y,   or
* y := alpha*A**H_x + beta_y
*
* @private
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
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
function zgemv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var noTrans;
	var noConj;
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var tempR;
	var tempI;
	var leny;
	var aijR;
	var aijI;
	var sa1;
	var sa2;
	var sx;
	var sy;
	var ix;
	var iy;
	var jx;
	var jy;
	var ai;
	var oA;
	var oX;
	var oY;
	var Av;
	var xv;
	var yv;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
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

	noTrans = ( trans === 'no-transpose' );
	noConj = ( trans === 'transpose' );

	if ( noTrans ) {
		leny = M;
	} else {
		leny = N;
	}

	// Get Float64Array views and convert offsets
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;
	yv = reinterpret( y, 0 );
	oY = offsetY * 2;

	// Matrix strides are in complex elements, so multiply by 2
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	// Vector strides in complex elements, multiply by 2
	sx = strideX * 2;
	sy = strideY * 2;

	// First form y := beta*y
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = oY;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < leny; i++ ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < leny; i++ ) {
				tempR = (betaR * yv[ iy ]) - (betaI * yv[ iy + 1 ]);
				tempI = (betaR * yv[ iy + 1 ]) + (betaI * yv[ iy ]);
				yv[ iy ] = tempR;
				yv[ iy + 1 ] = tempI;
				iy += sy;
			}
		}
	}

	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	if ( noTrans ) {
		// Form y := alpha*A*x + y
		jx = oX;
		for ( j = 0; j < N; j++ ) {
			// Temp = alpha * x[jx]
			tempR = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			tempI = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			iy = oY;
			ai = oA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				aijR = Av[ ai ];
				aijI = Av[ ai + 1 ];

				// y[iy] += temp * A[i,j]
				yv[ iy ] += (tempR * aijR) - (tempI * aijI);
				yv[ iy + 1 ] += (tempR * aijI) + (tempI * aijR);
				iy += sy;
				ai += sa1;
			}
			jx += sx;
		}
	} else {
		// Form y := alpha*A**T*x + y  or  y := alpha*A**H*x + y
		jy = oY;
		for ( j = 0; j < N; j++ ) {
			tempR = 0.0;
			tempI = 0.0;
			ix = oX;
			ai = oA + (j * sa2);
			if ( noConj ) {
				// Transpose (no conjugate)
				for ( i = 0; i < M; i++ ) {
					aijR = Av[ ai ];
					aijI = Av[ ai + 1 ];

					// Temp += A[i,j] * x[ix]
					tempR += (aijR * xv[ ix ]) - (aijI * xv[ ix + 1 ]);
					tempI += (aijR * xv[ ix + 1 ]) + (aijI * xv[ ix ]);
					ix += sx;
					ai += sa1;
				}
			} else {
				// Conjugate transpose
				for ( i = 0; i < M; i++ ) {
					aijR = Av[ ai ];
					aijI = -Av[ ai + 1 ]; // conjugate

					// Temp += conj(A[i,j]) * x[ix]
					tempR += (aijR * xv[ ix ]) - (aijI * xv[ ix + 1 ]);
					tempI += (aijR * xv[ ix + 1 ]) + (aijI * xv[ ix ]);
					ix += sx;
					ai += sa1;
				}
			}
			// y[jy] += alpha * temp
			yv[ jy ] += (alphaR * tempR) - (alphaI * tempI);
			yv[ jy + 1 ] += (alphaR * tempI) + (alphaI * tempR);
			jy += sy;
		}
	}
	return y;
}


// EXPORTS //

export default zgemv;
