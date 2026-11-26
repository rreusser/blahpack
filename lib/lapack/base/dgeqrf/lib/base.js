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

import dgeqr2 from '../../dgeqr2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization of a real M-by-N matrix A = Q * R.
* using blocked Householder reflections.
*
* The block size adapts to the workspace, as in the reference: the length of
* `WORK` from `offsetWork` is the reference's `LWORK`. With at least `N*NB`
* elements (`NB = 32`) the blocked code uses the full block size; with less,
* `NB` shrinks to `floor( LWORK/N )`, and below `2*N` the unblocked code factors
* the whole matrix. The blocked path stores the block-reflector `T` in
* `WORK(0:IB-1,0:IB-1)` and passes `WORK(IB:)` to `dlarfb`, both with leading
* dimension `N`, as the reference does.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace of length at least `max(1,N)`; for optimal performance at least `N*NB`, which enables the blocked path
* @param {integer} strideWork - stride length for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let ldwork, nbmin, iws, nb, ib, i;

	const K = Math.min( M, N );
	if ( K === 0 ) {
		return 0;
	}
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	nb = DEFAULT_NB;
	nbmin = 2;
	const nx = 0;
	iws = N;
	ldwork = N;
	if ( nb > 1 && nb < K ) {
		// Determine if workspace is large enough for blocked code
		ldwork = N;
		iws = ldwork * nb;
		if ( lwork < iws ) {
			// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB
			nb = Math.floor( lwork / ldwork );
			nbmin = 2;
		}
	}

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code initially
		i = 0;
		while ( i <= K - 1 - nx ) {
			ib = Math.min( K - i, nb );

			// Compute the QR factorization of the current panel A(i:M-1, i:i+ib-1)
			dgeqr2(M - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);

			if ( i + ib < N ) {
				// Form the triangular factor of the block reflector H = H(i) H(i+1) ... H(i+ib-1) in WORK(0:ib-1,0:ib-1)
				dlarft('forward', 'columnwise', M - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, strideWork * ldwork, offsetWork);

				// Apply H**T to A(i:M-1, i+ib:N-1) from the left, with WORK(ib:) as the update workspace
				dlarfb('left', 'transpose', 'forward', 'columnwise', M - i, N - i - ib, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), WORK, strideWork, strideWork * ldwork, offsetWork, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + ib ) * strideA2), WORK, strideWork, strideWork * ldwork, offsetWork + (ib * strideWork));
			}
			i += nb;
		}
	} else {
		i = 0;
	}

	// Use unblocked code to factor the last or only block
	if ( i <= K - 1 ) {
		dgeqr2(M - i, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default dgeqrf;
