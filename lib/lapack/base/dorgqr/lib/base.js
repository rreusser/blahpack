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

import dorg2r from '../../dorg2r/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';


// VARIABLES //

var NB = 32;  // Block size (LAPACK default for DORGQR)


// MAIN //

/**
* Generates an M-by-N real orthogonal matrix Q from the elementary.
* reflectors returned by DGEQRF (QR factorization, blocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(1) H(2) ... H(K)
*
* where each H(i) has the form `H(i) = I - tau(i)*v*v^T`.
*
* This is the blocked version that uses DLARFT + DLARFB for efficiency
* on large matrices, falling back to DORG2R for small ones.
*
* ## Notes
*
* -   On entry, the i-th column of A must contain the reflector vector
* for H(i), as returned by DGEQRF.
*
* -   On exit, A contains the M-by-N orthogonal matrix Q.
*
* -   WORK must be caller-provided with at least `max(1, N*NB)` elements
* where `NB = 32`. The buffer is used for the block-reflector T factor
* (NB x NB, accessed as an N-column matrix) and dlarfb scratch.
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
* @param {Float64Array} WORK - caller-provided workspace (`>= max(1, N*NB)` elements, `NB = 32`)
* @param {integer} strideWork - stride for WORK (must be 1 for 2D T-factor storage)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dorgqr( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ldwork;
	var nb;
	var nx;
	var kk;
	var ki;
	var ib;
	var i;
	var j;
	var l;

	if ( N <= 0 ) {
		return 0;
	}

	nb = NB;
	nx = 0;
	ldwork = N;

	// Determine blocking strategy

	// Use blocked algorithm if NB >= 2 and NB < K
	if ( nb >= 2 && nb < K ) {
		// NX = 0: always use blocked when possible
		nx = 0;

		if ( nx < K ) {
			// KI is the start of the last full block (0-based)
			// KK is the number of columns handled by the blocked part
			ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
			kk = Math.min( K, ki + nb );

			// Zero out first KK rows of columns KK..N-1

			// Fortran: DO 20 J = KK+1, N; DO 10 I = 1, KK; A(I,J) = ZERO
			for ( j = kk; j < N; j++ ) {
				for ( i = 0; i < kk; i++ ) {
					A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
				}
			}
		}
	} else {
		kk = 0;
	}

	// Apply DORG2R to the trailing submatrix (unblocked part)
	if ( kk < N ) {
		dorg2r(M - kk, N - kk, K - kk, A, strideA1, strideA2, offsetA + (kk * strideA1) + (kk * strideA2), TAU, strideTAU, offsetTAU + (kk * strideTAU), WORK, strideWork, offsetWork);
	}

	if ( kk > 0 ) {
		// Process blocks in reverse order
		for ( i = ki; i >= 0; i -= nb ) {
			ib = Math.min( nb, K - i );

			if ( i + ib < N ) {
				// Form the triangular factor T of the block reflector
				dlarft('forward', 'columnwise', M - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, 1, ldwork, offsetWork);

				// Apply H to A(i:M-1, i+ib:N-1) from the left
				dlarfb('left', 'no-transpose', 'forward', 'columnwise', M - i, N - i - ib, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), WORK, 1, ldwork, offsetWork, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + ib ) * strideA2), WORK, 1, ldwork, offsetWork + ib);
			}

			// Apply DORG2R to the current block panel
			dorg2r(M - i, ib, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, 1, offsetWork);

			// Zero out rows 0..i-1 of columns i..i+ib-1

			// Fortran: DO 40 J = I, I+IB-1; DO 30 L = 1, I-1; A(L,J) = ZERO
			for ( j = i; j < i + ib; j++ ) {
				for ( l = 0; l < i; l++ ) {
					A[ offsetA + (l * strideA1) + (j * strideA2) ] = 0.0;
				}
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dorgqr;
