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

import zgeqrf from '../../zgeqrf/lib/base.js';
import zlaqp2 from '../../zlaqp2/lib/base.js';
import zlaqps from '../../zlaqps/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization with column pivoting of an M-by-N matrix:.
* `A*P = Q*R`
* using level 3 BLAS.
*
* A, TAU, WORK are Complex128Arrays. Strides and offsets are in complex elements.
* RWORK is real (Float64Array).
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
* @param {Complex128Array} WORK - caller-owned complex workspace; base.js never
* allocates. Minimum length (in complex elements) is `computeWorkSize(M,N)`,
* which covers the fixed-column QR (zgeqrf/zunmqr), the blocked panel
* (zlaqps AUXV + F factor), and the unblocked remainder (zlaqp2).
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - caller-owned real workspace; base.js never
* allocates. Minimum length is `max(1, 2*N)`.
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let topbmn, sminmn, nbmin, nfxd, fjb, oF, sm, sn, na, nb, nx, jb, j;

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

		nb = DEFAULT_NB;
		nbmin = 2;
		nx = 0;

		if ( nb > 1 && nb < sminmn ) {
			nx = 0; // crossover point
		}

		if ( nb >= nbmin && nb < sminmn && nx < sminmn ) {
			// Use blocked code
			j = nfxd;
			topbmn = minmn - nx;

			// Partition the caller WORK for the blocked panel exactly as the
			// reference does with a single WORK array: AUXV occupies the first
			// `nb` complex elements from oW; the F factor follows immediately
			// after (leading dimension sn+1, nb columns).
			oF = oW + nb;

			while ( j < topbmn ) {
				jb = Math.min( nb, topbmn - j );

				// Factor panel using zlaqps
				fjb = zlaqps(M, N - j, j, jb, A, sa1, sa2, offsetA + (j * sa2), JPVT, strideJPVT, oJ + (j * strideJPVT), TAU, strideTAU, oT + (j * strideTAU), RWORK, strideRWork, oR + (j * strideRWork), RWORK, strideRWork, oR + (( N + j ) * strideRWork), WORK, 1, oW, WORK, 1, sn + 1, oF);
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
* Computes the minimum complex workspace size (in complex elements) required by
* `zgeqp3`.
*
* The caller owns WORK; base.js never allocates. The size covers every code
* path: the fixed-column QR (zgeqrf/zunmqr needs up to `N*NB`), the blocked
* panel (zlaqps needs AUXV(`NB`) + F(`(SN+1)*NB`) <= `(N+2)*NB`), and the
* unblocked remainder (zlaqp2 needs `N`). `(N+2)*NB` dominates all of them.
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
	return ( N + 2 ) * DEFAULT_NB;
}


// EXPORTS //

export default zgeqp3;
export { computeWorkSize };
