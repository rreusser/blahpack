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

import dorgqr from '../../dorgqr/lib/base.js';
import dorglq from '../../dorglq/lib/base.js';


// MAIN //

/**
* Generates one of the real orthogonal matrices Q or P^T determined by DGEBRD.
* when reducing a real matrix A to bidiagonal form: `A = Q*B*P^T`.
*
* Q and P^T are defined as products of elementary reflectors H(i) or G(i)
* respectively.
*
* If VECT = 'Q', A is assumed to have been an M-by-K matrix, and Q
* is of order M:
* if M >= K, Q = H(1) H(2) ... H(K) and dorgbr returns the first N
* columns of Q, where M >= N >= K;
* if M < K, Q = H(1) H(2) ... H(M-1) and dorgbr returns Q as an
* M-by-M orthogonal matrix.
*
* If VECT = 'P', A is assumed to have been a K-by-N matrix, and P^T
* is of order N:
* if K < N, P^T = G(1) G(2) ... G(K) and dorgbr returns the first M
* rows of P^T, where N >= M >= K;
* if K >= N, P^T = G(1) G(2) ... G(N-1) and dorgbr returns P^T as an
* N-by-N orthogonal matrix.
*
* @private
* @param {string} vect - 'q' to generate Q, 'p' to generate P^T
* @param {NonNegativeInteger} M - number of rows of the matrix Q or P^T
* @param {NonNegativeInteger} N - number of columns of the matrix Q or P^T
* @param {NonNegativeInteger} K - number of columns/rows in original matrix
* @param {Float64Array} A - matrix containing reflectors from DGEBRD
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace (ignored, allocated internally by dependencies)
* @param {integer} strideWORK - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (ignored)
* @returns {integer} info - 0 if successful
*/
function dorgbr( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var wantq;
	var i;
	var j;

	// Quick return
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	wantq = ( vect === 'apply-Q' );

	if ( wantq ) {
		// Form Q = H(1) H(2) ... H(K)

		if ( M >= K ) {
			// Q was determined by a call to DGEBRD with M >= K.
			// Simply apply DORGQR to the matrix A.
			dorgqr(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
		} else {
			// Q was determined by a call to DGEBRD with M < K.
			// Need to shift columns and then apply DORGQR.

			// Shift the vectors which define the elementary reflectors one
			// Column to the right, and set the first row and column of Q
			// To those of the unit matrix.
			// Fortran: DO 20 J = M, 2, -1 (1-based)
			// 0-based: j from M-1 downto 1
			for ( j = M - 1; j >= 1; j-- ) {
				// A(0, j) = 0
				A[ offsetA + (j * strideA2) ] = 0.0;

				// Copy column j-1 to column j for rows j..M-1 (0-based)
				// Fortran: DO 10 I = J+1, M => 0-based: i from j to M-1
				for ( i = j; i < M; i++ ) {
					A[ offsetA + (i * strideA1) + (j * strideA2) ] = A[ offsetA + (i * strideA1) + (( j - 1 ) * strideA2) ];
				}
			}
			// Set A(0,0) = 1, A(i,0) = 0 for i >= 1
			A[ offsetA ] = 1.0;
			for ( i = 1; i < M; i++ ) {
				A[ offsetA + (i * strideA1) ] = 0.0;
			}

			if ( M > 1 ) {
				// Form Q(1:M-1, 1:M-1) using the reflectors
				// Fortran: CALL DORGQR( M-1, M-1, M-1, A(2,2), LDA, TAU, WORK, LWORK, IINFO )
				dorgqr(M - 1, M - 1, M - 1, A, strideA1, strideA2, offsetA + strideA1 + strideA2, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
			}
		}
	} else if ( K < N ) {
		// Form P^T = G(1) G(2) ... G(K)

		// P^T was determined by a call to DGEBRD with K < N.
		// Simply apply DORGLQ to the matrix A.
		dorglq(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
	} else {
		// Form P^T = G(1) G(2) ... G(K)

		// P^T was determined by a call to DGEBRD with K >= N.
		// Need to shift rows and then apply DORGLQ.

		// Set first row and column appropriately
		// A(0,0) = 1
		A[ offsetA ] = 1.0;

		// A(i, 0) = 0 for i >= 1
		for ( i = 1; i < N; i++ ) {
			A[ offsetA + (i * strideA1) ] = 0.0;
		}

		// Shift rows: for columns j from 1 to N-1, shift rows down by 1
		// Fortran: DO 60 J = 2, N => 0-based: j from 1 to N-1
		for ( j = 1; j < N; j++ ) {
			// Shift: A(i, j) = A(i-1, j) for i from j-1 downto 1 (0-based)
			// Fortran: DO 50 I = J-1, 2, -1 => 0-based: i from j-2 downto 1
			for ( i = j - 1; i >= 1; i-- ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = A[ offsetA + (( i - 1 ) * strideA1) + (j * strideA2) ];
			}
			// A(0, j) = 0
			A[ offsetA + (j * strideA2) ] = 0.0;
		}

		if ( N > 1 ) {
			// Form P^T(1:N-1, 1:N-1) using the reflectors
			// Fortran: CALL DORGLQ( N-1, N-1, N-1, A(2,2), LDA, TAU, WORK, LWORK, IINFO )
			dorglq(N - 1, N - 1, N - 1, A, strideA1, strideA2, offsetA + strideA1 + strideA2, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
		}
	}

	return 0;
}


// EXPORTS //

export default dorgbr;
