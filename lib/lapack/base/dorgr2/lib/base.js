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
* Generates an M-by-N real matrix Q with orthonormal rows, defined as the.
* last M rows of a product of K elementary reflectors of order N:
*
*   Q = H(1) H(2) ... H(K)
*
* as returned by DGERQF.
*
* ## Notes
*
* -   On entry, the (m-k+i)-th row must contain the vector which defines
*     the elementary reflector H(i), for i = 1,2,...,k, as returned by
*     DGERQF in the last k rows of its array argument A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (N >= M)
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
function dorgr2( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ii;
	var i;
	var j;
	var l;

	if ( M <= 0 ) {
		return 0;
	}

	// Initialize rows 0..M-K-1 to rows of the unit matrix
	// Fortran: rows 1..M-K, columns 1..N
	if ( K < M ) {
		for ( j = 0; j < N; j++ ) {
			for ( l = 0; l < M - K; l++ ) {
				A[ offsetA + ( l * strideA1 ) + ( j * strideA2 ) ] = 0.0;
			}
			// If j > N-M-1 and j <= N-K-1, set A(M-N+j, j) = 1
			// Fortran: IF (J > N-M .AND. J <= N-K) A(M-N+J, J) = ONE
			// JS 0-based: if j > N-M-1 and j <= N-K-1, set A(M-N+j, j) = 1
			// Fortran J goes 1..N, condition: J > N-M and J <= N-K
			// JS j goes 0..N-1, condition: j+1 > N-M and j+1 <= N-K => j > N-M-1 and j <= N-K-1
			if ( j > N - M - 1 && j <= N - K - 1 ) {
				A[ offsetA + ( ( M - N + j ) * strideA1 ) + ( j * strideA2 ) ] = 1.0;
			}
		}
	}

	// Apply each reflector: i goes from 0 to K-1 (Fortran: 1 to K)
	for ( i = 0; i < K; i++ ) {
		// ii = M - K + i (0-based row index, Fortran: II = M-K+I)
		ii = M - K + i;

		// Apply H(i) to A(0:ii-1, 0:N-M+ii) from the right

		// Set A(ii, N-M+ii) = 1
		A[ offsetA + ( ii * strideA1 ) + ( ( N - M + ii ) * strideA2 ) ] = 1.0;

		// DLARF('Right', II-1, N-M+II, A(II,1), LDA, TAU(I), A, LDA, WORK)

		// Fortran: II-1 rows (1..II-1), N-M+II columns (1..N-M+II)

		// JS: ii rows (0..ii-1), N-M+ii+1 columns (0..N-M+ii)

		// The reflector vector is row ii of A, starting at column 0, with stride strideA2 (row stride in col-major = LDA)

		// For DLARF 'right': v has length N-M+ii+1, C has dimensions ii x (N-M+ii+1)
		dlarf( 'right', ii, N - M + ii + 1, A, strideA2, offsetA + ( ii * strideA1 ), TAU[ offsetTAU + ( i * strideTAU ) ], A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );

		// DSCAL(N-M+II-1, -TAU(I), A(II,1), LDA)

		// Fortran: scale N-M+II-1 elements of row II starting at column 1

		// JS: scale N-M+ii elements of row ii starting at column 0 (N-M+ii+1-1 = N-M+ii)
		dscal( N - M + ii, -TAU[ offsetTAU + ( i * strideTAU ) ], A, strideA2, offsetA + ( ii * strideA1 ) );

		// A(ii, N-M+ii) = 1 - TAU(i)
		A[ offsetA + ( ii * strideA1 ) + ( ( N - M + ii ) * strideA2 ) ] = 1.0 - TAU[ offsetTAU + ( i * strideTAU ) ];

		// Set A(ii, N-M+ii+1:N-1) to zero
		// Fortran: DO 30 L = N-M+II+1, N => JS: l = N-M+ii+1 .. N-1
		for ( l = N - M + ii + 1; l < N; l++ ) {
			A[ offsetA + ( ii * strideA1 ) + ( l * strideA2 ) ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default dorgr2;
