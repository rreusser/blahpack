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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zlaqp2 from '../../zlaqp2/lib/base.js';
import zlaqps from '../../zlaqps/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;


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
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - workspace size in complex elements (unused)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zgeqp3( M, N, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) {
	var topbmn;
	var sminmn;
	var workQR;
	var minmn;
	var nbmin;
	var nfxd;
	var AUXV;
	var sa1;
	var sa2;
	var fjb;
	var oJ;
	var oR;
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
	oR = offsetRWork;
	oT = offsetTAU;

	minmn = Math.min( M, N );
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

		// Allocate internal workspace for zgeqrf
		workQR = new Complex128Array( Math.max( N, 1 ) * DEFAULT_NB );

		zgeqrf( M, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, workQR, 1, 0 );

		if ( na < N ) {
			// Apply Q^H to remaining columns
			zunmqr('left', 'conjugate-transpose', M, N - na, na, A, sa1, sa2, offsetA, TAU, strideTAU, oT, A, sa1, sa2, offsetA + (na * sa2), workQR, 1, 0 );
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

			// Allocate F matrix and AUXV for blocked panel
			F = new Complex128Array( ( sn + 1 ) * nb );
			AUXV = new Complex128Array( nb );

			while ( j < topbmn ) {
				jb = Math.min( nb, topbmn - j );

				// Factor panel using zlaqps
				fjb = zlaqps(M, N - j, j, jb, A, sa1, sa2, offsetA + (j * sa2), JPVT, strideJPVT, oJ + (j * strideJPVT), TAU, strideTAU, oT + (j * strideTAU), RWORK, strideRWork, oR + (j * strideRWork), RWORK, strideRWork, oR + (( N + j ) * strideRWork), AUXV, 1, 0, F, 1, sn + 1, 0);
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


// EXPORTS //

export default zgeqp3;
