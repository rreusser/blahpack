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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q from the elementary.
* reflectors returned by ZGELQF (LQ factorization, unblocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(K)^H ... H(2)^H H(1)^H
*
* where each H(i) has the form `H(i) = I - tau(i)*v*v^H`, and v is
* stored as row i of the input matrix A.
*
* ## Notes
*
* -   On entry, the i-th row of A must contain the vector which defines
* the elementary reflector H(i), for i = 1, 2, ..., K, as returned by
* ZGELQF in the first K rows of its array argument A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= 0)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (length >= M)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zungl2( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var negTau;
	var tauv;
	var sa1;
	var sa2;
	var oA;
	var st;
	var Av;
	var ia;
	var it;
	var i;
	var j;
	var l;

	/* @complex-arrays A, TAU, WORK */

	if ( M <= 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	tauv = reinterpret( TAU, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	st = strideTAU * 2;

	// Initialize rows K+1..M to rows of the unit matrix

	// Fortran: IF (K < M) THEN DO 20 J=1,N; DO 10 L=K+1,M; ...
	if ( K < M ) {
		for ( j = 0; j < N; j++ ) {
			for ( l = K; l < M; l++ ) {
				ia = oA + (l * sa1) + (j * sa2);
				Av[ ia ] = 0.0;
				Av[ ia + 1 ] = 0.0;
			}
			// If J > K and J <= M (0-based: j >= K and j < M), set A(j,j) = 1
			if ( j >= K && j < M ) {
				ia = oA + (j * sa1) + (j * sa2);
				Av[ ia ] = 1.0;
				Av[ ia + 1 ] = 0.0;
			}
		}
	}

	// Apply each reflector in reverse order: i = K, K-1, ..., 1 (1-based)
	// JS: i goes from K-1 down to 0 (0-based)
	for ( i = K - 1; i >= 0; i-- ) {
		it = (offsetTAU * 2) + (i * st);

		// If i < N-1 (Fortran: I < N), the row extends beyond the diagonal
		if ( i < N - 1 ) {
			// Conjugate elements in row i from column i+1 to N-1
			// ZLACGV(N-I, A(I, I+1), LDA) - but stride is along columns (strideA2)
			zlacgv( N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );

			if ( i < M - 1 ) {
				// Set A(i,i) = 1
				ia = oA + (i * sa1) + (i * sa2);
				Av[ ia ] = 1.0;
				Av[ ia + 1 ] = 0.0;

				// ZLARF('Right', M-I, N-I+1, A(I,I), LDA, DCONJG(TAU(I)),

				//        A(I+1,I), LDA, WORK)

				// Stride along row = strideA2 (column stride)
				zlarf(
					'right', M - i - 1, N - i,
					A, strideA2, offsetA + (i * strideA1) + (i * strideA2),
					new Complex128Array( [ tauv[ it ], -tauv[ it + 1 ] ] ), 0,
					A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2),
					WORK, strideWork, offsetWork
				);
			}

			// ZSCAL(N-I, -TAU(I), A(I, I+1), LDA)
			negTau = new Complex128( -tauv[ it ], -tauv[ it + 1 ] );
			zscal(
				N - i - 1, negTau,
				A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2)
			);

			// Conjugate back: ZLACGV(N-I, A(I, I+1), LDA)
			zlacgv( N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );
		}

		// A(I,I) = ONE - DCONJG(TAU(I))
		ia = oA + (i * sa1) + (i * sa2);
		Av[ ia ] = 1.0 - tauv[ it ];
		Av[ ia + 1 ] = tauv[ it + 1 ];  // negated because conj

		// Zero out columns 0..i-1 of row i

		// Fortran: DO 30 L = 1, I-1; A(I,L) = ZERO
		for ( l = 0; l < i; l++ ) {
			ia = oA + (i * sa1) + (l * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default zungl2;
