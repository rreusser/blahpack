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
* Performs the Hermitian packed matrix-vector operation `y := alpha*A*x + beta*y`.
*
* `A` is an `N` by `N` Hermitian matrix supplied in packed form, `x` and `y`
* are `N`-element complex vectors, and `alpha` and `beta` are complex scalars.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar multiplier for `A*x`
* @param {Complex128Array} AP - packed Hermitian matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128} beta - complex scalar multiplier for `y`
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @returns {Complex128Array} `y`
*/
function zhpmv( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var alphaR;
	var alphaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var betaR;
	var betaI;
	var apkR;
	var apkI;
	var ajjR;
	var sap;
	var APv;
	var oAP;
	var xv;
	var yv;
	var oX;
	var oY;
	var sx;
	var sy;
	var ix;
	var iy;
	var jx;
	var jy;
	var kk;
	var yr;
	var yi;
	var k;
	var i;
	var j;

	// Quick return if possible:
	if ( N === 0 ) {
		return y;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return y;
	}

	// Reinterpret Complex128Arrays as Float64Arrays:
	APv = reinterpret( AP, 0 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	oAP = offsetAP * 2;
	oX = offsetX * 2;
	oY = offsetY * 2;
	sap = strideAP * 2;
	sx = strideX * 2;
	sy = strideY * 2;

	// First form y := beta * y:
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = oY;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < N; i += 1 ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < N; i += 1 ) {
				// y[i] = beta * y[i]
				yr = yv[ iy ];
				yi = yv[ iy + 1 ];
				yv[ iy ] = ( betaR * yr ) - ( betaI * yi );
				yv[ iy + 1 ] = ( betaR * yi ) + ( betaI * yr );
				iy += sy;
			}
		}
	}
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	kk = oAP;
	if ( uplo === 'upper' ) {
		// Form y when AP contains the upper triangle:
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j += 1 ) {
			// temp1 = alpha * x[j]
			temp1R = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
			temp1I = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
			temp2R = 0.0;
			temp2I = 0.0;
			ix = oX;
			iy = oY;
			k = kk;
			for ( i = 0; i < j; i += 1 ) {
				apkR = APv[ k ];
				apkI = APv[ k + 1 ];

				// y[i] += temp1 * AP[k]
				yv[ iy ] += ( temp1R * apkR ) - ( temp1I * apkI );
				yv[ iy + 1 ] += ( temp1R * apkI ) + ( temp1I * apkR );

				// temp2 += conj(AP[k]) * x[i]
				temp2R += ( apkR * xv[ ix ] ) + ( apkI * xv[ ix + 1 ] );
				temp2I += ( apkR * xv[ ix + 1 ] ) - ( apkI * xv[ ix ] );

				ix += sx;
				iy += sy;
				k += sap;
			}
			// Diagonal element: A(j,j) is real for Hermitian matrix
			ajjR = APv[ kk + ( j * sap ) ];

			// y[j] += temp1 * real(A[j,j]) + alpha * temp2
			yv[ jy ] += ( temp1R * ajjR ) + ( ( alphaR * temp2R ) - ( alphaI * temp2I ) );
			yv[ jy + 1 ] += ( temp1I * ajjR ) + ( ( alphaR * temp2I ) + ( alphaI * temp2R ) );

			jx += sx;
			jy += sy;
			kk += ( j + 1 ) * sap;
		}
	} else {
		// Form y when AP contains the lower triangle:
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j += 1 ) {
			// temp1 = alpha * x[j]
			temp1R = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
			temp1I = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
			temp2R = 0.0;
			temp2I = 0.0;

			// Diagonal element: A(j,j) is real for Hermitian matrix
			ajjR = APv[ kk ];
			yv[ jy ] += temp1R * ajjR;
			yv[ jy + 1 ] += temp1I * ajjR;

			ix = jx;
			iy = jy;
			k = kk + sap;
			for ( i = j + 1; i < N; i += 1 ) {
				ix += sx;
				iy += sy;
				apkR = APv[ k ];
				apkI = APv[ k + 1 ];

				// y[i] += temp1 * AP[k]
				yv[ iy ] += ( temp1R * apkR ) - ( temp1I * apkI );
				yv[ iy + 1 ] += ( temp1R * apkI ) + ( temp1I * apkR );

				// temp2 += conj(AP[k]) * x[i]
				temp2R += ( apkR * xv[ ix ] ) + ( apkI * xv[ ix + 1 ] );
				temp2I += ( apkR * xv[ ix + 1 ] ) - ( apkI * xv[ ix ] );

				k += sap;
			}
			// y[j] += alpha * temp2
			yv[ jy ] += ( alphaR * temp2R ) - ( alphaI * temp2I );
			yv[ jy + 1 ] += ( alphaR * temp2I ) + ( alphaI * temp2R );

			jx += sx;
			jy += sy;
			kk += ( N - j ) * sap;
		}
	}
	return y;
}


// EXPORTS //

export default zhpmv;
