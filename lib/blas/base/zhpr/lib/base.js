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


// MAIN //

/**
* Performs the Hermitian packed rank-1 update `A := alpha*x*x**H + A`.
*
* `alpha` is a real scalar, `x` is an `N`-element complex vector, and `A` is
* an `N` by `N` Hermitian matrix supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - real scalar constant
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} AP - packed Hermitian matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @returns {Complex128Array} `AP`
*/
function zhpr( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP ) {
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

	// Quick return if possible:
	if ( N === 0 || alpha === 0.0 ) {
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

	jx = ox;
	kk = oAP;

	if ( uplo === 'upper' ) {
		// Form A when upper triangle is stored in AP:
		for ( j = 0; j < N; j += 1 ) {
			xjR = xv[ jx ];
			xjI = xv[ jx + 1 ];
			if ( xjR !== 0.0 || xjI !== 0.0 ) {
				// Temp = alpha * conj(x[j]):
				tempR = alpha * xjR;
				tempI = -( alpha * xjI );

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

				// Diagonal: A(j,j) = real(A(j,j)) + real(x[j] * temp)
				APv[ k ] += ( xjR * tempR ) - ( xjI * tempI );
				APv[ k + 1 ] = 0.0;
			} else {
				// Force diagonal to real when x[j] == 0:
				k = kk + ( j * sap );
				APv[ k + 1 ] = 0.0;
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
				// Temp = alpha * conj(x[j]):
				tempR = alpha * xjR;
				tempI = -( alpha * xjI );

				// Diagonal: A(j,j) = real(A(j,j)) + real(temp * x[j])
				APv[ kk ] += ( xjR * tempR ) - ( xjI * tempI );
				APv[ kk + 1 ] = 0.0;

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
			} else {
				// Force diagonal to real when x[j] == 0:
				APv[ kk + 1 ] = 0.0;
			}
			jx += sx;
			kk += ( N - j ) * sap;
		}
	}
	return AP;
}


// EXPORTS //

export default zhpr;
