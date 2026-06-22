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
* Performs the symmetric rank-2 operation:.
* A := alpha_x_y**T + alpha_y_x**T + A,
* where alpha is a real scalar, x and y are N element vectors, and A is an
* N by N symmetric matrix.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is used (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - scalar multiplier
* @param {Float64Array} x - first input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} y - second input vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @returns {Float64Array} `A`
*/
function dsyr2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var temp1;
	var temp2;
	var sa1;
	var sa2;
	var ix;
	var iy;
	var jx;
	var jy;
	var i;
	var j;

	if ( N === 0 || alpha === 0.0 ) {
		return A;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	if ( uplo === 'upper' ) {
		// Form A when A is stored in the upper triangle
		jx = offsetX;
		jy = offsetY;
		for ( j = 0; j < N; j++ ) {
			if ( x[ jx ] !== 0.0 || y[ jy ] !== 0.0 ) {
				temp1 = alpha * y[ jy ];
				temp2 = alpha * x[ jx ];
				ix = offsetX;
				iy = offsetY;
				for ( i = 0; i <= j; i++ ) {
					A[ offsetA + (i * sa1) + (j * sa2) ] += (x[ ix ] * temp1) + (y[ iy ] * temp2);
					ix += strideX;
					iy += strideY;
				}
			}
			jx += strideX;
			jy += strideY;
		}
	} else {
		// Form A when A is stored in the lower triangle
		jx = offsetX;
		jy = offsetY;
		for ( j = 0; j < N; j++ ) {
			if ( x[ jx ] !== 0.0 || y[ jy ] !== 0.0 ) {
				temp1 = alpha * y[ jy ];
				temp2 = alpha * x[ jx ];
				ix = jx;
				iy = jy;
				for ( i = j; i < N; i++ ) {
					A[ offsetA + (i * sa1) + (j * sa2) ] += (x[ ix ] * temp1) + (y[ iy ] * temp2);
					ix += strideX;
					iy += strideY;
				}
			}
			jx += strideX;
			jy += strideY;
		}
	}
	return A;
}


// EXPORTS //

export default dsyr2;
