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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungqr from '../../zungqr/lib/base.js';
import zunglq from '../../zunglq/lib/base.js';


// MAIN //

/**
* Generate one of the complex unitary matrices Q or P^H determined by ZGEBRD.
* when reducing a complex matrix A to bidiagonal form: `A = Q*B*P^H`.
*
* Q and P^H are defined as products of elementary reflectors H(i) or G(i)
* respectively.
*
* If VECT = 'Q', A is assumed to have been an M-by-K matrix, and Q
* is of order M:
* if M >= K, Q = H(1) H(2) ... H(k) and zungbr returns the first N
* columns of Q, where M >= N >= K;
* if M < K, Q = H(1) H(2) ... H(m-1) and zungbr returns Q as an
* M-by-M unitary matrix.
*
* If VECT = 'P', A is assumed to have been a K-by-N matrix, and P^H
* is of order N:
* if K < N, P^H = G(1) G(2) ... G(k) and zungbr returns the first M
* rows of P^H, where N >= M >= K;
* if K >= N, P^H = G(1) G(2) ... G(n-1) and zungbr returns P^H as an
* N-by-N unitary matrix.
*
* @private
* @param {string} vect - 'q' to generate Q, 'p' to generate P^H
* @param {NonNegativeInteger} M - number of rows of the matrix Q or P^H
* @param {NonNegativeInteger} N - number of columns of the matrix Q or P^H
* @param {NonNegativeInteger} K - number of columns/rows in original matrix
* @param {Complex128Array} A - matrix containing reflectors from ZGEBRD
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} info - 0 if successful
*/
function zungbr( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var wantq;
	var sA1;
	var sA2;
	var idx;
	var Av;
	var oA;
	var i;
	var j;

	// Quick return
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	wantq = ( vect === 'apply-Q' );

	Av = reinterpret( A, 0 );
	sA1 = strideA1 * 2;
	sA2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( wantq ) {
		// Form Q = H(1) H(2) ... H(K)

		if ( M >= K ) {
			// Q was determined by a call to ZGEBRD with M >= K.
			// Simply apply ZUNGQR to the matrix A.
			zungqr(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		} else {
			// Q was determined by a call to ZGEBRD with M < K.
			// Need to shift columns and then apply ZUNGQR.

			// Shift the vectors which define the elementary reflectors one
			// Column to the right, and set the first row and column of Q
			// To those of the unit matrix.
			// Move columns M-1 down to 1, right by one (0-based: j from M-1 downto 1)
			for ( j = M - 1; j >= 1; j-- ) {
				// A(0, j) = 0
				idx = oA + (j * sA2);
				Av[ idx ] = 0.0;
				Av[ idx + 1 ] = 0.0;

				// Copy column j-1 to column j (rows j+1 to M-1, 0-based: i from j down to M-1)
				for ( i = j; i < M; i++ ) {
					idx = oA + (i * sA1) + (j * sA2);
					Av[ idx ] = Av[ oA + (i * sA1) + (( j - 1 ) * sA2) ];
					Av[ idx + 1 ] = Av[ oA + (i * sA1) + (( j - 1 ) * sA2) + 1 ];
				}
			}
			// Set A(0,0) = 1, A(i,0) = 0 for i >= 1
			Av[ oA ] = 1.0;
			Av[ oA + 1 ] = 0.0;
			for ( i = 1; i < M; i++ ) {
				idx = oA + (i * sA1);
				Av[ idx ] = 0.0;
				Av[ idx + 1 ] = 0.0;
			}

			if ( M > 1 ) {
				// Form Q(1:M-1, 1:M-1) using the reflectors
				zungqr(M - 1, M - 1, M - 1, A, strideA1, strideA2, offsetA + strideA1 + strideA2, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
			}
		}
	} else if ( K < N ) {
		// Form P^H = G(1) G(2) ... G(K)

		// P^H was determined by a call to ZGEBRD with K < N.
		// Simply apply ZUNGLQ to the matrix A.
		zunglq(M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	} else {
		// Form P^H = G(1) G(2) ... G(K)

		// P^H was determined by a call to ZGEBRD with K >= N.
		// Need to shift rows and then apply ZUNGLQ.

		// Set first row and column appropriately
		// A(0,0) = 1
		Av[ oA ] = 1.0;
		Av[ oA + 1 ] = 0.0;

		// A(i, 0) = 0 for i >= 1
		for ( i = 1; i < N; i++ ) {
			idx = oA + (i * sA1);
			Av[ idx ] = 0.0;
			Av[ idx + 1 ] = 0.0;
		}

		// Shift rows: for j from 1 to N-1, row j gets row j-1
		// (but shifted down one position in the first column direction)
		for ( j = 1; j < N; j++ ) {
			// Shift row: A(i, j) = A(i-1, j) for i from j-1 downto 1 (0-based)
			for ( i = j - 1; i >= 1; i-- ) {
				idx = oA + (i * sA1) + (j * sA2);
				Av[ idx ] = Av[ oA + (( i - 1 ) * sA1) + (j * sA2) ];
				Av[ idx + 1 ] = Av[ oA + (( i - 1 ) * sA1) + (j * sA2) + 1 ];
			}
			// A(0, j) = 0
			idx = oA + (j * sA2);
			Av[ idx ] = 0.0;
			Av[ idx + 1 ] = 0.0;
		}

		if ( N > 1 ) {
			// Form P^H(1:N-1, 1:N-1) using the reflectors
			zunglq(N - 1, N - 1, N - 1, A, strideA1, strideA2, offsetA + strideA1 + strideA2, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
		}
	}

	return 0;
}


// EXPORTS //

export default zungbr;
