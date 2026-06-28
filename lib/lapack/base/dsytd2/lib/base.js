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

import dlarfg from '../../dlarfg/lib/base.js';
import dsymv from '../../../../blas/base/dsymv/lib/base.js';
import dsyr2 from '../../../../blas/base/dsyr2/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';


// VARIABLES //

var HALF = 0.5;


// MAIN //

/**
* Reduces a real symmetric matrix A to real symmetric tridiagonal form T.
* by an orthogonal similarity transformation: `Q__T*A*Q = T`.
*
* If UPLO = 'U', the matrix Q is represented as a product of elementary
* reflectors `Q = H(n-1)*...*H(2)*H(1)`, and if UPLO = 'L', the matrix
* Q is represented `as Q = H(1)*H(2)*...*H(n-1)`.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix; on exit, contains tridiagonal form and reflectors
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} d - output array for the diagonal elements of T (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array for the off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAU - output array for the scalar factors of the reflectors (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @returns {integer} status code (0 = success)
*/
function dsytd2( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	var alpha;
	var taui;
	var sa1;
	var sa2;
	var i;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	if ( uplo === 'upper' ) {
		// Reduce the upper triangle of A.
		// Fortran: DO 10 I = N-1, 1, -1  (1-based, iterating N-1 down to 1)
		// JS 0-based: i goes from N-2 down to 0
		// Fortran column i+1 (1-based) = JS column i+1 (0-based, since we use i from N-2..0 matching Fortran I from N-1..1)
		// In Fortran: A(I, I+1) is alpha, A(1:I-1, I+1) is the vector, column I+1
		// JS 0-based: A(i, i+1) = A[oA + i*sa1 + (i+1)*sa2], A(0:i-1, i+1) column starts at oA + (i+1)*sa2

		// D(N) = A(N,N) in Fortran → d[N-1] = A[oA + (N-1)*sa1 + (N-1)*sa2]
		// This is set at the end after the loop

		for ( i = N - 2; i >= 0; i-- ) {
			// Generate elementary reflector H(i+1) (Fortran H(I)) to annihilate A(0:i-1, i+1)
			// Fortran: CALL DLARFG(I, A(I, I+1), A(1, I+1), 1, TAUI)
			// I (Fortran) = i+1 (0-based i maps to Fortran I = i+1)
			// Wait - let's be more careful. Fortran I goes from N-1 down to 1.
			// JS i goes from N-2 down to 0, so i = Fortran_I - 1, i.e. Fortran_I = i+1.

			// dlarfg(I, A(I,I+1), A(1,I+1), 1, TAUI) with Fortran I = i+1:
			//   N_reflector = i+1 (= Fortran I)
			//   alpha = A(i, i+1) in 0-based = A[oA + i*sa1 + (i+1)*sa2]
			//   X = A(0, i+1) in 0-based = A[oA + 0*sa1 + (i+1)*sa2], stride=sa1 (=1 for col-major)
			//   Length of x = i+1 - 1 = i
			// Dlarfg signature: dlarfg(N, alpha_arr, offsetAlpha, x, strideX, offsetX, tau, offsetTau)
			dlarfg(i + 1,                              // N = Fortran I = i+1
				A, offsetA + (i * sa1) + (( i + 1 ) * sa2),  // alpha at A(i, i+1)
				A, sa1, offsetA + (( i + 1 ) * sa2),        // x = column i+1 starting at row 0, stride=sa1
				TAU, offsetTAU + (i * strideTAU)             // taui output
			);
			e[ offsetE + (i * strideE) ] = A[ offsetA + (i * sa1) + (( i + 1 ) * sa2) ];

			taui = TAU[ offsetTAU + (i * strideTAU) ];

			if ( taui !== 0.0 ) {
				// Set A(i, i+1) = 1 to form the reflector
				A[ offsetA + (i * sa1) + (( i + 1 ) * sa2) ] = 1.0;

				// Compute w := tau * A * v, where v is stored in A(0:i, i+1)

				// Fortran: DSYMV(UPLO, I, TAUI, A, LDA, A(1,I+1), 1, ZERO, TAU, 1)

				// I (Fortran) = i+1, so we compute on the leading (i+1)-by-(i+1) submatrix
				dsymv(uplo, i + 1, taui, A, sa1, sa2, offsetA,                          // A, leading (i+1)x(i+1)
					A, sa1, offsetA + (( i + 1 ) * sa2),            // v = column i+1, rows 0..i
					0.0, TAU, strideTAU, offsetTAU                     // w = TAU array used as workspace
				);

				// Compute alpha := -0.5 * tau * dot(w, v)

				// Fortran: ALPHA = -HALF*TAUI*DDOT(I, TAU, 1, A(1,I+1), 1)
				alpha = -(HALF * taui) * ddot(i + 1, TAU, strideTAU, offsetTAU, A, sa1, offsetA + (( i + 1 ) * sa2));

				// Compute w := w + alpha * v

				// Fortran: DAXPY(I, ALPHA, A(1,I+1), 1, TAU, 1)
				daxpy(i + 1, alpha, A, sa1, offsetA + (( i + 1 ) * sa2), TAU, strideTAU, offsetTAU);

				// Apply the transformation as a rank-2 update:

				//   A := A - v * w**T - w * v**T

				// Fortran: DSYR2(UPLO, I, -ONE, A(1,I+1), 1, TAU, 1, A, LDA)
				dsyr2(uplo, i + 1, -1.0, A, sa1, offsetA + (( i + 1 ) * sa2), TAU, strideTAU, offsetTAU, A, sa1, sa2, offsetA);

				// Restore A(i, i+1) = e(i)
				A[ offsetA + (i * sa1) + (( i + 1 ) * sa2) ] = e[ offsetE + (i * strideE) ];
			}
			// D(I+1) = A(I+1, I+1) in Fortran (1-based) → d[i+1] = A[oA + (i+1)*sa1 + (i+1)*sa2]
			d[ offsetD + (( i + 1 ) * strideD) ] = A[ offsetA + (( i + 1 ) * sa1) + (( i + 1 ) * sa2) ];
			TAU[ offsetTAU + (i * strideTAU) ] = taui;
		}
		// D(1) = A(1,1) in Fortran → d[0] = A[oA]
		d[ offsetD ] = A[ offsetA ];
	} else {
		// Reduce the lower triangle of A.
		// Fortran: DO 20 I = 1, N-1 (1-based)
		// JS 0-based: i goes from 0 to N-2, matching Fortran I = i+1

		for ( i = 0; i < N - 1; i++ ) {
			// Generate elementary reflector H(i+1) (Fortran H(I)) to annihilate A(i+2:N-1, i)
			// Fortran: DLARFG(N-I, A(I+1,I), A(MIN(I+2,N),I), 1, TAUI)
			// With Fortran I = i+1:
			//   N_reflector = N - (i+1) = N - i - 1
			//   alpha = A(I+1, I) (Fortran 1-based) = A(i+1, i) in 0-based = A[oA + (i+1)*sa1 + i*sa2]
			//   X starts at A(MIN(I+2,N), I) (Fortran 1-based) = A(min(i+2, N-1), i) in 0-based
			//     = A[oA + min(i+2, N-1)*sa1 + i*sa2]
			//   Stride = 1 = sa1 (for column-major)
			dlarfg(N - i - 1,                                         // N_reflector
				A, offsetA + (( i + 1 ) * sa1) + (i * sa2),           // alpha at A(i+1, i)
				A, sa1, offsetA + (Math.min( i + 2, N - 1 ) * sa1) + (i * sa2),  // x starting at A(min(i+2,N-1), i)
				TAU, offsetTAU + (i * strideTAU)                     // taui output
			);
			e[ offsetE + (i * strideE) ] = A[ offsetA + (( i + 1 ) * sa1) + (i * sa2) ];

			taui = TAU[ offsetTAU + (i * strideTAU) ];

			if ( taui !== 0.0 ) {
				// Set A(i+1, i) = 1 to form the reflector
				A[ offsetA + (( i + 1 ) * sa1) + (i * sa2) ] = 1.0;

				// Compute w := tau * A * v

				// Fortran: DSYMV(UPLO, N-I, TAUI, A(I+1,I+1), LDA, A(I+1,I), 1, ZERO, TAU(I), 1)

				// N-I (Fortran) = N - (i+1) = N - i - 1

				// A submatrix starts at A(i+1, i+1) in 0-based

				// V = column i, starting at row i+1

				// W goes into TAU starting at index i
				dsymv(uplo, N - i - 1, taui, A, sa1, sa2, offsetA + (( i + 1 ) * sa1) + (( i + 1 ) * sa2),  // A submatrix at (i+1, i+1)
					A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2),               // v = A(i+1:N-1, i)
					0.0, TAU, strideTAU, offsetTAU + (i * strideTAU)                   // w = TAU(i:)
				);

				// Compute alpha := -0.5 * tau * dot(w, v)

				// Fortran: ALPHA = -HALF*TAUI*DDOT(N-I, TAU(I), 1, A(I+1,I), 1)
				alpha = -(HALF * taui) * ddot(N - i - 1, TAU, strideTAU, offsetTAU + (i * strideTAU), A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2));

				// Compute w := w + alpha * v

				// Fortran: DAXPY(N-I, ALPHA, A(I+1,I), 1, TAU(I), 1)
				daxpy(N - i - 1, alpha, A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2), TAU, strideTAU, offsetTAU + (i * strideTAU));

				// Apply the transformation as a rank-2 update:

				//   A := A - v * w**T - w * v**T

				// Fortran: DSYR2(UPLO, N-I, -ONE, A(I+1,I), 1, TAU(I), 1, A(I+1,I+1), LDA)
				dsyr2(uplo, N - i - 1, -1.0, A, sa1, offsetA + (( i + 1 ) * sa1) + (i * sa2), TAU, strideTAU, offsetTAU + (i * strideTAU), A, sa1, sa2, offsetA + (( i + 1 ) * sa1) + (( i + 1 ) * sa2));

				// Restore A(i+1, i) = e(i)
				A[ offsetA + (( i + 1 ) * sa1) + (i * sa2) ] = e[ offsetE + (i * strideE) ];
			}
			// D(I) = A(I,I) in Fortran (1-based) → d[i] = A[oA + i*sa1 + i*sa2]
			d[ offsetD + (i * strideD) ] = A[ offsetA + (i * sa1) + (i * sa2) ];
			TAU[ offsetTAU + (i * strideTAU) ] = taui;
		}
		// D(N) = A(N,N) in Fortran → d[N-1] = A[oA + (N-1)*sa1 + (N-1)*sa2]
		d[ offsetD + (( N - 1 ) * strideD) ] = A[ offsetA + (( N - 1 ) * sa1) + (( N - 1 ) * sa2) ];
	}

	return 0;
}


// EXPORTS //

export default dsytd2;
