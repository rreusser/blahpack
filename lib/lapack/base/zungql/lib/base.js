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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zung2l from '../../zung2l/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';


// VARIABLES //

var NB = 32;  // Block size (LAPACK default for ZUNGQL)


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q with orthonormal columns.
* which is defined as the last N columns of a product of K elementary
* reflectors of order M
*
* Q = H(K) ... H(2) H(1)
*
* as returned by ZGEQLF (QL factorization, blocked algorithm).
*
* This is the blocked version that uses ZLARFT + ZLARFB for efficiency
* on large matrices, falling back to ZUNG2L for small ones.
*
* ## Notes
*
* -   On entry, the (N-K+i)-th column of A must contain the vector which
* defines the elementary reflector H(i), for i = 1, 2, ..., K, as
* returned by ZGEQLF in the last K columns of its array argument A.
*
* -   On exit, A contains the M-by-N orthogonal matrix Q.
*
* -   WORK is allocated internally with sufficient size (N*NB).
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
* @param {Complex128Array} WORK - workspace (ignored, allocated internally)
* @param {integer} strideWork - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (ignored)
* @returns {integer} status code (0 = success)
*/
function zungql( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var ldwork;
	var work;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var nb;
	var kk;
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
				ia = oA + (i * sa1) + (j * sa2);
				Av[ ia ] = 0.0;
				Av[ ia + 1 ] = 0.0;
			}
		}
	} else {
		kk = 0;
	}

	// Use unblocked code for the first or only block
	// Fortran: CALL ZUNG2L(M-KK, N-KK, K-KK, A, LDA, TAU, WORK, IINFO)
	zung2l(
		M - kk, N - kk, K - kk,
		A, strideA1, strideA2, offsetA,
		TAU, strideTAU, offsetTAU,
		WORK, strideWork, offsetWork
	);

	if ( kk > 0 ) {
		// Allocate internal workspace for zlarft (T matrix) and zlarfb (scratch)
		work = new Complex128Array( ldwork * nb );

		// Process blocks from left to right (in terms of TAU index)

		// Fortran: DO 50 I = K-KK+1, K, NB (1-based)

		// 0-based: i goes from K-kk to K-1, step nb
		for ( i = K - kk; i < K; i += nb ) {
			ib = Math.min( nb, K - i );

			// Fortran column index for this block: N-K+I (1-based) => N-K+i (0-based)
			// Fortran condition: N-K+I > 1 (1-based) => N-K+i > 0 (0-based)
			if ( N - K + i > 0 ) {
				// Form the triangular factor of the block reflector
				// Fortran: ZLARFT('Backward', 'Columnwise', M-K+I+IB-1, IB,
				//                  A(1, N-K+I), LDA, TAU(I), WORK, LDWORK)
				// M-K+I+IB-1 (Fortran 1-based count) = M-K+i+ib (0-based: rows 0..M-K+i+ib-1)
				zlarft(
					'backward', 'columnwise', M - K + i + ib, ib,
					A, strideA1, strideA2, offsetA + (( N - K + i ) * strideA2),
					TAU, strideTAU, offsetTAU + (i * strideTAU),
					work, 1, ldwork, 0
				);

				// Apply H to A(0:M-K+i+ib-1, 0:N-K+i-1) from the left

				// Fortran: ZLARFB('Left', 'No transpose', 'Backward', 'Columnwise',

				//                  M-K+I+IB-1, N-K+I-1, IB, ...)
				zlarfb(
					'left', 'no-transpose', 'backward', 'columnwise',
					M - K + i + ib, N - K + i, ib,
					A, strideA1, strideA2, offsetA + (( N - K + i ) * strideA2),
					work, 1, ldwork, 0,
					A, strideA1, strideA2, offsetA,
					work, 1, ldwork, ib
				);
			}

			// Apply ZUNG2L to the current block
			// Fortran: ZUNG2L(M-K+I+IB-1, IB, IB, A(1, N-K+I), LDA, TAU(I), WORK, IINFO)
			// M-K+I+IB-1 (1-based) = M-K+i+ib (0-based rows)
			zung2l(
				M - K + i + ib, ib, ib,
				A, strideA1, strideA2, offsetA + (( N - K + i ) * strideA2),
				TAU, strideTAU, offsetTAU + (i * strideTAU),
				work, 1, 0
			);

			// Set rows M-K+i+ib to M-1 of columns N-K+i to N-K+i+ib-1 to zero

			// Fortran: DO 40 J = N-K+I, N-K+I+IB-1; DO 30 L = M-K+I+IB, M
			for ( j = N - K + i; j < N - K + i + ib; j++ ) {
				for ( l = M - K + i + ib; l < M; l++ ) {
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

export default zungql;
