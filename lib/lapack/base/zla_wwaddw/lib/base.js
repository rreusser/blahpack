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

/* eslint-disable camelcase, max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Adds a complex vector W into a doubled-single accumulation vector (X, Y).
*
* The doubled-single representation stores the high-order part in X and
* the low-order part in Y such that `X[i] + Y[i]` approximates the true
* accumulated value with extra precision.
*
* For each element i, the operation is:
*
* ```text
* S = X[i] + W[i]
* S = (S + S) - S     (rounding step to extract the high-order part)
* Y[i] = ((X[i] - S) + W[i]) + Y[i]
* X[i] = S
* ```
*
* where all operations are performed on complex numbers.
*
* @private
* @param {NonNegativeInteger} N - length of vectors X, Y, and W
* @param {Complex128Array} x - first part of the doubled-single accumulation vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second part of the doubled-single accumulation vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} w - vector to be added
* @param {integer} strideW - stride length for `w` (in complex elements)
* @param {NonNegativeInteger} offsetW - starting index for `w` (in complex elements)
* @returns {void}
*/
function zla_wwaddw( N, x, strideX, offsetX, y, strideY, offsetY, w, strideW, offsetW ) {
	var xv;
	var yv;
	var wv;
	var sr;
	var si;
	var sx;
	var sy;
	var sw;
	var ix;
	var iy;
	var iw;
	var i;

	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );
	wv = reinterpret( w, 0 );

	sx = strideX * 2;
	sy = strideY * 2;
	sw = strideW * 2;
	ix = offsetX * 2;
	iy = offsetY * 2;
	iw = offsetW * 2;

	for ( i = 0; i < N; i += 1 ) {
		// S = X(I) + W(I) (complex addition: re + re, im + im)
		sr = xv[ ix ] + wv[ iw ];
		si = xv[ ix + 1 ] + wv[ iw + 1 ];

		// S = (S + S) - S (rounding step to extract the high-order part)
		sr = ( sr + sr ) - sr;
		si = ( si + si ) - si;

		// Y(I) = ((X(I) - S) + W(I)) + Y(I)
		yv[ iy ] = ( ( xv[ ix ] - sr ) + wv[ iw ] ) + yv[ iy ];
		yv[ iy + 1 ] = ( ( xv[ ix + 1 ] - si ) + wv[ iw + 1 ] ) + yv[ iy + 1 ];

		// X(I) = S
		xv[ ix ] = sr;
		xv[ ix + 1 ] = si;

		ix += sx;
		iy += sy;
		iw += sw;
	}
}


// EXPORTS //

export default zla_wwaddw;
