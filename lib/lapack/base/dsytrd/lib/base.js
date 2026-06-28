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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytd2 from '../../dsytd2/lib/base.js';
import dlatrd from '../../dlatrd/lib/base.js';
import dsyr2k from '../../../../blas/base/dsyr2k/lib/base.js';


// VARIABLES //

var NB = 32; // block size (replaces ILAENV)


// MAIN //

/**
* Reduces a real symmetric matrix A to real symmetric tridiagonal form T.
* by an orthogonal similarity transformation: `Q__T*A*Q = T`.
*
* Uses the blocked algorithm: reduces NB columns at a time using dlatrd
* (panel factorization) and dsyr2k (trailing matrix update), then finishes
* the remaining block with dsytd2 (unblocked).
*
* If UPLO = 'U', the matrix Q is represented as a product of elementary
* reflectors `Q = H(n-1)*...*H(2)*H(1)`.
* If UPLO = 'L', the matrix Q is represented `as Q = H(1)*H(2)*...*H(n-1)`.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix; on exit contains tridiagonal form and reflectors
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
function dsytrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	var ldwork;
	var work;
	var sa1;
	var sa2;
	var nb;
	var nx;
	var kk;
	var i;
	var j;

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	// If N <= NB, use unblocked code (dsytd2) directly:
	if ( N <= NB ) {
		return dsytd2( uplo, N, A, sa1, sa2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU );
	}

	// Blocked algorithm: N > NB
	nb = NB;
	nx = nb; // crossover point (same as NB; ILAENV(3) typically returns NB)
	ldwork = N;

	// Allocate workspace for W matrix (N-by-NB), used by dlatrd
	work = new Float64Array( ldwork * nb );

	if ( uplo === 'upper' ) {
		// Reduce the upper triangle of A.
		// Columns 0:kk-1 (0-based) are handled by unblocked method.

		// Fortran: KK = N - ((N-NX+NB-1)/NB)*NB
		// This computes how many columns are left for the unblocked part.
		kk = N - ( Math.floor( ( N - nx + nb - 1 ) / nb ) * nb );

		// Fortran loop: DO I = N-NB+1, KK+1, -NB  (1-based)

		// In 0-based: i goes from N-nb down to kk, stepping by -nb

		// Fortran I corresponds to our i+1 (since Fortran is 1-based)

		// Actually let's keep i as the 0-based version of Fortran's I:

		//   Fortran I starts at N-NB+1, so 0-based i = N-NB+1-1 = N-NB

		//   Fortran loop ends at KK+1, so 0-based i >= KK+1-1 = KK
		for ( i = N - nb; i >= kk; i -= nb ) {
			// Reduce columns i:i+nb-1 (0-based) to tridiagonal form
			// And form the matrix W needed to update the unreduced part.

			// Fortran: DLATRD(UPLO, I+NB-1, NB, A, LDA, E, TAU, WORK, LDWORK)
			// Fortran I = i+1, so I+NB-1 = i+1+NB-1 = i+NB
			// Dlatrd signature: (uplo, N, nb, A, sa1, sa2, oA, e, sE, oE, TAU, sTAU, oTAU, W, sw1, sw2, oW)
			dlatrd(uplo, i + nb, nb, A, sa1, sa2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, work, 1, ldwork, 0);

			// Update the unreduced submatrix A(0:i-1, 0:i-1):

			//   A := A - V*W^T - W*V^T

			// Fortran: DSYR2K(UPLO, 'N', I-1, NB, -ONE, A(1,I), LDA, WORK, LDWORK, ONE, A, LDA)

			// Fortran I-1 = i+1-1 = i (the dimension of the submatrix)

			// A(1,I) in Fortran (1-based) = A(0, i) in 0-based = offsetA + i*sa2

			// WORK starts at (0,0) with strides (1, ldwork)
			dsyr2k(uplo, 'no-transpose', i, nb, -1.0, A, sa1, sa2, offsetA + (i * sa2), work, 1, ldwork, 0, 1.0, A, sa1, sa2, offsetA);

			// Copy superdiagonal elements back into A, and diagonal elements into D

			// Fortran: DO J = I, I+NB-1  (1-based)

			// 0-based: j from i to i+nb-1
			for ( j = i; j < i + nb; j++ ) {
				// Fortran: A(J-1, J) = E(J-1)  → A(j-1, j) = e[j-1]
				A[ offsetA + (( j - 1 ) * sa1) + (j * sa2) ] = e[ offsetE + (( j - 1 ) * strideE) ];

				// Fortran: D(J) = A(J, J)  → d[j] = A(j, j)
				d[ offsetD + (j * strideD) ] = A[ offsetA + (j * sa1) + (j * sa2) ];
			}
		}

		// Use unblocked code to reduce the last or only block (columns 0:kk-1)
		dsytd2( uplo, kk, A, sa1, sa2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU );
	} else {
		// Reduce the lower triangle of A.

		// Fortran loop: DO I = 1, N-NX, NB  (1-based)
		// 0-based: i from 0 to N-nx-1, stepping by nb
		// (Fortran I = i+1, upper bound Fortran is N-NX, so i+1 <= N-NX, i.e. i <= N-NX-1)
		// But actually: the Fortran loop is DO I = 1, N-NX, NB which means I takes values
		// 1, 1+NB, 1+2*NB, ... as long as I <= N-NX.
		// 0-based: i = 0, nb, 2*nb, ... while i <= N-nx-1 (since Fortran I = i+1 <= N-NX means i <= N-NX-1)

		i = 0;
		while ( i <= N - nx - 1 ) {
			// Reduce columns i:i+nb-1 (0-based) to tridiagonal form

			// Fortran: DLATRD(UPLO, N-I+1, NB, A(I,I), LDA, E(I), TAU(I), WORK, LDWORK)
			// Fortran I = i+1, so N-I+1 = N-(i+1)+1 = N-i
			// A(I,I) 1-based = A(i,i) 0-based = offsetA + i*sa1 + i*sa2
			// E(I) 1-based = e[i] 0-based (offset + i*stride)
			// TAU(I) 1-based = TAU[i] 0-based
			dlatrd(uplo, N - i, nb, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2), e, strideE, offsetE + (i * strideE), TAU, strideTAU, offsetTAU + (i * strideTAU), work, 1, ldwork, 0);

			// Update the unreduced submatrix A(i+nb:N-1, i+nb:N-1):

			//   A := A - V*W^T - W*V^T

			// Fortran: DSYR2K(UPLO, 'N', N-I-NB+1, NB, -ONE, A(I+NB, I), LDA, WORK(NB+1), LDWORK, ONE, A(I+NB, I+NB), LDA)

			// Fortran I = i+1, so N-I-NB+1 = N-(i+1)-NB+1 = N-i-NB

			// A(I+NB, I) 1-based = A(i+nb, i) 0-based = offsetA + (i+nb)*sa1 + i*sa2

			// WORK(NB+1) 1-based = work[nb] 0-based (row nb, col 0)

			// A(I+NB, I+NB) 1-based = A(i+nb, i+nb) 0-based
			dsyr2k(uplo, 'no-transpose', N - i - nb, nb, -1.0, A, sa1, sa2, offsetA + (( i + nb ) * sa1) + (i * sa2), work, 1, ldwork, nb, 1.0, A, sa1, sa2, offsetA + (( i + nb ) * sa1) + (( i + nb ) * sa2));

			// Copy subdiagonal elements back into A, and diagonal elements into D

			// Fortran: DO J = I, I+NB-1  (1-based), J is Fortran 1-based

			// 0-based: j from i to i+nb-1
			for ( j = i; j < i + nb; j++ ) {
				// Fortran: A(J+1, J) = E(J)  → A(j+1, j) = e[j]
				A[ offsetA + (( j + 1 ) * sa1) + (j * sa2) ] = e[ offsetE + (j * strideE) ];

				// Fortran: D(J) = A(J, J)  → d[j] = A(j, j)
				d[ offsetD + (j * strideD) ] = A[ offsetA + (j * sa1) + (j * sa2) ];
			}

			i += nb;
		}

		// Use unblocked code to reduce the last or only block
		// Fortran: DSYTD2(UPLO, N-I+1, A(I,I), LDA, D(I), E(I), TAU(I), IINFO)
		// Fortran I = i+1, so N-I+1 = N-i
		dsytd2(uplo, N - i, A, sa1, sa2, offsetA + (i * sa1) + (i * sa2), d, strideD, offsetD + (i * strideD), e, strideE, offsetE + (i * strideE), TAU, strideTAU, offsetTAU + (i * strideTAU));
	}

	return 0;
}


// EXPORTS //

export default dsytrd;
