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

/* eslint-disable max-len, max-params */

// MODULES //

import dlarfg from './../../dlarfg/lib/base.js';
import dlarz from './../../dlarz/lib/base.js';


// MAIN //

/**
* Factors the M-by-(M+L) real upper trapezoidal matrix `[ A1 A2 ] = [ A(0:M-1,0:M-1) A(0:M-1,N-L:N-1) ]` as `( R  0 ) * Z` by means of orthogonal transformations.
*
* ## Notes
*
* -   `Z` is an (M+L)-by-(M+L) orthogonal matrix, and `R` and `A1` are M-by-M upper triangular matrices.
* -   On exit, the leading M-by-M upper triangular part of `A` contains the upper triangular matrix `R`, and elements N-L to N-1 of the first M rows of `A`, with the array `TAU`, represent the orthogonal matrix `Z` as a product of M elementary reflectors.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} l - number of columns containing the meaningful part of the Householder vectors (`N - M >= l >= 0`)
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - output array of scalar factors of the elementary reflectors (length `M`)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - workspace array (length `M`)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {Float64Array} `A`
*/
function dlatrz( M, N, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var offsetV;
	var offsetC;
	var aii;
	var i;

	// Quick return if possible...
	if ( M === 0 ) {
		return A;
	}
	if ( M === N ) {
		for ( i = 0; i < N; i++ ) {
			TAU[ offsetTAU + ( i * strideTAU ) ] = 0.0;
		}
		return A;
	}

	// Iterate from i = M-1 down to 0 (Fortran: I = M, M-1, ..., 1).
	for ( i = M - 1; i >= 0; i-- ) {
		// Index of A(i, i) — the diagonal pivot element:
		aii = offsetA + ( i * strideA1 ) + ( i * strideA2 );

		// Starting index of A(i, N-l) — the trailing reflector tail:
		offsetV = offsetA + ( i * strideA1 ) + ( ( N - l ) * strideA2 );

		// Generate elementary reflector H(i) to annihilate `[ A(i,i), A(i,N-l:N-1) ]`. Reflector length is l+1 (one leading alpha plus l trailing tail elements, which are stored stepping by `strideA2`).
		dlarfg( l + 1, A, aii, A, strideA2, offsetV, TAU, offsetTAU + ( i * strideTAU ) );

		// Apply H(i) to A(0:i-1, i:N-1) from the right. The reflector vector `v` passed to `dlarz` is the trailing tail (length `l`), stored in row `i` starting at column `N-l` with stride `strideA2`. The target sub-matrix `C` is A(0:i-1, i:N-1).
		offsetC = offsetA + ( i * strideA2 );
		dlarz( 'right', i, N - i, l, A, strideA2, offsetV, TAU[ offsetTAU + ( i * strideTAU ) ], A, strideA1, strideA2, offsetC, WORK, strideWORK, offsetWORK );
	}
	return A;
}


// EXPORTS //

export default dlatrz;
