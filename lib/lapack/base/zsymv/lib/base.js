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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Performs the matrix-vector operation:.
*
*   y := alpha _ A _ x + beta * y
*
* where alpha and beta are complex scalars, x and y are complex vectors of
* length N, and A is an N-by-N complex SYMMETRIC matrix.
*
* NOTE: This is SYMMETRIC (not Hermitian). A(i,j) = A(j,i), with NO
* conjugation. For Hermitian, use zhemv.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128} alpha - scalar alpha
* @param {Complex128Array} A - N x N symmetric matrix
* @param {integer} strideA1 - first stride of A (complex elements)
* @param {integer} strideA2 - second stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - offset into A (complex elements)
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride of x (complex elements)
* @param {NonNegativeInteger} offsetX - offset into x (complex elements)
* @param {Complex128} beta - scalar beta
* @param {Complex128Array} y - input/output vector
* @param {integer} strideY - stride of y (complex elements)
* @param {NonNegativeInteger} offsetY - offset into y (complex elements)
* @returns {Complex128Array} y
*/
function zsymv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var Av;
	var xv;
	var yv;
	var sa1;
	var sa2;
	var sx;
	var sy;
	var oA;
	var ox;
	var oy;
	var pa;
	var iy;
	var ix;
	var jx;
	var jy;
	var aR;
	var aI;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	sy = strideY * 2;
	oA = offsetA * 2;
	ox = offsetX * 2;
	oy = offsetY * 2;

	alphaR = alpha.re;
	alphaI = alpha.im;
	betaR = beta.re;
	betaI = beta.im;

	if ( N === 0 || ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) ) {
		return y;
	}

	// Scale y by beta
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < N; i++ ) {
				iy = oy + (i * sy);
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				iy = oy + (i * sy);
				aR = yv[ iy ];
				aI = yv[ iy + 1 ];
				yv[ iy ] = (betaR * aR) - (betaI * aI);
				yv[ iy + 1 ] = (betaR * aI) + (betaI * aR);
			}
		}
	}

	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			jx = ox + (j * sx);
			jy = oy + (j * sy);
			temp1R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			temp1I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			temp2R = 0.0;
			temp2I = 0.0;

			for ( i = 0; i < j; i++ ) {
				pa = oA + (i * sa1) + (j * sa2);
				iy = oy + (i * sy);
				ix = ox + (i * sx);
				aR = Av[ pa ];
				aI = Av[ pa + 1 ];
				yv[ iy ] += (temp1R * aR) - (temp1I * aI);
				yv[ iy + 1 ] += (temp1R * aI) + (temp1I * aR);

				// Symmetric: no conjugation
				temp2R += (aR * xv[ ix ]) - (aI * xv[ ix + 1 ]);
				temp2I += (aR * xv[ ix + 1 ]) + (aI * xv[ ix ]);
			}

			pa = oA + (j * sa1) + (j * sa2);
			aR = Av[ pa ];
			aI = Av[ pa + 1 ];
			yv[ jy ] += (temp1R * aR) - (temp1I * aI);
			yv[ jy + 1 ] += (temp1R * aI) + (temp1I * aR);
			yv[ jy ] += (alphaR * temp2R) - (alphaI * temp2I);
			yv[ jy + 1 ] += (alphaR * temp2I) + (alphaI * temp2R);
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			jx = ox + (j * sx);
			jy = oy + (j * sy);
			temp1R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			temp1I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			temp2R = 0.0;
			temp2I = 0.0;

			pa = oA + (j * sa1) + (j * sa2);
			aR = Av[ pa ];
			aI = Av[ pa + 1 ];
			yv[ jy ] += (temp1R * aR) - (temp1I * aI);
			yv[ jy + 1 ] += (temp1R * aI) + (temp1I * aR);

			for ( i = j + 1; i < N; i++ ) {
				pa = oA + (i * sa1) + (j * sa2);
				iy = oy + (i * sy);
				ix = ox + (i * sx);
				aR = Av[ pa ];
				aI = Av[ pa + 1 ];
				yv[ iy ] += (temp1R * aR) - (temp1I * aI);
				yv[ iy + 1 ] += (temp1R * aI) + (temp1I * aR);
				temp2R += (aR * xv[ ix ]) - (aI * xv[ ix + 1 ]);
				temp2I += (aR * xv[ ix + 1 ]) + (aI * xv[ ix ]);
			}

			yv[ jy ] += (alphaR * temp2R) - (alphaI * temp2I);
			yv[ jy + 1 ] += (alphaR * temp2I) + (alphaI * temp2R);
		}
	}

	return y;
}


// EXPORTS //

export default zsymv;
