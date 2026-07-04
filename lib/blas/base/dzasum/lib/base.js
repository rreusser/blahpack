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
* Computes the sum of the absolute values of the real and imaginary components of a complex vector.
*
* `dzasum` takes the sum of `(|Re(.)| + |Im(.)|)` for each element and returns a double-precision result.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride in complex elements
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @returns {number} sum of absolute values
*/
function dzasum( N, zx, strideX, offsetX ) {
	var stemp;
	var xv;
	var ix;
	var i;

	stemp = 0.0;
	if ( N <= 0 || strideX <= 0 ) {
		return stemp;
	}
	xv = reinterpret( zx, 0 );
	ix = offsetX * 2;
	for ( i = 0; i < N; i++ ) {
		stemp += Math.abs( xv[ ix ] ) + Math.abs( xv[ ix + 1 ] );
		ix += strideX * 2;
	}
	return stemp;
}


// EXPORTS //

export default dzasum;
