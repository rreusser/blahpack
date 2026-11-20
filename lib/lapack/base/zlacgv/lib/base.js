/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Conjugate a complex vector in-place.
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @returns {Complex128Array} `x`
*/
function zlacgv( N, x, strideX, offsetX ) {
	let ix, i;

	if ( N <= 0 ) {
		return x;
	}

	const xv = reinterpret( x, 0 );
	ix = offsetX * 2;

	const sx = strideX * 2;
	for ( i = 0; i < N; i++ ) {
		xv[ ix + 1 ] = -xv[ ix + 1 ];
		ix += sx;
	}
	return x;
}


// EXPORTS //

export default zlacgv;
