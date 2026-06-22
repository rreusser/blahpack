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
* Performs the matrix-vector operation:.
* `y := alpha*A*x + beta * y`
* where A is an N-by-N symmetric matrix, x and y are N-element vectors,
* and alpha and beta are scalars.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of A is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - scalar multiplier for A*x
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar multiplier for y
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dsymv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var temp1;
	var temp2;
	var sa1;
	var sa2;
	var ia;
	var ix;
	var iy;
	var jx;
	var jy;
	var i;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;

	// Quick return if possible:
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	// First form y := beta * y:
	if ( beta !== 1.0 ) {
		iy = offsetY;
		if ( beta === 0.0 ) {
			for ( i = 0; i < N; i++ ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	if ( uplo === 'upper' ) {
		// Form y when A is stored in upper triangle:
		jx = offsetX;
		jy = offsetY;
		for ( j = 0; j < N; j++ ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			ix = offsetX;
			iy = offsetY;
			ia = offsetA + (j * sa2);
			for ( i = 0; i < j; i++ ) {
				y[ iy ] += temp1 * A[ ia + (i * sa1) ];
				temp2 += A[ ia + (i * sa1) ] * x[ ix ];
				ix += strideX;
				iy += strideY;
			}
			y[ jy ] += (temp1 * A[ ia + (j * sa1) ]) + (alpha * temp2);
			jx += strideX;
			jy += strideY;
		}
	} else {
		// Form y when A is stored in lower triangle:
		jx = offsetX;
		jy = offsetY;
		for ( j = 0; j < N; j++ ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			ia = offsetA + (j * sa2);
			y[ jy ] += temp1 * A[ ia + (j * sa1) ];
			ix = jx;
			iy = jy;
			for ( i = j + 1; i < N; i++ ) {
				ix += strideX;
				iy += strideY;
				y[ iy ] += temp1 * A[ ia + (i * sa1) ];
				temp2 += A[ ia + (i * sa1) ] * x[ ix ];
			}
			y[ jy ] += alpha * temp2;
			jx += strideX;
			jy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default dsymv;
