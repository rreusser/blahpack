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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zher from '../../../../blas/base/zher/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;


// MAIN //

/**
* Computes the factorization of a complex Hermitian matrix A using the.
* Bunch-Kaufman diagonal pivoting method:
*
*   A = U_D_U^H  or  A = L_D_L^H
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is Hermitian and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* NOTE: This is for HERMITIAN matrices. The conjugate transpose is used.
* Diagonal elements of A are real.
*
* IPIV stores 0-based pivot indices. If IPIV[k] >= 0, a 1x1 pivot was used
* and rows/columns k and IPIV[k] were interchanged. If IPIV[k] < 0 (2x2 pivot),
* IPIV[k] = IPIV[k-1] = ~p where p is the 0-based interchange index.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output complex Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
*/
function zhetf2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var info;
	var imax;
	var jmax;
	var d12R;
	var d12I;
	var wkR;
	var wkI;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var d11;
	var d22;
	var d;
	var tt;
	var r1;
	var sa1;
	var sa2;
	var Av;
	var tR;
	var tI;
	var kk;
	var kp;
	var p1;
	var p2;
	var p3;
	var p4;
	var k;
	var i;
	var j;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	Av = reinterpret( A, 0 );
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^H using the upper triangle of A
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;

			// ABSAKK = |real(A(k,k))|  (diagonal is real for Hermitian)
			p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] );

			// IMAX is the row-index of the largest off-diagonal element in column K
			if ( k > 0 ) {
				imax = izamax( k, A, strideA1, offsetA + (k * strideA2) );
				p2 = (offsetA * 2) + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( ( Math.max( absakk, colmax ) === 0.0 ) || absakk !== absakk ) {
				// Column is zero or contains a NaN
				if ( info === 0 ) {
					info = k + 1; // 1-based
				}
				kp = k;

				// Force diagonal to be real
				Av[ p1 + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					// JMAX is the column-index of the largest off-diagonal
					// Element in row IMAX, ROWMAX is its absolute value
					// Scan row IMAX from column IMAX+1 to K
					jmax = imax + 1 + izamax( k - imax - 1, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2) );
					p3 = (offsetA * 2) + (imax * sa1) + (jmax * sa2);
					rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
					if ( imax > 0 ) {
						jmax = izamax( imax, A, strideA1, offsetA + (imax * strideA2) );
						p4 = (offsetA * 2) + (jmax * sa1) + (imax * sa2);
						rowmax = Math.max( rowmax, Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						// No interchange, use 1x1 pivot block
						kp = k;
					} else {
						p4 = (offsetA * 2) + (imax * sa1) + (imax * sa2);
						if ( Math.abs( Av[ p4 ] ) >= ALPHA * rowmax ) {
							// Interchange rows and columns K and IMAX, use 1x1 pivot
							kp = imax;
						} else {
							// Interchange rows and columns K-1 and IMAX, use 2x2 pivot
							kp = imax;
							kstep = 2;
						}
					}
				}

				kk = k - kstep + 1;
				if ( kp !== kk ) {
					// Interchange rows and columns KP and KK in the leading submatrix
					// Swap columns KP and KK above row KP
					if ( kp > 0 ) {
						zswap( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}
					// Swap and conjugate entries between KP+1 and KK-1
					for ( j = kp + 1; j < kk; j++ ) {
						p1 = (offsetA * 2) + (j * sa1) + (kk * sa2);
						p2 = (offsetA * 2) + (kp * sa1) + (j * sa2);

						// T = conj(A(j,kk))
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];

						// A(j,kk) = conj(A(kp,j))
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];

						// A(kp,j) = t
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Conjugate A(kp,kk)
					p1 = (offsetA * 2) + (kp * sa1) + (kk * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap diagonal: real parts only
					p1 = (offsetA * 2) + (kk * sa1) + (kk * sa2);
					p2 = (offsetA * 2) + (kp * sa1) + (kp * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = 0.0;
					Av[ p2 ] = r1;
					Av[ p2 + 1 ] = 0.0;

					if ( kstep === 2 ) {
						// Force A(k,k) real
						p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
						Av[ p1 + 1 ] = 0.0;

						// Swap A(k-1,k) and A(kp,k)
						p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (k * sa2);
						p2 = (offsetA * 2) + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				} else {
					// Force diagonal to be real
					p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
					Av[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
						Av[ p1 + 1 ] = 0.0;
					}
				}

				// Update the leading submatrix
				if ( kstep === 1 ) {
					// 1x1 pivot: D(k) = real(A(k,k))
					// Perform Hermitian rank-1 update: A := A - (1/D(k))*x*x^H
					p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
					r1 = 1.0 / Av[ p1 ];
					zher( uplo, k, -r1, A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );

					// Scale column: A(0:k-1, k) *= 1/D(k)
					zdscal( k, r1, A, strideA1, offsetA + (k * strideA2) );
				} else {
					// 2x2 pivot block
					if ( k > 1 ) {
						// D = |A(k-1,k)| using dlapy2 (hypot)
						p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (k * sa2);
						d = Math.sqrt( Av[ p1 ] * Av[ p1 ] + Av[ p1 + 1 ] * Av[ p1 + 1 ] );

						// D22 = real(A(k-1,k-1)) / D
						p2 = (offsetA * 2) + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
						d22 = Av[ p2 ] / d;

						// D11 = real(A(k,k)) / D
						p3 = (offsetA * 2) + (k * sa1) + (k * sa2);
						d11 = Av[ p3 ] / d;

						// TT = 1 / (D11*D22 - 1)
						tt = 1.0 / ( d11 * d22 - 1.0 );

						// D12 = A(k-1,k) / D
						d12R = Av[ p1 ] / d;
						d12I = Av[ p1 + 1 ] / d;

						// D = TT / D
						d = tt / d;

						for ( j = k - 2; j >= 0; j-- ) {
							// WKM1 = D * (D11*A(j,k-1) - conj(D12)*A(j,k))
							p1 = (offsetA * 2) + (j * sa1) + (( k - 1 ) * sa2);
							p2 = (offsetA * 2) + (j * sa1) + (k * sa2);

							// D11*A(j,k-1)
							tR = d11 * Av[ p1 ];
							tI = d11 * Av[ p1 + 1 ];

							// - conj(D12)*A(j,k)

							// conj(D12) = (d12R, -d12I)
							tR -= (d12R * Av[ p2 ] + d12I * Av[ p2 + 1 ]);
							tI -= (d12R * Av[ p2 + 1 ] - d12I * Av[ p2 ]);

							wkm1R = d * tR;
							wkm1I = d * tI;

							// WK = D * (D22*A(j,k) - D12*A(j,k-1))
							tR = d22 * Av[ p2 ];
							tI = d22 * Av[ p2 + 1 ];

							tR -= (d12R * Av[ p1 ] - d12I * Av[ p1 + 1 ]);
							tI -= (d12R * Av[ p1 + 1 ] + d12I * Av[ p1 ]);

							wkR = d * tR;
							wkI = d * tI;

							for ( i = j; i >= 0; i-- ) {
								// A(i,j) -= A(i,k)*conj(WK) + A(i,k-1)*conj(WKM1)
								p3 = (offsetA * 2) + (i * sa1) + (j * sa2);
								p4 = (offsetA * 2) + (i * sa1) + (k * sa2);
								tR = (offsetA * 2) + (i * sa1) + (( k - 1 ) * sa2);

								// A(i,k)*conj(WK)
								Av[ p3 ] -= (Av[ p4 ] * wkR + Av[ p4 + 1 ] * wkI);
								Av[ p3 + 1 ] -= (Av[ p4 + 1 ] * wkR - Av[ p4 ] * wkI);

								// + A(i,k-1)*conj(WKM1)
								Av[ p3 ] -= (Av[ tR ] * wkm1R + Av[ tR + 1 ] * wkm1I);
								Av[ p3 + 1 ] -= (Av[ tR + 1 ] * wkm1R - Av[ tR ] * wkm1I);
							}

							// A(j,k) = WK
							p2 = (offsetA * 2) + (j * sa1) + (k * sa2);
							Av[ p2 ] = wkR;
							Av[ p2 + 1 ] = wkI;

							// A(j,k-1) = WKM1
							p1 = (offsetA * 2) + (j * sa1) + (( k - 1 ) * sa2);
							Av[ p1 ] = wkm1R;
							Av[ p1 + 1 ] = wkm1I;

							// Force A(j,j) real
							p3 = (offsetA * 2) + (j * sa1) + (j * sa2);
							Av[ p3 + 1 ] = 0.0;
						}
					}
				}
			}

			// Store pivot info
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^H using the lower triangle of A
		k = 0;
		while ( k < N ) {
			kstep = 1;

			// ABSAKK = |real(A(k,k))|
			p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] );

			if ( k < N - 1 ) {
				imax = k + 1 + izamax( N - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
				p2 = (offsetA * 2) + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( ( Math.max( absakk, colmax ) === 0.0 ) || absakk !== absakk ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				Av[ p1 + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Scan row IMAX
					jmax = k + izamax( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2) );
					p3 = (offsetA * 2) + (imax * sa1) + (jmax * sa2);
					rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
					if ( imax < N - 1 ) {
						jmax = imax + 1 + izamax( N - imax - 1, A, strideA1, offsetA + (( imax + 1 ) * strideA1) + (imax * strideA2) );
						p4 = (offsetA * 2) + (jmax * sa1) + (imax * sa2);
						rowmax = Math.max( rowmax, Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else {
						p4 = (offsetA * 2) + (imax * sa1) + (imax * sa2);
						if ( Math.abs( Av[ p4 ] ) >= ALPHA * rowmax ) {
							kp = imax;
						} else {
							kp = imax;
							kstep = 2;
						}
					}
				}

				kk = k + kstep - 1;
				if ( kp !== kk ) {
					// Interchange rows and columns KP and KK
					if ( kp < N - 1 ) {
						zswap( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2) );
					}
					// Swap and conjugate entries between KK+1 and KP-1
					for ( j = kk + 1; j < kp; j++ ) {
						p1 = (offsetA * 2) + (j * sa1) + (kk * sa2);
						p2 = (offsetA * 2) + (kp * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Conjugate A(kp,kk)
					p1 = (offsetA * 2) + (kp * sa1) + (kk * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap diagonal (real parts only)
					p1 = (offsetA * 2) + (kk * sa1) + (kk * sa2);
					p2 = (offsetA * 2) + (kp * sa1) + (kp * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = 0.0;
					Av[ p2 ] = r1;
					Av[ p2 + 1 ] = 0.0;

					if ( kstep === 2 ) {
						p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
						Av[ p1 + 1 ] = 0.0;
						p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (k * sa2);
						p2 = (offsetA * 2) + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				} else {
					p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
					Av[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
						Av[ p1 + 1 ] = 0.0;
					}
				}

				// Update the trailing submatrix
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
						r1 = 1.0 / Av[ p1 ];
						zher( uplo, N - k - 1, -r1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
						zdscal( N - k - 1, r1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
					}
				} else {
					// 2x2 pivot block
					if ( k < N - 2 ) {
						// D = |A(k+1,k)| (dlapy2)
						p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (k * sa2);
						d = Math.sqrt( Av[ p1 ] * Av[ p1 ] + Av[ p1 + 1 ] * Av[ p1 + 1 ] );

						// D11 = real(A(k+1,k+1)) / D
						p2 = (offsetA * 2) + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
						d11 = Av[ p2 ] / d;

						// D22 = real(A(k,k)) / D
						p3 = (offsetA * 2) + (k * sa1) + (k * sa2);
						d22 = Av[ p3 ] / d;

						tt = 1.0 / ( d11 * d22 - 1.0 );

						// D21 = A(k+1,k) / D
						d12R = Av[ p1 ] / d;
						d12I = Av[ p1 + 1 ] / d;

						d = tt / d;

						for ( j = k + 2; j < N; j++ ) {
							p1 = (offsetA * 2) + (j * sa1) + (k * sa2);
							p2 = (offsetA * 2) + (j * sa1) + (( k + 1 ) * sa2);

							// WK = D * (D11*A(j,k) - D21*A(j,k+1))
							tR = d11 * Av[ p1 ];
							tI = d11 * Av[ p1 + 1 ];
							tR -= (d12R * Av[ p2 ] - d12I * Av[ p2 + 1 ]);
							tI -= (d12R * Av[ p2 + 1 ] + d12I * Av[ p2 ]);
							wkR = d * tR;
							wkI = d * tI;

							// WKP1 = D * (D22*A(j,k+1) - conj(D21)*A(j,k))
							tR = d22 * Av[ p2 ];
							tI = d22 * Av[ p2 + 1 ];
							tR -= (d12R * Av[ p1 ] + d12I * Av[ p1 + 1 ]);
							tI -= (d12R * Av[ p1 + 1 ] - d12I * Av[ p1 ]);
							wkp1R = d * tR;
							wkp1I = d * tI;

							for ( i = j; i < N; i++ ) {
								p3 = (offsetA * 2) + (i * sa1) + (j * sa2);
								p4 = (offsetA * 2) + (i * sa1) + (k * sa2);
								tR = (offsetA * 2) + (i * sa1) + (( k + 1 ) * sa2);

								// A(i,j) -= A(i,k)*conj(WK) + A(i,k+1)*conj(WKP1)
								Av[ p3 ] -= (Av[ p4 ] * wkR + Av[ p4 + 1 ] * wkI);
								Av[ p3 + 1 ] -= (Av[ p4 + 1 ] * wkR - Av[ p4 ] * wkI);

								Av[ p3 ] -= (Av[ tR ] * wkp1R + Av[ tR + 1 ] * wkp1I);
								Av[ p3 + 1 ] -= (Av[ tR + 1 ] * wkp1R - Av[ tR ] * wkp1I);
							}

							Av[ p1 ] = wkR;
							Av[ p1 + 1 ] = wkI;
							Av[ p2 ] = wkp1R;
							Av[ p2 + 1 ] = wkp1I;

							// Force A(j,j) real
							p3 = (offsetA * 2) + (j * sa1) + (j * sa2);
							Av[ p3 + 1 ] = 0.0;
						}
					}
				}
			}

			// Store pivot info
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
				IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ] = ~kp;
			}

			k += kstep;
		}
	}

	return info;
}


// EXPORTS //

export default zhetf2;
