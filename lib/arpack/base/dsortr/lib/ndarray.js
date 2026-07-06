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
import base from './base.js';


// MAIN //

/**
* Sorts the values in `x1` with a gapped (Shell) insertion sort, optionally applying the same permutation to a companion vector `x2`.
*
* @param {string} which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
* @param {boolean} apply - whether to apply the sorting permutation to `x2`
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} x1 - array whose values determine (and receive) the sort
* @param {integer} strideX1 - stride length for `x1`
* @param {NonNegativeInteger} offsetX1 - starting index for `x1`
* @param {Float64Array} x2 - companion array permuted alongside `x1` when `apply` is `true`
* @param {integer} strideX2 - stride length for `x2`
* @param {NonNegativeInteger} offsetX2 - starting index for `x2`
* @throws {TypeError} first argument must be one of `LM`, `SM`, `LA`, or `SA`
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x1 = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
* var x2 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );
*
* dsortr( 'LA', true, 5, x1, 1, 0, x2, 1, 0 );
* // x1 => <Float64Array>[ -1.5, -1.0, 2.0, 3.0, 4.0 ]
*/
function dsortr( which, apply, N, x1, strideX1, offsetX1, x2, strideX2, offsetX2 ) {
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of `LM`, `SM`, `LA`, or `SA`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( which, apply, N, x1, strideX1, offsetX1, x2, strideX2, offsetX2 );
}


// EXPORTS //

export default dsortr;
