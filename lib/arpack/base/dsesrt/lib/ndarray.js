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
* Sorts the values in `x` with a gapped (Shell) insertion sort, optionally applying the same permutation to the columns of a companion matrix `A`.
*
* @param {string} which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
* @param {boolean} apply - whether to apply the sorting permutation to the columns of `A`
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} x - array whose values determine (and receive) the sort
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {NonNegativeInteger} na - number of rows of `A` to permute
* @param {Float64Array} A - companion matrix whose columns are permuted alongside `x` when `apply` is `true`
* @param {integer} strideA1 - stride of the first (row) dimension of `A`
* @param {integer} strideA2 - stride of the second (column) dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @throws {TypeError} first argument must be one of `LM`, `SM`, `LA`, or `SA`
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x = new Float64Array( [ 3.0, 1.0, 2.0 ] );
* var A = new Float64Array( [ 11.0, 12.0, 21.0, 22.0, 31.0, 32.0 ] ); // 2x3, column-major
*
* dsesrt( 'LA', true, 3, x, 1, 0, 2, A, 1, 2, 0 );
* // x => <Float64Array>[ 1.0, 2.0, 3.0 ]
*/
function dsesrt( which, apply, N, x, strideX, offsetX, na, A, strideA1, strideA2, offsetA ) {
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of `LM`, `SM`, `LA`, or `SA`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( which, apply, N, x, strideX, offsetX, na, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default dsesrt;
