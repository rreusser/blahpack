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

// MAIN //

/**
* Sorts the values in `x1` with a gapped (Shell) insertion sort, optionally applying the same permutation to a companion vector `x2`.
*
* ## Notes
*
* -   `which` selects the ordering, matching ARPACK's convention (the selected values are moved toward the end of `x1`):
*
*     -   `'LM'`: sort by largest magnitude.
*     -   `'SM'`: sort by smallest magnitude.
*     -   `'LA'`: sort by largest (algebraic) value.
*     -   `'SA'`: sort by smallest (algebraic) value.
*
* @private
* @param {string} which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
* @param {boolean} apply - whether to apply the sorting permutation to `x2`
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} x1 - array whose values determine (and receive) the sort
* @param {integer} strideX1 - stride length for `x1`
* @param {NonNegativeInteger} offsetX1 - starting index for `x1`
* @param {Float64Array} x2 - companion array permuted alongside `x1` when `apply` is `true`
* @param {integer} strideX2 - stride length for `x2`
* @param {NonNegativeInteger} offsetX2 - starting index for `x2`
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
	let igap, swap, temp, a1, b1, a2, b2, i, j;

	igap = N >> 1;
	while ( igap > 0 ) {
		for ( i = igap; i < N; i++ ) {
			j = i - igap;
			while ( j >= 0 ) {
				a1 = offsetX1 + ( j * strideX1 );
				b1 = offsetX1 + ( ( j + igap ) * strideX1 );
				if ( which === 'SA' ) {
					swap = ( x1[ a1 ] < x1[ b1 ] );
				} else if ( which === 'SM' ) {
					swap = ( Math.abs( x1[ a1 ] ) < Math.abs( x1[ b1 ] ) );
				} else if ( which === 'LA' ) {
					swap = ( x1[ a1 ] > x1[ b1 ] );
				} else { // 'LM'
					swap = ( Math.abs( x1[ a1 ] ) > Math.abs( x1[ b1 ] ) );
				}
				if ( !swap ) {
					break;
				}
				temp = x1[ a1 ];
				x1[ a1 ] = x1[ b1 ];
				x1[ b1 ] = temp;
				if ( apply ) {
					a2 = offsetX2 + ( j * strideX2 );
					b2 = offsetX2 + ( ( j + igap ) * strideX2 );
					temp = x2[ a2 ];
					x2[ a2 ] = x2[ b2 ];
					x2[ b2 ] = temp;
				}
				j -= igap;
			}
		}
		igap >>= 1;
	}
}


// EXPORTS //

export default dsortr;
