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
* Performs the symmetric rank-2 operation `A := alpha*x*y^T + alpha*y*x^T + A`.
*
* `alpha` is a scalar, `x` and `y` are `N` element vectors, and `A` is an
* `N` by `N` symmetric matrix supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} x - first input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} AP - packed symmetric matrix
* @param {integer} strideAP - `AP` stride length
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {Float64Array} `AP`
*/
function dspr2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, AP, strideAP, offsetAP ) {
	var temp1;
	var temp2;
	var kk;
	var ix;
	var iy;
	var jx;
	var jy;
	var i;
	var j;
	var k;

	if ( N === 0 || alpha === 0.0 ) {
		return AP;
	}

	jx = offsetX;
	jy = offsetY;
	kk = offsetAP;

	if ( uplo === 'upper' ) {
		// Form A when upper triangle is stored in AP
		for ( j = 0; j < N; j += 1 ) {
			if ( x[ jx ] !== 0.0 || y[ jy ] !== 0.0 ) {
				temp1 = alpha * y[ jy ];
				temp2 = alpha * x[ jx ];
				ix = offsetX;
				iy = offsetY;
				k = kk;
				for ( i = 0; i <= j; i += 1 ) {
					AP[ k ] += ( x[ ix ] * temp1 ) + ( y[ iy ] * temp2 );
					k += strideAP;
					ix += strideX;
					iy += strideY;
				}
			}
			jx += strideX;
			jy += strideY;
			kk += ( j + 1 ) * strideAP;
		}
	} else {
		// Form A when lower triangle is stored in AP
		for ( j = 0; j < N; j += 1 ) {
			if ( x[ jx ] !== 0.0 || y[ jy ] !== 0.0 ) {
				temp1 = alpha * y[ jy ];
				temp2 = alpha * x[ jx ];
				ix = jx;
				iy = jy;
				k = kk;
				for ( i = j; i < N; i += 1 ) {
					AP[ k ] += ( x[ ix ] * temp1 ) + ( y[ iy ] * temp2 );
					k += strideAP;
					ix += strideX;
					iy += strideY;
				}
			}
			jx += strideX;
			jy += strideY;
			kk += ( N - j ) * strideAP;
		}
	}
	return AP;
}


// EXPORTS //

export default dspr2;
