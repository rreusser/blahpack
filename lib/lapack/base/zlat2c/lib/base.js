/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import reinterpret128 from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import reinterpret64 from '@stdlib/strided/base/reinterpret-complex64/lib/index.js';


// VARIABLES //

// Single-precision overflow threshold, SLAMCH( 'O' ) for IEEE 754 binary32:
var RMAX = 3.4028234663852886e+38;


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
	var fround;
	var upper;
	var oa2;
	var os2;
	var sa1;
	var sa2;
	var ss1;
	var ss2;
	var av;
	var sv;
	var ia;
	var is;
	var re;
	var im;
	var i;
	var j;

	if ( N <= 0 ) {
		return 0;
	}
	fround = Math.fround;
	upper = ( uplo === 'upper' );
	av = reinterpret128( A, 0 );
	sv = reinterpret64( SA, 0 );

	// Convert complex-element strides/offsets to Float64 indices (factor of 2 for interleaved re/im):
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	ss1 = strideSA1 * 2;
	ss2 = strideSA2 * 2;
	oa2 = offsetA * 2;
	os2 = offsetSA * 2;

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
