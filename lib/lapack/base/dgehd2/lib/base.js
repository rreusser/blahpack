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
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dgehd2( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var xStart;
	var oAlpha;
	var oTau;
	var aii;
	var i;
	for ( i = ilo - 1; i < ihi - 1; i++ ) {
		// Compute elementary reflector H(i) to annihilate A(i+2:ihi,i)
		oAlpha = offsetA + (( i + 1 ) * strideA1) + (i * strideA2);
		xStart = Math.min( i + 2, N - 1 );
		oTau = offsetTAU + (i * strideTAU);
		dlarfg( ihi - i - 1, A, oAlpha, A, strideA1, offsetA + (xStart * strideA1) + (i * strideA2), TAU, oTau );
		aii = A[ oAlpha ];
		A[ oAlpha ] = 1.0;

		// Apply H(i) to A(1:ihi,i+1:ihi) from the right
		dlarf( 'right', ihi, ihi - i - 1, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), TAU[ oTau ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), WORK, strideWORK, offsetWORK );

		// Apply H(i) to A(i+1:ihi,i+1:n) from the left
		dlarf( 'left', ihi - i - 1, N - i - 1, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), TAU[ oTau ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), WORK, strideWORK, offsetWORK );

		A[ oAlpha ] = aii;
	}
	return 0;
}


// EXPORTS //

export default dgehd2;
