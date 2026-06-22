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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zsyr from '../../zsyr/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';

// NOTE: Do not use cmplx.divAt — it overwrites in-place, corrupting source


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;

// Module-level vars for cDiv output
var cdR = 0.0;
var cdI = 0.0;


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix A using the.
* Bunch-Kaufman diagonal pivoting method:
*
* `A = U*D*U^T  or  A = L*D*L^T`
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is symmetric and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* NOTE: This is for SYMMETRIC (not Hermitian) matrices. The transpose
* is used (not conjugate transpose).
*
* IPIV stores 0-based pivot indices. If `IPIV[k]` >= 0, then a 1x1 pivot
* was used and rows/columns k and `IPIV[k]` were interchanged.
* If `IPIV[k]` < 0 (for a 2x2 pivot), then `IPIV[k]` = `IPIV[k±1]` = ~(p)
* where p is the 0-based row/column that was interchanged.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output complex symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
*/
function zsytf2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var info;
	var imax;
	var jmax;
	var d11R;
	var d11I;
	var d12R;
	var d12I;
	var d21R;
	var d21I;
	var d22R;
	var d22I;
	var sa1;
	var sa2;
	var wkR;
	var wkI;
	var r1R;
	var r1I;
	var Av;
	var tR;
	var tI;
	var tr;
	var ti;
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
		// Factorize A as U * D * U^T using the upper triangle of A
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;

			// Determine rows and columns to be interchanged

			// CABS1(A(k,k))
			p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] );

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
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					// JMAX is the column-index of the largest off-diagonal
					// Element in row IMAX, and ROWMAX is its absolute value
					// Look in row IMAX from column IMAX+1 to K (using LDA stride for row scan)
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
						if ( ( Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) ) >= ALPHA * rowmax ) {
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
					// Interchange rows and columns KP and KK
					if ( kp > 0 ) {
						zswap( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}
					zswap( kk - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kp + 1 ) * strideA2) );

					// Swap diagonal elements
					p1 = (offsetA * 2) + (kk * sa1) + (kk * sa2);
					p2 = (offsetA * 2) + (kp * sa1) + (kp * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( kstep === 2 ) {
						p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (k * sa2);
						p2 = (offsetA * 2) + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				}

				// Update the leading submatrix
				if ( kstep === 1 ) {
					// 1x1 pivot block D(k)
					// R1 = CONE / A(K, K) via Smith's method
					p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
					tr = Av[ p1 ];
					ti = Av[ p1 + 1 ];
					if ( Math.abs( ti ) <= Math.abs( tr ) ) {
						tR = ti / tr;
						tI = tr + (ti * tR);
						r1R = 1.0 / tI;
						r1I = -(tR / tI);
					} else {
						tR = tr / ti;
						tI = ti + (tr * tR);
						r1R = tR / tI;
						r1I = -(1.0 / tI);
					}

					// zsyr(uplo, k, -R1, A(:,k), 1, A, LDA)
					zsyr( uplo, k, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );

					// zscal(k, R1, A(:,k), 1)
					zscal( k, new Complex128( r1R, r1I ), A, strideA1, offsetA + (k * strideA2) );
				} else if ( k > 1 ) {
					// 2x2 pivot block
					// D12 = A(K-1, K)
					p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (k * sa2);
					d12R = Av[ p1 ];
					d12I = Av[ p1 + 1 ];

					// D22 = A(K-1, K-1) / D12
					p2 = (offsetA * 2) + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
					cDiv( Av[ p2 ], Av[ p2 + 1 ], d12R, d12I );
					d22R = cdR;
					d22I = cdI;

					// D11 = A(K, K) / D12
					p3 = (offsetA * 2) + (k * sa1) + (k * sa2);
					cDiv( Av[ p3 ], Av[ p3 + 1 ], d12R, d12I );
					d11R = cdR;
					d11I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = (d11R * d22R) - (d11I * d22I) - 1.0;
					ti = (d11R * d22I) + (d11I * d22R);
					cDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					// D12 = T / D12
					cDiv( r1R, r1I, d12R, d12I );
					d12R = cdR;
					d12I = cdI;

					for ( j = k - 2; j >= 0; j-- ) {
						// WKM1 = D12 * (D11*A(J,K-1) - A(J,K))
						p1 = (offsetA * 2) + (j * sa1) + (( k - 1 ) * sa2);
						p2 = (offsetA * 2) + (j * sa1) + (k * sa2);

						// D11*A(J,K-1): complex multiply
						tr = (d11R * Av[ p1 ]) - (d11I * Av[ p1 + 1 ]);
						ti = (d11R * Av[ p1 + 1 ]) + (d11I * Av[ p1 ]);

						// D11*A(J,K-1) - A(J,K)
						tr -= Av[ p2 ];
						ti -= Av[ p2 + 1 ];

						// WKM1 = D12 * result
						wkm1R = (d12R * tr) - (d12I * ti);
						wkm1I = (d12R * ti) + (d12I * tr);

						// WK = D12 * (D22*A(J,K) - A(J,K-1))

						// D22*A(J,K)
						tr = (d22R * Av[ p2 ]) - (d22I * Av[ p2 + 1 ]);
						ti = (d22R * Av[ p2 + 1 ]) + (d22I * Av[ p2 ]);

						// D22*A(J,K) - A(J,K-1)
						tr -= Av[ p1 ];
						ti -= Av[ p1 + 1 ];

						// WK = D12 * result
						wkR = (d12R * tr) - (d12I * ti);
						wkI = (d12R * ti) + (d12I * tr);

						for ( i = j; i >= 0; i-- ) {
							// A(I,J) -= A(I,K)*WK + A(I,K-1)*WKM1
							p3 = (offsetA * 2) + (i * sa1) + (j * sa2);
							p4 = (offsetA * 2) + (i * sa1) + (k * sa2);
							tR = (offsetA * 2) + (i * sa1) + (( k - 1 ) * sa2);

							// A(I,K)*WK
							tr = (Av[ p4 ] * wkR) - (Av[ p4 + 1 ] * wkI);
							ti = (Av[ p4 ] * wkI) + (Av[ p4 + 1 ] * wkR);

							// A(I,K-1)*WKM1
							tr += (Av[ tR ] * wkm1R) - (Av[ tR + 1 ] * wkm1I);
							ti += (Av[ tR ] * wkm1I) + (Av[ tR + 1 ] * wkm1R);
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}
						// A(J,K) = WK
						Av[ p2 ] = wkR;
						Av[ p2 + 1 ] = wkI;

						// A(J,K-1) = WKM1
						Av[ p1 ] = wkm1R;
						Av[ p1 + 1 ] = wkm1I;
					}
				}
			}

			// Store details of the interchanges in IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle of A
		k = 0;
		while ( k < N ) {
			kstep = 1;

			// Determine rows and columns to be interchanged
			p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] );

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
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Look in row IMAX from column K to IMAX-1 (using LDA stride)
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
						if ( ( Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) ) >= ALPHA * rowmax ) {
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
					zswap( kp - kk - 1, A, strideA1, offsetA + (( kk + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kk + 1 ) * strideA2) );

					// Swap diagonal elements
					p1 = (offsetA * 2) + (kk * sa1) + (kk * sa2);
					p2 = (offsetA * 2) + (kp * sa1) + (kp * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( kstep === 2 ) {
						p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (k * sa2);
						p2 = (offsetA * 2) + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				}

				// Update the trailing submatrix
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						// R1 = 1 / A(K, K)
						p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
						tr = Av[ p1 ];
						ti = Av[ p1 + 1 ];
						if ( Math.abs( ti ) <= Math.abs( tr ) ) {
							tR = ti / tr;
							tI = tr + (ti * tR);
							r1R = ( 1.0 ) / tI;
							r1I = ( -tR ) / tI;
						} else {
							tR = tr / ti;
							tI = ti + (tr * tR);
							r1R = ( tR ) / tI;
							r1I = ( -1.0 ) / tI;
						}

						zsyr( uplo, N - k - 1, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );

						zscal( N - k - 1, new Complex128( r1R, r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
					}
				} else if ( k < N - 2 ) {
				// 2x2 pivot block
					// D21 = A(K+1, K)
					p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (k * sa2);
					d21R = Av[ p1 ];
					d21I = Av[ p1 + 1 ];

					// D11 = A(K+1, K+1) / D21
					p2 = (offsetA * 2) + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
					tr = Av[ p2 ];
					ti = Av[ p2 + 1 ];
					if ( Math.abs( d21I ) <= Math.abs( d21R ) ) {
						tR = d21I / d21R;
						tI = d21R + (d21I * tR);
						d11R = ( tr + (ti * tR) ) / tI;
						d11I = ( ti - (tr * tR) ) / tI;
					} else {
						tR = d21R / d21I;
						tI = d21I + (d21R * tR);
						d11R = ( (tr * tR) + ti ) / tI;
						d11I = ( (ti * tR) - tr ) / tI;
					}

					// D22 = A(K, K) / D21
					p2 = (offsetA * 2) + (k * sa1) + (k * sa2);
					tr = Av[ p2 ];
					ti = Av[ p2 + 1 ];
					if ( Math.abs( d21I ) <= Math.abs( d21R ) ) {
						tR = d21I / d21R;
						tI = d21R + (d21I * tR);
						d22R = ( tr + (ti * tR) ) / tI;
						d22I = ( ti - (tr * tR) ) / tI;
					} else {
						tR = d21R / d21I;
						tI = d21I + (d21R * tR);
						d22R = ( (tr * tR) + ti ) / tI;
						d22I = ( (ti * tR) - tr ) / tI;
					}

					// T = 1 / (D11*D22 - 1)
					tr = (d11R * d22R) - (d11I * d22I) - 1.0;
					ti = (d11R * d22I) + (d11I * d22R);
					if ( Math.abs( ti ) <= Math.abs( tr ) ) {
						tR = ti / tr;
						tI = tr + (ti * tR);
						r1R = ( 1.0 ) / tI;
						r1I = ( -tR ) / tI;
					} else {
						tR = tr / ti;
						tI = ti + (tr * tR);
						r1R = ( tR ) / tI;
						r1I = ( -1.0 ) / tI;
					}

					// D21 = T / D21
					tr = r1R;
					ti = r1I;
					if ( Math.abs( d21I ) <= Math.abs( d21R ) ) {
						tR = d21I / d21R;
						tI = d21R + (d21I * tR);
						d21R = ( tr + (ti * tR) ) / tI;
						d21I = ( ti - (tr * tR) ) / tI;
					} else {
						tR = d21R / d21I;
						tI = d21I + (d21R * tR);
						d21R = ( (tr * tR) + ti ) / tI;
						d21I = ( (ti * tR) - tr ) / tI;
					}

					for ( j = k + 2; j < N; j++ ) {
						p1 = (offsetA * 2) + (j * sa1) + (k * sa2);
						p2 = (offsetA * 2) + (j * sa1) + (( k + 1 ) * sa2);

						// WK = D21 * (D11*A(J,K) - A(J,K+1))

						// D11*A(J,K)
						tr = (d11R * Av[ p1 ]) - (d11I * Av[ p1 + 1 ]);
						ti = (d11R * Av[ p1 + 1 ]) + (d11I * Av[ p1 ]);
						tr -= Av[ p2 ];
						ti -= Av[ p2 + 1 ];
						wkR = (d21R * tr) - (d21I * ti);
						wkI = (d21R * ti) + (d21I * tr);

						// WKP1 = D21 * (D22*A(J,K+1) - A(J,K))
						tr = (d22R * Av[ p2 ]) - (d22I * Av[ p2 + 1 ]);
						ti = (d22R * Av[ p2 + 1 ]) + (d22I * Av[ p2 ]);
						tr -= Av[ p1 ];
						ti -= Av[ p1 + 1 ];
						wkp1R = (d21R * tr) - (d21I * ti);
						wkp1I = (d21R * ti) + (d21I * tr);

						for ( i = j; i < N; i++ ) {
							// A(I,J) -= A(I,K)*WK + A(I,K+1)*WKP1
							p3 = (offsetA * 2) + (i * sa1) + (j * sa2);
							p4 = (offsetA * 2) + (i * sa1) + (k * sa2);
							tR = (offsetA * 2) + (i * sa1) + (( k + 1 ) * sa2);
							tr = (Av[ p4 ] * wkR) - (Av[ p4 + 1 ] * wkI);
							ti = (Av[ p4 ] * wkI) + (Av[ p4 + 1 ] * wkR);
							tr += (Av[ tR ] * wkp1R) - (Av[ tR + 1 ] * wkp1I);
							ti += (Av[ tR ] * wkp1I) + (Av[ tR + 1 ] * wkp1R);
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}
						Av[ p1 ] = wkR;
						Av[ p1 + 1 ] = wkI;
						Av[ p2 ] = wkp1R;
						Av[ p2 + 1 ] = wkp1I;
					}
				}
			}

			// Store details of the interchanges in IPIV
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

/**
* Perform complex division, storing result in module-level cdR and cdI.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
*/
function cDiv( ar, ai, br, bi ) {
	var r;
	var d;
	if ( Math.abs( bi ) <= Math.abs( br ) ) {
		r = bi / br;
		d = br + (bi * r);
		cdR = ( ar + (ai * r) ) / d;
		cdI = ( ai - (ar * r) ) / d;
	} else {
		r = br / bi;
		d = bi + (br * r);
		cdR = ( (ar * r) + ai ) / d;
		cdI = ( (ai * r) - ar ) / d;
	}
}


// EXPORTS //

export default zsytf2;
