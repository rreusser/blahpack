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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform the rank 1 operation A := alpha_x_y**H + A.
* where alpha is a complex scalar, x is an M element complex vector,
* y is an N element complex vector, and A is an M by N complex matrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} x - first complex input vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second complex input vector
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} A - complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @returns {Complex128Array} `A`
*/
function zgerc( M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var alphaRe;
	var alphaIm;
	var sa1;
	var sa2;
	var sx;
	var sy;
	var ix;
	var jy;
	var ia;
	var oA;
	var oX;
	var oY;
	var Av;
	var xv;
	var yv;
	var tr;
	var ti;
	var yr;
	var yi;
	var i;
	var j;

	if ( M <= 0 || N <= 0 ) {
		return A;
	}

	alphaRe = real( alpha );
	alphaIm = imag( alpha );

	// Quick return if alpha is zero
	if ( alphaRe === 0.0 && alphaIm === 0.0 ) {
		return A;
	}

	// Get Float64Array views and convert offsets
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;
	yv = reinterpret( y, 0 );
	oY = offsetY * 2;

	// Convert strides from complex-element units to double units
	sx = strideX * 2;
	sy = strideY * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	jy = oY;

	for ( j = 0; j < N; j++ ) {
		yr = yv[ jy ];
		yi = yv[ jy + 1 ];

		// Check if y(j) is zero
		if ( yr !== 0.0 || yi !== 0.0 ) {
			// Temp = alpha * conj(y(j))
			// conj(y) = yr - yi*i
			// alpha * conj(y) = (alphaRe + alphaIm*i)(yr - yi*i)
			//                 = (alphaRe*yr + alphaIm*yi) + (alphaIm*yr - alphaRe*yi)*i
			tr = (alphaRe * yr) + (alphaIm * yi);
			ti = (alphaIm * yr) - (alphaRe * yi);

			ix = oX;
			ia = oA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				// A(i,j) = A(i,j) + x(i) * temp
				// (xr + xi*i)(tr + ti*i) = (xr*tr - xi*ti) + (xr*ti + xi*tr)*i
				Av[ ia ] += (xv[ ix ] * tr) - (xv[ ix + 1 ] * ti);
				Av[ ia + 1 ] += (xv[ ix ] * ti) + (xv[ ix + 1 ] * tr);
				ix += sx;
				ia += sa1;
			}
		}
		jy += sy;
	}
	return A;
}


// EXPORTS //

export default zgerc;
