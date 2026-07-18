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
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dormhr( side, trans, M, N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	let mi, ni, ic, jc;

	// NH = IHI - ILO: number of elementary reflectors
	const nh = ihi - ilo;

	const left = ( side === 'left' );

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
	return dormqr(side, trans, mi, ni, nh, A, strideA1, strideA2, offsetA + ( ilo * strideA1 ) + ( ( ilo - 1 ) * strideA2 ), TAU, strideTAU, offsetTAU + ( ( ilo - 1 ) * strideTAU ), C, strideC1, strideC2, offsetC + ( ic * strideC1 ) + ( jc * strideC2 ), WORK, strideWork, offsetWork);
}


// EXPORTS //

export default dormhr;
