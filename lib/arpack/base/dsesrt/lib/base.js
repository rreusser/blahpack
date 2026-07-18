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

import dswap from './../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Sorts the values in `x` with a gapped (Shell) insertion sort, optionally applying the same permutation to the columns of a companion matrix `A`.
*
* ## Notes
*
* -   `which` selects the ordering, matching ARPACK's convention (the selected values are moved toward the end of `x`):
*
*     -   `'LM'`: sort by largest magnitude.
*     -   `'SM'`: sort by smallest magnitude.
*     -   `'LA'`: sort by largest (algebraic) value.
*     -   `'SA'`: sort by smallest (algebraic) value.
*
* -   When `apply` is `true`, each swap of `x[j]` and `x[j+igap]` also swaps the first `na` elements of the corresponding columns of `A`.
*
* @private
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
	let igap, swap, temp, a1, b1, i, j;

	igap = N >> 1;
	while ( igap > 0 ) {
		for ( i = igap; i < N; i++ ) {
			j = i - igap;
			while ( j >= 0 ) {
				a1 = offsetX + ( j * strideX );
				b1 = offsetX + ( ( j + igap ) * strideX );
				if ( which === 'SA' ) {
					swap = ( x[ a1 ] < x[ b1 ] );
				} else if ( which === 'SM' ) {
					swap = ( Math.abs( x[ a1 ] ) < Math.abs( x[ b1 ] ) );
				} else if ( which === 'LA' ) {
					swap = ( x[ a1 ] > x[ b1 ] );
				} else { // 'LM'
					swap = ( Math.abs( x[ a1 ] ) > Math.abs( x[ b1 ] ) );
				}
				if ( !swap ) {
					break;
				}
				temp = x[ a1 ];
				x[ a1 ] = x[ b1 ];
				x[ b1 ] = temp;
				if ( apply ) {
					dswap( na, A, strideA1, offsetA + ( j * strideA2 ), A, strideA1, offsetA + ( ( j + igap ) * strideA2 ) );
				}
				j -= igap;
			}
		}
		igap >>= 1;
	}
}


// EXPORTS //

export default dsesrt;
