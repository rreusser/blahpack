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

import dlarfg from '../../dlarfg/lib/base.js';
import dlarf from '../../dlarf/lib/base.js';


// MAIN //

/**
* Reduces a real M-by-N matrix A to upper or lower bidiagonal form B.
* by an orthogonal transformation: `Q__T*A*P = B`.
*
* If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
*
* The matrices Q and P are represented as products of elementary reflectors:
*
* If M >= N,
* Q = H(1) H(2) ... H(N)  and  P = G(1) G(2) ... G(N-1)
* If M < N,
* Q = H(1) H(2) ... H(M-1)  and  P = G(1) G(2) ... G(M)
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} d - output array of diagonal elements of B, length min(M,N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output array of off-diagonal elements of B, length min(M,N)-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} TAUQ - output array of scalar factors for Q, length min(M,N)
* @param {integer} strideTAUQ - stride for TAUQ
* @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ
* @param {Float64Array} TAUP - output array of scalar factors for P, length min(M,N)
* @param {integer} strideTAUP - stride for TAUP
* @param {NonNegativeInteger} offsetTAUP - starting index for TAUP
* @param {Float64Array} WORK - workspace array (length >= max(M,N))
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dgebd2( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork ) {
	var aii;
	var aij;
	var i;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	if ( M >= N ) {
		// Reduce to upper bidiagonal form
		for ( i = 0; i < N; i++ ) {
			// Index of A(i, i)
			aii = offsetA + (i * strideA1) + (i * strideA2);

			// Generate elementary reflector H(i) to annihilate A(i+1:M-1, i)

			// dlarfg: alpha is (array, offset), modifies in-place
			dlarfg( M - i, A, aii, A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2), TAUQ, offsetTAUQ + (i * strideTAUQ) );

			// D(i) = A(i,i) (the computed beta)
			d[ offsetD + (i * strideD) ] = A[ aii ];

			// Set A(i,i) = 1 for the reflector application
			A[ aii ] = 1.0;

			// Apply H(i) to A(i:M-1, i+1:N-1) from the left

			// dlarf: tau is a plain number
			if ( i < N - 1 ) {
				dlarf( 'left', M - i, N - i - 1, A, strideA1, aii, TAUQ[ offsetTAUQ + (i * strideTAUQ) ], A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );
			}

			// Restore A(i,i) = D(i)
			A[ aii ] = d[ offsetD + (i * strideD) ];

			if ( i < N - 1 ) {
				// Index of A(i, i+1)
				aij = offsetA + (i * strideA1) + (( i + 1 ) * strideA2);

				// Generate elementary reflector G(i) to annihilate A(i, i+2:N-1)
				dlarfg( N - i - 1, A, aij, A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 2, N - 1 ) * strideA2), TAUP, offsetTAUP + (i * strideTAUP) );

				// E(i) = A(i, i+1) (the computed beta)
				e[ offsetE + (i * strideE) ] = A[ aij ];

				// Set A(i, i+1) = 1 for the reflector application
				A[ aij ] = 1.0;

				// Apply G(i) to A(i+1:M-1, i+1:N-1) from the right
				dlarf( 'right', M - i - 1, N - i - 1, A, strideA2, aij, TAUP[ offsetTAUP + (i * strideTAUP) ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

				// Restore A(i, i+1) = E(i)
				A[ aij ] = e[ offsetE + (i * strideE) ];
			} else {
				TAUP[ offsetTAUP + (i * strideTAUP) ] = 0.0;
			}
		}
	} else {
		// Reduce to lower bidiagonal form
		for ( i = 0; i < M; i++ ) {
			// Index of A(i, i)
			aii = offsetA + (i * strideA1) + (i * strideA2);

			// Generate elementary reflector G(i) to annihilate A(i, i+1:N-1)
			dlarfg( N - i, A, aii, A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 1, N - 1 ) * strideA2), TAUP, offsetTAUP + (i * strideTAUP) );

			// D(i) = A(i,i) (the computed beta)
			d[ offsetD + (i * strideD) ] = A[ aii ];

			// Set A(i,i) = 1 for the reflector application
			A[ aii ] = 1.0;

			// Apply G(i) to A(i+1:M-1, i:N-1) from the right
			if ( i < M - 1 ) {
				dlarf( 'right', M - i - 1, N - i, A, strideA2, aii, TAUP[ offsetTAUP + (i * strideTAUP) ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), WORK, strideWork, offsetWork );
			}

			// Restore A(i,i) = D(i)
			A[ aii ] = d[ offsetD + (i * strideD) ];

			if ( i < M - 1 ) {
				// Index of A(i+1, i)
				aij = offsetA + (( i + 1 ) * strideA1) + (i * strideA2);

				// Generate elementary reflector H(i) to annihilate A(i+2:M-1, i)
				dlarfg( M - i - 1, A, aij, A, strideA1, offsetA + (Math.min( i + 2, M - 1 ) * strideA1) + (i * strideA2), TAUQ, offsetTAUQ + (i * strideTAUQ) );

				// E(i) = A(i+1, i) (the computed beta)
				e[ offsetE + (i * strideE) ] = A[ aij ];

				// Set A(i+1, i) = 1 for the reflector application
				A[ aij ] = 1.0;

				// Apply H(i) to A(i+1:M-1, i+1:N-1) from the left
				dlarf( 'left', M - i - 1, N - i - 1, A, strideA1, aij, TAUQ[ offsetTAUQ + (i * strideTAUQ) ], A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

				// Restore A(i+1, i) = E(i)
				A[ aij ] = e[ offsetE + (i * strideE) ];
			} else {
				TAUQ[ offsetTAUQ + (i * strideTAUQ) ] = 0.0;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dgebd2;
