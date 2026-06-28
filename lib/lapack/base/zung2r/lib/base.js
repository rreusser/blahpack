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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from '../../zlarf/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// MAIN //

/**
* Generate an M-by-N complex unitary matrix Q from the elementary.
* reflectors returned by ZGEQRF (QR factorization, unblocked algorithm).
*
* Q is defined as the product of K elementary reflectors:
*
* Q = H(1) H(2) ... H(K)
*
* where each H(i) has the form `H(i) = I - tau(i)*v*v^H`.
*
* ## Notes
*
* -   On entry, the i-th column of A must contain the vector which defines
* the elementary reflector H(i), for i = 1, 2, ..., K, as returned by
* ZGEQRF in the first K columns of its array argument A.
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
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zung2r( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
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

	if ( N <= 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	tauv = reinterpret( TAU, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	st = strideTAU * 2;

	// Initialize columns K+1..N of the matrix to columns of the unit matrix

	// Fortran: DO 20 J = K+1, N
	for ( j = K; j < N; j++ ) {
		// Zero out the column
		for ( l = 0; l < M; l++ ) {
			ia = oA + (l * sa1) + (j * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
		// Set diagonal to 1
		ia = oA + (j * sa1) + (j * sa2);
		Av[ ia ] = 1.0;
		Av[ ia + 1 ] = 0.0;
	}

	// Apply each reflector in reverse order: i = K, K-1, ..., 1
	// Fortran: DO 40 I = K, 1, -1  (1-based i)
	// JS: i goes from K-1 down to 0 (0-based)
	for ( i = K - 1; i >= 0; i-- ) {
		it = (offsetTAU * 2) + (i * st);

		// If i < N-1 (Fortran: I < N), apply the reflector to A(i:M-1, i+1:N-1)
		if ( i < N - 1 ) {
			// Set A(i,i) = 1 before applying the reflector
			ia = oA + (i * sa1) + (i * sa2);
			Av[ ia ] = 1.0;
			Av[ ia + 1 ] = 0.0;

			// ZLARF('Left', M-I, N-I-1, A(I,I), 1, TAU(I), A(I,I+1), LDA, WORK)

			// In Fortran 1-based: M-I+1 rows from row I, N-I cols from col I+1

			// In 0-based: M-i rows from row i, N-i-1 cols from col i+1
			zlarf(
				'left', M - i, N - i - 1,
				A, strideA1, offsetA + (i * strideA1) + (i * strideA2),
				TAU, offsetTAU + (i * strideTAU),
				A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2),
				WORK, strideWork, offsetWork
			);
		}

		// If i < M-1 (Fortran: I < M), scale the sub-diagonal part of column i
		if ( i < M - 1 ) {
			// ZSCAL(M-I, -TAU(I), A(I+1,I), 1)
			// In 0-based: M-i-1 elements starting at A(i+1, i)
			negTau = new Complex128( -tauv[ it ], -tauv[ it + 1 ] );
			zscal(
				M - i - 1, negTau,
				A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2)
			);
		}

		// A(i,i) = 1 - TAU(i)
		ia = oA + (i * sa1) + (i * sa2);
		Av[ ia ] = 1.0 - tauv[ it ];
		Av[ ia + 1 ] = -tauv[ it + 1 ];

		// Zero out rows 0..i-1 of column i

		// Fortran: DO 30 L = 1, I-1
		for ( l = 0; l < i; l++ ) {
			ia = oA + (l * sa1) + (i * sa2);
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default zung2r;
