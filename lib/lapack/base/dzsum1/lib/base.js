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
* Takes the sum of the absolute values of a complex vector and returns a.
* double precision result.
*
* Based on DZASUM from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} CX - complex input vector
* @param {integer} strideCX - stride for `CX` (in complex elements)
* @param {NonNegativeInteger} offsetCX - starting index for `CX` (in complex elements)
* @returns {number} sum of absolute values
*/
function dzsum1( N, CX, strideCX, offsetCX ) {
	let stemp, ix, i;

	stemp = 0.0;
	if ( N <= 0 ) {
		return 0.0;
	}

	const xv = reinterpret( CX, 0 );
	ix = offsetCX * 2;
	const sx = strideCX * 2;

	for ( i = 0; i < N; i++ ) {
		stemp += cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
		ix += sx;
	}
	return stemp;
}


// EXPORTS //

export default dzsum1;
