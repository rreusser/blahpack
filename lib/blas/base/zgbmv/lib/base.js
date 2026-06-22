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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs one of the matrix-vector operations `y := alpha*op(A)*x + beta*y`.
*
* `op(A) = A`, `op(A) = A^T`, or `op(A) = A^H`, where alpha and beta are
* complex scalars, x and y are complex vectors, and A is an M-by-N band
* matrix with `kl` sub-diagonals and `ku` super-diagonals.
*
* Band storage: the matrix A is stored in a `(kl+ku+1)` by N array, with the
* diagonal at row `ku`. Element `A(i,j)` of the full matrix is at band position
* `A_band[ku+i-j, j]`.
*
* @private
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of the matrix A
* @param {NonNegativeInteger} N - number of columns of the matrix A
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128} beta - complex scalar constant
* @param {Complex128Array} y - input/output vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @returns {Complex128Array} `y`
*/
function zgbmv( trans, M, N, kl, ku, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var noConj;
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var tempR;
	var tempI;
	var leny;
	var aijR;
	var aijI;
	var sa1;
	var sa2;
	var sx;
	var sy;
	var oA;
	var oX;
	var oY;
	var Av;
	var xv;
	var yv;
	var iy;
	var jx;
	var jy;
	var ky;
	var kx;
	var ia;
	var tr;
	var ti;
	var i;
	var j;
	var k;

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	// Quick return if possible:
	if ( M === 0 || N === 0 || ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) ) {
		return y;
	}

	noConj = ( trans === 'transpose' );

	// Set leny, the length of the vector y:
	if ( trans === 'no-transpose' ) {
		leny = M;
	} else {
		leny = N;
	}

	// Get Float64Array views and convert offsets/strides from complex to double:
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;
	yv = reinterpret( y, 0 );
	oY = offsetY * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	sy = strideY * 2;

	kx = oX;
	ky = oY;

	// First form y := beta * y:
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = ky;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < leny; i += 1 ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < leny; i += 1 ) {
				// y[i] = beta * y[i]
				tr = ( betaR * yv[ iy ] ) - ( betaI * yv[ iy + 1 ] );
				ti = ( betaR * yv[ iy + 1 ] ) + ( betaI * yv[ iy ] );
				yv[ iy ] = tr;
				yv[ iy + 1 ] = ti;
				iy += sy;
			}
		}
	}
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	if ( trans === 'no-transpose' ) {
		// Form y := alpha*A*x + y:
		jx = kx;
		for ( j = 0; j < N; j += 1 ) {
			// Temp = alpha * x[jx]
			tempR = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
			tempI = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
			k = ku - j;
			iy = ky;
			for ( i = Math.max( 0, j - ku ); i < Math.min( M, j + kl + 1 ); i += 1 ) {
				ia = oA + ( ( k + i ) * sa1 ) + ( j * sa2 );
				aijR = Av[ ia ];
				aijI = Av[ ia + 1 ];

				// Y[iy] += temp * A[k+i, j]
				yv[ iy ] += ( tempR * aijR ) - ( tempI * aijI );
				yv[ iy + 1 ] += ( tempR * aijI ) + ( tempI * aijR );
				iy += sy;
			}
			jx += sx;
			if ( j >= ku ) {
				ky += sy;
			}
		}
	} else {
		// Form y := alpha*A**T*x + y  or  y := alpha*A**H*x + y:
		jy = ky;
		for ( j = 0; j < N; j += 1 ) {
			tempR = 0.0;
			tempI = 0.0;
			k = ku - j;
			kx = oX + ( Math.max( 0, j - ku ) * sx );
			if ( noConj ) {
				// Transpose (no conjugate):
				for ( i = Math.max( 0, j - ku ); i < Math.min( M, j + kl + 1 ); i += 1 ) {
					ia = oA + ( ( k + i ) * sa1 ) + ( j * sa2 );
					aijR = Av[ ia ];
					aijI = Av[ ia + 1 ];

					// Temp += A[k+i, j] * x[kx]
					tempR += ( aijR * xv[ kx ] ) - ( aijI * xv[ kx + 1 ] );
					tempI += ( aijR * xv[ kx + 1 ] ) + ( aijI * xv[ kx ] );
					kx += sx;
				}
			} else {
				// Conjugate transpose:
				for ( i = Math.max( 0, j - ku ); i < Math.min( M, j + kl + 1 ); i += 1 ) {
					ia = oA + ( ( k + i ) * sa1 ) + ( j * sa2 );
					aijR = Av[ ia ];
					aijI = -Av[ ia + 1 ]; // conjugate

					// Temp += conj(A[k+i, j]) * x[kx]
					tempR += ( aijR * xv[ kx ] ) - ( aijI * xv[ kx + 1 ] );
					tempI += ( aijR * xv[ kx + 1 ] ) + ( aijI * xv[ kx ] );
					kx += sx;
				}
			}
			// y[jy] += alpha * temp
			yv[ jy ] += ( alphaR * tempR ) - ( alphaI * tempI );
			yv[ jy + 1 ] += ( alphaR * tempI ) + ( alphaI * tempR );
			jy += sy;
		}
	}
	return y;
}


// EXPORTS //

export default zgbmv;
