/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungl2 from '../../zungl2/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q from the elementary.
* reflectors returned by ZGELQF (LQ factorization, blocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(K)^H ... H(2)^H H(1)^H
*
* This is the blocked version that uses ZLARFT + ZLARFB for efficiency
* on large matrices, falling back to ZUNGL2 for small ones.
*
* ## Notes
*
* -   On entry, the i-th row of A must contain the reflector vector
* for H(i), as returned by ZGELQF.
*
* -   On exit, A contains the M-by-N unitary matrix Q.
*
* -   WORK must have at least `max(1,M)` elements. For optimum performance it
* should have at least `M*NB` elements (`NB = 32`), which enables the blocked
* path when `K` exceeds the crossover point `NX = 128`; with less, the block size is reduced to `floor(LWORK/M)`, and the
* unblocked code is used when that is below 2.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace of length at least `max(1,M)`; `M*NB` (`NB = 32`) enables the blocked path when `K > 128`
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zunglq( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let nbmin, nb, nx, kk = NaN, ki = NaN, ib = NaN, ia = NaN, i = NaN, j = NaN, l = NaN;

	/* @complex-arrays A, TAU, WORK */

	if ( M <= 0 ) {
		return 0;
	}

	const Av = reinterpret( A, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;

	// JS LWORK: the workspace length available from offsetWork
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	// Determine the block size
	nb = ilaenv( 1, 'ZUNGLQ', ' ', M, N, K, -1 );
	nbmin = 2;
	nx = 0;
	const ldwork = M;
	if ( nb > 1 && nb < K ) {
		// Determine when to cross over from blocked to unblocked code
		nx = Math.max( 0, ilaenv( 3, 'ZUNGLQ', ' ', M, N, K, -1 ) );
		if ( nx < K ) {
			// IWS = LDWORK*NB: not enough workspace for the optimal NB, so reduce it
			if ( lwork < ldwork * nb ) {
				nb = Math.floor( lwork / ldwork );
				nbmin = Math.max( 2, ilaenv( 2, 'ZUNGLQ', ' ', M, N, K, -1 ) );
			}
		}
	}

	if ( nb >= nbmin && nb < K && nx < K ) {
		// KI is the start of the last full block (0-based); KK is the number of columns handled by the blocked part
		ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Zero out rows KK..M-1 of columns 0..KK-1

		// Fortran: DO 20 J = 1, KK; DO 10 I = KK+1, M; A(I,J)=ZERO
		for ( j = 0; j < kk; j++ ) {
			for ( i = kk; i < M; i++ ) {
				ia = oA + (i * sa1) + (j * sa2);
				Av[ ia ] = 0.0;
				Av[ ia + 1 ] = 0.0;
			}
		}
	} else {
		kk = 0;
	}

	// Apply ZUNGL2 to the trailing submatrix (unblocked part)
	if ( kk < M ) {
		zungl2(
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

			if ( i + ib < M ) {
				// Form the triangular factor of the block reflector
				// ZLARFT('Forward', 'Rowwise', N-I+1, IB, A(I,I), LDA, TAU(I), WORK, LDWORK)
				zlarft(
					'forward', 'rowwise', N - i, ib,
					A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					TAU, strideTAU, offsetTAU + (i * strideTAU),
					WORK, 1, ldwork, offsetWork
				);

				// Apply H to A(i+ib:M-1, i:N-1) from the right

				// ZLARFB('Right', 'Conjugate transpose', 'Forward', 'Rowwise',

				//         M-I-IB+1, N-I+1, IB, A(I,I), LDA, WORK, LDWORK,

				//         A(I+IB,I), LDA, WORK(IB+1), LDWORK)
				zlarfb(
					'right', 'conjugate-transpose', 'forward', 'rowwise',
					M - i - ib, N - i, ib,
					A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					WORK, 1, ldwork, offsetWork,
					A, strideA1, strideA2, offsetA + (( i + ib ) * strideA1) + (i * strideA2),
					WORK, 1, ldwork, offsetWork + ib
				);
			}

			// Apply ZUNGL2 to the current block panel
			// ZUNGL2(IB, N-I+1, IB, A(I,I), LDA, TAU(I), WORK, IINFO)
			zungl2(
				ib, N - i, ib,
				A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2),
				TAU, strideTAU, offsetTAU + (i * strideTAU),
				WORK, strideWork, offsetWork
			);

			// Zero out columns 0..i-1 of rows i..i+ib-1

			// Fortran: DO 40 J = 1, I-1; DO 30 L = I, I+IB-1; A(L,J)=ZERO
			for ( j = 0; j < i; j++ ) {
				for ( l = i; l < i + ib; l++ ) {
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

export default zunglq;
