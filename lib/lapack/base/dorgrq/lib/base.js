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

import dorgr2 from '../../dorgr2/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';


// VARIABLES //

var NB = 32;  // Block size (LAPACK default for DORGRQ)


// MAIN //

/**
* Generates an M-by-N real matrix Q with orthonormal rows from elementary reflectors returned by DGERQF (blocked algorithm).
*
* Q is defined as the last M rows of a product of K elementary reflectors of order N:
*
* `Q = H(1) H(2) ... H(K)`
*
* where each `H(i)` has the form `H(i) = I - tau(i)*v*v^T`, and `v` is stored
* as the (m-k+i)-th row of the input matrix A.
*
* This is the blocked version that uses DLARFT + DLARFB for efficiency on
* large matrices, falling back to DORGR2 for small ones.
*
* ## Notes
*
* -   On entry, the (m-k+i)-th row of A must contain the reflector vector for
* `H(i)`, as returned by DGERQF in the last k rows of A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* -   WORK must have length _>=_ M*NB (where NB is the block size, 32).
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
* @param {Float64Array} WORK - workspace (length >= M*NB)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dorgrq( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ldwork;
	var nbmin;
	var nb;
	var nx;
	var kk;
	var ib;
	var ii;
	var i;
	var j;
	var l;

	if ( M <= 0 ) {
		return 0;
	}

	nbmin = 2;
	nx = 0;
	nb = NB;
	ldwork = M;

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code after the first block.
		// The last kk rows are handled by the block method.
		kk = Math.min( K, ( ( ( ( K - nx + nb - 1 ) / nb ) | 0 ) * nb ) );

		// Set A(0:M-KK-1, N-KK..N-1) to zero

		// Fortran: DO 20 J = N-KK+1, N; DO 10 I = 1, M-KK; A(I,J) = 0
		for ( j = N - kk; j < N; j++ ) {
			for ( i = 0; i < M - kk; i++ ) {
				A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = 0.0;
			}
		}
	} else {
		kk = 0;
	}

	// Use unblocked code for the first or only block
	// Fortran: CALL DORGR2(M-KK, N-KK, K-KK, A, LDA, TAU, WORK, IINFO)
	dorgr2( M - kk, N - kk, K - kk, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

	if ( kk > 0 ) {
		// Use blocked code
		// Fortran: DO 50 I = K - KK + 1, K, NB  (1-based, step +NB)
		// In 0-based: i = K-kk, i < K, step nb
		for ( i = K - kk; i < K; i += nb ) {
			ib = Math.min( nb, K - i );

			// II in Fortran (1-based) = M-K+I, where I is 1-based.

			// 0-based: ii = M-K+i (the row index of the i-th reflector vector)
			ii = M - K + i;

			if ( ii > 0 ) {
				// Form the triangular factor of the block reflector
				// H = H(i+ib-1) ... H(i+1) H(i)
				// Fortran: DLARFT('Backward','Rowwise', N-K+I+IB-1, IB, A(II,1), LDA, TAU(I), WORK, LDWORK)
				// With Fortran 1-based I, N-K+I+IB-1 = N-K+(i+1)+IB-1 = N-K+i+IB in 0-based.
				dlarft( 'backward', 'rowwise', N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, 1, ldwork, offsetWork );

				// Apply H^T to A(0:ii-1, 0:N-K+i+ib-1) from the right

				// Fortran: DLARFB('Right','Transpose','Backward','Rowwise', II-1, N-K+I+IB-1, IB, A(II,1), LDA, WORK, LDWORK, A, LDA, WORK(IB+1), LDWORK)

				// II-1 (Fortran 1-based) = ii (0-based), N-K+I+IB-1 = N-K+i+ib (0-based)
				dlarfb( 'right', 'transpose', 'backward', 'rowwise', ii, N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), WORK, 1, ldwork, offsetWork, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, offsetWork + ib );
			}

			// Apply H^T to columns 0..N-K+i+ib-1 of current block
			// Fortran: DORGR2(IB, N-K+I+IB-1, IB, A(II,1), LDA, TAU(I), WORK, IINFO)
			dorgr2( ib, N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, offsetWork );

			// Set columns N-K+i+ib..N-1 of current block (rows ii..ii+ib-1) to zero

			// Fortran: DO 40 L = N-K+I+IB, N; DO 30 J = II, II+IB-1; A(J,L)=0
			for ( l = N - K + i + ib; l < N; l++ ) {
				for ( j = ii; j < ii + ib; j++ ) {
					A[ offsetA + ( j * strideA1 ) + ( l * strideA2 ) ] = 0.0;
				}
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dorgrq;
