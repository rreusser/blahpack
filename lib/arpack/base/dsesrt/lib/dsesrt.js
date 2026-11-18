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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sorts the values in `x` with a gapped (Shell) insertion sort, optionally applying the same permutation to the columns of a column-major companion matrix `A`.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
* @param {boolean} apply - whether to apply the sorting permutation to the columns of `A`
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} x - array whose values determine (and receive) the sort
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} na - number of rows of `A` to permute
* @param {Float64Array} A - companion matrix (column-major) whose columns are permuted alongside `x` when `apply` is `true`
* @param {integer} LDA - leading dimension of `A`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of `LM`, `SM`, `LA`, or `SA`
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x = new Float64Array( [ 3.0, 1.0, 2.0 ] );
* var A = new Float64Array( [ 11.0, 12.0, 21.0, 22.0, 31.0, 32.0 ] ); // 2x3, LDA=2
*
* dsesrt( 'column-major', 'LA', true, 3, x, 1, 2, A, 2 );
* // x => <Float64Array>[ 1.0, 2.0, 3.0 ]
*/
function dsesrt( order, which, apply, N, x, strideX, na, A, LDA ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of `LM`, `SM`, `LA`, or `SA`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( which, apply, N, x, strideX, stride2offset( N, strideX ), na, A, sa1, sa2, 0 );
}


// EXPORTS //

export default dsesrt;
