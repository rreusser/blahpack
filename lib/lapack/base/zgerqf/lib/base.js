/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import zgerq2 from '../../zgerq2/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes an RQ factorization of a complex M-by-N matrix A = R * Q using blocked Householder reflections.
*
* On exit, if M <= N, the upper triangle of the subarray A(0:M-1, N-M:N-1) contains the M-by-M upper triangular matrix R; if M >= N, the elements on and above the (M-N)-th subdiagonal contain the M-by-N upper trapezoidal matrix R; the remaining elements, with the array TAU, represent the unitary matrix Q.
*
* ## Workspace
*
* The block size adapts to the workspace, as in the reference: the length (in complex elements) of `WORK` from `offsetWork` is the reference's `LWORK`. With at least `M*NB` elements (`NB = 32`) the blocked code uses the full block size; with less, `NB` shrinks to `floor( LWORK/M )`, and below `2*M` the unblocked code factors the whole matrix. The blocked path stores the block-reflector `T` in `WORK(0:IB-1,0:IB-1)` and passes `WORK(IB:)` to `zlarfb`, both with leading dimension `M`, as the reference does.
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors (length `min(M,N)`)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - workspace of length at least `max(1,M)`; for optimal performance at least `M*NB`, which enables the blocked path
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zgerqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let nbmin, iws, ib, mu, nu, ki, kk, nb, i;

	const K = Math.min( M, N );
	if ( K === 0 ) {
		return 0;
	}

	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	nb = DEFAULT_NB;
	nbmin = 2;
	const nx = 0;
	iws = M;
	const ldwork = M;

	if ( nb > 1 && nb < K ) {
		// Determine if workspace is large enough for blocked code
		iws = ldwork * nb;
		if ( lwork < iws ) {
			// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB
			nb = Math.floor( lwork / ldwork );
			nbmin = 2;
		}
	}

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code initially (Fortran: KI = ((K-NX-1)/NB)*NB; KK = MIN(K, KI+NB))
		ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Fortran DO 10 I = K-KK+KI+1, K-KK+1, -NB (1-based); 0-based: i starts at K-kk+ki, ends (inclusive) at K-kk, step -nb
		i = K - kk + ki;
		while ( i >= K - kk ) {
			ib = Math.min( K - i, nb );

			// Compute the RQ factorization of the current block A( M-K+i:M-K+i+ib-1, 0:N-K+i+ib-1 ); panel has ib rows and (N-K+i+ib) columns
			zgerq2( ib, N - K + i + ib, A, strideA1, strideA2, offsetA + ( ( M - K + i ) * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, offsetWork );

			if ( M - K + i > 0 ) {
				// Form the triangular factor of the block reflector H = H(i+ib-1) ... H(i+1) H(i) (backward, rowwise) in WORK(0:ib-1,0:ib-1)
				zlarft( 'backward', 'rowwise', N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( M - K + i ) * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, strideWork * ldwork, offsetWork );

				// Apply H to A( 0:M-K+i-1, 0:N-K+i+ib-1 ) from the right, with WORK(ib:) as the update workspace
				zlarfb( 'right', 'no-transpose', 'backward', 'rowwise', M - K + i, N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( M - K + i ) * strideA1 ), WORK, strideWork, strideWork * ldwork, offsetWork, A, strideA1, strideA2, offsetA, WORK, strideWork, strideWork * ldwork, offsetWork + ( ib * strideWork ) );
			}
			i -= nb;
		}

		// Fortran post-loop: I = K-KK+1-NB (1-based), so MU = M-K+I+NB-1 = M-KK and NU = N-K+I+NB-1 = N-KK
		mu = M - kk;
		nu = N - kk;
	} else {
		mu = M;
		nu = N;
	}

	// Use unblocked code to factor the last or only block
	if ( mu > 0 && nu > 0 ) {
		zgerq2( mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	return 0;
}


// EXPORTS //

export default zgerqf;
