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

import ilaenv from '../../ilaenv/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zlaqp2 from '../../zlaqp2/lib/base.js';
import zlaqps from '../../zlaqps/lib/base.js';
import zswap from '../../../blas/zswap/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import dznrm2 from '../../../blas/dznrm2/lib/base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of a matrix A: A·P = Q·R using Level 3 BLAS.
*
* A, TAU, WORK are Complex128Arrays. Strides and offsets are in complex elements.
* RWORK is real (Float64Array).
*
* `WORK` from `offsetWork` is the reference's `LWORK`, at least `N+1`. With
* `(N+1)*NB` elements (`NB = 32`) the blocked code (zlaqps) uses the full block
* size; with less, `NB` shrinks to `floor( LWORK/(SN+1) )`, and below
* `NBMIN = 2` the unblocked code (zlaqp2) factors the free columns. As in the
* reference, the blocked panel keeps AUXV in `WORK[0..JB-1]` and F (leading
* dimension `N-j`) from `WORK[JB]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - first dim stride of A (complex elements)
* @param {integer} strideA2 - second dim stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} JPVT - column permutation (1-based on exit)
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Complex128Array} TAU - output reflector scalars
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - complex workspace of length at least `N+1`; for optimal performance at least `(N+1)*NB` (NB = 32), which enables the blocked path
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - caller-owned real workspace; base.js never
* allocates. Minimum length is `max(1, 2*N)`.
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	const kb = new Int32Array( 1 );
	let topbmn, sminmn, minws, nbmin, nfxd, fjb, sm, sn, na, nb, nx, jb, j;

	const sa1 = strideA1;
	const sa2 = strideA2;
	const oJ = offsetJPVT;
	const oR = offsetRWork;
	const oT = offsetTAU;
	const oW = offsetWork;

	const minmn = Math.min( M, N );
	if ( minmn === 0 ) {
		return 0;
	}

	// Phase 1: Move fixed columns to the front
	nfxd = 0;
	for ( j = 0; j < N; j++ ) {
		if ( JPVT[ oJ + (j * strideJPVT) ] === 0 ) {
			JPVT[ oJ + (j * strideJPVT) ] = j + 1; // 1-based
		} else {
			if ( j === nfxd ) {
				JPVT[ oJ + (j * strideJPVT) ] = j + 1; // 1-based
			} else {
				// Swap columns j and nfxd
				zswap( M, A, sa1, offsetA + (j * sa2), A, sa1, offsetA + (nfxd * sa2) );
				JPVT[ oJ + (j * strideJPVT) ] = JPVT[ oJ + (nfxd * strideJPVT) ];
				JPVT[ oJ + (nfxd * strideJPVT) ] = j + 1; // 1-based
			}
			nfxd += 1;
		}
	}

	// Phase 2: Factor fixed columns using standard QR
	if ( nfxd > 0 ) {
		na = Math.min( M, nfxd );

		// Use the caller-owned WORK as the zgeqrf/zunmqr scratch (stride-1,
		// contiguous from oW). This phase completes before Phase 3, so Phase 3
		// safely reuses the same region.
		zgeqrf( M, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, WORK, 1, oW );

		if ( na < N ) {
			// Apply Q^H to remaining columns
			zunmqr('left', 'conjugate-transpose', M, N - na, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, A, sa1, sa2, offsetA + (na * sa2), WORK, 1, oW );
		}
	}

	// Phase 3: Factor the free columns
	if ( nfxd < minmn ) {
		sm = M - nfxd;
		sn = N - nfxd;
		sminmn = minmn - nfxd;

		// Compute initial column norms for the unfactored submatrix
		for ( j = nfxd; j < N; j++ ) {
			RWORK[ oR + (j * strideRWork) ] = dznrm2(sm, A, sa1, offsetA + (nfxd * sa1) + (j * sa2));
			RWORK[ oR + (( N + j ) * strideRWork) ] = RWORK[ oR + (j * strideRWork) ];
		}

		// The JS LWORK is the workspace's length (CONVENTIONS W1/W6):
		const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

		// Determine the block size:
		nb = ilaenv( 1, 'ZGEQRF', ' ', sm, sn, -1, -1 );
		nbmin = 2;
		nx = 0;

		if ( nb > 1 && nb < sminmn ) {
			// Determine when to cross over from blocked to unblocked code:
			nx = Math.max( 0, ilaenv( 3, 'ZGEQRF', ' ', sm, sn, -1, -1 ) );
			if ( nx < sminmn ) {
				// Determine if workspace is large enough for blocked code:
				minws = ( sn + 1 ) * nb;
				if ( lwork < minws ) {
					// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB:
					nb = Math.floor( lwork / ( sn + 1 ) );
					nbmin = Math.max( 2, ilaenv( 2, 'ZGEQRF', ' ', sm, sn, -1, -1 ) );
				}
			}
		}

		if ( nb >= nbmin && nb < sminmn && nx < sminmn ) {
			// Use blocked code
			j = nfxd;
			topbmn = minmn - nx;

			while ( j < topbmn ) {
				jb = Math.min( nb, topbmn - j );

				// Factor panel using zlaqps: AUXV is WORK[0..jb-1] and F (leading dimension N-j) follows it, as in the reference (WORK(1), WORK(JB+1), LDF = N-J+1)
				zlaqps( M, N - j, j, jb, kb, A, sa1, sa2, offsetA + (j * sa2), JPVT, strideJPVT, oJ + (j * strideJPVT), TAU, strideTAU, oT + (j * strideTAU), RWORK, strideRWork, oR + (j * strideRWork), RWORK, strideRWork, oR + (( N + j ) * strideRWork), WORK, 1, oW, WORK, 1, N - j, oW + jb );
				fjb = kb[ 0 ];
				j += fjb;
			}
		} else {
			j = nfxd;
		}

		// Use unblocked code for the remainder
		if ( j < minmn ) {
			zlaqp2(M, N - j, j, A, sa1, sa2, offsetA + (j * sa2), JPVT, strideJPVT, oJ + (j * strideJPVT), TAU, strideTAU, oT + (j * strideTAU), RWORK, strideRWork, oR + (j * strideRWork), RWORK, strideRWork, oR + (( N + j ) * strideRWork), WORK, strideWork, offsetWork);
		}
	}

	return 0;
}

/**
* Returns the reference's optimal complex workspace size (LWKOPT, in complex elements) for `zgeqp3`: `(N+1)*NB`, which enables the blocked path. The minimum is `N+1`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {integer} workspace size (in complex elements)
*/
function computeWorkSize( M, N ) {
	if ( Math.min( M, N ) === 0 ) {
		return 1;
	}
	return ( N + 1 ) * ilaenv( 1, 'ZGEQRF', ' ', M, N, -1, -1 );
}


// EXPORTS //

export default zgeqp3;
export { computeWorkSize };
