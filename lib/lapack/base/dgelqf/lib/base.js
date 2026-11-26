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

import dgelq2 from '../../dgelq2/lib/base.js';
import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes an LQ factorization of a real M-by-N matrix A = L * Q.
* using blocked Householder reflections.
*
* On exit, the elements on and below the diagonal of A contain the
* M-by-min(M,N) lower trapezoidal matrix L; the elements above the
* diagonal, with the array TAU, represent the orthogonal matrix Q as
* a product of elementary reflectors.
*
* The block size adapts to the workspace, as in the reference: the length of
* `WORK` from `offsetWork` (in elements) is the reference's `LWORK`. With at
* least `M*NB` (`NB = 32`) the blocked code uses the full block size; with
* less, `NB` shrinks to `floor( LWORK/M )`, and below `2*M` the
* unblocked code factors the whole matrix. The blocked path stores the
* block-reflector `T` in `WORK(0:IB-1,0:IB-1)` and passes `WORK(IB:)` to
* `dlarfb`, both with leading dimension `M`, as the reference does.
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
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgelqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let ldwork, nbmin, iws, nb, ib, i;

	const K = Math.min( M, N );

	// Quick return if possible
	if ( K === 0 ) {
		return 0;
	}

	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	nb = DEFAULT_NB;
	nbmin = 2;
	const nx = 0;
	iws = M;
	ldwork = M;
	if ( nb > 1 && nb < K ) {
		// Determine if workspace is large enough for blocked code
		ldwork = M;
		iws = ldwork * nb;
		if ( lwork < iws ) {
			// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB
			nb = Math.floor( lwork / ldwork );
			nbmin = 2;
		}
	}

	if ( nb >= nbmin && nb < K && nx < K ) {
		// Use blocked code
		i = 0;
		while ( i <= K - 1 - nx ) {
			ib = Math.min( K - i, nb );

			// Compute the LQ factorization of the current panel A(i:i+ib-1, i:N-1)
			dgelq2(ib, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);

			if ( i + ib < M ) {
				// Form the triangular factor of the block reflector
				// H = H(i) H(i+1) ... H(i+ib-1)
				dlarft('forward', 'rowwise', N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, strideWork * ldwork, offsetWork);

				// Apply H to A(i+ib:M-1, i:N-1) from the right
				dlarfb('right', 'no-transpose', 'forward', 'rowwise', M - i - ib, N - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), WORK, strideWork, strideWork * ldwork, offsetWork, A, strideA1, strideA2, offsetA + (( i + ib ) * strideA1) + (i * strideA2), WORK, strideWork, strideWork * ldwork, offsetWork + ( ib * strideWork ) );
			}
			i += nb;
		}
	} else {
		i = 0;
	}

	// Use unblocked code to factor the last or only block
	if ( i <= K - 1 ) {
		dgelq2(M - i, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, strideWork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default dgelqf;
