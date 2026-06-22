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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Computes an LQ factorization of a complex M-by-N matrix A = L * Q.
* using Householder reflections (unblocked algorithm).
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride for TAU (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
* @param {Complex128Array} WORK - workspace array (length >= M)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zgelq2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var alpha_re;
	var alpha_im;
	var tau_off;
	var sa1;
	var sa2;
	var aii;
	var oA;
	var Av;
	var K;
	var i;

	/* @complex-arrays A, TAU, WORK */

	// Get Float64 view for direct element access
	Av = reinterpret( A, 0 );

	// Float64 strides and offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	K = Math.min( M, N );

	for ( i = 0; i < K; i++ ) {
		// Float64 index of A(i,i)
		aii = oA + (i * sa1) + (i * sa2);

		// Complex-element offset of A(i,i)

		// Caii = offsetA + i * strideA1 + i * strideA2

		// Conjugate the i-th row from column i to N-1

		// Zlacgv accepts Complex128Array with complex-element stride/offset
		zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );

		// tau(i) complex-element offset
		tau_off = offsetTAU + (i * strideTAU);

		// Generate elementary reflector H(i) to annihilate A(i, i+1:N-1)

		// Zlarfg accepts Complex128Array with complex-element strides/offsets
		zlarfg( N - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 1, N - 1 ) * strideA2), TAU, tau_off );

		if ( i < M - 1 ) {
			// Save A(i,i) (which now holds beta) and set to 1
			alpha_re = Av[ aii ];
			alpha_im = Av[ aii + 1 ];
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply H(i) to A(i+1:M-1, i:N-1) from the right

			// Zlarf accepts Complex128Array with complex-element strides/offsets
			zlarf( 'right', M - i - 1, N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, tau_off, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), WORK, strideWORK, offsetWORK );

			// Restore A(i,i)
			Av[ aii ] = alpha_re;
			Av[ aii + 1 ] = alpha_im;
		}

		// Unconjugate the i-th row from column i to N-1
		zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );
	}
	return 0;
}


// EXPORTS //

export default zgelq2;
