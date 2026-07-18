/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
	let tempR, tempI, xr, xi, yr, yi, ix, iy, i;

	tempR = 0.0;
	tempI = 0.0;

	if ( N <= 0 ) {
		return new Complex128( 0.0, 0.0 );
	}

	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );

	ix = offsetX * 2;
	iy = offsetY * 2;
	const sx = strideX * 2;
	const sy = strideY * 2;

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
