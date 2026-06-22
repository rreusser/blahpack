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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Computes a QL factorization of a complex M-by-N matrix A = Q * L
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
* @param {Complex128Array} WORK - workspace array (length >= N)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zgeql2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var conj_tau;
	var conj_f64;
	var alpha_re;
	var alpha_im;
	var tau_f64;
	var sa1;
	var sa2;
	var aii;
	var oA;
	var oT;
	var Av;
	var col;
	var row;
	var K;
	var i;

	/* @complex-arrays A, TAU, WORK */

	// Get Float64 views for direct element access
	Av = reinterpret( A, 0 );
	tau_f64 = reinterpret( TAU, 0 );

	// Float64 strides and offsets (doubled from complex-element values)
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	oT = offsetTAU * 2;

	K = Math.min( M, N );
	conj_tau = new Complex128Array( 1 );
	conj_f64 = reinterpret( conj_tau, 0 );

	for ( i = K - 1; i >= 0; i-- ) {
		// Fortran: column = N-K+I (1-based), row = M-K+I (1-based)
		// 0-based: col = N-K+i, row = M-K+i
		col = N - K + i;
		row = M - K + i;

		// Float64 index of A(row, col)
		aii = oA + (row * sa1) + (col * sa2);

		// Generate elementary reflector H(i) to annihilate A(0:row-1, col)
		// Fortran: ZLARFG( M-K+I, ALPHA, A(1, N-K+I), 1, TAU(I) )
		// alpha is at A(row, col), vector is A(0:row-1, col)
		zlarfg(
			row + 1,
			A, offsetA + (row * strideA1) + (col * strideA2),
			A, strideA1, offsetA + (Math.min( row - 1, 0 ) * strideA1) + (col * strideA2),
			TAU, offsetTAU + (i * strideTAU)
		);

		if ( col > 0 ) {
			// Save A(row, col) and set to 1.0 + 0.0i
			alpha_re = Av[ aii ];
			alpha_im = Av[ aii + 1 ];
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply H(i)^H to A(0:row, 0:col-1) from the left
			// Fortran: ZLARF('Left', M-K+I, N-K+I-1, A(1,N-K+I), 1, DCONJG(TAU(I)), A, LDA, WORK)
			conj_f64[ 0 ] = tau_f64[ oT + ((i * strideTAU) * 2) ];
			conj_f64[ 1 ] = -tau_f64[ oT + ((i * strideTAU) * 2) + 1 ];

			zlarf(
				'left',
				row + 1, col,
				A, strideA1, offsetA + (col * strideA2),
				conj_tau, 0,
				A, strideA1, strideA2, offsetA,
				WORK, strideWORK, offsetWORK
			);

			// Restore A(row, col)
			Av[ aii ] = alpha_re;
			Av[ aii + 1 ] = alpha_im;
		}
	}
	return 0;
}


// EXPORTS //

export default zgeql2;
