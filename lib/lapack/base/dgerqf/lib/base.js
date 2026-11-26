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

import dgerq2 from '../../dgerq2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Computes an RQ factorization of a real M-by-N matrix A = R * Q.
* using blocked Householder reflections.
*
* On exit, if M <= N, the upper triangle of the subarray
* A(0:M-1, N-M:N-1) contains the M-by-M upper triangular matrix R;
* if M >= N, the elements on and above the (M-N)-th subdiagonal
* contain the M-by-N upper trapezoidal matrix R; the remaining
* elements, with the array TAU, represent the orthogonal matrix Q.
*
* The block size adapts to the workspace, as in the reference: the length of
* `WORK` from `offsetWork` is the reference's `LWORK`. With at least `M*NB`
* elements (`NB` from `ilaenv`), when `min(M,N)` exceeds the crossover `NX` (also from `ilaenv`), the blocked code uses the full block size; with less,
* `NB` shrinks to `floor( LWORK/M )`, and below `2*M` the unblocked code factors
* the whole matrix. The blocked path stores the block-reflector `T` in
* `WORK(0:IB-1,0:IB-1)` and passes `WORK(IB:)` to `dlarfb`, both with leading
* dimension `M`, as the reference does.
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors (length min(M,N))
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace of length at least `max(1,M)`; for optimal performance at least `M*NB`, which enables the blocked path
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgerqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let nbmin, iws, ib, nx, ki, kk, mu, nu, nb, i;

	const K = Math.min( M, N );

	// Quick return if possible
	if ( K === 0 ) {
		return 0;
	}

	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	nb = ilaenv( 1, 'DGERQF', ' ', M, N, -1, -1 );
	nbmin = 2;
	nx = 1;
	iws = M;
	const ldwork = M;

	if ( nb > 1 && nb < K ) {
		// Determine when to cross over from blocked to unblocked code
		nx = Math.max( 0, ilaenv( 3, 'DGERQF', ' ', M, N, -1, -1 ) );
		if ( nx < K ) {
			// Determine if workspace is large enough for blocked code
			iws = ldwork * nb;
			if ( lwork < iws ) {
				// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB
				nb = Math.floor( lwork / ldwork );
				nbmin = Math.max( 2, ilaenv( 2, 'DGERQF', ' ', M, N, -1, -1 ) );
			}
		}
	}

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code initially.
		// The last kk rows are handled by the block method.
		ki = Math.floor( (K - nx - 1) / nb ) * nb;
		kk = Math.min( K, ki + nb );

		// Iterate backward over blocks

		// Fortran: DO I = K-KK+KI+1, K-KK+1, -NB (1-based)

		// 0-based: i goes from K-kk+ki down to K-kk, step -nb
		for ( i = K - kk + ki; i >= K - kk; i -= nb ) {
			ib = Math.min( K - i, nb );

			// Compute the RQ factorization of the current block

			// A(m-k+i : m-k+i+ib-1, 0 : n-k+i+ib-1)
			dgerq2(ib, N - K + i + ib, A, strideA1, strideA2, offsetA + ((M - K + i) * strideA1), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);

			if ( M - K + i > 0 ) {
				// Form the triangular factor of the block reflector
				// H = H(i+ib-1) ... H(i+1) H(i) in WORK(0:ib-1,0:ib-1)
				dlarft('backward', 'rowwise', N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ((M - K + i) * strideA1), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, strideWork * ldwork, offsetWork);

				// Apply H to A(0:m-k+i-1, 0:n-k+i+ib-1) from the right, with WORK(ib:) as the update workspace
				dlarfb('right', 'no-transpose', 'backward', 'rowwise', M - K + i, N - K + i + ib, ib, A, strideA1, strideA2, offsetA + ((M - K + i) * strideA1), WORK, strideWork, strideWork * ldwork, offsetWork, A, strideA1, strideA2, offsetA, WORK, strideWork, strideWork * ldwork, offsetWork + (ib * strideWork));
			}
		}
		mu = M - K + i + nb;
		nu = N - K + i + nb;
	} else {
		mu = M;
		nu = N;
	}

	// Use unblocked code to factor the last or only block
	if ( mu > 0 && nu > 0 ) {
		dgerq2(mu, nu, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default dgerqf;
