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
* Scale a complex double-precision vector by a double-precision constant.
*
* @private
* @param {PositiveInteger} N - number of complex elements
* @param {number} alpha - real scalar multiplier
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @returns {Complex128Array} `zx`
*/
function zdscal( N, alpha, x, strideX, offsetX ) {
	let ix, i;

	if ( N <= 0 ) {
		return x;
	}

	const xv = reinterpret( x, 0 );
	ix = offsetX * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	const sx = strideX * 2;

	for ( i = 0; i < N; i++ ) {
		xv[ ix ] *= alpha;
		xv[ ix + 1 ] *= alpha;
		ix += sx;
	}
	return x;
}


// EXPORTS //

export default zdscal;
