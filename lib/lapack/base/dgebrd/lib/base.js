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

import dgebd2 from '../../dgebd2/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dlabrd from '../../dlabrd/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Reduces a real M-by-N matrix A to upper or lower real bidiagonal form B.
* by an orthogonal transformation: `Q__T*A*P = B`.
*
* This is the blocked version that processes NB columns at a time using
* dlabrd for the panel factorization, dgemm for the trailing matrix update,
* and dgebd2 for the final unblocked piece.
*
* If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} d - output array of diagonal elements of B, length min(M,N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output array of off-diagonal elements of B, length min(M,N)-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} TAUQ - output array of scalar factors for Q, length min(M,N)
* @param {integer} strideTAUQ - stride for TAUQ
* @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ
* @param {Float64Array} TAUP - output array of scalar factors for P, length min(M,N)
* @param {integer} strideTAUP - stride for TAUP
* @param {NonNegativeInteger} offsetTAUP - starting index for TAUP
* @param {Float64Array} WORK - caller-provided workspace array. Required size: `max(M, N)` for the unblocked path; `(M + N) * NB` for the blocked path with `NB = 32` (default). A minimum of `(M + N) * 2` enables a reduced-NB blocked path; below that, the routine falls back to unblocked and only `max(M, N)` is needed
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK array
* @returns {integer} info - 0 if successful
*/
function dgebrd( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork, lwork ) {
	var ldwrkx;
	var ldwrky;
	var minmn;
	var nbmin;
	var nb;
	var nx;
	var ws;
	var i;
	var j;

	minmn = Math.min( M, N );

	// Quick return if possible
	if ( minmn === 0 ) {
		return 0;
	}

	// Determine the block size
	nb = DEFAULT_NB;
	ldwrkx = M;
	ldwrky = N;
	ws = Math.max( M, N );
	nx = minmn;

	if ( nb > 1 && nb < minmn ) {
		// Determine crossover point NX (below which unblocked is faster)
		nx = Math.max( nb, 0 );

		if ( nx < minmn ) {
			ws = ( M + N ) * nb;
			if ( lwork < ws ) {
				// Not enough workspace for optimal NB; determine minimum NB
				nbmin = 2;
				if ( lwork >= ( M + N ) * nbmin ) {
					nb = Math.floor( lwork / ( M + N ) );
				} else {
					nb = 1;
					nx = minmn;
				}
			}
		}
	}

	// Blocked loop: reduce NB columns/rows at a time
	i = 0;
	if ( nb >= 2 && nb < minmn && nx < minmn ) {
		while ( i < minmn - nx ) {
			// Reduce rows and columns i:i+nb-1 to bidiagonal form and return
			// The matrices X and Y which are needed to update the unreduced
			// Part of the matrix.

			// dlabrd( M, N, nb, A, sA1, sA2, oA, d, sD, oD, e, sE, oE,
			//         TAUQ, sTQ, oTQ, TAUP, sTP, oTP, X, sX1, sX2, oX, Y, sY1, sY2, oY )

			// X starts at offsetWork, Y starts at offsetWork + ldwrkx * nb
			dlabrd(M - i, N - i, nb, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), d, strideD, offsetD + (i * strideD), e, strideE, offsetE + (i * strideE), TAUQ, strideTAUQ, offsetTAUQ + (i * strideTAUQ), TAUP, strideTAUP, offsetTAUP + (i * strideTAUP), WORK, 1, ldwrkx, offsetWork, WORK, 1, ldwrky, offsetWork + (ldwrkx * nb));

			// Update the trailing submatrix A(i+nb:M-1, i+nb:N-1)
			if ( M - i - nb > 0 && N - i - nb > 0 ) {
				// C := -1 * A(i+nb:,i:i+nb-1) * Y(nb:,:)^T + 1 * A(i+nb:,i+nb:)
				dgemm('no-transpose', 'transpose', M - i - nb, N - i - nb, nb, -1.0, A, strideA1, strideA2, offsetA + (( i + nb ) * strideA1) + (i * strideA2), WORK, 1, ldwrky, offsetWork + (ldwrkx * nb) + nb, 1.0, A, strideA1, strideA2, offsetA + (( i + nb ) * strideA1) + (( i + nb ) * strideA2));

				// C := -1 * X(nb:,:) * A(i:i+nb-1,i+nb:) + 1 * A(i+nb:,i+nb:)
				dgemm('no-transpose', 'no-transpose', M - i - nb, N - i - nb, nb, -1.0, WORK, 1, ldwrkx, offsetWork + nb, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + nb ) * strideA2), 1.0, A, strideA1, strideA2, offsetA + (( i + nb ) * strideA1) + (( i + nb ) * strideA2));
			}

			// Copy diagonal and off-diagonal elements of B back into A
			if ( M >= N ) {
				// Upper bidiagonal: D(j) -> A(j,j), E(j) -> A(j,j+1)
				for ( j = i; j < i + nb; j++ ) {
					A[ offsetA + (j * strideA1) + (j * strideA2) ] = d[ offsetD + (j * strideD) ];
					A[ offsetA + (j * strideA1) + (( j + 1 ) * strideA2) ] = e[ offsetE + (j * strideE) ];
				}
			} else {
				// Lower bidiagonal: D(j) -> A(j,j), E(j) -> A(j+1,j)
				for ( j = i; j < i + nb; j++ ) {
					A[ offsetA + (j * strideA1) + (j * strideA2) ] = d[ offsetD + (j * strideD) ];
					A[ offsetA + (( j + 1 ) * strideA1) + (j * strideA2) ] = e[ offsetE + (j * strideE) ];
				}
			}

			i += nb;
		}
	}

	// Use unblocked code to factor the last or only block
	dgebd2(M - i, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), d, strideD, offsetD + (i * strideD), e, strideE, offsetE + (i * strideE), TAUQ, strideTAUQ, offsetTAUQ + (i * strideTAUQ), TAUP, strideTAUP, offsetTAUP + (i * strideTAUP), WORK, strideWork, offsetWork);

	return 0;
}


// EXPORTS //

export default dgebrd;
