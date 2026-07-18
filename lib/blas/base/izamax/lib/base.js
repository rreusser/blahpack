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
* Finds the index of the element having the maximum sum of absolute values of.
* real and imaginary parts in a double-precision complex vector.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride in complex elements
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function izamax( N, zx, strideX, offsetX ) {
	let dmax, imax, val, ix, i;

	if ( N < 1 || strideX <= 0 ) {
		return -1;
	}
	if ( N === 1 ) {
		return 0;
	}

	const xv = reinterpret( zx, 0 );
	ix = offsetX * 2;

	// Step size in Float64 indices for each complex element
	const step = 2 * strideX;
	dmax = Math.abs( xv[ ix ] ) + Math.abs( xv[ ix + 1 ] );
	imax = 0;
	ix += step;

	for ( i = 1; i < N; i++ ) {
		val = Math.abs( xv[ ix ] ) + Math.abs( xv[ ix + 1 ] );
		if ( val > dmax ) {
			imax = i;
			dmax = val;
		}
		ix += step;
	}
	return imax;
}


// EXPORTS //

export default izamax;
