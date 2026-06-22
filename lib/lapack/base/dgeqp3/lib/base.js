/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
* @returns {integer} info - 0 if successful
*/
function dgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU ) {
	var topbmn;
	var sminmn;
	var workQR;
	var minmn;
	var nbmin;
	var nfxd;
	var AUXV;
	var VN1;
	var VN2;
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
	var F;
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

	// Phase 2: Factor fixed columns using standard QR
	if ( nfxd > 0 ) {
		na = Math.min( M, nfxd );

		// Allocate internal workspace for dgeqrf
		workQR = new Float64Array( Math.max( N, 1 ) * DEFAULT_NB );

		dgeqrf( M, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, workQR, 1, 0 );

		if ( na < N ) {
			// Apply Q^T to remaining columns
			dormqr( 'left', 'transpose', M, N - na, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, A, sa1, sa2, offsetA + (na * sa2), workQR, 1, 0 );
		}
	}

	// Phase 3: Factor the free columns
	if ( nfxd < minmn ) {
		sm = M - nfxd;
		sn = N - nfxd;
		sminmn = minmn - nfxd;

		// Allocate column norm arrays: VN1 (partial norms) and VN2 (original norms)
		VN1 = new Float64Array( sn );
		VN2 = new Float64Array( sn );

		// Compute initial column norms for the unfactored submatrix
		for ( j = 0; j < sn; j++ ) {
			VN1[ j ] = dnrm2(sm, A, sa1, offsetA + (nfxd * sa1) + ((nfxd + j) * sa2));
			VN2[ j ] = VN1[ j ];
		}

		nb = DEFAULT_NB;
		nbmin = 2;
		nx = 0;

		if ( nb > 1 && nb < sminmn ) {
			nx = Math.max( 0, DEFAULT_NX );
		}

		if ( nb >= nbmin && nb < sminmn && nx < sminmn ) {
			// Use blocked code
			j = 0;
			topbmn = sminmn - nx;

			// Allocate F matrix and AUXV for blocked panel
			F = new Float64Array( ( sn + 1 ) * nb );
			AUXV = new Float64Array( nb );

			while ( j < topbmn ) {
				jb = Math.min( nb, topbmn - j );

				// Factor panel using dlaqps

				// dlaqps( M, N, offset, nb, A, sa1, sa2, oA, JPVT, sJ, oJ, TAU, sT, oT, VN1, sV1, oV1, VN2, sV2, oV2, AUXV, sA, oA, F, sF1, sF2, oF )
				fjb = dlaqps(M, sn - j, nfxd + j, jb, A, sa1, sa2, offsetA + ((nfxd + j) * sa2), JPVT, strideJPVT, oJ + ((nfxd + j) * strideJPVT), TAU, strideTAU, oT + ((nfxd + j) * strideTAU), VN1, 1, j, VN2, 1, j, AUXV, 1, 0, F, 1, sn - j, 0);
				j += fjb;
			}
		} else {
			j = 0;
		}

		// Use unblocked code for the remainder
		if ( nfxd + j < minmn ) {
			// Allocate scratch workspace for dlaqp2
			workQR = new Float64Array( sn );

			dlaqp2(M, sn - j, nfxd + j, A, sa1, sa2, offsetA + ((nfxd + j) * sa2), JPVT, strideJPVT, oJ + ((nfxd + j) * strideJPVT), TAU, strideTAU, oT + ((nfxd + j) * strideTAU), VN1, 1, j, VN2, 1, j, workQR, 1, 0);
		}
	}

	return 0;
}


// EXPORTS //

export default dgeqp3;
