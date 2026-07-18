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

import zgeql2 from '../../zgeql2/lib/base.js';
import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QL factorization of a complex M-by-N matrix A = Q * L using blocked Householder reflections.
*
* ## Workspace
*
* WORK is a caller-provided `Complex128Array`. The required length (in complex elements) is `max( 1, N*NB + NB*NB )` with `NB = 32`, partitioned as `WORK[0:N*NB]` for the `zlarfb` trailing-submatrix update (an `N x NB` matrix with leading dimension `N`) followed by `WORK[N*NB:N*NB+NB*NB]` for the `NB x NB` triangular factor `T` built by `zlarft`.
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
* @param {Complex128Array} WORK - caller-provided workspace (length `>= max(1, N*NB + NB*NB)` with `NB = 32`)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zgeqlf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let iws, ib, mu, nu, ki, kk, i;

	const K = Math.min( M, N );
	if ( K === 0 ) {
		return 0;
	}

	const nb = DEFAULT_NB;
	const nbmin = 2;
	const nx = 0;
	iws = N;
	const ldwork = N;

	const T = WORK;

	if ( nb > 1 && nb < K ) {
		iws = ldwork * nb;
	}
	const offsetT = offsetWork + iws;

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code initially (Fortran: KI = ((K-NX-1)/NB)*NB; KK = MIN(K, KI+NB))
		ki = Math.floor( ( K - nx - 1 ) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Fortran DO 10 I = K-KK+KI+1, K-KK+1, -NB (1-based); 0-based: i starts at K-kk+ki, ends (inclusive) at K-kk, step -nb
		i = K - kk + ki;
		while ( i >= K - kk ) {
			ib = Math.min( K - i, nb );

			// Compute the QL factorization of the current block A( 0:M-K+i+ib-1, N-K+i:N-K+i+ib-1 ); panel has (M-K+i+ib) rows and ib columns
			zgeql2( M - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), WORK, strideWork, offsetWork );

			if ( N - K + i > 0 ) {
				// Form the triangular factor of the block reflector H = H(i+ib-1) ... H(i+1) H(i) (backward, columnwise)
				zlarft( 'backward', 'columnwise', M - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), T, 1, nb, offsetT );

				// Apply H^H to A( 0:M-K+i+ib-1, 0:N-K+i-1 ) from the left
				zlarfb( 'left', 'conjugate-transpose', 'backward', 'columnwise', M - K + i + ib, N - K + i, ib, A, strideA1, strideA2, offsetA + ( ( N - K + i ) * strideA2 ), T, 1, nb, offsetT, A, strideA1, strideA2, offsetA, WORK, 1, ldwork, offsetWork );
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
		zgeql2( mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	return 0;
}


// EXPORTS //

export default zgeqlf;
