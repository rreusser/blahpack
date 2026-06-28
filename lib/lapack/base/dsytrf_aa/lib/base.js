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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dgemm from './../../../../blas/base/dgemm/lib/base.js';
import dlasyfAa from './../../dlasyf_aa/lib/base.js';


// VARIABLES //

var NB = 32; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes the factorization of a real symmetric matrix `A` using Aasen's algorithm (blocked).
*
* The form of the factorization is:
*
* ```text
* A = U^T*T*U  or  A = L*T*L^T
* ```
*
* where `U` (or `L`) is a product of permutation and unit upper (lower)
* triangular matrices, and `T` is a symmetric tridiagonal matrix.
*
* On exit, the tridiagonal matrix is stored in the diagonals and the
* subdiagonals of `A`, and `L` (or `U`) is stored below (or above) the
* subdiagonals.
*
* `IPIV` stores standard 0-based pivot indices. Aasen's algorithm does NOT
* use the Bunch-Kaufman negative-IPIV encoding; entries are plain row
* swaps recorded as 0-based indices.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Int32Array} IPIV - pivot index output array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} `0`
*/
function dsytrfAa( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var alpha;
	var WORK;
	var sa1;
	var sa2;
	var nb;
	var jb;
	var k1;
	var k2;
	var mj;
	var nj;
	var J1;
	var j2;
	var j3;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;

	if ( N === 0 ) {
		return 0;
	}

	// Store IPIV(1) = 1 (Fortran) → 0 (0-based JS): row 0 stays at row 0.
	IPIV[ offsetIPIV ] = 0;

	if ( N === 1 ) {
		return 0;
	}

	// Allocate WORK: H is N rows × NB cols (N*NB doubles), plus scratch of length N for the panel kernel.
	nb = NB;
	WORK = new Float64Array( N * ( nb + 1 ) );

	if ( uplo === 'upper' ) {
		// Factorize A as U^T*T*U using the upper triangle of A.

		// Copy first row A(1, 1:N) into H(1:N) (stored at WORK(1:N)).
		// Fortran row 1, all N columns, stride=LDA in row direction.
		dcopy( N, A, sa2, offsetA, WORK, 1, 0 );

		j = 0;
		while ( j < N ) {
			// J is the last column index (0-based) of the previous panel; J1 is the first column index (Fortran 1-based) of the current panel.
			J1 = j + 1;
			jb = ( ( N - J1 + 1 ) < nb ) ? ( N - J1 + 1 ) : nb;

			// K1 identifies if the previous column of the panel has been explicitly stored:

			//   K1=1 for the first panel (j=0), K1=0 for the rest.
			k1 = ( j === 0 ) ? 1 : 0;

			// Panel factorization.

			// Fortran: CALL DLASYF_AA( UPLO, 2-K1, N-J, JB, A( MAX(1,J), J+1 ), LDA, IPIV( J+1 ), WORK, N, WORK( N*NB+1 ) )

			// A( MAX(1, J), J+1 ) → 0-based row max(1,J)-1 = (j === 0 ? 0 : j-1), 0-based col = j.

			// H is laid out at WORK[0..N*NB-1] with strideH1=1, strideH2=N.

			// Scratch WORK is at WORK[N*NB..].
			dlasyfAa(uplo, 2 - k1, N - j, jb, A, sa1, sa2, offsetA + ( ( ( j === 0 ) ? 0 : ( j - 1 ) ) * sa1 ) + ( j * sa2 ), IPIV, strideIPIV, offsetIPIV + ( j * strideIPIV ), WORK, 1, N, 0, WORK, 1, N * nb);

			// Adjust IPIV and apply it back. (J-th step picks (J+1)-th pivot.)

			// Fortran: DO J2 = J+2, MIN(N, J+JB+1)

			//   IPIV(J2) = IPIV(J2) + J

			//   IF ((J2 .NE. IPIV(J2)) .AND. ((J1-K1) > 2)) DSWAP( J1-K1-2, A(1,J2), 1, A(1, IPIV(J2)), 1 )

			// JS: IPIV is 0-based; dlasyf_aa wrote 0-based indices into IPIV[J+1..]. Adjust by `j` to make global 0-based.
			for ( j2 = j + 1; j2 < ( ( N < ( j + jb + 1 ) ) ? N : ( j + jb + 1 ) ); j2 += 1 ) {
				IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] += j;

				// Compare 0-based j2 against (Fortran 1-based stored pivot - 1) = pivot 0-based; but our IPIV is already 0-based. So compare j2 to IPIV[j2].
				if ( ( j2 !== IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] ) && ( ( J1 - k1 ) > 2 ) ) {
					// DSWAP( J1-K1-2, A(1, J2), 1, A(1, IPIV(J2)), 1 )
					// J2 here is Fortran's J2 = (j2+1), so column (j2+1)-1 = j2. IPIV(J2) Fortran 1-based = stored 0-based + 1, so column = stored 0-based.
					dswap(J1 - k1 - 2, A, sa1, offsetA + ( j2 * sa2 ), A, sa1, offsetA + ( IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] * sa2 ));
				}
			}

			j += jb;

			// Trailing submatrix update.
			if ( j < N ) {
				// If first panel and JB=1 (NB=1), nothing to do.
				if ( J1 > 1 || jb > 1 ) {
					// Merge rank-1 update with BLAS-3 update.
					// ALPHA = A(J, J+1) Fortran → 0-based: row j-1, col j.
					alpha = A[ offsetA + ( ( j - 1 ) * sa1 ) + ( j * sa2 ) ];
					A[ offsetA + ( ( j - 1 ) * sa1 ) + ( j * sa2 ) ] = 1.0;

					// DCOPY( N-J, A(J-1, J+1), LDA, WORK( (J+1-J1+1)+JB*N ), 1 )

					// A(J-1, J+1) Fortran 1-based with current J = j (just updated j after panel).

					//   But careful: Fortran J after j += jb. Here j is 0-based already.

					//   Fortran's J after panel = j (0-based). So A(J-1, J+1) Fortran = A(j-1, j+1), 0-based: row=j-2, col=j.

					// WORK index: Fortran (J+1-J1+1)+JB*N. With Fortran J = j (0-based here = Fortran j-shifted by panel), J1=j-jb+1 (the original first panel col Fortran 1-based).

					// Actually: J1 was set BEFORE j += jb. After j += jb, Fortran J = j_post_increment. But Fortran J1 still refers to first col of prev panel.

					// Let's recompute: Fortran J BEFORE the increment is j_pre = (j_post - jb). After J = J + JB, Fortran J = j_post (0-based equivalent).

					// (J+1-J1+1) Fortran = (j_post+1 - J1 + 1) = (j_post - J1 + 2) = (j_post - (j_pre+1) + 2) = (j_post - j_pre + 1) = (jb+1).

					// So WORK( (J+1-J1+1) + JB*N ) Fortran 1-based = WORK( (jb+1) + jb*N ).

					// 0-based JS: index = jb + jb*N = (jb)*(N+1).
					dcopy(N - j, A, sa2, offsetA + ( ( j - 2 ) * sa1 ) + ( j * sa2 ), WORK, 1, jb + ( jb * N ));
					dscal( N - j, alpha, WORK, 1, jb + ( jb * N ) );

					// K1 identifies if the previous column of the panel has been explicitly stored.

					// J1>1 (Fortran) means j_pre > 0 (i.e., not first panel).
					if ( J1 > 1 ) {
						// Not first panel.
						k2 = 1;
					} else {
						// First panel.
						k2 = 0;

						// First update skips the first column.
						jb -= 1;
					}

					// DO J2 = J+1, N, NB  Fortran 1-based: column J+1 to N stride NB.
					// JS 0-based: j2 from j to N-1 stride NB.
					for ( j2 = j; j2 < N; j2 += NB ) {
						// NJ = MIN( NB, N-J2+1 ) Fortran. JS: nj = min(NB, N - j2).
						nj = ( NB < ( N - j2 ) ) ? NB : ( N - j2 );

						// Update (J2, J2) diagonal block with DGEMV.

						// Fortran J3 = J2 (1-based), JS j3 = j2 (0-based).
						j3 = j2;
						for ( mj = nj - 1; mj >= 1; mj -= 1 ) {
							// DGEMV( 'No transpose', MJ, JB+1, -1, WORK(J3-J1+1+K1*N), N, A(J1-K2, J3), 1, 1, A(J3, J3), LDA )
							// WORK(J3-J1+1+K1*N) Fortran 1-based: J3 Fortran=j3+1, J1 Fortran=J1, K1*N rows = column index k1.
							//   Index Fortran = (j3+1) - J1 + 1 + k1*N = j3 - J1 + 2 + k1*N
							//   0-based JS = j3 - J1 + 1 + k1*N, with strideH1=1, strideH2=N => offset = j3 - J1 + 1 + k1*N (since strideH1=1).
							//   With J1 = j_pre+1 (Fortran), this = j3 - j_pre + k1*N.
							// A(J1-K2, J3) Fortran: row=J1-K2 (1-based), col=J3=j3+1.
							//   0-based: row = J1 - k2 - 1, col = j3.
							dgemv('no-transpose', mj, jb + 1, -1.0, WORK, 1, N, ( j3 - J1 + 1 ) + ( k1 * N ), A, sa1, offsetA + ( ( J1 - k2 - 1 ) * sa1 ) + ( j3 * sa2 ), 1.0, A, sa2, offsetA + ( j3 * sa1 ) + ( j3 * sa2 ));
							j3 += 1;
						}

						// Update off-diagonal block of J2-th block row with DGEMM.
						// Fortran: DGEMM( 'Transpose', 'Transpose', NJ, N-J3+1, JB+1, -1, A(J1-K2, J2), LDA, WORK(J3-J1+1+K1*N), N, 1, A(J2, J3), LDA )
						// Note: after the inner loop, J3 = J2 + NJ - 1 (Fortran), so 0-based: j3 = j2 + nj - 1. (Because j3 incremented `nj-1` times from j2.)
						// N - J3 + 1 Fortran = N - (j3+1) + 1 = N - j3.
						dgemm('transpose', 'transpose', nj, N - j3, jb + 1, -1.0, A, sa1, sa2, offsetA + ( ( J1 - k2 - 1 ) * sa1 ) + ( j2 * sa2 ), WORK, 1, N, ( j3 - J1 + 1 ) + ( k1 * N ), 1.0, A, sa1, sa2, offsetA + ( j2 * sa1 ) + ( j3 * sa2 ));
					}

					// Recover T(J, J+1).
					A[ offsetA + ( ( j - 1 ) * sa1 ) + ( j * sa2 ) ] = alpha;
				}

				// WORK(1:N-J) stores H(J+1, 1) — copy A(J+1, J+1) row into WORK(1).
				// Fortran: DCOPY( N-J, A(J+1, J+1), LDA, WORK(1), 1 ).
				// 0-based: row=j, col=j, stride along col direction = sa2.
				dcopy( N - j, A, sa2, offsetA + ( j * sa1 ) + ( j * sa2 ), WORK, 1, 0 );
			}
		}
		return 0;
	}

	// Lower triangle: factorize A as L*T*L^T using the lower triangle of A.

	// Copy first column A(1:N, 1) into H(1:N) (stored at WORK(1:N)).
	dcopy( N, A, sa1, offsetA, WORK, 1, 0 );

	j = 0;
	while ( j < N ) {
		J1 = j + 1;
		jb = ( ( N - J1 + 1 ) < nb ) ? ( N - J1 + 1 ) : nb;

		k1 = ( j === 0 ) ? 1 : 0;

		// Panel factorization.

		// Fortran: A( J+1, MAX(1,J) ) → row=j, col=max(1,j)-1 = (j === 0 ? 0 : j-1).
		dlasyfAa(uplo, 2 - k1, N - j, jb, A, sa1, sa2, offsetA + ( j * sa1 ) + ( ( ( j === 0 ) ? 0 : ( j - 1 ) ) * sa2 ), IPIV, strideIPIV, offsetIPIV + ( j * strideIPIV ), WORK, 1, N, 0, WORK, 1, N * nb);

		// Adjust IPIV and apply it back.
		for ( j2 = j + 1; j2 < ( ( N < ( j + jb + 1 ) ) ? N : ( j + jb + 1 ) ); j2 += 1 ) {
			IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] += j;

			if ( ( j2 !== IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] ) && ( ( J1 - k1 ) > 2 ) ) {
				// DSWAP( J1-K1-2, A(J2, 1), LDA, A(IPIV(J2), 1), LDA )
				// 0-based: row=j2 (or stored pivot), col=0; row stride for column traversal => sa2.
				dswap(J1 - k1 - 2, A, sa2, offsetA + ( j2 * sa1 ), A, sa2, offsetA + ( IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] * sa1 ));
			}
		}

		j += jb;

		if ( j < N ) {
			if ( J1 > 1 || jb > 1 ) {
				// ALPHA = A(J+1, J) Fortran → row=j, col=j-1.
				alpha = A[ offsetA + ( j * sa1 ) + ( ( j - 1 ) * sa2 ) ];
				A[ offsetA + ( j * sa1 ) + ( ( j - 1 ) * sa2 ) ] = 1.0;

				// DCOPY( N-J, A(J+1, J-1), 1, WORK(...), 1 ).
				// Fortran: row=j, col=j-2 (0-based), down a column => stride=sa1.
				dcopy(N - j, A, sa1, offsetA + ( j * sa1 ) + ( ( j - 2 ) * sa2 ), WORK, 1, jb + ( jb * N ));
				dscal( N - j, alpha, WORK, 1, jb + ( jb * N ) );

				if ( J1 > 1 ) {
					k2 = 1;
				} else {
					k2 = 0;
					jb -= 1;
				}

				for ( j2 = j; j2 < N; j2 += NB ) {
					nj = ( NB < ( N - j2 ) ) ? NB : ( N - j2 );

					j3 = j2;
					for ( mj = nj - 1; mj >= 1; mj -= 1 ) {
						// DGEMV( 'No transpose', MJ, JB+1, -1, WORK(J3-J1+1+K1*N), N, A(J3, J1-K2), LDA, 1, A(J3, J3), 1 )
						// A(J3, J1-K2) Fortran: row=j3, col=J1-k2-1.
						// A(J3, J3) result: row=j3, col=j3, vector along column direction => stride=sa1.
						dgemv('no-transpose', mj, jb + 1, -1.0, WORK, 1, N, ( j3 - J1 + 1 ) + ( k1 * N ), A, sa2, offsetA + ( j3 * sa1 ) + ( ( J1 - k2 - 1 ) * sa2 ), 1.0, A, sa1, offsetA + ( j3 * sa1 ) + ( j3 * sa2 ));
						j3 += 1;
					}

					// DGEMM( 'No transpose', 'Transpose', N-J3+1, NJ, JB+1, -1, WORK(J3-J1+1+K1*N), N, A(J2, J1-K2), LDA, 1, A(J3, J2), LDA )
					dgemm('no-transpose', 'transpose', N - j3, nj, jb + 1, -1.0, WORK, 1, N, ( j3 - J1 + 1 ) + ( k1 * N ), A, sa1, sa2, offsetA + ( j2 * sa1 ) + ( ( J1 - k2 - 1 ) * sa2 ), 1.0, A, sa1, sa2, offsetA + ( j3 * sa1 ) + ( j2 * sa2 ));
				}

				// Recover T(J+1, J).
				A[ offsetA + ( j * sa1 ) + ( ( j - 1 ) * sa2 ) ] = alpha;
			}

			// Copy A(J+1, J+1) column into WORK(1:N-J).
			dcopy( N - j, A, sa1, offsetA + ( j * sa1 ) + ( j * sa2 ), WORK, 1, 0 );
		}
	}
	return 0;
}


// EXPORTS //

export default dsytrfAa;
