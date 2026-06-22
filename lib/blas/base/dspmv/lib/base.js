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

// MAIN //

/**
* Performs the matrix-vector operation `y = alpha*A*x + beta*y`.
*
* `A` is an `N` by `N` symmetric matrix supplied in packed form, `x` and `y`
* are `N`-element vectors, and `alpha` and `beta` are scalars.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar multiplier for `A*x`
* @param {Float64Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar multiplier for `y`
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dspmv( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var temp1;
	var temp2;
	var kk;
	var ix;
	var iy;
	var jx;
	var jy;
	var kx;
	var ky;
	var k;
	var i;
	var j;

	// Quick return if possible:
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	// Set up the start points in x and y (caller provides correct offsets):
	kx = offsetX;
	ky = offsetY;

	// First form y := beta * y:
	if ( beta !== 1.0 ) {
		iy = ky;
		if ( beta === 0.0 ) {
			for ( i = 0; i < N; i += 1 ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < N; i += 1 ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	kk = offsetAP;
	if ( uplo === 'upper' ) {
		// Form y when AP contains the upper triangle:
		jx = kx;
		jy = ky;
		for ( j = 0; j < N; j += 1 ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			ix = kx;
			iy = ky;
			k = kk;
			for ( i = 0; i < j; i += 1 ) {
				y[ iy ] += temp1 * AP[ k ];
				temp2 += AP[ k ] * x[ ix ];
				ix += strideX;
				iy += strideY;
				k += strideAP;
			}
			y[ jy ] += ( temp1 * AP[ kk + ( j * strideAP ) ] ) + ( alpha * temp2 );
			jx += strideX;
			jy += strideY;
			kk += ( j + 1 ) * strideAP;
		}
	} else {
		// Form y when AP contains the lower triangle:
		jx = kx;
		jy = ky;
		for ( j = 0; j < N; j += 1 ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			y[ jy ] += temp1 * AP[ kk ];
			ix = jx;
			iy = jy;
			k = kk + strideAP;
			for ( i = j + 1; i < N; i += 1 ) {
				ix += strideX;
				iy += strideY;
				y[ iy ] += temp1 * AP[ k ];
				temp2 += AP[ k ] * x[ ix ];
				k += strideAP;
			}
			y[ jy ] += alpha * temp2;
			jx += strideX;
			jy += strideY;
			kk += ( N - j ) * strideAP;
		}
	}
	return y;
}


// EXPORTS //

export default dspmv;
