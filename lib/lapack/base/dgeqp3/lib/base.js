/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dgeqrf from '../../dgeqrf/lib/base.js';
import dlaqp2 from '../../dlaqp2/lib/base.js';
import dlaqps from '../../dlaqps/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;
var DEFAULT_NX = 128; // crossover point: ILAENV(3, 'DGEQRF', ...) = 128


// MAIN //

/**
* Computes a QR factorization with column pivoting of a real M-by-N matrix:.
*   A_P = Q_R
* using Level 3 BLAS.
*
* The caller must supply WORK as a `Float64Array` of size at least `max(1, 3*N+1)` elements
* for the unblocked path, or `max(1, 2*N + (N+1)*NB)` elements (with `NB = 32`) for the
* blocked path (i.e., when `min(M,N) - nfxd > NB`). The WORK array is partitioned as follows
* (0-based from `offsetWork`):
*   - `WORK[0..N-1]`         — VN1: partial column norms (indices NFXD..N-1 used)
*   - `WORK[N..2*N-1]`       — VN2: saved column norms (indices NFXD..N-1 used)
*   - `WORK[2*N..2*N+NB-1]`  — AUXV: blocked panel auxiliary vector
*   - `WORK[2*N+NB..end]`    — F: blocked panel matrix (leading dimension N-j, NB columns)
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
* @param {Float64Array} WORK - caller-provided workspace (see size requirements above)
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-params
	var topbmn;
	var sminmn;
	var oAUXV;
	var minmn;
	var oVN1;
	var oVN2;
	var nbmin;
	var nfxd;
	var oWQR;
	var oF;
	var sa1;
	var sa2;
	var fjb;
	var oJ;
	var oT;
	var sm;
	var sn;
	var na;
	var nb;
	var nx;
	var jb;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	oJ = offsetJPVT;
	oT = offsetTAU;

	minmn = Math.min( M, N );
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
	//   WORK[offsetWork+2*N .. offsetWork+2*N+NB-1] — AUXV
	//   WORK[offsetWork+2*N+NB .. end]             — F (leading dim sn, NB columns)
	oWQR = offsetWork;      // scratch for dgeqrf/dormqr (reused as VN1 base)
	oVN1 = offsetWork;      // VN1 starts at WORK[N+NFXD] in Fortran; here we use WORK[NFXD]
	oVN2 = offsetWork + N;  // VN2 section
	nb = DEFAULT_NB;
	oAUXV = offsetWork + ( 2 * N );
	oF = offsetWork + ( 2 * N ) + nb;

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

		nbmin = 2;
		nx = 0;

		if ( nb > 1 && nb < sminmn ) {
			nx = Math.max( 0, DEFAULT_NX );
		}

		if ( nb >= nbmin && nb < sminmn && nx < sminmn ) {
			// Use blocked code
			j = 0;
			topbmn = sminmn - nx;

			while ( j < topbmn ) {
				jb = Math.min( nb, topbmn - j );

				// Factor panel using dlaqps

				// F has leading dimension (sn - j); oF points into WORK
				fjb = dlaqps(M, sn - j, nfxd + j, jb, A, sa1, sa2, offsetA + ((nfxd + j) * sa2), JPVT, strideJPVT, oJ + ((nfxd + j) * strideJPVT), TAU, strideTAU, oT + ((nfxd + j) * strideTAU), WORK, 1, oVN1 + nfxd + j, WORK, 1, oVN2 + nfxd + j, WORK, 1, oAUXV, WORK, 1, sn - j, oF);
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
