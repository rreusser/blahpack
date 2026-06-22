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
* Generate an M-by-N real orthogonal matrix Q with orthonormal columns.
* which is defined as the last N columns of a product of K elementary
* reflectors of order M
*
* Q = H(K) ... H(2) H(1)
*
* as returned by DGEQLF (QL factorization, unblocked algorithm).
*
* ## Notes
*
* -   On entry, the (N-K+i)-th column of A must contain the vector which
* defines the elementary reflector H(i), for i = 1, 2, ..., K, as
* returned by DGEQLF in the last K columns of its array argument A.
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
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dorg2l( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var ii;
	var i;
	var j;
	var l;

	if ( N <= 0 ) {
		return 0;
	}

	// Initialize columns 0..N-K-1 to columns of the unit matrix.
	// Fortran: DO 20 J = 1, N-K (1-based) => JS: j = 0..N-K-1 (0-based)
	// The diagonal element for column j is at row M-N+j (0-based).
	for ( j = 0; j < N - K; j++ ) {
		for ( l = 0; l < M; l++ ) {
			A[ offsetA + (l * strideA1) + (j * strideA2) ] = 0.0;
		}
		A[ offsetA + (( M - N + j ) * strideA1) + (j * strideA2) ] = 1.0;
	}

	// Apply each reflector in forward order: i = 0, 1, ..., K-1
	// Fortran: DO 40 I = 1, K (1-based) => JS: i = 0..K-1 (0-based)
	for ( i = 0; i < K; i++ ) {
		// ii = N-K+i (0-based column index)
		// Fortran: II = N-K+I (1-based) => ii = N-K+i (0-based)
		ii = N - K + i;

		// Set A(M-N+ii, ii) = 1 before applying the reflector

		// Fortran: A(M-N+II, II) = 1
		// M-N+II (1-based) = M-N+(ii+1) => 0-based row = M-N+ii
		A[ offsetA + (( M - N + ii ) * strideA1) + (ii * strideA2) ] = 1.0;

		// Apply H(i) to A(0:M-N+ii, 0:ii-1) from the left

		// Fortran: DLARF('Left', M-N+II, II-1, A(1,II), 1, TAU(I), A, LDA, WORK)

		//   M-N+II rows = M-N+ii+1 (converting 1-based count)

		//   II-1 cols = ii (converting 1-based count)

		//   V starts at A(1,II) = A(row=0, col=ii) in 0-based

		//   C starts at A(1,1) = A(row=0, col=0) in 0-based
		if ( ii > 0 ) {
			dlarf('left', M - N + ii + 1, ii, A, strideA1, offsetA + (ii * strideA2), TAU[ offsetTAU + (i * strideTAU) ], A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK);
		}

		// Scale the reflector column above the diagonal: DSCAL(M-N+II-1, -TAU(I), A(1,II), 1)
		// Fortran count M-N+II-1 = M-N+ii+1-1 = M-N+ii
		// Starts at A(1,II) = A(row=0, col=ii) in 0-based
		if ( M - N + ii > 0 ) {
			dscal(M - N + ii, -TAU[ offsetTAU + (i * strideTAU) ], A, strideA1, offsetA + (ii * strideA2));
		}

		// A(M-N+ii, ii) = 1 - TAU(i)
		A[ offsetA + (( M - N + ii ) * strideA1) + (ii * strideA2) ] = 1.0 - TAU[ offsetTAU + (i * strideTAU) ];

		// Zero out rows M-N+ii+1 to M-1 of column ii

		// Fortran: DO 30 L = M-N+II+1, M

		// 0-based: l = M-N+ii+1 to M-1
		for ( l = M - N + ii + 1; l < M; l++ ) {
			A[ offsetA + (l * strideA1) + (ii * strideA2) ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default dorg2l;
