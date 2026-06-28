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

import dlarf from '../../dlarf/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Generate an M-by-N real orthogonal matrix Q from the elementary.
* reflectors returned by DGEQRF/DGEQR2 (QR factorization, unblocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(1) H(2) ... H(K)
*
* where each H(i) has the form `H(i) = I - tau(i)*v*v^T`.
*
* ## Notes
*
* -   On entry, the i-th column of A must contain the vector which defines
* the elementary reflector H(i), for i = 1, 2, ..., K, as returned by
* DGEQRF in the first K columns of its array argument A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
* @param {Float64Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace (length >= N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dorg2r( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var i;
	var j;
	var l;

	if ( N <= 0 ) {
		return 0;
	}

	// Initialize columns K+1..N to columns of the identity matrix
	// Fortran: DO 20 J = K+1, N (1-based) => JS: j = K..N-1 (0-based)
	for ( j = K; j < N; j++ ) {
		// Zero out the entire column
		for ( l = 0; l < M; l++ ) {
			A[ offsetA + (l * strideA1) + (j * strideA2) ] = 0.0;
		}
		// Set diagonal element to 1
		A[ offsetA + (j * strideA1) + (j * strideA2) ] = 1.0;
	}

	// Apply each reflector in reverse order: i = K, K-1, ..., 1
	// Fortran: DO 40 I = K, 1, -1 (1-based) => JS: i = K-1..0 (0-based)
	for ( i = K - 1; i >= 0; i-- ) {
		// If i < N-1 (Fortran: I < N), apply the reflector to A(i:M-1, i+1:N-1)
		if ( i < N - 1 ) {
			// Set A(i,i) = 1 before applying the reflector
			A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0;

			// DLARF('Left', M-I, N-I-1, A(I,I), 1, TAU(I), A(I,I+1), LDA, WORK)

			// Fortran 1-based: M-I+1 rows, N-I cols starting at (I, I+1)

			// JS 0-based: M-i rows from row i, N-i-1 cols from col i+1
			dlarf('left', M - i, N - i - 1, A, strideA1, offsetA + (i * strideA1) + (i * strideA2), TAU[ offsetTAU + (i * strideTAU) ], A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork);
		}

		// If i < M-1 (Fortran: I < M), scale the sub-diagonal part of column i
		if ( i < M - 1 ) {
			// DSCAL(M-I, -TAU(I), A(I+1,I), 1)
			// JS 0-based: M-i-1 elements starting at A(i+1, i)
			dscal(M - i - 1, -TAU[ offsetTAU + (i * strideTAU) ], A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2));
		}

		// A(i,i) = 1 - TAU(i)
		A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0 - TAU[ offsetTAU + (i * strideTAU) ];

		// Zero out rows 0..i-1 of column i

		// Fortran: DO 30 L = 1, I-1
		for ( l = 0; l < i; l++ ) {
			A[ offsetA + (l * strideA1) + (i * strideA2) ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default dorg2r;
