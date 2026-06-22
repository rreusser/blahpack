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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import idamax from './../../../../blas/base/idamax/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dlaset from './../../../../lapack/base/dlaset/lib/base.js';


// MAIN //

/**
* Factorizes a panel of a real symmetric matrix `A` using Aasen's algorithm.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`)
* @param {integer} j1 - location (1 or 2, Fortran convention) of the first row/column of the panel within the submatrix
* @param {NonNegativeInteger} M - dimension of the submatrix passed to the routine
* @param {NonNegativeInteger} nb - panel width
* @param {Float64Array} A - input/output matrix containing (the trailing portion of) the matrix to factor
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - output pivot index array (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} H - workspace matrix, dimensions M-by-NB
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} WORK - scratch workspace, length at least M
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} `0`
*/
function dlasyfAa( uplo, j1, M, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, H, strideH1, strideH2, offsetH, WORK, strideWORK, offsetWORK ) {
	var alpha;
	var jmax;
	var sa1;
	var sa2;
	var sh1;
	var sh2;
	var piv;
	var k1;
	var i1;
	var i2;
	var mj;
	var J;
	var K;

	sa1 = strideA1;
	sa2 = strideA2;
	sh1 = strideH1;
	sh2 = strideH2;

	// `K1` is the first (Fortran 1-based) column of the panel to be factorized; K1=2 when J1=1, K1=1 when J1=2:
	k1 = ( 2 - j1 ) + 1;

	J = 1;
	jmax = ( M < nb ) ? M : nb;

	if ( uplo === 'upper' ) {
		// Factorize A as U^T*D*U using the upper triangle of A:
		while ( J <= jmax ) {
			// `K` is the Fortran 1-based column being factorized:
			K = j1 + J - 1;

			if ( J === M ) {
				// Only need to compute T(J,J):
				mj = 1;
			} else {
				mj = ( M - J ) + 1;
			}

			// H(J:M, J) := A(J, J:M) - H(J:M, 1:J-1) * L(J1:J-1, J)
			// (H(J:M, J) was initialized to A(J, J:M) by the caller / by the previous panel.)
			if ( K > 2 ) {
				// DGEMV( 'No transpose', MJ, J-K1, -1, H(J,K1), LDH, A(1,J), 1, 1, H(J,J), 1 )
				dgemv( 'no-transpose', mj, J - k1, -1.0, H, sh1, sh2, offsetH + ( ( J - 1 ) * sh1 ) + ( ( k1 - 1 ) * sh2 ), A, sa1, offsetA + ( ( J - 1 ) * sa2 ), 1.0, H, sh1, offsetH + ( ( J - 1 ) * sh1 ) + ( ( J - 1 ) * sh2 ) );
			}

			// Copy H(J:M, J) into WORK(1:MJ):
			dcopy( mj, H, sh1, offsetH + ( ( J - 1 ) * sh1 ) + ( ( J - 1 ) * sh2 ), WORK, strideWORK, offsetWORK );

			if ( J > k1 ) {
				// Compute WORK := WORK - L(J-1, J:M) * T(J-1, J),
				// Where A(K-1, J) stores T(J-1, J) and A(K-2, J:M) stores U(J-1, J:M).
				alpha = -A[ offsetA + ( ( K - 2 ) * sa1 ) + ( ( J - 1 ) * sa2 ) ];

				// DAXPY( MJ, ALPHA, A(K-2, J), LDA, WORK(1), 1 )
				daxpy( mj, alpha, A, sa2, offsetA + ( ( K - 3 ) * sa1 ) + ( ( J - 1 ) * sa2 ), WORK, strideWORK, offsetWORK );
			}

			// Set A(K, J) = T(J, J):
			A[ offsetA + ( ( K - 1 ) * sa1 ) + ( ( J - 1 ) * sa2 ) ] = WORK[ offsetWORK ];

			if ( J < M ) {
				// Compute WORK(2:M-J+1) = T(J,J) * L(J, J+1:M)
				// (A(K, J) stores T(J,J), A(K-1, J+1:M) stores U(J, J+1:M).)
				if ( K > 1 ) {
					alpha = -A[ offsetA + ( ( K - 1 ) * sa1 ) + ( ( J - 1 ) * sa2 ) ];

					// DAXPY( M-J, ALPHA, A(K-1, J+1), LDA, WORK(2), 1 )
					daxpy( M - J, alpha, A, sa2, offsetA + ( ( K - 2 ) * sa1 ) + ( J * sa2 ), WORK, strideWORK, offsetWORK + strideWORK );
				}

				// Find I2 = argmax(|WORK(2:M-J+1)|) in Fortran 1-based addressing:
				i2 = idamax( M - J, WORK, strideWORK, offsetWORK + strideWORK ) + 2; // +1 for 0->1 base, +1 for the "+1" shift in Fortran
				piv = WORK[ offsetWORK + ( ( i2 - 1 ) * strideWORK ) ];

				// Apply symmetric pivot:
				if ( i2 !== 2 && piv !== 0.0 ) {
					// Swap WORK(I1) and WORK(I2):
					i1 = 2;
					WORK[ offsetWORK + ( ( i2 - 1 ) * strideWORK ) ] = WORK[ offsetWORK + ( ( i1 - 1 ) * strideWORK ) ];
					WORK[ offsetWORK + ( ( i1 - 1 ) * strideWORK ) ] = piv;

					// Translate to global panel coordinates:
					i1 = i1 + J - 1;
					i2 = i2 + J - 1;

					// Swap A(I1, I1+1:I2-1) with A(I1+1:I2-1, I2)  (a row segment with a column segment):

					// DSWAP( I2-I1-1, A(J1+I1-1, I1+1), LDA, A(J1+I1, I2), 1 )
					dswap( i2 - i1 - 1, A, sa2, offsetA + ( ( j1 + i1 - 2 ) * sa1 ) + ( i1 * sa2 ), A, sa1, offsetA + ( ( j1 + i1 - 1 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) );

					// Swap A(I1, I2+1:M) with A(I2, I2+1:M):
					if ( i2 < M ) {
						// DSWAP( M-I2, A(J1+I1-1, I2+1), LDA, A(J1+I2-1, I2+1), LDA )
						dswap( M - i2, A, sa2, offsetA + ( ( j1 + i1 - 2 ) * sa1 ) + ( i2 * sa2 ), A, sa2, offsetA + ( ( j1 + i2 - 2 ) * sa1 ) + ( i2 * sa2 ) );
					}

					// Swap diagonal A(I1, I1) with A(I2, I2):
					piv = A[ offsetA + ( ( i1 + j1 - 2 ) * sa1 ) + ( ( i1 - 1 ) * sa2 ) ];
					A[ offsetA + ( ( j1 + i1 - 2 ) * sa1 ) + ( ( i1 - 1 ) * sa2 ) ] = A[ offsetA + ( ( j1 + i2 - 2 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) ];
					A[ offsetA + ( ( j1 + i2 - 2 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) ] = piv;

					// Swap H(I1, 1:I1-1) with H(I2, 1:I1-1):
					dswap( i1 - 1, H, sh2, offsetH + ( ( i1 - 1 ) * sh1 ), H, sh2, offsetH + ( ( i2 - 1 ) * sh1 ) );

					// Record the pivot (store 0-based):
					IPIV[ offsetIPIV + ( ( i1 - 1 ) * strideIPIV ) ] = i2 - 1;

					// Swap L(1:I1-1, I1) with L(1:I1-1, I2), skipping the first column:
					if ( i1 > k1 - 1 ) {
						// DSWAP( I1-K1+1, A(1, I1), 1, A(1, I2), 1 )
						dswap( i1 - k1 + 1, A, sa1, offsetA + ( ( i1 - 1 ) * sa2 ), A, sa1, offsetA + ( ( i2 - 1 ) * sa2 ) );
					}
				} else {
					// Self-pivot — record IPIV(J+1) = J+1 in Fortran (0-based: J):
					IPIV[ offsetIPIV + ( J * strideIPIV ) ] = J;
				}

				// Set A(K, J+1) = T(J, J+1):
				A[ offsetA + ( ( K - 1 ) * sa1 ) + ( J * sa2 ) ] = WORK[ offsetWORK + strideWORK ];

				if ( J < nb ) {
					// Copy A(K+1, J+1:M) into H(J+1:M, J+1):
					// DCOPY( M-J, A(K+1, J+1), LDA, H(J+1, J+1), 1 )
					dcopy( M - J, A, sa2, offsetA + ( K * sa1 ) + ( J * sa2 ), H, sh1, offsetH + ( J * sh1 ) + ( J * sh2 ) );
				}

				// Compute L(J+2, J+1) = WORK(3:M-J+1) / T(J, J+1):
				if ( J < M - 1 ) {
					if ( A[ offsetA + ( ( K - 1 ) * sa1 ) + ( J * sa2 ) ] === 0.0 ) {
						// DLASET( 'Full', 1, M-J-1, 0, 0, A(K, J+2), LDA )
						dlaset( 'full', 1, M - J - 1, 0.0, 0.0, A, sa1, sa2, offsetA + ( ( K - 1 ) * sa1 ) + ( ( J + 1 ) * sa2 ) );
					} else {
						alpha = 1.0 / A[ offsetA + ( ( K - 1 ) * sa1 ) + ( J * sa2 ) ];

						// DCOPY( M-J-1, WORK(3), 1, A(K, J+2), LDA )
						dcopy( M - J - 1, WORK, strideWORK, offsetWORK + ( 2 * strideWORK ), A, sa2, offsetA + ( ( K - 1 ) * sa1 ) + ( ( J + 1 ) * sa2 ) );

						// DSCAL( M-J-1, ALPHA, A(K, J+2), LDA )
						dscal( M - J - 1, alpha, A, sa2, offsetA + ( ( K - 1 ) * sa1 ) + ( ( J + 1 ) * sa2 ) );
					}
				}
			}
			J += 1;
		}
		return 0;
	}

	// Factorize A as L*D*L^T using the lower triangle of A:
	while ( J <= jmax ) {
		K = j1 + J - 1;

		if ( J === M ) {
			mj = 1;
		} else {
			mj = ( M - J ) + 1;
		}

		// H(J:M, J) := A(J:M, J) - H(J:M, 1:J-1) * L(J, J1:J-1)^T:
		if ( K > 2 ) {
			// DGEMV( 'No transpose', MJ, J-K1, -1, H(J,K1), LDH, A(J,1), LDA, 1, H(J,J), 1 )
			dgemv( 'no-transpose', mj, J - k1, -1.0, H, sh1, sh2, offsetH + ( ( J - 1 ) * sh1 ) + ( ( k1 - 1 ) * sh2 ), A, sa2, offsetA + ( ( J - 1 ) * sa1 ), 1.0, H, sh1, offsetH + ( ( J - 1 ) * sh1 ) + ( ( J - 1 ) * sh2 ) );
		}

		// Copy H(J:M, J) into WORK:
		dcopy( mj, H, sh1, offsetH + ( ( J - 1 ) * sh1 ) + ( ( J - 1 ) * sh2 ), WORK, strideWORK, offsetWORK );

		if ( J > k1 ) {
			// Compute WORK := WORK - L(J:M, J-1) * T(J-1, J),
			// Where A(J, K-1) = T(J-1, J) and A(J, K-2) = L(J, J-1).
			alpha = -A[ offsetA + ( ( J - 1 ) * sa1 ) + ( ( K - 2 ) * sa2 ) ];

			// DAXPY( MJ, ALPHA, A(J, K-2), 1, WORK, 1 )
			daxpy( mj, alpha, A, sa1, offsetA + ( ( J - 1 ) * sa1 ) + ( ( K - 3 ) * sa2 ), WORK, strideWORK, offsetWORK );
		}

		// Set A(J, K) = T(J, J):
		A[ offsetA + ( ( J - 1 ) * sa1 ) + ( ( K - 1 ) * sa2 ) ] = WORK[ offsetWORK ];

		if ( J < M ) {
			// Compute WORK(2:M-J+1) = T(J,J) * L(J+1:M, J):
			if ( K > 1 ) {
				alpha = -A[ offsetA + ( ( J - 1 ) * sa1 ) + ( ( K - 1 ) * sa2 ) ];

				// DAXPY( M-J, ALPHA, A(J+1, K-1), 1, WORK(2), 1 )
				daxpy( M - J, alpha, A, sa1, offsetA + ( J * sa1 ) + ( ( K - 2 ) * sa2 ), WORK, strideWORK, offsetWORK + strideWORK );
			}

			// Find I2 = argmax(|WORK(2:M-J+1)|), Fortran 1-based:
			i2 = idamax( M - J, WORK, strideWORK, offsetWORK + strideWORK ) + 2;
			piv = WORK[ offsetWORK + ( ( i2 - 1 ) * strideWORK ) ];

			if ( i2 !== 2 && piv !== 0.0 ) {
				i1 = 2;
				WORK[ offsetWORK + ( ( i2 - 1 ) * strideWORK ) ] = WORK[ offsetWORK + ( ( i1 - 1 ) * strideWORK ) ];
				WORK[ offsetWORK + ( ( i1 - 1 ) * strideWORK ) ] = piv;

				i1 = i1 + J - 1;
				i2 = i2 + J - 1;

				// Swap A(I1+1:I2-1, I1) with A(I2, I1+1:I2-1):

				// DSWAP( I2-I1-1, A(I1+1, J1+I1-1), 1, A(I2, J1+I1), LDA )
				dswap( i2 - i1 - 1, A, sa1, offsetA + ( i1 * sa1 ) + ( ( j1 + i1 - 2 ) * sa2 ), A, sa2, offsetA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i1 - 1 ) * sa2 ) );

				// Swap A(I2+1:M, I1) with A(I2+1:M, I2):
				if ( i2 < M ) {
					// DSWAP( M-I2, A(I2+1, J1+I1-1), 1, A(I2+1, J1+I2-1), 1 )
					dswap( M - i2, A, sa1, offsetA + ( i2 * sa1 ) + ( ( j1 + i1 - 2 ) * sa2 ), A, sa1, offsetA + ( i2 * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) );
				}

				// Swap diagonal A(I1, I1) with A(I2, I2):
				piv = A[ offsetA + ( ( i1 - 1 ) * sa1 ) + ( ( j1 + i1 - 2 ) * sa2 ) ];
				A[ offsetA + ( ( i1 - 1 ) * sa1 ) + ( ( j1 + i1 - 2 ) * sa2 ) ] = A[ offsetA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) ];
				A[ offsetA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) ] = piv;

				// Swap H(I1, 1:I1-1) with H(I2, 1:I1-1):
				dswap( i1 - 1, H, sh2, offsetH + ( ( i1 - 1 ) * sh1 ), H, sh2, offsetH + ( ( i2 - 1 ) * sh1 ) );

				// Record the pivot (store 0-based):
				IPIV[ offsetIPIV + ( ( i1 - 1 ) * strideIPIV ) ] = i2 - 1;

				// Swap L(1:I1-1, I1) with L(1:I1-1, I2), skipping the first column:
				if ( i1 > k1 - 1 ) {
					// DSWAP( I1-K1+1, A(I1, 1), LDA, A(I2, 1), LDA )
					dswap( i1 - k1 + 1, A, sa2, offsetA + ( ( i1 - 1 ) * sa1 ), A, sa2, offsetA + ( ( i2 - 1 ) * sa1 ) );
				}
			} else {
				IPIV[ offsetIPIV + ( J * strideIPIV ) ] = J;
			}

			// Set A(J+1, K) = T(J+1, J):
			A[ offsetA + ( J * sa1 ) + ( ( K - 1 ) * sa2 ) ] = WORK[ offsetWORK + strideWORK ];

			if ( J < nb ) {
				// Copy A(J+1:M, J+1) into H(J+1:M, J+1):
				// DCOPY( M-J, A(J+1, K+1), 1, H(J+1, J+1), 1 )
				dcopy( M - J, A, sa1, offsetA + ( J * sa1 ) + ( K * sa2 ), H, sh1, offsetH + ( J * sh1 ) + ( J * sh2 ) );
			}

			if ( J < M - 1 ) {
				if ( A[ offsetA + ( J * sa1 ) + ( ( K - 1 ) * sa2 ) ] === 0.0 ) {
					// DLASET( 'Full', M-J-1, 1, 0, 0, A(J+2, K), LDA )
					dlaset( 'full', M - J - 1, 1, 0.0, 0.0, A, sa1, sa2, offsetA + ( ( J + 1 ) * sa1 ) + ( ( K - 1 ) * sa2 ) );
				} else {
					alpha = 1.0 / A[ offsetA + ( J * sa1 ) + ( ( K - 1 ) * sa2 ) ];

					// DCOPY( M-J-1, WORK(3), 1, A(J+2, K), 1 )
					dcopy( M - J - 1, WORK, strideWORK, offsetWORK + ( 2 * strideWORK ), A, sa1, offsetA + ( ( J + 1 ) * sa1 ) + ( ( K - 1 ) * sa2 ) );

					// DSCAL( M-J-1, ALPHA, A(J+2, K), 1 )
					dscal( M - J - 1, alpha, A, sa1, offsetA + ( ( J + 1 ) * sa1 ) + ( ( K - 1 ) * sa2 ) );
				}
			}
		}
		J += 1;
	}
	return 0;
}


// EXPORTS //

export default dlasyfAa;
