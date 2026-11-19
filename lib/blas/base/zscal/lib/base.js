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
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Scale a complex double-precision vector by a complex constant.
*
* @private
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for `zx` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `zx` (in complex elements)
* @returns {Complex128Array} `zx`
*/
function zscal( N, alpha, x, strideX, offsetX ) {
	let ix, tr, i;

	if ( N <= 0 ) {
		return x;
	}

	const zaR = real( alpha );
	const zaI = imag( alpha );

	// Early return if za === (1, 0)
	if ( zaR === 1.0 && zaI === 0.0 ) {
		return x;
	}

	const xv = reinterpret( x, 0 );
	ix = offsetX * 2;

	// Each complex element spans 2 doubles, so multiply stride by 2
	const sx = strideX * 2;

	for ( i = 0; i < N; i++ ) {
		tr = (zaR * xv[ ix ]) - (zaI * xv[ ix + 1 ]);
		xv[ ix + 1 ] = (zaR * xv[ ix + 1 ]) + (zaI * xv[ ix ]);
		xv[ ix ] = tr;
		ix += sx;
	}
	return x;
}


// EXPORTS //

export default zscal;
