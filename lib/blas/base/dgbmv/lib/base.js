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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MAIN //

/**
* Performs the matrix-vector operation `y := alpha*op(A)*x + beta*y`.
*
* `op(A) = A` or `op(A) = A^T`, alpha and beta are scalars, x and y are
* vectors, and A is an M-by-N band matrix with `kl` sub-diagonals and `ku`
* super-diagonals.
*
* Band storage: the matrix A is stored in a `(kl+ku+1)` by N array, with the
* diagonal at row `ku`. Element `A(i,j)` of the full matrix is at band position
* `A_band[ku+i-j, j]`.
*
* @private
* @param {string} trans - specifies the operation: `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of the matrix A
* @param {NonNegativeInteger} N - number of columns of the matrix A
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {number} alpha - scalar constant
* @param {Float64Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dgbmv( trans, M, N, kl, ku, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var leny;
	var temp;
	var sa1;
	var sa2;
	var iy;
	var jx;
	var jy;
	var kx;
	var ky;
	var ia;
	var i;
	var j;
	var k;

	// Quick return if possible:
	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	// Set LENY, the length of the vector y:
	if ( trans === 'no-transpose' ) {
		leny = M;
	} else {
		leny = N;
	}

	kx = offsetX;
	ky = offsetY;

	// First form y := beta * y:
	if ( beta !== 1.0 ) {
		iy = ky;
		if ( beta === 0.0 ) {
			for ( i = 0; i < leny; i += 1 ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < leny; i += 1 ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	if ( trans === 'no-transpose' ) {
		// Form y := alpha*A*x + y:
		jx = kx;
		for ( j = 0; j < N; j += 1 ) {
			if ( x[ jx ] !== 0.0 ) {
				temp = alpha * x[ jx ];
				k = ku - j;
				for ( i = Math.max( 0, j - ku ); i < Math.min( M, j + kl + 1 ); i += 1 ) {
					ia = offsetA + ( ( k + i ) * sa1 ) + ( j * sa2 );
					y[ offsetY + ( i * strideY ) ] += temp * A[ ia ];
				}
			}
			jx += strideX;
			if ( j >= ku ) {
				ky += strideY;
			}
		}
	} else {
		// Form y := alpha*A**T*x + y:
		jy = ky;
		for ( j = 0; j < N; j += 1 ) {
			temp = 0.0;
			k = ku - j;
			for ( i = Math.max( 0, j - ku ); i < Math.min( M, j + kl + 1 ); i += 1 ) {
				ia = offsetA + ( ( k + i ) * sa1 ) + ( j * sa2 );
				temp += A[ ia ] * x[ offsetX + ( i * strideX ) ];
			}
			y[ jy ] += alpha * temp;
			jy += strideY;
			if ( j >= ku ) {
				kx += strideX;
			}
		}
	}
	return y;
}


// EXPORTS //

export default dgbmv;
