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

// Single-precision overflow threshold (corresponds to SLAMCH('O')).
var RMAX = FLOAT32_MAX;


// MAIN //

/**
* Converts a double-precision triangular matrix `A` to a single-precision triangular matrix `SA`.
*
* ## Notes
*
* -   If any element of `A` falls outside the representable range of single precision, the routine returns `info = 1` and `SA` is left in a partially-updated state.
*
* @private
* @param {string} uplo - specifies whether `A` is upper or lower triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input double-precision matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float32Array} SA - output single-precision matrix
* @param {integer} strideSA1 - stride of the first dimension of `SA`
* @param {integer} strideSA2 - stride of the second dimension of `SA`
* @param {NonNegativeInteger} offsetSA - index offset for `SA`
* @returns {integer} status code (0 = success, 1 = overflow)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Float32Array = require( '@stdlib/array/float32' );
*
* var A = new Float64Array( [ 1.0, 0.0, 2.0, 3.0 ] );
* var SA = new Float32Array( 4 );
*
* var info = dlat2s( 'upper', 2, A, 1, 2, 0, SA, 1, 2, 0 );
* // returns 0
*/
function dlat2s( uplo, N, A, strideA1, strideA2, offsetA, SA, strideSA1, strideSA2, offsetSA ) { // eslint-disable-line max-len, max-params
	var aij;
	var ia0;
	var is0;
	var i;
	var j;

	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			ia0 = offsetA + ( j * strideA2 );
			is0 = offsetSA + ( j * strideSA2 );
			for ( i = 0; i <= j; i++ ) {
				aij = A[ ia0 + ( i * strideA1 ) ];
				if ( aij < -RMAX || aij > RMAX ) {
					return 1;
				}
				SA[ is0 + ( i * strideSA1 ) ] = Math.fround( aij );
			}
		}
		return 0;
	}
	// uplo === 'lower'
	for ( j = 0; j < N; j++ ) {
		ia0 = offsetA + ( j * strideA2 );
		is0 = offsetSA + ( j * strideSA2 );
		for ( i = j; i < N; i++ ) {
			aij = A[ ia0 + ( i * strideA1 ) ];
			if ( aij < -RMAX || aij > RMAX ) {
				return 1;
			}
			SA[ is0 + ( i * strideSA1 ) ] = Math.fround( aij );
		}
	}
	return 0;
}


// EXPORTS //

export default dlat2s;
