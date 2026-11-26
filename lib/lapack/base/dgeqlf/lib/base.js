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

import dgeql2 from '../../dgeql2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Computes a QL factorization of a real M-by-N matrix A = Q * L using blocked Householder reflections.
*
* ## Workspace
*
* The block size adapts to the workspace, as in the reference: the length of `WORK` from `offsetWork` is the reference's `LWORK`. With at least `N*NB` elements (`NB` from `ilaenv`), when `min(M,N)` exceeds the crossover `NX` (also from `ilaenv`), the blocked code uses the full block size; with less, `NB` shrinks to `floor( LWORK/N )`, and below `2*N` the unblocked code factors the whole matrix. The blocked path stores the block-reflector `T` in `WORK(0:IB-1,0:IB-1)` and passes `WORK(IB:)` to `dlarfb`, both with leading dimension `N`, as the reference does.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - workspace of length at least `max(1,N)`; for optimal performance at least `N*NB`, which enables the blocked path
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dgeqlf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let nx, nbmin, iws, ib, mu, nu, ki, kk, nb, i;

	const K = Math.min( M, N );
	if ( K === 0 ) {
		return 0;
	}

	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	nb = ilaenv( 1, 'DGEQLF', ' ', M, N, -1, -1 );
	nbmin = 2;
	nx = 1;
	iws = N;
	const ldwork = N;

	if ( nb > 1 && nb < K ) {
		// Determine when to cross over from blocked to unblocked code
		nx = Math.max( 0, ilaenv( 3, 'DGEQLF', ' ', M, N, -1, -1 ) );
		if ( nx < K ) {
			// Determine if workspace is large enough for blocked code
			iws = ldwork * nb;
			if ( lwork < iws ) {
				// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB
				nb = Math.floor( lwork / ldwork );
				nbmin = Math.max( 2, ilaenv( 2, 'DGEQLF', ' ', M, N, -1, -1 ) );
			}
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

			// Compute the QL factorization of the current block A( 0:M-K+i+ib-1, N-K+i:N-K+i+ib-1 ); panel has (M-K+i+ib) rows and ib columns
			dgeql2( M - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, offsetWork );

			if ( N - K + i > 0 ) {
				// Form the triangular factor of the block reflector H = H(i+ib-1) ... H(i+1) H(i) (backward, columnwise) in WORK(0:ib-1,0:ib-1)
				dlarft( 'backward', 'columnwise', M - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, strideWork * ldwork, offsetWork );

				// Apply H^T to A( 0:M-K+i+ib-1, 0:N-K+i-1 ) from the left, with WORK(ib:) as the update workspace
				dlarfb( 'left', 'transpose', 'backward', 'columnwise', M - K + i + ib, N - K + i, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), WORK, strideWork, strideWork * ldwork, offsetWork, A, strideA1, strideA2, offsetA, WORK, strideWork, strideWork * ldwork, offsetWork + ( ib * strideWork ) );
			}
			i -= nb;
		}

		// Fortran post-loop: I = K-KK+1-NB (1-based), so MU = M-K+I+NB-1 = M-KK and NU = N-KK
		mu = M - kk;
		nu = N - kk;
	} else {
		mu = M;
		nu = N;
	}

	// Use unblocked code to factor the last or only block
	if ( mu > 0 && nu > 0 ) {
		dgeql2( mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	return 0;
}


// EXPORTS //

export default dgeqlf;
