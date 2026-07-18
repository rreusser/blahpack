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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfgp from '../../zlarfgp/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Computes a QR factorization of a complex M-by-N matrix `A = Q * R` with non-negative real diagonal elements of `R`, using Householder reflections (unblocked algorithm).
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
function zgeqr2p( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let alphaRe, alphaIm, aii, i;

	/* @complex-arrays A, TAU, WORK */

	// Get Float64 views for direct element access
	const Av = reinterpret( A, 0 );
	const tauF64 = reinterpret( TAU, 0 );

	// Float64 strides and offsets (doubled from complex-element values)
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;
	const oT = offsetTAU * 2;

	const K = Math.min( M, N );
	const conjTau = new Complex128Array( 1 );
	const conjF64 = reinterpret( conjTau, 0 );

	for ( i = 0; i < K; i++ ) {
		// Float64 index of A(i,i)
		aii = oA + (i * sa1) + (i * sa2);

		// Generate elementary reflector H(i) with non-negative diagonal to annul A(i+1:M-1, i)

		// zlarfgp( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )

		// Sub-routines accept Complex128Array with complex-element strides/offsets
		zlarfgp( M - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2), TAU, offsetTAU + (i * strideTAU) );

		if ( i < N - 1 ) {
			// Save A(i,i) and set to 1 for the reflector application
			alphaRe = Av[ aii ];
			alphaIm = Av[ aii + 1 ];
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply H(i)^H to A(i:M-1, i+1:N-1) from the left

			// Zlarf uses conj(tau) for left application of H^H
			conjF64[ 0 ] = tauF64[ oT + ((i * strideTAU) * 2) ];
			conjF64[ 1 ] = -tauF64[ oT + ((i * strideTAU) * 2) + 1 ];

			// zlarf( side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork )

			// Sub-routines accept Complex128Array with complex-element strides/offsets
			zlarf( 'left', M - i, N - i - 1, A, strideA1, offsetA + (i * strideA1) + (i * strideA2), conjTau, 0, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

			// Restore A(i,i)
			Av[ aii ] = alphaRe;
			Av[ aii + 1 ] = alphaIm;
		}
	}
	return 0;
}


// EXPORTS //

export default zgeqr2p;
