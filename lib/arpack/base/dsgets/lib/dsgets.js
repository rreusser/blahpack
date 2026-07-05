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

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Selects the shifts for the implicitly restarted symmetric Lanczos/Arnoldi iteration and sorts the current Ritz values.
*
* @param {integer} ishift - if 1, compute the shifts; if 0, leave `shifts` untouched
* @param {string} which - ordering: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
* @param {NonNegativeInteger} kev - number of wanted Ritz values
* @param {NonNegativeInteger} np - number of shifts (unwanted Ritz values)
* @param {Float64Array} ritz - Ritz values (length kev+np); reordered in place
* @param {integer} strideRitz - stride length for `ritz`
* @param {Float64Array} bounds - Ritz estimates (length kev+np); permuted alongside `ritz`
* @param {integer} strideBounds - stride length for `bounds`
* @param {Float64Array} shifts - output array for the selected shifts (length np)
* @param {integer} strideShifts - stride length for `shifts`
* @throws {TypeError} second argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
* var bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
* var shifts = new Float64Array( 2 );
*
* dsgets( 1, 'LM', 3, 2, ritz, 1, bounds, 1, shifts, 1 );
* // ritz => <Float64Array>[ -1.0, -1.5, 2.0, 3.0, 4.0 ]
*/
function dsgets( ishift, which, kev, np, ritz, strideRitz, bounds, strideBounds, shifts, strideShifts ) {
	var n;
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`. Value: `%s`.', which ) );
	}
	n = kev + np;
	return base( ishift, which, kev, np, ritz, strideRitz, stride2offset( n, strideRitz ), bounds, strideBounds, stride2offset( n, strideBounds ), shifts, strideShifts, stride2offset( np, strideShifts ) );
}


// EXPORTS //

export default dsgets;
