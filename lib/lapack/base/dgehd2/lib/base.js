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

import dlarf from '../../dlarf/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';


// MAIN //

/**
* Reduce a general matrix to upper Hessenberg form (unblocked).
*
* @private
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - input array
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - output array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dgehd2( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let xStart, oAlpha, oTau, aii, i;
	for ( i = ilo - 1; i < ihi - 1; i++ ) {
		// Compute elementary reflector H(i) to annihilate A(i+2:ihi,i)
		oAlpha = offsetA + (( i + 1 ) * strideA1) + (i * strideA2);
		xStart = Math.min( i + 2, N - 1 );
		oTau = offsetTAU + (i * strideTAU);
		dlarfg( ihi - i - 1, A, oAlpha, A, strideA1, offsetA + (xStart * strideA1) + (i * strideA2), TAU, oTau );
		aii = A[ oAlpha ];
		A[ oAlpha ] = 1.0;

		// Apply H(i) to A(1:ihi,i+1:ihi) from the right
		dlarf( 'right', ihi, ihi - i - 1, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), TAU[ oTau ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

		// Apply H(i) to A(i+1:ihi,i+1:n) from the left
		dlarf( 'left', ihi - i - 1, N - i - 1, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), TAU[ oTau ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

		A[ oAlpha ] = aii;
	}
	return 0;
}


// EXPORTS //

export default dgehd2;
