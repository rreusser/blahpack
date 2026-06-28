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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zlaset from './../../../../lapack/base/zlaset/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var ZERO = new Complex128( 0.0, 0.0 );
var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Factorizes a panel of a complex symmetric matrix `A` using Aasen's algorithm.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`)
* @param {integer} j1 - location (1 or 2, Fortran convention) of the first row/column of the panel within the submatrix
* @param {NonNegativeInteger} M - dimension of the submatrix passed to the routine
* @param {NonNegativeInteger} nb - panel width
* @param {Complex128Array} A - input/output matrix containing (the trailing portion of) the matrix to factor
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - output pivot index array (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} H - workspace matrix, dimensions `M`-by-`NB`
* @param {integer} strideH1 - stride of the first dimension of `H` (in complex elements)
* @param {integer} strideH2 - stride of the second dimension of `H` (in complex elements)
* @param {NonNegativeInteger} offsetH - starting index for `H` (in complex elements)
* @param {Complex128Array} WORK - scratch workspace, length at least `M`
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} `0`
*/
function zlasyfAa( uplo, j1, M, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, H, strideH1, strideH2, offsetH, WORK, strideWork, offsetWork ) {
	var alpha;
	var jmax;
	var pivR;
	var pivI;
	var tmpR;
	var tmpI;
	var akR;
	var akI;
	var sa1;
	var sa2;
	var idx;
	var sw;
	var oA;
	var oW;
	var av;
	var wv;
	var k1;
	var i1;
	var i2;
	var mj;
	var J;
	var K;

	// Float64 views (interleaved [re, im] pairs):
	av = reinterpret( A, 0 );
	wv = reinterpret( WORK, 0 );

	// Float64-element strides/offsets (×2 for complex elements):
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw = strideWork * 2;
	oA = offsetA * 2;
	oW = offsetWork * 2;

	// `K1` is the first (Fortran 1-based) column of the panel to be factorized; `K1=2` when `J1=1`, `K1=1` when `J1=2`:
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
				// ZGEMV( 'No transpose', MJ, J-K1, -ONE, H(J,K1), LDH, A(1,J), 1, ONE, H(J,J), 1 )
				zgemv( 'no-transpose', mj, J - k1, NEGONE, H, strideH1, strideH2, offsetH + ( ( J - 1 ) * strideH1 ) + ( ( k1 - 1 ) * strideH2 ), A, strideA1, offsetA + ( ( J - 1 ) * strideA2 ), ONE, H, strideH1, offsetH + ( ( J - 1 ) * strideH1 ) + ( ( J - 1 ) * strideH2 ) );
			}

			// Copy H(J:M, J) into WORK(1:MJ):
			zcopy( mj, H, strideH1, offsetH + ( ( J - 1 ) * strideH1 ) + ( ( J - 1 ) * strideH2 ), WORK, strideWork, offsetWork );

			if ( J > k1 ) {
				// Compute WORK := WORK - L(J-1, J:M) * T(J-1, J),
				// Where A(K-1, J) stores T(J-1, J) and A(K-2, J:M) stores U(J-1, J:M).
				// alpha = -A(K-1, J) (complex negation):
				idx = oA + ( ( K - 2 ) * sa1 ) + ( ( J - 1 ) * sa2 );
				alpha = new Complex128( -av[ idx ], -av[ idx + 1 ] );

				// ZAXPY( MJ, ALPHA, A(K-2, J), LDA, WORK(1), 1 )
				zaxpy( mj, alpha, A, strideA2, offsetA + ( ( K - 3 ) * strideA1 ) + ( ( J - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
			}

			// Set A(K, J) = T(J, J) := WORK(1):
			idx = oA + ( ( K - 1 ) * sa1 ) + ( ( J - 1 ) * sa2 );
			av[ idx ] = wv[ oW ];
			av[ idx + 1 ] = wv[ oW + 1 ];

			if ( J < M ) {
				// Compute WORK(2:M-J+1) = T(J,J) * L(J, J+1:M)
				// (A(K, J) stores T(J,J), A(K-1, J+1:M) stores U(J, J+1:M).)
				if ( K > 1 ) {
					// alpha = -A(K, J):
					idx = oA + ( ( K - 1 ) * sa1 ) + ( ( J - 1 ) * sa2 );
					alpha = new Complex128( -av[ idx ], -av[ idx + 1 ] );

					// ZAXPY( M-J, ALPHA, A(K-1, J+1), LDA, WORK(2), 1 )
					zaxpy( M - J, alpha, A, strideA2, offsetA + ( ( K - 2 ) * strideA1 ) + ( J * strideA2 ), WORK, strideWork, offsetWork + strideWork );
				}

				// Find I2 = argmax(|WORK(2:M-J+1)|) in Fortran 1-based addressing:
				i2 = izamax( M - J, WORK, strideWork, offsetWork + strideWork ) + 2; // +1 for 0->1 base, +1 for the "+1" shift in Fortran
				idx = oW + ( ( i2 - 1 ) * sw );
				pivR = wv[ idx ];
				pivI = wv[ idx + 1 ];

				// Apply symmetric pivot (PIV != 0 in complex sense — must use OR, not AND):
				if ( i2 !== 2 && ( pivR !== 0.0 || pivI !== 0.0 ) ) {
					// Swap WORK(I1) and WORK(I2):
					i1 = 2;
					tmpR = wv[ oW + ( ( i1 - 1 ) * sw ) ];
					tmpI = wv[ oW + ( ( i1 - 1 ) * sw ) + 1 ];
					wv[ oW + ( ( i2 - 1 ) * sw ) ] = tmpR;
					wv[ oW + ( ( i2 - 1 ) * sw ) + 1 ] = tmpI;
					wv[ oW + ( ( i1 - 1 ) * sw ) ] = pivR;
					wv[ oW + ( ( i1 - 1 ) * sw ) + 1 ] = pivI;

					// Translate to global panel coordinates:
					i1 = i1 + J - 1;
					i2 = i2 + J - 1;

					// Swap A(I1, I1+1:I2-1) with A(I1+1:I2-1, I2)  (a row segment with a column segment):

					// ZSWAP( I2-I1-1, A(J1+I1-1, I1+1), LDA, A(J1+I1, I2), 1 )
					zswap( i2 - i1 - 1, A, strideA2, offsetA + ( ( j1 + i1 - 2 ) * strideA1 ) + ( i1 * strideA2 ), A, strideA1, offsetA + ( ( j1 + i1 - 1 ) * strideA1 ) + ( ( i2 - 1 ) * strideA2 ) );

					// Swap A(I1, I2+1:M) with A(I2, I2+1:M):
					if ( i2 < M ) {
						// ZSWAP( M-I2, A(J1+I1-1, I2+1), LDA, A(J1+I2-1, I2+1), LDA )
						zswap( M - i2, A, strideA2, offsetA + ( ( j1 + i1 - 2 ) * strideA1 ) + ( i2 * strideA2 ), A, strideA2, offsetA + ( ( j1 + i2 - 2 ) * strideA1 ) + ( i2 * strideA2 ) );
					}

					// Swap diagonal A(I1, I1) with A(I2, I2):
					idx = oA + ( ( j1 + i1 - 2 ) * sa1 ) + ( ( i1 - 1 ) * sa2 );
					akR = av[ idx ];
					akI = av[ idx + 1 ];
					tmpR = av[ oA + ( ( j1 + i2 - 2 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) ];
					tmpI = av[ oA + ( ( j1 + i2 - 2 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) + 1 ];
					av[ idx ] = tmpR;
					av[ idx + 1 ] = tmpI;
					av[ oA + ( ( j1 + i2 - 2 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) ] = akR;
					av[ oA + ( ( j1 + i2 - 2 ) * sa1 ) + ( ( i2 - 1 ) * sa2 ) + 1 ] = akI;

					// Swap H(I1, 1:I1-1) with H(I2, 1:I1-1):
					zswap( i1 - 1, H, strideH2, offsetH + ( ( i1 - 1 ) * strideH1 ), H, strideH2, offsetH + ( ( i2 - 1 ) * strideH1 ) );

					// Record the pivot (store 0-based):
					IPIV[ offsetIPIV + ( ( i1 - 1 ) * strideIPIV ) ] = i2 - 1;

					// Swap L(1:I1-1, I1) with L(1:I1-1, I2), skipping the first column:
					if ( i1 > k1 - 1 ) {
						// ZSWAP( I1-K1+1, A(1, I1), 1, A(1, I2), 1 )
						zswap( i1 - k1 + 1, A, strideA1, offsetA + ( ( i1 - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( i2 - 1 ) * strideA2 ) );
					}
				} else {
					// Self-pivot — record IPIV(J+1) = J+1 in Fortran (0-based: J):
					IPIV[ offsetIPIV + ( J * strideIPIV ) ] = J;
				}

				// Set A(K, J+1) = T(J, J+1) := WORK(2):
				idx = oA + ( ( K - 1 ) * sa1 ) + ( J * sa2 );
				av[ idx ] = wv[ oW + sw ];
				av[ idx + 1 ] = wv[ oW + sw + 1 ];

				if ( J < nb ) {
					// Copy A(K+1, J+1:M) into H(J+1:M, J+1):
					// ZCOPY( M-J, A(K+1, J+1), LDA, H(J+1, J+1), 1 )
					zcopy( M - J, A, strideA2, offsetA + ( K * strideA1 ) + ( J * strideA2 ), H, strideH1, offsetH + ( J * strideH1 ) + ( J * strideH2 ) );
				}

				// Compute L(J+2, J+1) = WORK(3:M-J+1) / T(J, J+1):
				if ( J < M - 1 ) {
					idx = oA + ( ( K - 1 ) * sa1 ) + ( J * sa2 );
					if ( av[ idx ] === 0.0 && av[ idx + 1 ] === 0.0 ) {
						// ZLASET( 'Full', 1, M-J-1, ZERO, ZERO, A(K, J+2), LDA )
						zlaset( 'full', 1, M - J - 1, ZERO, ZERO, A, strideA1, strideA2, offsetA + ( ( K - 1 ) * strideA1 ) + ( ( J + 1 ) * strideA2 ) );
					} else {
						// alpha = ONE / A(K, J+1) — use cmplx.div for stability:
						alpha = cmplx.div( ONE, new Complex128( av[ idx ], av[ idx + 1 ] ) );

						// ZCOPY( M-J-1, WORK(3), 1, A(K, J+2), LDA )
						zcopy( M - J - 1, WORK, strideWork, offsetWork + ( 2 * strideWork ), A, strideA2, offsetA + ( ( K - 1 ) * strideA1 ) + ( ( J + 1 ) * strideA2 ) );

						// ZSCAL( M-J-1, ALPHA, A(K, J+2), LDA )
						zscal( M - J - 1, alpha, A, strideA2, offsetA + ( ( K - 1 ) * strideA1 ) + ( ( J + 1 ) * strideA2 ) );
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
			// ZGEMV( 'No transpose', MJ, J-K1, -ONE, H(J,K1), LDH, A(J,1), LDA, ONE, H(J,J), 1 )
			zgemv( 'no-transpose', mj, J - k1, NEGONE, H, strideH1, strideH2, offsetH + ( ( J - 1 ) * strideH1 ) + ( ( k1 - 1 ) * strideH2 ), A, strideA2, offsetA + ( ( J - 1 ) * strideA1 ), ONE, H, strideH1, offsetH + ( ( J - 1 ) * strideH1 ) + ( ( J - 1 ) * strideH2 ) );
		}

		// Copy H(J:M, J) into WORK:
		zcopy( mj, H, strideH1, offsetH + ( ( J - 1 ) * strideH1 ) + ( ( J - 1 ) * strideH2 ), WORK, strideWork, offsetWork );

		if ( J > k1 ) {
			// Compute WORK := WORK - L(J:M, J-1) * T(J-1, J),
			// Where A(J, K-1) = T(J-1, J) and A(J, K-2) = L(J, J-1).
			idx = oA + ( ( J - 1 ) * sa1 ) + ( ( K - 2 ) * sa2 );
			alpha = new Complex128( -av[ idx ], -av[ idx + 1 ] );

			// ZAXPY( MJ, ALPHA, A(J, K-2), 1, WORK, 1 )
			zaxpy( mj, alpha, A, strideA1, offsetA + ( ( J - 1 ) * strideA1 ) + ( ( K - 3 ) * strideA2 ), WORK, strideWork, offsetWork );
		}

		// Set A(J, K) = T(J, J):
		idx = oA + ( ( J - 1 ) * sa1 ) + ( ( K - 1 ) * sa2 );
		av[ idx ] = wv[ oW ];
		av[ idx + 1 ] = wv[ oW + 1 ];

		if ( J < M ) {
			// Compute WORK(2:M-J+1) = T(J,J) * L(J+1:M, J):
			if ( K > 1 ) {
				idx = oA + ( ( J - 1 ) * sa1 ) + ( ( K - 1 ) * sa2 );
				alpha = new Complex128( -av[ idx ], -av[ idx + 1 ] );

				// ZAXPY( M-J, ALPHA, A(J+1, K-1), 1, WORK(2), 1 )
				zaxpy( M - J, alpha, A, strideA1, offsetA + ( J * strideA1 ) + ( ( K - 2 ) * strideA2 ), WORK, strideWork, offsetWork + strideWork );
			}

			// Find I2 = argmax(|WORK(2:M-J+1)|), Fortran 1-based:
			i2 = izamax( M - J, WORK, strideWork, offsetWork + strideWork ) + 2;
			idx = oW + ( ( i2 - 1 ) * sw );
			pivR = wv[ idx ];
			pivI = wv[ idx + 1 ];

			if ( i2 !== 2 && ( pivR !== 0.0 || pivI !== 0.0 ) ) {
				i1 = 2;
				tmpR = wv[ oW + ( ( i1 - 1 ) * sw ) ];
				tmpI = wv[ oW + ( ( i1 - 1 ) * sw ) + 1 ];
				wv[ oW + ( ( i2 - 1 ) * sw ) ] = tmpR;
				wv[ oW + ( ( i2 - 1 ) * sw ) + 1 ] = tmpI;
				wv[ oW + ( ( i1 - 1 ) * sw ) ] = pivR;
				wv[ oW + ( ( i1 - 1 ) * sw ) + 1 ] = pivI;

				i1 = i1 + J - 1;
				i2 = i2 + J - 1;

				// Swap A(I1+1:I2-1, I1) with A(I2, I1+1:I2-1):

				// ZSWAP( I2-I1-1, A(I1+1, J1+I1-1), 1, A(I2, J1+I1), LDA )
				zswap( i2 - i1 - 1, A, strideA1, offsetA + ( i1 * strideA1 ) + ( ( j1 + i1 - 2 ) * strideA2 ), A, strideA2, offsetA + ( ( i2 - 1 ) * strideA1 ) + ( ( j1 + i1 - 1 ) * strideA2 ) );

				// Swap A(I2+1:M, I1) with A(I2+1:M, I2):
				if ( i2 < M ) {
					// ZSWAP( M-I2, A(I2+1, J1+I1-1), 1, A(I2+1, J1+I2-1), 1 )
					zswap( M - i2, A, strideA1, offsetA + ( i2 * strideA1 ) + ( ( j1 + i1 - 2 ) * strideA2 ), A, strideA1, offsetA + ( i2 * strideA1 ) + ( ( j1 + i2 - 2 ) * strideA2 ) );
				}

				// Swap diagonal A(I1, I1) with A(I2, I2):
				idx = oA + ( ( i1 - 1 ) * sa1 ) + ( ( j1 + i1 - 2 ) * sa2 );
				akR = av[ idx ];
				akI = av[ idx + 1 ];
				tmpR = av[ oA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) ];
				tmpI = av[ oA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) + 1 ];
				av[ idx ] = tmpR;
				av[ idx + 1 ] = tmpI;
				av[ oA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) ] = akR;
				av[ oA + ( ( i2 - 1 ) * sa1 ) + ( ( j1 + i2 - 2 ) * sa2 ) + 1 ] = akI;

				// Swap H(I1, 1:I1-1) with H(I2, 1:I1-1):
				zswap( i1 - 1, H, strideH2, offsetH + ( ( i1 - 1 ) * strideH1 ), H, strideH2, offsetH + ( ( i2 - 1 ) * strideH1 ) );

				// Record the pivot (store 0-based):
				IPIV[ offsetIPIV + ( ( i1 - 1 ) * strideIPIV ) ] = i2 - 1;

				// Swap L(1:I1-1, I1) with L(1:I1-1, I2), skipping the first column:
				if ( i1 > k1 - 1 ) {
					// ZSWAP( I1-K1+1, A(I1, 1), LDA, A(I2, 1), LDA )
					zswap( i1 - k1 + 1, A, strideA2, offsetA + ( ( i1 - 1 ) * strideA1 ), A, strideA2, offsetA + ( ( i2 - 1 ) * strideA1 ) );
				}
			} else {
				IPIV[ offsetIPIV + ( J * strideIPIV ) ] = J;
			}

			// Set A(J+1, K) = T(J+1, J) := WORK(2):
			idx = oA + ( J * sa1 ) + ( ( K - 1 ) * sa2 );
			av[ idx ] = wv[ oW + sw ];
			av[ idx + 1 ] = wv[ oW + sw + 1 ];

			if ( J < nb ) {
				// Copy A(J+1:M, J+1) into H(J+1:M, J+1):
				// ZCOPY( M-J, A(J+1, K+1), 1, H(J+1, J+1), 1 )
				zcopy( M - J, A, strideA1, offsetA + ( J * strideA1 ) + ( K * strideA2 ), H, strideH1, offsetH + ( J * strideH1 ) + ( J * strideH2 ) );
			}

			if ( J < M - 1 ) {
				idx = oA + ( J * sa1 ) + ( ( K - 1 ) * sa2 );
				if ( av[ idx ] === 0.0 && av[ idx + 1 ] === 0.0 ) {
					// ZLASET( 'Full', M-J-1, 1, ZERO, ZERO, A(J+2, K), LDA )
					zlaset( 'full', M - J - 1, 1, ZERO, ZERO, A, strideA1, strideA2, offsetA + ( ( J + 1 ) * strideA1 ) + ( ( K - 1 ) * strideA2 ) );
				} else {
					// alpha = ONE / A(J+1, K) — use cmplx.div for stability:
					alpha = cmplx.div( ONE, new Complex128( av[ idx ], av[ idx + 1 ] ) );

					// ZCOPY( M-J-1, WORK(3), 1, A(J+2, K), 1 )
					zcopy( M - J - 1, WORK, strideWork, offsetWork + ( 2 * strideWork ), A, strideA1, offsetA + ( ( J + 1 ) * strideA1 ) + ( ( K - 1 ) * strideA2 ) );

					// ZSCAL( M-J-1, ALPHA, A(J+2, K), 1 )
					zscal( M - J - 1, alpha, A, strideA1, offsetA + ( ( J + 1 ) * strideA1 ) + ( ( K - 1 ) * strideA2 ) );
				}
			}
		}
		J += 1;
	}
	return 0;
}


// EXPORTS //

export default zlasyfAa;
