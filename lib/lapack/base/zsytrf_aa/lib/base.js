/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import zlasyfAa from './../../zlasyf_aa/lib/base.js';


// VARIABLES //

const NB = 32; // Block size (hardcoded; Fortran uses ILAENV)
const NEGONE = new Complex128( -1.0, 0.0 );
const ONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix `A` using Aasen's algorithm (blocked).
*
* The form of the factorization is:
*
* ```text
* A = U^T*T*U  or  A = L*T*L^T
* ```
*
* where `U` (or `L`) is a product of permutation and unit upper (lower)
* triangular matrices, and `T` is a complex symmetric tridiagonal matrix.
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
* @param {Complex128Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Complex128Array} WORK - caller-owned workspace; base.js never allocates. Minimum length from `offsetWork` is `N*(NB+1)` (with `NB = 32`) when `N > 1`; unused otherwise.
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for `WORK` (in complex elements)
* @returns {integer} `0`
*/
function zsytrfAa( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	let alphaR, alphaI, alpha, idx, jb, k1, k2, mj, nj, J1, j2, j3, j;

	if ( N === 0 ) {
		return 0;
	}

	// Store IPIV(1) = 1 (Fortran) → 0 (0-based JS): row 0 stays at row 0.
	IPIV[ offsetIPIV ] = 0;

	if ( N === 1 ) {
		return 0;
	}

	// Float64 view of A for direct re/im scalar access at specific positions.
	const av = reinterpret( A, 0 );
	const oA = offsetA * 2;
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;

	// WORK layout (caller-owned): H is N rows x NB cols (N*NB complex elements) at
	// `offsetWork`, plus scratch of length N for the panel kernel at `offsetWork + N*NB*strideWork`.
	const nb = NB;

	if ( uplo === 'upper' ) {
		// Factorize A as U^T*T*U using the upper triangle of A.

		// Copy first row A(1, 1:N) into H(1:N) (stored at WORK(1:N)).
		// Fortran row 1, all N columns, stride=LDA in row direction.
		zcopy( N, A, strideA2, offsetA, WORK, strideWork, offsetWork );

		j = 0;
		while ( j < N ) {
			// J is the last column index (0-based) of the previous panel; J1 is the first column index (Fortran 1-based) of the current panel.
			J1 = j + 1;
			jb = ( ( N - J1 + 1 ) < nb ) ? ( N - J1 + 1 ) : nb;

			// K1 identifies if the previous column of the panel has been explicitly stored:

			//   K1=1 for the first panel (j=0), K1=0 for the rest.
			k1 = ( j === 0 ) ? 1 : 0;

			// Panel factorization.

			// Fortran: CALL ZLASYF_AA( UPLO, 2-K1, N-J, JB, A( MAX(1,J), J+1 ), LDA, IPIV( J+1 ), WORK, N, WORK( N*NB+1 ) )

			// A( MAX(1, J), J+1 ) → 0-based row max(1,J)-1 = (j === 0 ? 0 : j-1), 0-based col = j.

			// H is laid out at WORK[0..N*NB-1] with strideH1=1, strideH2=N.

			// Scratch WORK is at WORK[N*NB..].
			zlasyfAa( uplo, 2 - k1, N - j, jb, A, strideA1, strideA2, offsetA + ( ( ( j === 0 ) ? 0 : ( j - 1 ) ) * strideA1 ) + ( j * strideA2 ), IPIV, strideIPIV, offsetIPIV + ( j * strideIPIV ), WORK, strideWork, N * strideWork, offsetWork, WORK, strideWork, offsetWork + ( N * nb * strideWork ) );

			// Adjust IPIV and apply it back. (J-th step picks (J+1)-th pivot.)

			// Fortran: DO J2 = J+2, MIN(N, J+JB+1)

			//   IPIV(J2) = IPIV(J2) + J

			//   IF ((J2 .NE. IPIV(J2)) .AND. ((J1-K1) > 2)) ZSWAP( J1-K1-2, A(1,J2), 1, A(1, IPIV(J2)), 1 )

			// JS: IPIV is 0-based; zlasyf_aa wrote 0-based indices into IPIV[J+1..]. Adjust by `j` to make global 0-based.
			for ( j2 = j + 1; j2 < ( ( N < ( j + jb + 1 ) ) ? N : ( j + jb + 1 ) ); j2 += 1 ) {
				IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] += j;

				// Compare 0-based j2 against stored 0-based pivot.
				if ( ( j2 !== IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] ) && ( ( J1 - k1 ) > 2 ) ) {
					// ZSWAP( J1-K1-2, A(1, J2), 1, A(1, IPIV(J2)), 1 )
					zswap( J1 - k1 - 2, A, strideA1, offsetA + ( j2 * strideA2 ), A, strideA1, offsetA + ( IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] * strideA2 ) );
				}
			}

			j += jb;

			// Trailing submatrix update.
			if ( j < N ) {
				// If first panel and JB=1 (NB=1), nothing to do.
				if ( J1 > 1 || jb > 1 ) {
					// Merge rank-1 update with BLAS-3 update.
					// ALPHA = A(J, J+1) Fortran → 0-based: row j-1, col j.
					idx = oA + ( ( j - 1 ) * sa1 ) + ( j * sa2 );
					alphaR = av[ idx ];
					alphaI = av[ idx + 1 ];
					alpha = new Complex128( alphaR, alphaI );

					// A(J, J+1) = ONE.
					av[ idx ] = 1.0;
					av[ idx + 1 ] = 0.0;

					// ZCOPY( N-J, A(J-1, J+1), LDA, WORK( (J+1-J1+1)+JB*N ), 1 ).

					// 0-based: row=j-2, col=j; the WORK index is jb + jb*N (see dsytrf_aa derivation).
					zcopy( N - j, A, strideA2, offsetA + ( ( j - 2 ) * strideA1 ) + ( j * strideA2 ), WORK, strideWork, offsetWork + ( ( jb + ( jb * N ) ) * strideWork ) );
					zscal( N - j, alpha, WORK, strideWork, offsetWork + ( ( jb + ( jb * N ) ) * strideWork ) );

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

						// Update (J2, J2) diagonal block with ZGEMV.

						// Fortran J3 = J2 (1-based), JS j3 = j2 (0-based).
						j3 = j2;
						for ( mj = nj - 1; mj >= 1; mj -= 1 ) {
							// ZGEMV( 'No transpose', MJ, JB+1, -ONE, WORK(J3-J1+1+K1*N), N, A(J1-K2, J3), 1, ONE, A(J3, J3), LDA )
							// WORK index = j3 - J1 + 1 + k1*N (0-based, strideH1=1, strideH2=N).
							// A(J1-K2, J3) Fortran: row=J1-k2-1 (0-based), col=j3.
							// A(J3, J3) result: row=j3, col=j3, vector along row direction => stride=strideA2.
							zgemv( 'no-transpose', mj, jb + 1, NEGONE, WORK, strideWork, N * strideWork, offsetWork + ( ( ( j3 - J1 + 1 ) + ( k1 * N ) ) * strideWork ), A, strideA1, offsetA + ( ( J1 - k2 - 1 ) * strideA1 ) + ( j3 * strideA2 ), ONE, A, strideA2, offsetA + ( j3 * strideA1 ) + ( j3 * strideA2 ) );
							j3 += 1;
						}

						// Update off-diagonal block of J2-th block row with ZGEMM.
						// Fortran: ZGEMM( 'Transpose', 'Transpose', NJ, N-J3+1, JB+1, -ONE, A(J1-K2, J2), LDA, WORK(J3-J1+1+K1*N), N, ONE, A(J2, J3), LDA )
						// After inner loop, j3 = j2 + nj - 1 (0-based). N - J3 + 1 Fortran = N - j3.
						zgemm( 'transpose', 'transpose', nj, N - j3, jb + 1, NEGONE, A, strideA1, strideA2, offsetA + ( ( J1 - k2 - 1 ) * strideA1 ) + ( j2 * strideA2 ), WORK, strideWork, N * strideWork, offsetWork + ( ( ( j3 - J1 + 1 ) + ( k1 * N ) ) * strideWork ), ONE, A, strideA1, strideA2, offsetA + ( j2 * strideA1 ) + ( j3 * strideA2 ) );
					}

					// Recover T(J, J+1).
					idx = oA + ( ( j - 1 ) * sa1 ) + ( j * sa2 );
					av[ idx ] = alphaR;
					av[ idx + 1 ] = alphaI;
				}

				// WORK(1:N-J) stores H(J+1, 1) — copy A(J+1, J+1) row into WORK(1).
				// Fortran: ZCOPY( N-J, A(J+1, J+1), LDA, WORK(1), 1 ).
				// 0-based: row=j, col=j, stride along col direction = strideA2.
				zcopy( N - j, A, strideA2, offsetA + ( j * strideA1 ) + ( j * strideA2 ), WORK, strideWork, offsetWork );
			}
		}
		return 0;
	}

	// Lower triangle: factorize A as L*T*L^T using the lower triangle of A.

	// Copy first column A(1:N, 1) into H(1:N) (stored at WORK(1:N)).
	zcopy( N, A, strideA1, offsetA, WORK, strideWork, offsetWork );

	j = 0;
	while ( j < N ) {
		J1 = j + 1;
		jb = ( ( N - J1 + 1 ) < nb ) ? ( N - J1 + 1 ) : nb;

		k1 = ( j === 0 ) ? 1 : 0;

		// Panel factorization.

		// Fortran: A( J+1, MAX(1,J) ) → row=j, col=max(1,j)-1 = (j === 0 ? 0 : j-1).
		zlasyfAa( uplo, 2 - k1, N - j, jb, A, strideA1, strideA2, offsetA + ( j * strideA1 ) + ( ( ( j === 0 ) ? 0 : ( j - 1 ) ) * strideA2 ), IPIV, strideIPIV, offsetIPIV + ( j * strideIPIV ), WORK, strideWork, N * strideWork, offsetWork, WORK, strideWork, offsetWork + ( N * nb * strideWork ) );

		// Adjust IPIV and apply it back.
		for ( j2 = j + 1; j2 < ( ( N < ( j + jb + 1 ) ) ? N : ( j + jb + 1 ) ); j2 += 1 ) {
			IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] += j;

			if ( ( j2 !== IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] ) && ( ( J1 - k1 ) > 2 ) ) {
				// ZSWAP( J1-K1-2, A(J2, 1), LDA, A(IPIV(J2), 1), LDA )
				// 0-based: row=j2 (or stored pivot), col=0; row stride for column traversal => strideA2.
				zswap( J1 - k1 - 2, A, strideA2, offsetA + ( j2 * strideA1 ), A, strideA2, offsetA + ( IPIV[ offsetIPIV + ( j2 * strideIPIV ) ] * strideA1 ) );
			}
		}

		j += jb;

		if ( j < N ) {
			if ( J1 > 1 || jb > 1 ) {
				// ALPHA = A(J+1, J) Fortran → row=j, col=j-1.
				idx = oA + ( j * sa1 ) + ( ( j - 1 ) * sa2 );
				alphaR = av[ idx ];
				alphaI = av[ idx + 1 ];
				alpha = new Complex128( alphaR, alphaI );

				// A(J+1, J) = ONE.
				av[ idx ] = 1.0;
				av[ idx + 1 ] = 0.0;

				// ZCOPY( N-J, A(J+1, J-1), 1, WORK(...), 1 ).
				// Fortran: row=j, col=j-2 (0-based), down a column => stride=strideA1.
				zcopy( N - j, A, strideA1, offsetA + ( j * strideA1 ) + ( ( j - 2 ) * strideA2 ), WORK, strideWork, offsetWork + ( ( jb + ( jb * N ) ) * strideWork ) );
				zscal( N - j, alpha, WORK, strideWork, offsetWork + ( ( jb + ( jb * N ) ) * strideWork ) );

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
						// ZGEMV( 'No transpose', MJ, JB+1, -ONE, WORK(J3-J1+1+K1*N), N, A(J3, J1-K2), LDA, ONE, A(J3, J3), 1 )
						// A(J3, J1-K2) Fortran: row=j3, col=J1-k2-1.
						// A(J3, J3) result: row=j3, col=j3, vector along column direction => stride=strideA1.
						zgemv( 'no-transpose', mj, jb + 1, NEGONE, WORK, strideWork, N * strideWork, offsetWork + ( ( ( j3 - J1 + 1 ) + ( k1 * N ) ) * strideWork ), A, strideA2, offsetA + ( j3 * strideA1 ) + ( ( J1 - k2 - 1 ) * strideA2 ), ONE, A, strideA1, offsetA + ( j3 * strideA1 ) + ( j3 * strideA2 ) );
						j3 += 1;
					}

					// ZGEMM( 'No transpose', 'Transpose', N-J3+1, NJ, JB+1, -ONE, WORK(J3-J1+1+K1*N), N, A(J2, J1-K2), LDA, ONE, A(J3, J2), LDA )
					zgemm( 'no-transpose', 'transpose', N - j3, nj, jb + 1, NEGONE, WORK, strideWork, N * strideWork, offsetWork + ( ( ( j3 - J1 + 1 ) + ( k1 * N ) ) * strideWork ), A, strideA1, strideA2, offsetA + ( j2 * strideA1 ) + ( ( J1 - k2 - 1 ) * strideA2 ), ONE, A, strideA1, strideA2, offsetA + ( j3 * strideA1 ) + ( j2 * strideA2 ) );
				}

				// Recover T(J+1, J).
				idx = oA + ( j * sa1 ) + ( ( j - 1 ) * sa2 );
				av[ idx ] = alphaR;
				av[ idx + 1 ] = alphaI;
			}

			// Copy A(J+1, J+1) column into WORK(1:N-J).
			zcopy( N - j, A, strideA1, offsetA + ( j * strideA1 ) + ( j * strideA2 ), WORK, strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default zsytrfAa;
