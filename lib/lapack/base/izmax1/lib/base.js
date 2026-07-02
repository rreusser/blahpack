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
import cabs from '@stdlib/math/base/special/cabs/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';


// MAIN //

/**
* Finds the index of the first vector element of maximum absolute value.
*
* Based on IZAMAX from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* Returns a 0-based index (Fortran returns 1-based).
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} ZX - complex input vector
* @param {integer} strideZX - stride for `ZX` (in complex elements)
* @param {NonNegativeInteger} offsetZX - starting index for `ZX` (in complex elements)
* @returns {integer} 0-based index of the element with maximum absolute value
*/
function izmax1( N, ZX, strideZX, offsetZX ) {
	var result;
	var dmax;
	var val;
	var xv;
	var sx;
	var ix;
	var i;

	if ( N < 1 ) {
		return -1;
	}
	result = 0;
	if ( N === 1 ) {
		return 0;
	}

	xv = reinterpret( ZX, 0 );
	ix = offsetZX * 2;
	sx = strideZX * 2;

	dmax = cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
	ix += sx;

	for ( i = 1; i < N; i++ ) {
		val = cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
		if ( val > dmax ) {
			result = i;
			dmax = val;
		}
		ix += sx;
	}
	return result;
}


// EXPORTS //

export default izmax1;
