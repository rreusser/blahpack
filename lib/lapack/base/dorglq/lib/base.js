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

import dorgl2 from '../../dorgl2/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';


// VARIABLES //

var NB = 32;  // Block size (LAPACK default for DORGLQ)


// MAIN //

/**
* Generates an M-by-N real orthogonal matrix Q from the elementary.
* reflectors returned by DGELQF (LQ factorization, blocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(K) ... H(2) H(1)
*
* where each H(i) has the form `H(i) = I - tau(i)*v*v^T`, and v is
* stored as row i of the input matrix A.
*
* This is the blocked version that uses DLARFT + DLARFB for efficiency
* on large matrices, falling back to DORGL2 for small ones.
*
* ## Notes
*
* -   On entry, the i-th row of A must contain the reflector vector
* for H(i), as returned by DGELQF.
*
* -   On exit, A contains the M-by-N orthogonal matrix Q.
*
* -   WORK must have length >= M*NB (where NB is the block size, 32).
* The lwork parameter is ignored in this implementation; WORK is
* assumed to be large enough.
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
* @param {Float64Array} WORK - workspace (length >= M*NB)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dorglq( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ldwork;
	var nb;
	var nx;
	var kk;
	var ki;
	var ib;
	var i;
	var j;
	var l;

	if ( M <= 0 ) {
		return 0;
	}

	nb = NB;
	nx = 0;
	ldwork = M;

	// Determine blocking strategy
	if ( nb >= 2 && nb < K ) {
		nx = 0;

		if ( nx < K ) {
			ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
			kk = Math.min( K, ki + nb );

			// Zero out rows KK..M-1 of columns 0..KK-1

			// Fortran: DO 20 J = 1, KK; DO 10 I = KK+1, M; A(I,J)=ZERO
			for ( j = 0; j < kk; j++ ) {
				for ( i = kk; i < M; i++ ) {
					A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
				}
			}
		}
	} else {
		kk = 0;
	}

	// Apply DORGL2 to the trailing submatrix (unblocked part)
	if ( kk < M ) {
		dorgl2(M - kk, N - kk, K - kk, A, strideA1, strideA2, offsetA + (kk * strideA1) + (kk * strideA2), TAU, strideTAU, offsetTAU + (kk * strideTAU), WORK, strideWork, offsetWork);
	}

	if ( kk > 0 ) {
		// Process blocks in reverse order
		// Fortran: DO 50 I = KI+1, 1, -NB (1-based)
		// In 0-based: i goes from ki down to 0, step -nb
		for ( i = ki; i >= 0; i -= nb ) {
			ib = Math.min( nb, K - i );

			if ( i + ib < M ) {
				// Form the triangular factor of the block reflector
				// DLARFT('Forward', 'Rowwise', N-I+1, IB, A(I,I), LDA, TAU(I), WORK, LDWORK)
				// Fortran N-I+1 with 1-based I => JS N-i with 0-based i
				dlarft('forward', 'rowwise', N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, 1, ldwork, offsetWork);

				// Apply H to A(i+ib:M-1, i:N-1) from the right

				// DLARFB('Right', 'Transpose', 'Forward', 'Rowwise',

				//         M-I-IB+1, N-I+1, IB, A(I,I), LDA, WORK, LDWORK,

				//         A(I+IB,I), LDA, WORK(IB+1), LDWORK)
				dlarfb('right', 'transpose', 'forward', 'rowwise', M - i - ib, N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), WORK, 1, ldwork, offsetWork, A, strideA1, strideA2, offsetA + (( i + ib ) * strideA1) + (i * strideA2), WORK, 1, ldwork, offsetWork + ib);
			}

			// Apply DORGL2 to the current block panel
			// DORGL2(IB, N-I+1, IB, A(I,I), LDA, TAU(I), WORK, IINFO)
			dorgl2(ib, N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);

			// Zero out columns 0..i-1 of rows i..i+ib-1

			// Fortran: DO 40 J = 1, I-1; DO 30 L = I, I+IB-1; A(L,J)=ZERO
			for ( j = 0; j < i; j++ ) {
				for ( l = i; l < i + ib; l++ ) {
					A[ offsetA + (l * strideA1) + (j * strideA2) ] = 0.0;
				}
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dorglq;
