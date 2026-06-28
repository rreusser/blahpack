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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Computes a QR factorization of a complex M-by-N matrix A = Q * R.
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
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zgeqr2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
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

	for ( i = 0; i < K; i++ ) {
		// Float64 index of A(i,i)
		aii = oA + (i * sa1) + (i * sa2);

		// Generate elementary reflector H(i) to annul A(i+1:M-1, i)

		// zlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )

		// Sub-routines accept Complex128Array with complex-element strides/offsets
		zlarfg( M - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2), TAU, offsetTAU + (i * strideTAU) );

		if ( i < N - 1 ) {
			// Save A(i,i) and set to 1 for the reflector application
			alpha_re = Av[ aii ];
			alpha_im = Av[ aii + 1 ];
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply H(i)^H to A(i:M-1, i+1:N-1) from the left

			// Zlarf uses conj(tau) for left application of H^H
			conj_f64[ 0 ] = tau_f64[ oT + ((i * strideTAU) * 2) ];
			conj_f64[ 1 ] = -tau_f64[ oT + ((i * strideTAU) * 2) + 1 ];

			// zlarf( side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork )

			// Sub-routines accept Complex128Array with complex-element strides/offsets
			zlarf( 'left', M - i, N - i - 1, A, strideA1, offsetA + (i * strideA1) + (i * strideA2), conj_tau, 0, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

			// Restore A(i,i)
			Av[ aii ] = alpha_re;
			Av[ aii + 1 ] = alpha_im;
		}
	}
	return 0;
}


// EXPORTS //

export default zgeqr2;
