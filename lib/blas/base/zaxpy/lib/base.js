/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} y - input/output vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @returns {Complex128Array} `zy`
*/
function zaxpy( N, alpha, x, strideX, offsetX, y, strideY, offsetY ) {
	let ix, iy, xr, xi, i;

	if ( N <= 0 ) {
		return y;
	}

	const zaR = real( alpha );
	const zaI = imag( alpha );

	// Quick return if alpha is zero (DCABS1(ZA) == 0)
	if ( zaR === 0.0 && zaI === 0.0 ) {
		return y;
	}

	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );

	// Convert complex strides/offsets to Float64 strides/offsets
	const sx = strideX * 2;
	const sy = strideY * 2;
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
	return y;
}


// EXPORTS //

export default zaxpy;
