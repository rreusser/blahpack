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
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// MAIN //

/**
* Computes an RQ factorization of a complex M-by-N matrix A = R * Q.
* using Householder reflections (unblocked algorithm).
*
* On exit, if M <= N, the upper triangle of the subarray
* A(0:M-1, N-M:N-1) contains the M-by-M upper triangular matrix R;
* if M >= N, the elements on and above the (M-N)-th subdiagonal
* contain the M-by-N upper trapezoidal matrix R; the remaining
* elements, with the array TAU, represent the unitary matrix Q
* as a product of elementary reflectors.
*
* Q = H(1)^H H(2)^H ... H(k)^H, where k = min(M,N).
*
* Each H(i) has the form H(i) = I - tau _ v _ v^H
* where v(n-k+i+1:n) = 0 and v(n-k+i) = 1; conjg(v(1:n-k+i-1)) is stored
* in A(m-k+i, 0:n-k+i-2), and tau in TAU(i).
*
* @private
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors (length min(M,N))
* @param {integer} strideTAU - stride for TAU (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
* @param {Complex128Array} WORK - workspace array (length >= M)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zgerq2( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var alpha_re;
	var alpha_im;
	var row;
	var sa1;
	var sa2;
	var aii;
	var oA;
	var Av;
	var K;
	var i;

	/* @complex-arrays A, TAU, WORK */

	// Get Float64 views for direct element access
	Av = reinterpret( A, 0 );

	// Float64 strides and offsets (doubled from complex-element values)
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	K = Math.min( M, N );

	// Iterate backward: i = K-1, K-2, ..., 0

	// Fortran iterates I = K, K-1, ..., 1 (1-based)
	for ( i = K - 1; i >= 0; i-- ) {
		// Row of reflector in 0-based: M-K+i
		row = M - K + i;

		// Float64 index of A(row, N-K+i)
		aii = oA + ( row * sa1 ) + ( ( N - K + i ) * sa2 );

		// Conjugate the row A(row, 0:N-K+i) so that zlarfg works on

		// Conjugated entries

		// Fortran: CALL ZLACGV(N-K+I, A(M-K+I,1), LDA)

		// N-K+I elements starting at column 0, stepping by strideA2

		// In 0-based: N-K+i+1 elements (columns 0 through N-K+i)
		zlacgv( N - K + i + 1, A, strideA2, offsetA + ( row * strideA1 ) );

		// Generate elementary reflector H(i) to annihilate A(row, 0:N-K+i-1)

		// zlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )

		// Alpha = A(row, N-K+i), x = A(row, 0) stepping by strideA2

		// Length of reflector vector = N-K+i+1
		zlarfg(N - K + i + 1, A, offsetA + ( row * strideA1 ) + ( ( N - K + i ) * strideA2 ), A, strideA2, offsetA + ( row * strideA1 ), TAU, offsetTAU + ( i * strideTAU ));

		if ( row > 0 ) {
			// Save A(row, N-K+i) and set to 1 for the reflector application
			alpha_re = Av[ aii ];
			alpha_im = Av[ aii + 1 ];
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply H(i) to A(0:row-1, 0:N-K+i) from the right

			// zlarf( side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK )
			zlarf('right', row,                 // number of rows of sub-matrix
				N - K + i + 1,       // number of columns of sub-matrix
				A, strideA2, offsetA + ( row * strideA1 ), // v = row `row`, stride along columns
				TAU, offsetTAU + ( i * strideTAU ), A, strideA1, strideA2, offsetA,             // C = A(0, 0)
				WORK, strideWORK, offsetWORK);

			// Restore A(row, N-K+i)
			Av[ aii ] = alpha_re;
			Av[ aii + 1 ] = alpha_im;
		}

		// Unconjugate A(row, 0:N-K+i-1)
		// Fortran: CALL ZLACGV(N-K+I-1, A(M-K+I,1), LDA)
		// In 0-based: N-K+i elements (columns 0 through N-K+i-2),
		// But Fortran says N-K+I-1 elements from column 1 (0-based: 0)
		if ( N - K + i > 0 ) {
			zlacgv( N - K + i, A, strideA2, offsetA + ( row * strideA1 ) );
		}
	}
	return 0;
}


// EXPORTS //

export default zgerq2;
