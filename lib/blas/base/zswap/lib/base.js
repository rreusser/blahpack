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


// MAIN //

/**
* Interchange two complex double-precision vectors.
*
* @private
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128Array} zx - first complex input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - second complex input vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @returns {Complex128Array} `zx`
*/
function zswap( N, zx, strideX, offsetX, zy, strideY, offsetY ) {
	var tmp0;
	var tmp1;
	var xv;
	var yv;
	var sx;
	var sy;
	var ix;
	var iy;
	var i;

	if ( N <= 0 ) {
		return zx;
	}

	xv = reinterpret( zx, 0 );
	yv = reinterpret( zy, 0 );
	ix = offsetX * 2;
	iy = offsetY * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	sx = strideX * 2;
	sy = strideY * 2;

	for ( i = 0; i < N; i++ ) {
		tmp0 = xv[ ix ];
		tmp1 = xv[ ix + 1 ];
		xv[ ix ] = yv[ iy ];
		xv[ ix + 1 ] = yv[ iy + 1 ];
		yv[ iy ] = tmp0;
		yv[ iy + 1 ] = tmp1;
		ix += sx;
		iy += sy;
	}
	return zx;
}


// EXPORTS //

export default zswap;
