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
* Scales a complex double-precision vector by a complex constant and adds.
* the result to another complex double-precision vector: y := alpha*x + y.
*
* @private
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128} za - complex scalar
* @param {Complex128Array} zx - input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - input/output vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @returns {Complex128Array} `zy`
*/
function zaxpy( N, za, zx, strideX, offsetX, zy, strideY, offsetY ) {
	var zaR;
	var zaI;
	var xv;
	var yv;
	var sx;
	var sy;
	var ix;
	var iy;
	var xr;
	var xi;
	var i;

	if ( N <= 0 ) {
		return zy;
	}

	zaR = real( za );
	zaI = imag( za );

	// Quick return if alpha is zero (DCABS1(ZA) == 0)
	if ( zaR === 0.0 && zaI === 0.0 ) {
		return zy;
	}

	xv = reinterpret( zx, 0 );
	yv = reinterpret( zy, 0 );

	// Convert complex strides/offsets to Float64 strides/offsets
	sx = strideX * 2;
	sy = strideY * 2;
	ix = offsetX * 2;
	iy = offsetY * 2;

	for ( i = 0; i < N; i++ ) {
		xr = xv[ ix ];
		xi = xv[ ix + 1 ];

		// y[iy] += za * x[ix]

		// (zaR + zaI*i) * (xr + xi*i) = (zaR*xr - zaI*xi) + (zaR*xi + zaI*xr)*i
		yv[ iy ] += (zaR * xr) - (zaI * xi);
		yv[ iy + 1 ] += (zaR * xi) + (zaI * xr);

		ix += sx;
		iy += sy;
	}
	return zy;
}


// EXPORTS //

export default zaxpy;
