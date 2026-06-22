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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from '../../zlarf/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q with orthonormal columns.
* which is defined as the last N columns of a product of K elementary
* reflectors of order M
*
* Q = H(K) ... H(2) H(1)
*
* as returned by ZGEQLF (QL factorization, unblocked algorithm).
*
* ## Notes
*
* -   On entry, the (N-K+i)-th column of A must contain the vector which
* defines the elementary reflector H(i), for i = 1, 2, ..., K, as
* returned by ZGEQLF in the last K columns of its array argument A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (0 <= N <= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= N)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (length >= N)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zung2l( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	var negTau;
	var tauv;
	var sa1;
	var sa2;
	var oA;
	var st;
	var Av;
	var ia;
	var it;
	var ii;
	var i;
	var j;
	var l;

	/* @complex-arrays A, TAU, WORK */

	if ( N <= 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	tauv = reinterpret( TAU, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	st = strideTAU * 2;

	// Initialize columns 0..N-K-1 to columns of the unit matrix.

	// Fortran: DO 20 J = 1, N-K; set A(M-N+J, J) = ONE, rest = ZERO
	for ( j = 0; j < N - K; j++ ) {
		for ( l = 0; l < M; l++ ) {
			ia = oA + (l * sa1) + (j * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
		// Diagonal element at row M-N+j
		ia = oA + (( M - N + j ) * sa1) + (j * sa2);
		Av[ ia ] = 1.0;
		Av[ ia + 1 ] = 0.0;
	}

	// Apply each reflector in forward order: i = 0, 1, ..., K-1
	// Fortran: DO 40 I = 1, K (1-based)
	for ( i = 0; i < K; i++ ) {
		// ii = N-K+i (0-based column index)
		ii = N - K + i;
		it = (offsetTAU * 2) + (i * st);

		// Set A(M-N+ii, ii) = 1 before applying the reflector
		ia = oA + (( M - N + ii ) * sa1) + (ii * sa2);
		Av[ ia ] = 1.0;
		Av[ ia + 1 ] = 0.0;

		// Apply H(i) to A(0:M-N+ii, 0:ii-1) from the left

		// Fortran: ZLARF('Left', M-N+II, II-1, A(1,II), 1, TAU(I), A, LDA, WORK)

		// M-N+II (1-based count) = M-N+ii+1 (0-based rows: 0..M-N+ii)

		// II-1 (1-based count) = ii (0-based cols: 0..ii-1)
		if ( ii > 0 ) {
			zlarf(
				'left', M - N + ii + 1, ii,
				A, strideA1, offsetA + (ii * strideA2),
				TAU, offsetTAU + (i * strideTAU),
				A, strideA1, strideA2, offsetA,
				WORK, strideWORK, offsetWORK
			);
		}

		// Scale the reflector column above the diagonal: ZSCAL(M-N+II-1, -TAU(I), A(1,II), 1)
		// M-N+II-1 (1-based count) = M-N+ii (0-based: M-N+ii elements from row 0)
		if ( M - N + ii > 0 ) {
			negTau = new Complex128( -tauv[ it ], -tauv[ it + 1 ] );
			zscal(
				M - N + ii, negTau,
				A, strideA1, offsetA + (ii * strideA2)
			);
		}

		// A(M-N+ii, ii) = 1 - TAU(i)  (complex: (1,0) - tau)
		ia = oA + (( M - N + ii ) * sa1) + (ii * sa2);
		Av[ ia ] = 1.0 - tauv[ it ];
		Av[ ia + 1 ] = -tauv[ it + 1 ];

		// Zero out rows M-N+ii+1 to M-1 of column ii

		// Fortran: DO 30 L = M-N+II+1, M
		for ( l = M - N + ii + 1; l < M; l++ ) {
			ia = oA + (l * sa1) + (ii * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default zung2l;
