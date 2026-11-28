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
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Computes a QL factorization of a complex M-by-N matrix A = Q * L.
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
function zgeql2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	let alpha_re, alpha_im, aii, col, row, i;

	/* @complex-arrays A, TAU, WORK */

	// Get Float64 views for direct element access
	const Av = reinterpret( A, 0 );
	const tau_f64 = reinterpret( TAU, 0 );

	// Float64 strides and offsets (doubled from complex-element values)
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;
	const oT = offsetTAU * 2;

	const K = Math.min( M, N );
	const conj_tau = new Complex128Array( 1 );
	const conj_f64 = reinterpret( conj_tau, 0 );

	for ( i = K - 1; i >= 0; i-- ) {
		// Fortran: column = N-K+I (1-based), row = M-K+I (1-based)
		// 0-based: col = N-K+i, row = M-K+i
		col = N - K + i;
		row = M - K + i;

		// Float64 index of A(row, col)
		aii = oA + (row * sa1) + (col * sa2);

		// Generate elementary reflector H(i) to annihilate A(0:row-1, col)

		// Fortran: ZLARFG( M-K+I, ALPHA, A(1, N-K+I), 1, TAU(I) )

		// Alpha is at A(row, col), vector is A(0:row-1, col)
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
				WORK, strideWork, offsetWork
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
