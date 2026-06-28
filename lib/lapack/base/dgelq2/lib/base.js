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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dlarfg from '../../dlarfg/lib/base.js';
import dlarf from '../../dlarf/lib/base.js';


// MAIN //

/**
* Computes an LQ factorization of a real M-by-N matrix A = L * Q.
* using Householder reflections (unblocked algorithm).
*
* On exit, the elements on and below the diagonal of A contain the
* M-by-min(M,N) lower trapezoidal matrix L; the elements above the
* diagonal, with the array TAU, represent the orthogonal matrix Q as
* a product of elementary reflectors.
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors (length min(M,N))
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace array (length >= M)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgelq2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var save;
	var aii;
	var K;
	var i;

	K = Math.min( M, N );

	for ( i = 0; i < K; i++ ) {
		// Index of A(i,i) in the flat array
		aii = offsetA + (i * strideA1) + (i * strideA2);

		// Generate elementary reflector H(i) to annihilate A(i, i+1:N-1)

		// dlarfg( N-i, alpha(array,offset), x, strideX, offsetX, tau, offsetTau )

		// Alpha = A(i,i), x = A(i, min(i+1, N-1)), stride along columns = strideA2
		dlarfg(N - i, A, aii, A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 1, N - 1 ) * strideA2), TAU, offsetTAU + (i * strideTAU));

		if ( i < M - 1 ) {
			// Save A(i,i) and set it to 1 for the reflector application
			save = A[ aii ];
			A[ aii ] = 1.0;

			// Apply H(i) to A(i+1:M-1, i:N-1) from the right

			// dlarf( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork )
			dlarf('right', M - i - 1,          // number of rows of sub-matrix
				N - i,              // number of columns of sub-matrix
				A, strideA2, aii,   // v = row i from col i onward, stride along columns
				TAU[ offsetTAU + (i * strideTAU) ], // tau is a plain scalar for dlarf
				A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), // C = A(i+1, i)
				WORK, strideWork, offsetWork);

			// Restore A(i,i)
			A[ aii ] = save;
		}
	}
	return 0;
}


// EXPORTS //

export default dgelq2;
