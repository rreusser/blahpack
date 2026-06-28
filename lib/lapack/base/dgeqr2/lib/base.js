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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dlarfg from '../../dlarfg/lib/base.js';
import dlarf from '../../dlarf/lib/base.js';


// MAIN //

/**
* Computes a QR factorization of a real M-by-N matrix A = Q * R.
* using Householder reflections (unblocked algorithm).
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace array (length >= N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgeqr2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var alpha;
	var aii;
	var K;
	var i;

	K = Math.min( M, N );

	for ( i = 0; i < K; i++ ) {
		// Generate elementary reflector H(i) to annihilate A(i+1:M-1, i)
		aii = offsetA + (i * strideA1) + (i * strideA2);

		dlarfg( M - i, A, aii, A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2), TAU, offsetTAU + (i * strideTAU) );

		if ( i < N - 1 ) {
			// Save A(i,i) and set to 1 for the reflector application
			alpha = A[ aii ];
			A[ aii ] = 1.0;

			// Apply H(i) to A(i:M-1, i+1:N-1) from the left
			dlarf( 'left', M - i, N - i - 1, A, strideA1, aii, TAU[ offsetTAU + (i * strideTAU) ], A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

			// Restore A(i,i)
			A[ aii ] = alpha;
		}
	}
	return 0;
}


// EXPORTS //

export default dgeqr2;
