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

import dormqr from '../../dormqr/lib/base.js';


// MAIN //

/**
* Overwrites the general real M-by-N matrix C with.
*
*   SIDE = 'left'      SIDE = 'right'
*   TRANS = 'no-transpose':    Q _ C            C _ Q
*   TRANS = 'transpose':       Q^T _ C          C _ Q^T
*
* where Q is a real orthogonal matrix of order nq, with nq = M if
* SIDE = 'left' and nq = N if SIDE = 'right'. Q is defined as the product of
* IHI-ILO elementary reflectors, as returned by dgehrd:
*
*   Q = H(ilo) H(ilo+1) ... H(ihi-1)
*
* @private
* @param {string} side - 'left' to apply Q from left, 'right' from right
* @param {string} trans - 'no-transpose' for Q, 'transpose' for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {integer} ilo - 1-based lower index from dgehrd (1 <= ILO <= IHI)
* @param {integer} ihi - 1-based upper index from dgehrd
* @param {Float64Array} A - matrix containing reflectors from dgehrd
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of the elementary reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} C - input/output M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - dimension of WORK array
* @returns {integer} info - 0 if successful
*/
function dormhr( side, trans, M, N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork ) {
	var left;
	var nh;
	var mi;
	var ni;
	var ic;
	var jc;

	// NH = IHI - ILO: number of elementary reflectors
	nh = ihi - ilo;

	left = ( side === 'left' );

	// Workspace query (reference DORMHR: LWKOPT = NW*NB, with NW = N if
	// side is 'left' else M, NB = 32). Returns the optimal size and
	// performs no work, matching reference LAPACK so callers size WORK
	// correctly instead of corrupting the caller's data. Comes before the
	// quick return, as in reference DORMHR.
	if ( lwork === -1 ) {
		WORK[ offsetWORK ] = ( left ? Math.max( 1, N ) : Math.max( 1, M ) ) * 32;
		return 0;
	}

	// Quick return if possible
	if ( M === 0 || N === 0 || nh === 0 ) {
		return 0;
	}

	if ( left ) {
		// Apply Q to C(ILO+1:IHI, 1:N) — in 0-based: rows ILO..IHI-1
		mi = nh;
		ni = N;
		ic = ilo;   // 0-based row start (Fortran ILO+1 is 1-based -> ILO in 0-based)
		jc = 0;     // 0-based col start
	} else {
		// Apply Q to C(1:M, ILO+1:IHI) — in 0-based: cols ILO..IHI-1
		mi = M;
		ni = nh;
		ic = 0;     // 0-based row start
		jc = ilo;   // 0-based col start (Fortran ILO+1 is 1-based -> ILO in 0-based)
	}

	// Call dormqr with the submatrix A(ILO+1:IHI, ILO:IHI-1) and TAU(ILO:IHI-1)
	// In Fortran 1-based: A(ILO+1, ILO), TAU(ILO), C(I1, I2)
	// In 0-based: A row ILO, col ILO-1; TAU index ILO-1; C row ic, col jc
	return dormqr(side, trans, mi, ni, nh, A, strideA1, strideA2, offsetA + ( ilo * strideA1 ) + ( ( ilo - 1 ) * strideA2 ), TAU, strideTAU, offsetTAU + ( ( ilo - 1 ) * strideTAU ), C, strideC1, strideC2, offsetC + ( ic * strideC1 ) + ( jc * strideC2 ), WORK, strideWORK, offsetWORK);
}


// EXPORTS //

export default dormhr;
