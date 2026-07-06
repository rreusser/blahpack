/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';
import dsortr from './../../dsortr/lib/base.js';


// MAIN //

/**
* Selects the shifts for the implicitly restarted symmetric Lanczos/Arnoldi iteration and sorts the current Ritz values.
*
* ## Notes
*
* -   `ritz` and `bounds` have length `kev + np`; `shifts` has length `np`.
* -   `which` selects the ordering (`'LM'`, `'SM'`, `'LA'`, `'SA'`) or `'BE'` (both ends), matching ARPACK's convention.
* -   When `ishift = 1` and `np > 0`, the `np` unwanted Ritz values become the shifts (sorted by smallest magnitude).
*
* @private
* @param {integer} ishift - if 1, compute the shifts; if 0, leave `shifts` untouched
* @param {string} which - ordering: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
* @param {NonNegativeInteger} kev - number of wanted Ritz values
* @param {NonNegativeInteger} np - number of shifts (unwanted Ritz values)
* @param {Float64Array} ritz - Ritz values (length kev+np); reordered in place
* @param {integer} strideRitz - stride length for `ritz`
* @param {NonNegativeInteger} offsetRitz - starting index for `ritz`
* @param {Float64Array} bounds - Ritz estimates (length kev+np); permuted alongside `ritz`
* @param {integer} strideBounds - stride length for `bounds`
* @param {NonNegativeInteger} offsetBounds - starting index for `bounds`
* @param {Float64Array} shifts - output array for the selected shifts (length np)
* @param {integer} strideShifts - stride length for `shifts`
* @param {NonNegativeInteger} offsetShifts - starting index for `shifts`
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
* var bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
* var shifts = new Float64Array( 2 );
*
* dsgets( 1, 'LM', 3, 2, ritz, 1, 0, bounds, 1, 0, shifts, 1, 0 );
* // ritz => <Float64Array>[ -1.0, -1.5, 2.0, 3.0, 4.0 ]
*/
function dsgets( ishift, which, kev, np, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, shifts, strideShifts, offsetShifts ) {
	var kevd2;
	var mn;
	var mx;

	if ( which === 'BE' ) {
		// Sort the full spectrum ascending, then interchange the low `kevd2`
		// wanted values with the shift block so both ends are retained.
		dsortr( 'LA', true, kev + np, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds );
		kevd2 = kev >> 1;
		if ( kev > 1 ) {
			mn = Math.min( kevd2, np );
			mx = Math.max( kevd2, np );
			dswap( mn, ritz, strideRitz, offsetRitz, ritz, strideRitz, offsetRitz + ( mx * strideRitz ) );
			dswap( mn, bounds, strideBounds, offsetBounds, bounds, strideBounds, offsetBounds + ( mx * strideBounds ) );
		}
	} else {
		dsortr( which, true, kev + np, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds );
	}

	if ( ishift === 1 && np > 0 ) {
		// The `np` smallest-magnitude bounds identify the shifts; copy the
		// corresponding Ritz values into `shifts`.
		dsortr( 'SM', true, np, bounds, strideBounds, offsetBounds, ritz, strideRitz, offsetRitz );
		dcopy( np, ritz, strideRitz, offsetRitz, shifts, strideShifts, offsetShifts );
	}
}


// EXPORTS //

export default dsgets;
