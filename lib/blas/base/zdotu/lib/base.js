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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';


// MAIN //

/**
* Computes the unconjugated dot product of two complex vectors.
* `ZDOTU = X^T * Y = sum_i x_i * y_i`
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - first complex input vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second complex input vector
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @returns {Complex128} unconjugated dot product
*/
function zdotu( N, x, strideX, offsetX, y, strideY, offsetY ) {
	var tempR;
	var tempI;
	var xv;
	var yv;
	var xr;
	var xi;
	var yr;
	var yi;
	var sx;
	var sy;
	var ix;
	var iy;
	var i;

	tempR = 0.0;
	tempI = 0.0;

	if ( N <= 0 ) {
		return new Complex128( 0.0, 0.0 );
	}

	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );

	ix = offsetX * 2;
	iy = offsetY * 2;
	sx = strideX * 2;
	sy = strideY * 2;

	for ( i = 0; i < N; i++ ) {
		xr = xv[ ix ];
		xi = xv[ ix + 1 ];
		yr = yv[ iy ];
		yi = yv[ iy + 1 ];

		// x * y = (xr + xi*i) * (yr + yi*i)

		//       = (xr*yr - xi*yi) + (xr*yi + xi*yr)*i
		tempR += (xr * yr) - (xi * yi);
		tempI += (xr * yi) + (xi * yr);
		ix += sx;
		iy += sy;
	}

	return new Complex128( tempR, tempI );
}


// EXPORTS //

export default zdotu;
