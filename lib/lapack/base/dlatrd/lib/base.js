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

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dsymv from '../../../../blas/base/dsymv/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';


// MAIN //

/**
* Reduces NB rows and columns of a real symmetric matrix A to symmetric.
* tridiagonal form by an orthogonal similarity transformation `Q__T*A*Q`,
* and returns the matrices V and W which are needed to apply the
* transformation to the unreduced part of A.
*
* If UPLO = 'U', DLATRD reduces the last NB rows and columns of a matrix,
* of which the upper triangle is supplied;
* if UPLO = 'L', DLATRD reduces the first NB rows and columns of a matrix,
* of which the lower triangle is supplied.
*
* This is an auxiliary routine called by DSYTRD.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of A is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {integer} nb - number of rows and columns to reduce
* @param {Float64Array} A - input matrix (N-by-N, symmetric)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAU - scalar factors of the elementary reflectors (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} W - output matrix (N-by-NB)
* @param {integer} strideW1 - stride of the first dimension of `W`
* @param {integer} strideW2 - stride of the second dimension of `W`
* @param {NonNegativeInteger} offsetW - starting index for `W`
*/
function dlatrd( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW ) {
	var alpha;
	var iw;
	var i;

	if ( N <= 0 ) {
		return;
	}

	if ( uplo === 'upper' ) {
		// Reduce last NB columns of upper triangle
		// Fortran loop: DO I = N, N-NB+1, -1
		// 0-based: i goes from N-1 down to N-nb
		for ( i = N - 1; i >= N - nb; i-- ) {
			iw = i - N + nb; // 0-based column index in W

			if ( i < N - 1 ) {
				// Update A(0:i, i)
				// A(1:I,I) := A(1:I,I) - A(1:I,I+1:N) * W(I,IW+1:NB-1)^T
				dgemv( 'no-transpose', i + 1, N - 1 - i, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), W, strideW2, offsetW + (i * strideW1) + (( iw + 1 ) * strideW2), 1.0, A, strideA1, offsetA + (i * strideA2));

				// A(1:I,I) := A(1:I,I) - W(1:I,IW+1:NB-1) * A(I,I+1:N)^T
				dgemv( 'no-transpose', i + 1, N - 1 - i, -1.0, W, strideW1, strideW2, offsetW + (( iw + 1 ) * strideW2), A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), 1.0, A, strideA1, offsetA + (i * strideA2));
			}

			if ( i > 0 ) {
				// Generate elementary reflector H(i) to annihilate A(0:i-2, i)
				// Fortran: DLARFG(I-1, A(I-1,I), A(1,I), 1, TAU(I-1))
				// 0-based: dlarfg(i, A[i-1,i], A[0,i], 1, TAU[i-1])
				dlarfg( i, A, offsetA + (( i - 1 ) * strideA1) + (i * strideA2), A, strideA1, offsetA + (i * strideA2), TAU, offsetTAU + (( i - 1 ) * strideTAU));
				e[ offsetE + (( i - 1 ) * strideE) ] = A[ offsetA + (( i - 1 ) * strideA1) + (i * strideA2) ];
				A[ offsetA + (( i - 1 ) * strideA1) + (i * strideA2) ] = 1.0;

				// Compute W(0:i-1, iw)

				// W(1:I-1,IW) := A(1:I-1,1:I-1) * A(1:I-1,I) (symmetric multiply)
				dsymv( 'upper', i, 1.0, A, strideA1, strideA2, offsetA, A, strideA1, offsetA + (i * strideA2), 0.0, W, strideW1, offsetW + (iw * strideW2));

				if ( i < N - 1 ) {
					// W(I+1:N,IW) := W(1:I-1,IW+1:NB-1)^T * A(1:I-1,I)
					dgemv( 'transpose', i, N - 1 - i, 1.0, W, strideW1, strideW2, offsetW + (( iw + 1 ) * strideW2), A, strideA1, offsetA + (i * strideA2), 0.0, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2));

					// W(1:I-1,IW) := W(1:I-1,IW) - A(1:I-1,I+1:N) * W(I+1:N,IW)
					dgemv( 'no-transpose', i, N - 1 - i, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2), 1.0, W, strideW1, offsetW + (iw * strideW2));

					// W(I+1:N,IW) := A(1:I-1,I+1:N)^T * A(1:I-1,I)
					dgemv( 'transpose', i, N - 1 - i, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA2), A, strideA1, offsetA + (i * strideA2), 0.0, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2));

					// W(1:I-1,IW) := W(1:I-1,IW) - W(1:I-1,IW+1:NB-1) * W(I+1:N,IW)
					dgemv( 'no-transpose', i, N - 1 - i, -1.0, W, strideW1, strideW2, offsetW + (( iw + 1 ) * strideW2), W, strideW1, offsetW + (( i + 1 ) * strideW1) + (iw * strideW2), 1.0, W, strideW1, offsetW + (iw * strideW2));
				}

				// W(1:I-1,IW) := TAU(I-1) * W(1:I-1,IW)
				dscal( i, TAU[ offsetTAU + (( i - 1 ) * strideTAU) ], W, strideW1, offsetW + (iw * strideW2));

				// ALPHA := -0.5 * TAU(I-1) * W(1:I-1,IW)^T * A(1:I-1,I)
				alpha = -( 0.5 * TAU[ offsetTAU + (( i - 1 ) * strideTAU) ] ) *
					ddot( i, W, strideW1, offsetW + (iw * strideW2), A, strideA1, offsetA + (i * strideA2));

				// W(1:I-1,IW) := W(1:I-1,IW) + ALPHA * A(1:I-1,I)
				daxpy( i, alpha, A, strideA1, offsetA + (i * strideA2), W, strideW1, offsetW + (iw * strideW2));
			}
		}
	} else {
		// Reduce first NB columns of lower triangle
		// Fortran loop: DO I = 1, NB
		// 0-based: i goes from 0 to nb-1
		for ( i = 0; i < nb; i++ ) {
			// Update A(i:N-1, i)
			// A(I:N,I) := A(I:N,I) - A(I:N,1:I-1) * W(I,1:I-1)^T
			dgemv( 'no-transpose', N - i, i, -1.0, A, strideA1, strideA2, offsetA + (i * strideA1), W, strideW2, offsetW + (i * strideW1), 1.0, A, strideA1, offsetA + (i * strideA1) + (i * strideA2));

			// A(I:N,I) := A(I:N,I) - W(I:N,1:I-1) * A(I,1:I-1)^T
			dgemv( 'no-transpose', N - i, i, -1.0, W, strideW1, strideW2, offsetW + (i * strideW1), A, strideA2, offsetA + (i * strideA1), 1.0, A, strideA1, offsetA + (i * strideA1) + (i * strideA2));

			if ( i < N - 1 ) {
				// Generate elementary reflector H(i) to annihilate A(i+2:N-1, i)
				// Fortran: DLARFG(N-I, A(I+1,I), A(MIN(I+2,N),I), 1, TAU(I))
				// 0-based: dlarfg(N-i-1, A[i+1,i], A[min(i+2,N-1),i], 1, TAU[i])
				dlarfg( N - i - 1, A, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 2, N - 1 ) * strideA1) + (i * strideA2), TAU, offsetTAU + (i * strideTAU));
				e[ offsetE + (i * strideE) ] = A[ offsetA + (( i + 1 ) * strideA1) + (i * strideA2) ];
				A[ offsetA + (( i + 1 ) * strideA1) + (i * strideA2) ] = 1.0;

				// Compute W(i+1:N-1, i)

				// W(I+1:N,I) := A(I+1:N,I+1:N) * A(I+1:N,I) (symmetric multiply)
				dsymv( 'lower', N - i - 1, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), 0.0, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2));

				// W(1:I-1,I) := W(I+1:N,1:I-1)^T * A(I+1:N,I)
				dgemv( 'transpose', N - i - 1, i, 1.0, W, strideW1, strideW2, offsetW + (( i + 1 ) * strideW1), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), 0.0, W, strideW1, offsetW + (i * strideW2));

				// W(I+1:N,I) := W(I+1:N,I) - A(I+1:N,1:I-1) * W(1:I-1,I)
				dgemv( 'no-transpose', N - i - 1, i, -1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1), W, strideW1, offsetW + (i * strideW2), 1.0, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2));

				// W(1:I-1,I) := A(I+1:N,1:I-1)^T * A(I+1:N,I)
				dgemv( 'transpose', N - i - 1, i, 1.0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), 0.0, W, strideW1, offsetW + (i * strideW2));

				// W(I+1:N,I) := W(I+1:N,I) - W(I+1:N,1:I-1) * W(1:I-1,I)
				dgemv( 'no-transpose', N - i - 1, i, -1.0, W, strideW1, strideW2, offsetW + (( i + 1 ) * strideW1), W, strideW1, offsetW + (i * strideW2), 1.0, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2));

				// W(I+1:N,I) := TAU(I) * W(I+1:N,I)
				dscal( N - i - 1, TAU[ offsetTAU + (i * strideTAU) ], W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2));

				// ALPHA := -0.5 * TAU(I) * W(I+1:N,I)^T * A(I+1:N,I)
				alpha = -( 0.5 * TAU[ offsetTAU + (i * strideTAU) ] ) *
					ddot( N - i - 1, W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2), A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2));

				// W(I+1:N,I) := W(I+1:N,I) + ALPHA * A(I+1:N,I)
				daxpy( N - i - 1, alpha, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), W, strideW1, offsetW + (( i + 1 ) * strideW1) + (i * strideW2));
			}
		}
	}
}


// EXPORTS //

export default dlatrd;
