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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zung2r from '../../zung2r/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';


// VARIABLES //

var NB = 32;  // Block size (LAPACK default for ZUNGQR)


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q from the elementary.
* reflectors returned by ZGEQRF (QR factorization, blocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(1) H(2) ... H(K)
*
* This is the blocked version that uses ZLARFT + ZLARFB for efficiency
* on large matrices, falling back to ZUNG2R for small ones.
*
* ## Notes
*
* -   On entry, the i-th column of A must contain the reflector vector
* for H(i), as returned by ZGEQRF.
*
* -   On exit, A contains the M-by-N unitary matrix Q.
*
* -   WORK must have length >= N*NB (where NB is the block size, 32).
* The lwork parameter is ignored in this implementation; WORK is
* assumed to be large enough.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (length >= N*NB)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zungqr( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ldwork;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var nb;
	var nx;
	var kk;
	var ki;
	var ib;
	var ia;
	var i;
	var j;
	var l;

	/* @complex-arrays A, TAU, WORK */

	if ( N <= 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	nb = NB;
	nx = 0;
	ldwork = N;

	// Determine blocking strategy

	// Use blocked algorithm if NB >= 2 and NB < K
	if ( nb >= 2 && nb < K ) {
		// Use crossover point NX = 0 (always use blocked when possible)
		nx = 0;

		if ( nx < K ) {
			// KI is the index of the start of the last full block
			// KK is the number of columns handled by the blocked part
			ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
			kk = Math.min( K, ki + nb );

			// Zero out first KK rows of columns KK..N-1

			// Fortran: DO 20 J = KK+1, N; DO 10 I = 1, KK; A(I,J)=ZERO
			for ( j = kk; j < N; j++ ) {
				for ( i = 0; i < kk; i++ ) {
					ia = oA + (i * sa1) + (j * sa2);
					Av[ ia ] = 0.0;
					Av[ ia + 1 ] = 0.0;
				}
			}
		}
	} else {
		kk = 0;
	}

	// Apply ZUNG2R to the trailing submatrix (unblocked part)
	if ( kk < N ) {
		zung2r(
			M - kk, N - kk, K - kk,
			A, strideA1, strideA2, offsetA + (kk * strideA1) + (kk * strideA2),
			TAU, strideTAU, offsetTAU + (kk * strideTAU),
			WORK, strideWork, offsetWork
		);
	}

	if ( kk > 0 ) {
		// Process blocks in reverse order
		// Fortran: DO 50 I = KI+1, 1, -NB (1-based)
		// In 0-based: i goes from ki down to 0, step -nb
		for ( i = ki; i >= 0; i -= nb ) {
			ib = Math.min( nb, K - i );

			if ( i + ib < N ) {
				// Form the triangular factor of the block reflector
				// ZLARFT('Forward', 'Columnwise', M-I+1, IB, A(I,I), LDA, TAU(I), WORK, LDWORK)
				zlarft(
					'forward', 'columnwise', M - i, ib,
					A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					TAU, strideTAU, offsetTAU + (i * strideTAU),
					WORK, 1, ldwork, offsetWork
				);

				// Apply H to A(i:M-1, i+ib:N-1) from the left

				// ZLARFB('Left', 'No transpose', 'Forward', 'Columnwise',

				//         M-I+1, N-I-IB+1, IB, A(I,I), LDA, WORK, LDWORK,

				//         A(I,I+IB), LDA, WORK(IB+1), LDWORK)
				zlarfb(
					'left', 'no-transpose', 'forward', 'columnwise',
					M - i, N - i - ib, ib,
					A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					WORK, 1, ldwork, offsetWork,
					A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + ib ) * strideA2),
					WORK, 1, ldwork, offsetWork + ib
				);
			}

			// Apply ZUNG2R to the current block panel
			// ZUNG2R(M-I+1, IB, IB, A(I,I), LDA, TAU(I), WORK, IINFO)
			zung2r(
				M - i, ib, ib,
				A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2),
				TAU, strideTAU, offsetTAU + (i * strideTAU),
				WORK, strideWork, offsetWork
			);

			// Zero out rows 0..i-1 of columns i..i+ib-1

			// Fortran: DO 40 J = I, I+IB-1; DO 30 L = 1, I-1; A(L,J)=ZERO
			for ( j = i; j < i + ib; j++ ) {
				for ( l = 0; l < i; l++ ) {
					ia = oA + (l * sa1) + (j * sa2);
					Av[ ia ] = 0.0;
					Av[ ia + 1 ] = 0.0;
				}
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zungqr;
