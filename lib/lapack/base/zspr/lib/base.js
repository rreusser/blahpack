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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs the symmetric rank-1 update `A := alpha*x*x**T + A` where `A` is a complex symmetric matrix stored in packed format.
*
* Unlike the Hermitian variant (zhpr), zspr uses transpose (not conjugate-transpose), alpha is complex (not real), and diagonal elements remain fully complex.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @returns {Complex128Array} `AP`
*/
function zspr( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP ) {
	var alphaR;
	var alphaI;
	var tempR;
	var tempI;
	var xjR;
	var xjI;
	var xiR;
	var xiI;
	var APv;
	var sap;
	var oAP;
	var xv;
	var ox;
	var sx;
	var kk;
	var ix;
	var jx;
	var k;
	var i;
	var j;

	alphaR = real( alpha );
	alphaI = imag( alpha );

	// Quick return if possible:
	if ( N === 0 || ( alphaR === 0.0 && alphaI === 0.0 ) ) {
		return AP;
	}

	// Reinterpret Complex128Arrays as Float64Arrays:
	xv = reinterpret( x, 0 );
	APv = reinterpret( AP, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	sx = strideX * 2;
	sap = strideAP * 2;
	ox = offsetX * 2;
	oAP = offsetAP * 2;

	// Start point in x (offset already encodes the starting position):
	jx = ox;
	kk = oAP;

	if ( uplo === 'upper' ) {
		// Form A when upper triangle is stored in AP:
		for ( j = 0; j < N; j += 1 ) {
			xjR = xv[ jx ];
			xjI = xv[ jx + 1 ];
			if ( xjR !== 0.0 || xjI !== 0.0 ) {
				// Temp = alpha * x[j] (complex multiply, no conjugation):
				tempR = ( alphaR * xjR ) - ( alphaI * xjI );
				tempI = ( alphaR * xjI ) + ( alphaI * xjR );

				// Off-diagonal elements: AP[k] += x[i] * temp
				ix = ox;
				k = kk;
				for ( i = 0; i < j; i += 1 ) {
					xiR = xv[ ix ];
					xiI = xv[ ix + 1 ];

					// AP[k] += x[i] * temp (complex multiply):
					APv[ k ] += ( xiR * tempR ) - ( xiI * tempI );
					APv[ k + 1 ] += ( xiR * tempI ) + ( xiI * tempR );
					ix += sx;
					k += sap;
				}

				// Diagonal element: AP[kk+j] += x[j] * temp (fully complex):
				APv[ k ] += ( xjR * tempR ) - ( xjI * tempI );
				APv[ k + 1 ] += ( xjR * tempI ) + ( xjI * tempR );
			}
			jx += sx;
			kk += ( j + 1 ) * sap;
		}
	} else {
		// Form A when lower triangle is stored in AP:
		for ( j = 0; j < N; j += 1 ) {
			xjR = xv[ jx ];
			xjI = xv[ jx + 1 ];
			if ( xjR !== 0.0 || xjI !== 0.0 ) {
				// Temp = alpha * x[j] (complex multiply, no conjugation):
				tempR = ( alphaR * xjR ) - ( alphaI * xjI );
				tempI = ( alphaR * xjI ) + ( alphaI * xjR );

				// Diagonal element: AP[kk] += temp * x[j] (fully complex):
				APv[ kk ] += ( tempR * xjR ) - ( tempI * xjI );
				APv[ kk + 1 ] += ( tempR * xjI ) + ( tempI * xjR );

				// Off-diagonal elements below diagonal:
				ix = jx + sx;
				k = kk + sap;
				for ( i = j + 1; i < N; i += 1 ) {
					xiR = xv[ ix ];
					xiI = xv[ ix + 1 ];

					// AP[k] += x[i] * temp (complex multiply):
					APv[ k ] += ( xiR * tempR ) - ( xiI * tempI );
					APv[ k + 1 ] += ( xiR * tempI ) + ( xiI * tempR );
					ix += sx;
					k += sap;
				}
			}
			jx += sx;
			kk += ( N - j ) * sap;
		}
	}
	return AP;
}


// EXPORTS //

export default zspr;
