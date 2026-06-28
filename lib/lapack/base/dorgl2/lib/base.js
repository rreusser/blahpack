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

/* eslint-disable max-len, max-params */

// MODULES //

import dlarf from '../../dlarf/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Generates an M-by-N real orthogonal matrix Q from the elementary.
* reflectors returned by DGELQF/DGELQ2 (LQ factorization, unblocked).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(K) ... H(2) H(1)
*
* where each H(i) has the form `H(i) = I - tau(i)*v*v^T`, and v is
* stored as row i of the input matrix A.
*
* ## Notes
*
* -   On entry, the i-th row of A must contain the vector which defines
* the elementary reflector H(i), for i = 1, 2, ..., K, as returned by
* DGELQF in the first K rows of its array argument A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Float64Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace (length >= M)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dorgl2( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var it;
	var i;
	var j;
	var l;

	if ( M <= 0 ) {
		return 0;
	}

	// Initialize rows K+1..M to rows of the unit matrix
	// Fortran: IF (K < M) THEN DO 20 J=1,N; DO 10 L=K+1,M; ...
	if ( K < M ) {
		for ( j = 0; j < N; j++ ) {
			for ( l = K; l < M; l++ ) {
				A[ offsetA + (l * strideA1) + (j * strideA2) ] = 0.0;
			}
			// If J > K and J <= M (0-based: j >= K and j < M), set A(j,j) = 1
			if ( j >= K && j < M ) {
				A[ offsetA + (j * strideA1) + (j * strideA2) ] = 1.0;
			}
		}
	}

	// Apply each reflector in reverse order: i = K, K-1, ..., 1 (1-based)
	// JS: i goes from K-1 down to 0 (0-based)
	for ( i = K - 1; i >= 0; i-- ) {
		it = offsetTAU + (i * strideTAU);

		// If i < N-1 (Fortran: I < N), the row extends beyond the diagonal
		if ( i < N - 1 ) {
			if ( i < M - 1 ) {
				// Set A(i,i) = 1
				A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0;

				// DLARF('Right', M-I, N-I+1, A(I,I), LDA, TAU(I),

				//        A(I+1,I), LDA, WORK)

				// V is row i from column i onward, so stride for v = strideA2 (along columns)

				// C is rows i+1..M-1, columns i..N-1
				dlarf('right', M - i - 1, N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU[ it ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), WORK, strideWork, offsetWork);
			}

			// DSCAL(N-I, -TAU(I), A(I, I+1), LDA)
			// Scale row i from column i+1 onward by -tau(i), stride = strideA2
			dscal(N - i - 1, -TAU[ it ], A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2));
		}

		// A(I,I) = ONE - TAU(I)
		A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0 - TAU[ it ];

		// Zero out columns 0..i-1 of row i

		// Fortran: DO 30 L = 1, I-1; A(I,L) = ZERO
		for ( l = 0; l < i; l++ ) {
			A[ offsetA + (i * strideA1) + (l * strideA2) ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default dorgl2;
