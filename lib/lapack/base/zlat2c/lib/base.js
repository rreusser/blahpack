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

import reinterpret128 from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import reinterpret64 from '@stdlib/strided/base/reinterpret-complex64/lib/index.js';


// VARIABLES //

// Single-precision overflow threshold, SLAMCH( 'O' ) for IEEE 754 binary32:
const RMAX = 3.4028234663852886e+38;


// MAIN //

/**
* Converts a double-complex triangular matrix `A` to a single-complex triangular matrix `SA`, checking that each entry is within the single-precision overflow range.
*
* ## Notes
*
* -   `RMAX` is the overflow threshold of IEEE 754 single-precision. If any element of the referenced triangle has a real or imaginary part with magnitude greater than `RMAX`, the conversion is aborted and the routine returns `1`.
*
* @private
* @param {string} uplo - specifies whether `A` is upper or lower triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex64Array} SA - output matrix
* @param {integer} strideSA1 - stride of the first dimension of `SA`
* @param {integer} strideSA2 - stride of the second dimension of `SA`
* @param {NonNegativeInteger} offsetSA - starting index for `SA`
* @returns {integer} status code (`0` = success, `1` = entry outside single-precision range)
*/
function zlat2c( uplo, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA ) { // eslint-disable-line max-len, max-params
	let ia, is, re, im, i, j;

	if ( N <= 0 ) {
		return 0;
	}
	const fround = Math.fround;
	const upper = ( uplo === 'upper' );
	const av = reinterpret128( A, 0 );
	const sv = reinterpret64( SA, 0 );

	// Convert complex-element strides/offsets to Float64 indices (factor of 2 for interleaved re/im):
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const ss1 = strideSA1 * 2;
	const ss2 = strideSA2 * 2;
	const oa2 = offsetA * 2;
	const os2 = offsetSA * 2;

	if ( upper ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				ia = oa2 + ( i * sa1 ) + ( j * sa2 );
				re = av[ ia ];
				im = av[ ia + 1 ];
				if ( re < -RMAX || re > RMAX || im < -RMAX || im > RMAX ) {
					return 1;
				}
				is = os2 + ( i * ss1 ) + ( j * ss2 );
				sv[ is ] = fround( re );
				sv[ is + 1 ] = fround( im );
			}
		}
		return 0;
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			ia = oa2 + ( i * sa1 ) + ( j * sa2 );
			re = av[ ia ];
			im = av[ ia + 1 ];
			if ( re < -RMAX || re > RMAX || im < -RMAX || im > RMAX ) {
				return 1;
			}
			is = os2 + ( i * ss1 ) + ( j * ss2 );
			sv[ is ] = fround( re );
			sv[ is + 1 ] = fround( im );
		}
	}
	return 0;
}


// EXPORTS //

export default zlat2c;
