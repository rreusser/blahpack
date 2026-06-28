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

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Reduces the first NB rows and columns of a real general M-by-N matrix A.
* to upper or lower bidiagonal form by an orthogonal transformation
* `Q__T*A*P`, and returns the matrices X and Y which are needed to apply
* the transformation to the unreduced part of A.
*
* If M >= N, A is reduced to upper bidiagonal form; if M < N, to lower
* bidiagonal form.
*
* This is an auxiliary routine called by DGEBRD.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} nb - number of leading rows and columns to reduce
* @param {Float64Array} A - input matrix (M-by-N, column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} d - real diagonal elements (length nb)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - real off-diagonal elements (length nb)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAUQ - scalars for Q reflectors (length nb)
* @param {integer} strideTAUQ - stride length for `TAUQ`
* @param {NonNegativeInteger} offsetTAUQ - starting index for `TAUQ`
* @param {Float64Array} TAUP - scalars for P reflectors (length nb)
* @param {integer} strideTAUP - stride length for `TAUP`
* @param {NonNegativeInteger} offsetTAUP - starting index for `TAUP`
* @param {Float64Array} X - output matrix (M-by-NB, column-major)
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} Y - output matrix (N-by-NB, column-major)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
*/
function dlabrd( M, N, nb, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY ) {
	var i;

	if ( M <= 0 || N <= 0 ) {
		return;
	}

	if ( M >= N ) {
		// Reduce to upper bidiagonal form
		for ( i = 0; i < nb; i++ ) {
			// Update A(i:M-1, i)
			// A(i:M-1,i) := A(i:M-1,i) - A(i:M-1,0:i-1) * Y(i,0:i-1)^T
			dgemv( 'no-transpose', M - i, i, -1.0, A, strideA1, strideA2, offsetA + (i * strideA1), Y, strideY2, offsetY + (i * strideY1), 1.0, A, strideA1, offsetA + (i * strideA1) + (i * strideA2));

			// A(i:M-1,i) := A(i:M-1,i) - X(i:M-1,0:i-1) * A(0:i-1,i)
			dgemv( 'no-transpose', M - i, i, -1.0, X, strideX1, strideX2, offsetX + (i * strideX1), A, strideA1, offsetA + (i * strideA2), 1.0, A, strideA1, offsetA + (i * strideA1) + (i * strideA2));

			// Generate elementary reflector H(i) to annihilate A(i+1:M-1, i)
			dlarfg( M - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2), TAUQ, offsetTAUQ + (i * strideTAUQ));
			d[ offsetD + (i * strideD) ] = A[ offsetA + (i * strideA1) + (i * strideA2) ];

			if ( i < N - 1 ) {
				// Set A(i,i) = 1 for use as the reflector vector
				A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0;

				// Compute Y(i+1:N-1, i)

				// Y(i+1:N-1,i) := A(i:M-1,i+1:N-1)^T * A(i:M-1,i)
				dgemv( 'transpose', M - i, N - i - 1, 1.0, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), A, strideA1, offsetA + (i * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Y(0:i-1,i) := A(i:M-1,0:i-1)^T * A(i:M-1,i)
				dgemv( 'transpose', M - i, i, 1.0, A, strideA1, strideA2, offsetA + (i * strideA1), A, strideA1, offsetA + (i * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (i * strideY2));

				// Y(i+1:N-1,i) := Y(i+1:N-1,i) - Y(i+1:N-1,0:i-1) * Y(0:i-1,i)
				dgemv( 'no-transpose', N - i - 1, i, -1.0, Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1), Y, strideY1, offsetY + (i * strideY2), 1.0, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Y(0:i-1,i) := X(i:M-1,0:i-1)^T * A(i:M-1,i)
				dgemv( 'transpose', M - i, i, 1.0, X, strideX1, strideX2, offsetX + (i * strideX1), A, strideA1, offsetA + (i * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (i * strideY2));

				// Y(i+1:N-1,i) := Y(i+1:N-1,i) - A(0:i-1,i+1:N-1)^T * Y(0:i-1,i)
				dgemv( 'transpose', i, N - i - 1, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), Y, strideY1, offsetY + (i * strideY2), 1.0, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Y(i+1:N-1,i) := TAUQ(i) * Y(i+1:N-1,i)
				dscal( N - i - 1, TAUQ[ offsetTAUQ + (i * strideTAUQ) ], Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Update A(i, i+1:N-1)

				// A(i,i+1:N-1) := A(i,i+1:N-1) - Y(i+1:N-1,0:i) * A(i,0:i)^T
				dgemv( 'no-transpose', N - i - 1, i + 1, -1.0, Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1), A, strideA2, offsetA + (i * strideA1), 1.0, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2));

				// A(i,i+1:N-1) := A(i,i+1:N-1) - A(0:i-1,i+1:N-1)^T * X(i,0:i-1)^T
				dgemv( 'transpose', i, N - i - 1, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), X, strideX2, offsetX + (i * strideX1), 1.0, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2));

				// Generate elementary reflector G(i) to annihilate A(i, i+2:N-1)
				dlarfg( N - i - 1, A, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 2, N - 1 ) * strideA2), TAUP, offsetTAUP + (i * strideTAUP));
				e[ offsetE + (i * strideE) ] = A[ offsetA + (i * strideA1) + (( i + 1 ) * strideA2) ];
				A[ offsetA + (i * strideA1) + (( i + 1 ) * strideA2) ] = 1.0;

				// Compute X(i+1:M-1, i)

				// X(i+1:M-1,i) := A(i+1:M-1,i+1:N-1) * A(i,i+1:N-1)^T
				dgemv( 'no-transpose', M - i - 1, N - i - 1, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), 0.0, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// X(0:i,i) := Y(i+1:N-1,0:i)^T * A(i,i+1:N-1)^T
				dgemv( 'transpose', N - i - 1, i + 1, 1.0, Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1), A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), 0.0, X, strideX1, offsetX + (i * strideX2));

				// X(i+1:M-1,i) := X(i+1:M-1,i) - A(i+1:M-1,0:i) * X(0:i,i)
				dgemv( 'no-transpose', M - i - 1, i + 1, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1), X, strideX1, offsetX + (i * strideX2), 1.0, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// X(0:i-1,i) := A(0:i-1,i+1:N-1) * A(i,i+1:N-1)^T
				dgemv( 'no-transpose', i, N - i - 1, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), 0.0, X, strideX1, offsetX + (i * strideX2));

				// X(i+1:M-1,i) := X(i+1:M-1,i) - X(i+1:M-1,0:i-1) * X(0:i-1,i)
				dgemv( 'no-transpose', M - i - 1, i, -1.0, X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1), X, strideX1, offsetX + (i * strideX2), 1.0, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// X(i+1:M-1,i) := TAUP(i) * X(i+1:M-1,i)
				dscal( M - i - 1, TAUP[ offsetTAUP + (i * strideTAUP) ], X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));
			}
		}
	} else {
		// Reduce to lower bidiagonal form (M < N)
		for ( i = 0; i < nb; i++ ) {
			// Update A(i, i:N-1)
			// A(i,i:N-1) := A(i,i:N-1) - Y(i:N-1,0:i-1) * A(i,0:i-1)^T
			dgemv( 'no-transpose', N - i, i, -1.0, Y, strideY1, strideY2, offsetY + (i * strideY1), A, strideA2, offsetA + (i * strideA1), 1.0, A, strideA2, offsetA + (i * strideA1) + (i * strideA2));

			// A(i,i:N-1) := A(i,i:N-1) - A(0:i-1,i:N-1)^T * X(i,0:i-1)^T
			dgemv( 'transpose', i, N - i, -1.0, A, strideA1, strideA2, offsetA + (i * strideA2), X, strideX2, offsetX + (i * strideX1), 1.0, A, strideA2, offsetA + (i * strideA1) + (i * strideA2));

			// Generate elementary reflector G(i) to annihilate A(i, i+1:N-1)
			dlarfg( N - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 1, N - 1 ) * strideA2), TAUP, offsetTAUP + (i * strideTAUP));
			d[ offsetD + (i * strideD) ] = A[ offsetA + (i * strideA1) + (i * strideA2) ];

			if ( i < M - 1 ) {
				// Set A(i,i) = 1 for use as reflector vector
				A[ offsetA + (i * strideA1) + (i * strideA2) ] = 1.0;

				// Compute X(i+1:M-1, i)

				// X(i+1:M-1,i) := A(i+1:M-1,i:N-1) * A(i,i:N-1)^T
				dgemv( 'no-transpose', M - i - 1, N - i, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), A, strideA2, offsetA + (i * strideA1) + (i * strideA2), 0.0, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// X(0:i-1,i) := Y(i:N-1,0:i-1)^T * A(i,i:N-1)^T
				dgemv( 'transpose', N - i, i, 1.0, Y, strideY1, strideY2, offsetY + (i * strideY1), A, strideA2, offsetA + (i * strideA1) + (i * strideA2), 0.0, X, strideX1, offsetX + (i * strideX2));

				// X(i+1:M-1,i) := X(i+1:M-1,i) - A(i+1:M-1,0:i-1) * X(0:i-1,i)
				dgemv( 'no-transpose', M - i - 1, i, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1), X, strideX1, offsetX + (i * strideX2), 1.0, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// X(0:i-1,i) := A(0:i-1,i:N-1) * A(i,i:N-1)^T
				dgemv( 'no-transpose', i, N - i, 1.0, A, strideA1, strideA2, offsetA + (i * strideA2), A, strideA2, offsetA + (i * strideA1) + (i * strideA2), 0.0, X, strideX1, offsetX + (i * strideX2));

				// X(i+1:M-1,i) := X(i+1:M-1,i) - X(i+1:M-1,0:i-1) * X(0:i-1,i)
				dgemv( 'no-transpose', M - i - 1, i, -1.0, X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1), X, strideX1, offsetX + (i * strideX2), 1.0, X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// X(i+1:M-1,i) := TAUP(i) * X(i+1:M-1,i)
				dscal( M - i - 1, TAUP[ offsetTAUP + (i * strideTAUP) ], X, strideX1, offsetX + (( i + 1 ) * strideX1) + (i * strideX2));

				// Update A(i+1:M-1, i)

				// A(i+1:M-1,i) := A(i+1:M-1,i) - A(i+1:M-1,0:i-1) * Y(i,0:i-1)^T
				dgemv( 'no-transpose', M - i - 1, i, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1), Y, strideY2, offsetY + (i * strideY1), 1.0, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2));

				// A(i+1:M-1,i) := A(i+1:M-1,i) - X(i+1:M-1,0:i) * A(0:i,i)
				dgemv( 'no-transpose', M - i - 1, i + 1, -1.0, X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1), A, strideA1, offsetA + (i * strideA2), 1.0, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2));

				// Generate elementary reflector H(i) to annihilate A(i+2:M-1, i)
				dlarfg( M - i - 1, A, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 2, M - 1 ) * strideA1) + (i * strideA2), TAUQ, offsetTAUQ + (i * strideTAUQ));
				e[ offsetE + (i * strideE) ] = A[ offsetA + (( i + 1 ) * strideA1) + (i * strideA2) ];
				A[ offsetA + (( i + 1 ) * strideA1) + (i * strideA2) ] = 1.0;

				// Compute Y(i+1:N-1, i)

				// Y(i+1:N-1,i) := A(i+1:M-1,i+1:N-1)^T * A(i+1:M-1,i)
				dgemv( 'transpose', M - i - 1, N - i - 1, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Y(0:i-1,i) := A(i+1:M-1,0:i-1)^T * A(i+1:M-1,i)
				dgemv( 'transpose', M - i - 1, i, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (i * strideY2));

				// Y(i+1:N-1,i) := Y(i+1:N-1,i) - Y(i+1:N-1,0:i-1) * Y(0:i-1,i)
				dgemv( 'no-transpose', N - i - 1, i, -1.0, Y, strideY1, strideY2, offsetY + (( i + 1 ) * strideY1), Y, strideY1, offsetY + (i * strideY2), 1.0, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Y(0:i,i) := X(i+1:M-1,0:i)^T * A(i+1:M-1,i)
				dgemv( 'transpose', M - i - 1, i + 1, 1.0, X, strideX1, strideX2, offsetX + (( i + 1 ) * strideX1), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (i * strideY2));

				// Y(i+1:N-1,i) := Y(i+1:N-1,i) - A(0:i,i+1:N-1)^T * Y(0:i,i)
				dgemv( 'transpose', i + 1, N - i - 1, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), Y, strideY1, offsetY + (i * strideY2), 1.0, Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));

				// Y(i+1:N-1,i) := TAUQ(i) * Y(i+1:N-1,i)
				dscal( N - i - 1, TAUQ[ offsetTAUQ + (i * strideTAUQ) ], Y, strideY1, offsetY + (( i + 1 ) * strideY1) + (i * strideY2));
			}
		}
	}
}


// EXPORTS //

export default dlabrd;
