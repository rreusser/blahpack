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

import zunmqr from '../../zunmqr/lib/base.js';


// MAIN //

/**
* Overwrites the general complex M-by-N matrix C with.
*
*   SIDE = 'L'      SIDE = 'R'
*   TRANS = 'N':    Q _ C            C _ Q
*   TRANS = 'C':    Q^H _ C          C _ Q^H
*
* where Q is a complex unitary matrix of order nq, with nq = M if
* SIDE = 'L' and nq = N if SIDE = 'R'. Q is defined as the product of
* IHI-ILO elementary reflectors, as returned by zgehrd:
*
*   Q = H(ilo) H(ilo+1) ... H(ihi-1)
*
* @private
* @param {string} side - 'left' to apply Q from left, 'right' from right
* @param {string} trans - 'no-transpose' for Q, 'conjugate-transpose' for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {integer} ilo - 1-based lower index from zgehrd (1 <= ILO <= IHI)
* @param {integer} ihi - 1-based upper index from zgehrd
* @param {Complex128Array} A - matrix containing reflectors from zgehrd
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Complex128Array} TAU - scalar factors of the elementary reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Complex128Array} C - input/output M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - dimension of WORK array
* @returns {integer} info - 0 if successful
*/
function zunmhr( side, trans, M, N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork, lwork ) {
	var left;
	var nh;
	var mi;
	var ni;
	var ic;
	var jc;

	// NH = IHI - ILO: number of elementary reflectors
	nh = ihi - ilo;

	left = ( side === 'left' );

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

	// Call zunmqr with the submatrix A(ILO+1:IHI, ILO:IHI-1) and TAU(ILO:IHI-1)
	// In Fortran 1-based: A(ILO+1, ILO), TAU(ILO), C(I1, I2)
	// In 0-based: A row ILO, col ILO-1; TAU index ILO-1; C row ic, col jc
	return zunmqr(
		side, trans, mi, ni, nh,
		A, strideA1, strideA2, offsetA + ( ilo * strideA1 ) + ( ( ilo - 1 ) * strideA2 ),
		TAU, strideTAU, offsetTAU + ( ( ilo - 1 ) * strideTAU ),
		C, strideC1, strideC2, offsetC + ( ic * strideC1 ) + ( jc * strideC2 ),
		WORK, strideWork, offsetWork
	);
}


// EXPORTS //

export default zunmhr;
