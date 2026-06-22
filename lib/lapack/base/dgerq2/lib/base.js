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
* Computes an RQ factorization of a real M-by-N matrix A = R * Q.
* using Householder reflections (unblocked algorithm).
*
* On exit, if M <= N, the upper triangle of the subarray
* A(0:M-1, N-M:N-1) contains the M-by-M upper triangular matrix R;
* if M >= N, the elements on and above the (M-N)-th subdiagonal
* contain the M-by-N upper trapezoidal matrix R; the remaining
* elements, with the array TAU, represent the orthogonal matrix Q
* as a product of elementary reflectors.
*
* Q = H(1) H(2) ... H(k), where k = min(M,N).
*
* Each H(i) has the form H(i) = I - tau _ v _ v^T
* where v(n-k+i+1:n) = 0 and v(n-k+i) = 1; v(1:n-k+i-1) is stored
* in A(m-k+i, 0:n-k+i-2), and tau in TAU(i).
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
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgerq2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var save;
	var aii;
	var row;
	var K;
	var i;

	K = Math.min( M, N );

	// Iterate backward: i = K-1, K-2, ..., 0

	// Fortran iterates I = K, K-1, ..., 1 (1-based)

	// 0-based: row index = M-K+i, col index = N-K+i
	for ( i = K - 1; i >= 0; i-- ) {
		// Row of reflector in 0-based: M-K+i
		row = M - K + i;

		// Index of A(row, N-K+i) — the diagonal pivot element
		aii = offsetA + (row * strideA1) + ((N - K + i) * strideA2);

		// Generate elementary reflector H(i) to annihilate A(row, 0:N-K+i-1)

		// dlarfg( len, alpha(array,offset), x, strideX, offsetX, tau, offsetTau )

		// Alpha = A(row, N-K+i), x = A(row, 0) stepping by strideA2

		// Length of reflector vector = N-K+i+1 (Fortran: N-K+I)
		dlarfg(N - K + i + 1, A, aii, A, strideA2, offsetA + (row * strideA1), TAU, offsetTAU + (i * strideTAU));

		if ( row > 0 ) {
			// Save A(row, N-K+i) and set it to 1 for the reflector application
			save = A[ aii ];
			A[ aii ] = 1.0;

			// Apply H(i) to A(0:row-1, 0:N-K+i) from the right

			// dlarf( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK )
			dlarf('right', row,                 // number of rows of sub-matrix
				N - K + i + 1,       // number of columns of sub-matrix
				A, strideA2, offsetA + (row * strideA1), // v = row `row` from col 0 to N-K+i, stride along columns
				TAU[ offsetTAU + (i * strideTAU) ],      // tau is a plain scalar for dlarf
				A, strideA1, strideA2, offsetA,           // C = A(0, 0)
				WORK, strideWORK, offsetWORK);

			// Restore A(row, N-K+i)
			A[ aii ] = save;
		}
	}
	return 0;
}


// EXPORTS //

export default dgerq2;
