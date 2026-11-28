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
import dgeqrf from '../../dgeqrf/lib/base.js';
import dlaqp2 from '../../dlaqp2/lib/base.js';
import dlaqps from '../../dlaqps/lib/base.js';
import dswap from '../../../blas/dswap/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dnrm2 from '../../../blas/dnrm2/lib/base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of a matrix A: A·P = Q·R using Level 3 BLAS.
*
* `WORK` from `offsetWork` is the reference's `LWORK`, at least `3*N+1`. With
* `2*N + (N+1)*NB` elements (`NB = 32`) the blocked code (dlaqps) uses the full
* block size; with less, `NB` shrinks to fit, and below `NBMIN = 2` the
* unblocked code (dlaqp2) factors the free columns. The WORK array is
* partitioned as in the reference (0-based from `offsetWork`):
*   - `WORK[0..N-1]`              — VN1: partial column norms (indices NFXD..N-1 used)
*   - `WORK[N..2*N-1]`            — VN2: saved column norms (indices NFXD..N-1 used)
*   - `WORK[2*N..2*N+JB-1]`       — AUXV: blocked panel auxiliary vector
*   - `WORK[2*N+JB..]`            — F: blocked panel matrix (leading dimension N-j, JB columns)
* The same WORK buffer (starting at `offsetWork`) is also passed to `dgeqrf` and `dormqr`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input/output matrix (M-by-N)
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} JPVT - column permutation (1-based on exit)
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Float64Array} TAU - output reflector scalars (length >= min(M,N))
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace of length at least `3*N+1`; for optimal performance at least `2*N + (N+1)*NB` (NB = 32), which enables the blocked path
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-params
	const kb = new Int32Array( 1 );
	let topbmn, sminmn, minws, nbmin, nfxd, fjb, sm, sn, na, nb, nx, jb, j;

	const sa1 = strideA1;
	const sa2 = strideA2;
	const oJ = offsetJPVT;
	const oT = offsetTAU;

	const minmn = Math.min( M, N );
	if ( minmn === 0 ) {
		return 0;
	}

	// Phase 1: Move fixed columns to the front
	// On entry, JPVT[j] != 0 means column j is "fixed" (moved to front).
	// On exit, JPVT[j] = k means column j of A*P was column k of the original A (1-based).
	nfxd = 0;
	for ( j = 0; j < N; j++ ) {
		if ( JPVT[ oJ + (j * strideJPVT) ] === 0 ) {
			JPVT[ oJ + (j * strideJPVT) ] = j + 1; // 1-based
		} else {
			if ( j === nfxd ) {
				JPVT[ oJ + (j * strideJPVT) ] = j + 1; // 1-based
			} else {
				// Swap columns j and nfxd
				dswap( M, A, sa1, offsetA + (j * sa2), A, sa1, offsetA + (nfxd * sa2) );
				JPVT[ oJ + (j * strideJPVT) ] = JPVT[ oJ + (nfxd * strideJPVT) ];
				JPVT[ oJ + (nfxd * strideJPVT) ] = j + 1; // 1-based
			}
			nfxd += 1;
		}
	}

	// Partition WORK into sections matching the Fortran WORK layout:
	//   WORK[offsetWork .. offsetWork+N-1]        — scratch for dgeqrf/dormqr and (later) VN1
	//   WORK[offsetWork+N .. offsetWork+2*N-1]    — VN2
	//   WORK[offsetWork+2*N .. offsetWork+2*N+JB-1] — AUXV
	//   WORK[offsetWork+2*N+JB .. end]             — F (leading dim sn-j, JB columns)
	const oWQR = offsetWork;      // scratch for dgeqrf/dormqr (reused as VN1 base)
	const oVN1 = offsetWork;      // VN1 starts at WORK[N+NFXD] in Fortran; here we use WORK[NFXD]
	const oVN2 = offsetWork + N;  // VN2 section
	const oAUXV = offsetWork + ( 2 * N );

	// The JS LWORK is the workspace's length (CONVENTIONS W1/W6):
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	// Phase 2: Factor fixed columns using standard QR
	if ( nfxd > 0 ) {
		na = Math.min( M, nfxd );
		dgeqrf( M, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, WORK, 1, oWQR );

		if ( na < N ) {
			// Apply Q^T to remaining columns
			dormqr( 'left', 'transpose', M, N - na, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, A, sa1, sa2, offsetA + (na * sa2), WORK, 1, oWQR );
		}
	}

	// Phase 3: Factor the free columns
	if ( nfxd < minmn ) {
		sm = M - nfxd;
		sn = N - nfxd;
		sminmn = minmn - nfxd;

		// Initialize column norm arrays in the WORK buffer:

		//   VN1 at WORK[oVN1+nfxd .. oVN1+N-1]

		//   VN2 at WORK[oVN2+nfxd .. oVN2+N-1]
		for ( j = 0; j < sn; j++ ) {
			WORK[ oVN1 + nfxd + j ] = dnrm2(sm, A, sa1, offsetA + (nfxd * sa1) + ((nfxd + j) * sa2));
			WORK[ oVN2 + nfxd + j ] = WORK[ oVN1 + nfxd + j ];
		}

		// Determine the block size:
		nb = ilaenv( 1, 'DGEQRF', ' ', sm, sn, -1, -1 );
		nbmin = 2;
		nx = 0;

		if ( nb > 1 && nb < sminmn ) {
			// Determine when to cross over from blocked to unblocked code:
			nx = Math.max( 0, ilaenv( 3, 'DGEQRF', ' ', sm, sn, -1, -1 ) );
			if ( nx < sminmn ) {
				// Determine if workspace is large enough for blocked code. The reference counts `2*SN` for VN1/VN2 here, but they sit at WORK(1:2*N), so with fixed columns its blocked path would need 2*NFXD more than it checks; count `2*N`, which keeps dlaqps inside the workspace:
				minws = ( 2 * N ) + ( ( sn + 1 ) * nb );
				if ( lwork < minws ) {
					// Not enough workspace to use optimal NB: reduce NB and determine the minimum value of NB:
					nb = Math.floor( ( lwork - ( 2 * N ) ) / ( sn + 1 ) );
					nbmin = Math.max( 2, ilaenv( 2, 'DGEQRF', ' ', sm, sn, -1, -1 ) );
				}
			}
		}

		if ( nb >= nbmin && nb < sminmn && nx < sminmn ) {
			// Use blocked code
			j = 0;
			topbmn = sminmn - nx;

			while ( j < topbmn ) {
				jb = Math.min( nb, topbmn - j );

				// Factor panel using dlaqps

				// F (leading dimension sn - j) follows the JB-element AUXV, as in the reference (WORK(2*N+JB+1))
				dlaqps( M, sn - j, nfxd + j, jb, kb, A, sa1, sa2, offsetA + ((nfxd + j) * sa2), JPVT, strideJPVT, oJ + ((nfxd + j) * strideJPVT), TAU, strideTAU, oT + ((nfxd + j) * strideTAU), WORK, 1, oVN1 + nfxd + j, WORK, 1, oVN2 + nfxd + j, WORK, 1, oAUXV, WORK, 1, sn - j, oAUXV + jb );
				fjb = kb[ 0 ];
				j += fjb;
			}
		} else {
			j = 0;
		}

		// Use unblocked code for the remainder
		// AUXV section of WORK reused as scratch for dlaqp2
		if ( nfxd + j < minmn ) {
			dlaqp2(M, sn - j, nfxd + j, A, sa1, sa2, offsetA + ((nfxd + j) * sa2), JPVT, strideJPVT, oJ + ((nfxd + j) * strideJPVT), TAU, strideTAU, oT + ((nfxd + j) * strideTAU), WORK, 1, oVN1 + nfxd + j, WORK, 1, oVN2 + nfxd + j, WORK, 1, oAUXV);
		}
	}

	return 0;
}


// EXPORTS //

export default dgeqp3;
