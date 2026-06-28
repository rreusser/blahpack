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

/* eslint-disable max-len, max-params */

// MAIN //

/**
* Performs one of the matrix-vector operations:.
* y := alpha_A_x + beta_y,   or   y := alpha_A^T_x + beta_y
*
* @private
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {number} alpha - scalar multiplier for A*x
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {number} beta - scalar multiplier for y
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @returns {Float64Array} `y`
*/
function dgemv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var noTrans;
	var temp;
	var leny;
	var sa1;
	var sa2;
	var ia;
	var ix;
	var iy;
	var jx;
	var jy;
	var i;
	var j;

	noTrans = ( trans === 'no-transpose' );

	// Quick return if possible
	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	if ( noTrans ) {
		leny = M;
	} else {
		leny = N;
	}

	// First form y := beta*y
	if ( beta !== 1.0 ) {
		iy = offsetY;
		if ( beta === 0.0 ) {
			for ( i = 0; i < leny; i++ ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < leny; i++ ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	if ( noTrans ) {
		// Form y := alpha*A*x + y
		jx = offsetX;
		for ( j = 0; j < N; j++ ) {
			temp = alpha * x[ jx ];
			iy = offsetY;
			ia = offsetA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				y[ iy ] += temp * A[ ia ];
				iy += strideY;
				ia += sa1;
			}
			jx += strideX;
		}
	} else {
		// Form y := alpha*A^T*x + y
		jy = offsetY;
		for ( j = 0; j < N; j++ ) {
			temp = 0.0;
			ix = offsetX;
			ia = offsetA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				temp += A[ ia ] * x[ ix ];
				ix += strideX;
				ia += sa1;
			}
			y[ jy ] += alpha * temp;
			jy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default dgemv;
