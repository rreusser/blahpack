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

import zgelq2 from '../../zgelq2/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes an LQ factorization of a complex M-by-N matrix A = L * Q.
* using blocked Householder reflections.
*
* The caller must supply WORK as a `Complex128Array` of size at least
* `M*NB + NB*NB` complex elements (with `NB = 32`) when the blocked path
* is taken (i.e., `min(M,N) > NB`). The buffer is partitioned so that
* `WORK[offsetWork .. offsetWork + M*NB - 1]` holds the `zlarfb` block
* update workspace (logical leading dimension `M`) and
* `WORK[offsetWork + M*NB .. offsetWork + M*NB + NB*NB - 1]` holds the
* `NB`-by-`NB` block-reflector `T` factor. For the unblocked path
* (`min(M,N) <= NB`), only `M` complex elements are required. base.js never
* allocates — the caller owns and sizes the buffer (enables batch reuse).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - caller-provided workspace (see size formula above)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zgelqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let iws, ib, i;

	/* @complex-arrays A, TAU, WORK, T */

	const K = Math.min( M, N );

	// Quick return if possible
	if ( K === 0 ) {
		return 0;
	}

	const nb = DEFAULT_NB;
	const nbmin = 2;
	const nx = 0;
	iws = M;
	const ldwork = M;

	// Partition the caller-owned WORK: WORK[offsetWork .. offsetWork+iws-1] is
	// the block-update scratch (logical leading dimension `ldwork = M`) and
	// WORK[offsetWork+iws ..] holds the NB-by-NB block-reflector T factor.
	// base.js never allocates — the caller owns and sizes the buffer.
	const T = WORK;

	if ( nb > 1 && nb < K ) {
		iws = ldwork * nb;
	}
	const offsetT = offsetWork + iws;

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code
		i = 0;
		while ( i <= K - 1 - nx ) {
			ib = Math.min( K - i, nb );

			// Compute the LQ factorization of the current panel A(i:i+ib-1, i:N-1)
			zgelq2(ib, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);

			if ( i + ib < M ) {
				// Form the triangular factor of the block reflector
				// H = H(i) H(i+1) ... H(i+ib-1)
				zlarft('forward', 'rowwise', N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), T, 1, nb, offsetT);

				// Apply H to A(i+ib:M-1, i:N-1) from the right
				zlarfb('right', 'no-transpose', 'forward', 'rowwise', M - i - ib, N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), T, 1, nb, offsetT, A, strideA1, strideA2, offsetA + (( i + ib ) * strideA1) + (i * strideA2), WORK, 1, ldwork, offsetWork);
			}
			i += nb;
		}
	} else {
		i = 0;
	}

	// Use unblocked code to factor the last or only block
	if ( i <= K - 1 ) {
		zgelq2(M - i, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default zgelqf;
