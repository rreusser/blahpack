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
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Computes an LQ factorization of a complex M-by-N matrix A = L * Q.
* using blocked Householder reflections.
*
* The block size adapts to the workspace, as in the reference: the length of
* `WORK` from `offsetWork` (in complex elements) is the reference's `LWORK`. With at
* least `M*NB` (`NB` from `ilaenv`), when `min(M,N)` exceeds the crossover `NX` (also from `ilaenv`), the blocked code uses the full block size; with
* less, `NB` shrinks to `floor( LWORK/M )`, and below `2*M` the
* unblocked code factors the whole matrix. The blocked path stores the
* block-reflector `T` in `WORK(0:IB-1,0:IB-1)` and passes `WORK(IB:)` to
* `zlarfb`, both with leading dimension `M`, as the reference does.
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
* @param {Complex128Array} WORK - workspace of length at least `max(1,M)`; for optimal performance at least `M*NB`, which enables the blocked path
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zgelqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let nx, ldwork, nbmin, iws, nb, ib, i;

	/* @complex-arrays A, TAU, WORK */

	const K = Math.min( M, N );

	// Quick return if possible
	if ( K === 0 ) {
		return 0;
	}

	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	nb = ilaenv( 1, 'ZGELQF', ' ', M, N, -1, -1 );
	nbmin = 2;
	nx = 0;
	iws = M;
	ldwork = M;
	if ( nb > 1 && nb < K ) {
		// Determine when to cross over from blocked to unblocked code
		nx = Math.max( 0, ilaenv( 3, 'ZGELQF', ' ', M, N, -1, -1 ) );
		if ( nx < K ) {
			// Determine if workspace is large enough for blocked code
			iws = ldwork * nb;
			if ( lwork < iws ) {
				// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB
				nb = Math.floor( lwork / ldwork );
				nbmin = Math.max( 2, ilaenv( 2, 'ZGELQF', ' ', M, N, -1, -1 ) );
			}
		}
	}

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
				zlarft('forward', 'rowwise', N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, strideWork * ldwork, offsetWork);

				// Apply H to A(i+ib:M-1, i:N-1) from the right
				zlarfb('right', 'no-transpose', 'forward', 'rowwise', M - i - ib, N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), WORK, strideWork, strideWork * ldwork, offsetWork, A, strideA1, strideA2, offsetA + (( i + ib ) * strideA1) + (i * strideA2), WORK, strideWork, strideWork * ldwork, offsetWork + ( ib * strideWork ) );
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
