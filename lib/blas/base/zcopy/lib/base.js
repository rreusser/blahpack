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
* Copy a complex double-precision vector.
*
* @private
* @param {PositiveInteger} N - number of complex elements
* @param {Complex128Array} zx - source complex vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @param {Complex128Array} zy - destination complex vector
* @param {integer} strideY - stride for `zy` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `zy` (in complex elements)
* @returns {Complex128Array} `zy`
*/
function zcopy( N, zx, strideX, offsetX, zy, strideY, offsetY ) {
	let ix, iy, i;

	if ( N <= 0 ) {
		return zy;
	}

	const xv = reinterpret( zx, 0 );
	const yv = reinterpret( zy, 0 );
	ix = offsetX * 2;
	iy = offsetY * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	const sx = strideX * 2;
	const sy = strideY * 2;

	for ( i = 0; i < N; i++ ) {
		yv[ iy ] = xv[ ix ];
		yv[ iy + 1 ] = xv[ ix + 1 ];
		ix += sx;
		iy += sy;
	}
	return zy;
}


// EXPORTS //

export default zcopy;
