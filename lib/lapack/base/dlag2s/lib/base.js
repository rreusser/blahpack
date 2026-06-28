/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import FLOAT32_MAX from '@stdlib/constants/float32/max/lib/index.js';


// VARIABLES //

// Single-precision (IEEE 754 binary32) overflow threshold, matching SLAMCH('O'):
var RMAX = FLOAT32_MAX;


// MAIN //

/**
* Converts a double precision matrix `A` to a single precision matrix `SA`.
*
* ## Notes
*
* -   On exit, `SA[i,j]` holds `fround(A[i,j])` for every converted element.
*     The result is stored as a `Float64Array` whose values are all exactly
*     representable in IEEE 754 binary32 (i.e., rounded via `Math.fround`).
*
* -   If any element of `A` exceeds the single precision range, the routine
*     terminates early and returns `1`; otherwise it returns `0`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} SA - output matrix (single-precision rounded values stored as `Float64Array`)
* @param {integer} strideSA1 - stride of the first dimension of `SA`
* @param {integer} strideSA2 - stride of the second dimension of `SA`
* @param {NonNegativeInteger} offsetSA - starting index for `SA`
* @returns {integer} status code (`0` on success, `1` if an element overflows single precision)
*/
function dlag2s( M, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA ) { // eslint-disable-line max-len, max-params
	var aij;
	var da0;
	var ds0;
	var i;
	var j;

	for ( j = 0; j < N; j++ ) {
		da0 = offsetA + ( j * strideA2 );
		ds0 = offsetSA + ( j * strideSA2 );
		for ( i = 0; i < M; i++ ) {
			aij = A[ da0 + ( i * strideA1 ) ];
			if ( aij < -RMAX || aij > RMAX ) {
				return 1;
			}
			SA[ ds0 + ( i * strideSA1 ) ] = Math.fround( aij );
		}
	}
	return 0;
}


// EXPORTS //

export default dlag2s;
