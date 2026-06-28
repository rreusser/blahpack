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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorg2l from '../../dorg2l/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';


// VARIABLES //

var NB = 32;  // Block size (LAPACK default for DORGQL)


// MAIN //

/**
* Generates an M-by-N real orthogonal matrix Q with orthonormal columns.
* which is defined as the last N columns of a product of K elementary
* reflectors of order M
*
* Q = H(K) ... H(2) H(1)
*
* as returned by DGEQLF (QL factorization, blocked algorithm).
*
* This is the blocked version that uses DLARFT + DLARFB for efficiency
* on large matrices, falling back to DORG2L for small ones.
*
* ## Notes
*
* -   On entry, the (N-K+i)-th column of A must contain the vector which
* defines the elementary reflector H(i), for i = 1, 2, ..., K, as
* returned by DGEQLF in the last K columns of its array argument A.
*
* -   On exit, A contains the M-by-N orthogonal matrix Q.
*
* -   WORK is allocated internally with sufficient size (N*NB).
* The lwork parameter and WORK/strideWork/offsetWork are kept for
* API compatibility but not used.
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
* @param {Float64Array} WORK - workspace (ignored, allocated internally)
* @param {integer} strideWork - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (ignored)
* @returns {integer} status code (0 = success)
*/
function dorgql( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ldwork;
	var work;
	var nb;
	var kk;
	var ib;
	var i;
	var j;
	var l;

	if ( N <= 0 ) {
		return 0;
	}

	nb = NB;
	ldwork = N;

	// Determine blocking strategy: use blocked if NB >= 2 and NB < K
	if ( nb >= 2 && nb < K ) {
		// KK = number of columns handled by blocked part
		// Fortran: KK = MIN(K, ((K-NX+NB-1)/NB)*NB) with NX=0
		kk = Math.min( K, Math.floor( ( K + nb - 1 ) / nb ) * nb );

		// Set A(M-KK:M-1, 0:N-KK-1) to zero

		// Fortran: DO 20 J = 1, N-KK; DO 10 I = M-KK+1, M
		for ( j = 0; j < N - kk; j++ ) {
			for ( i = M - kk; i < M; i++ ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
			}
		}
	} else {
		kk = 0;
	}

	// Use unblocked code for the first or only block
	// Fortran: CALL DORG2L(M-KK, N-KK, K-KK, A, LDA, TAU, WORK, IINFO)
	// A starts at A(1,1) in Fortran = A(0,0) in 0-based, no offset change needed
	dorg2l(M - kk, N - kk, K - kk, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork);

	if ( kk > 0 ) {
		// Allocate internal workspace for dlarft (T matrix) and dlarfb (scratch)
		work = new Float64Array( ldwork * nb );

		// Process blocks from left to right (in terms of TAU index)

		// Fortran: DO 50 I = K-KK+1, K, NB (1-based)

		// 0-based: i goes from K-kk to K-1, step nb
		for ( i = K - kk; i < K; i += nb ) {
			ib = Math.min( nb, K - i );

			// Fortran column index for this block: N-K+I (1-based) => N-K+i (0-based)
			// Fortran condition: N-K+I > 1 (1-based) => N-K+i > 0 (0-based)
			if ( N - K + i > 0 ) {
				// Form the triangular factor of the block reflector
				// H = H(i+ib-1) ... H(i+1) H(i)
				// Fortran: DLARFT('Backward', 'Columnwise', M-K+I+IB-1, IB,
				//                  A(1, N-K+I), LDA, TAU(I), WORK, LDWORK)
				// M-K+I+IB-1 (Fortran 1-based count) = M-K+i+ib (0-based: rows 0..M-K+i+ib-1)
				dlarft('backward', 'columnwise', M - K + i + ib, ib, A, strideA1, strideA2, offsetA + (( N - K + i ) * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), work, 1, ldwork, 0);

				// Apply H to A(0:M-K+i+ib-1, 0:N-K+i-1) from the left

				// Fortran: DLARFB('Left', 'No transpose', 'Backward', 'Columnwise',

				//                  M-K+I+IB-1, N-K+I-1, IB,

				//                  A(1, N-K+I), LDA, WORK, LDWORK,

				//                  A, LDA, WORK(IB+1), LDWORK)

				// M-K+I+IB-1 (1-based count) = M-K+i+ib (0-based rows)

				// N-K+I-1 (1-based count) = N-K+i (0-based cols)
				dlarfb('left', 'no-transpose', 'backward', 'columnwise', M - K + i + ib, N - K + i, ib, A, strideA1, strideA2, offsetA + (( N - K + i ) * strideA2), work, 1, ldwork, 0, A, strideA1, strideA2, offsetA, work, 1, ldwork, ib);
			}

			// Apply DORG2L to the current block
			// Fortran: DORG2L(M-K+I+IB-1, IB, IB, A(1, N-K+I), LDA, TAU(I), WORK, IINFO)
			// M-K+I+IB-1 (1-based) = M-K+i+ib (0-based rows)
			dorg2l(M - K + i + ib, ib, ib, A, strideA1, strideA2, offsetA + (( N - K + i ) * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), work, 1, 0);

			// Set rows M-K+i+ib to M-1 of columns N-K+i to N-K+i+ib-1 to zero

			// Fortran: DO 40 J = N-K+I, N-K+I+IB-1; DO 30 L = M-K+I+IB, M

			// 0-based: j = N-K+i..N-K+i+ib-1, l = M-K+i+ib..M-1
			for ( j = N - K + i; j < N - K + i + ib; j++ ) {
				for ( l = M - K + i + ib; l < M; l++ ) {
					A[ offsetA + (l * strideA1) + (j * strideA2) ] = 0.0;
				}
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dorgql;
