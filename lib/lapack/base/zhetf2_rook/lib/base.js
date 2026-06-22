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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MODULES //

import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import zdscal from './../../../../blas/base/zdscal/lib/base.js';
import zher from './../../../../blas/base/zher/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;


// MAIN //

/**
* Factorizes a complex Hermitian indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* ## Notes
*
* -   Computes `A = U*D*U^H` or `A = L*D*L^H`, where `D` is Hermitian and block-diagonal with 1-by-1 and 2-by-2 blocks. Diagonal entries of `A` are real.
* -   IPIV stores 0-based pivot indices. If `IPIV[k] >= 0`, a 1x1 pivot was used and rows/columns `k` and `IPIV[k]` were interchanged. If `IPIV[k] < 0`, both entries of the 2x2 pivot block are negative; `~IPIV[k]` gives the 0-based row/column swapped with `k`.
*
* @private
* @param {string} uplo - specifies whether to reference the upper or lower triangular part of `A`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - output pivot index array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} `info` - 0 if successful, k (1-based) if `D(k,k)` is exactly zero.
*/
function zhetf2Rook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var dtemp;
	var itemp;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var info;
	var done;
	var imax;
	var jmax;
	var d21R;
	var d21I;
	var d11;
	var d22;
	var sa1;
	var sa2;
	var wkR;
	var wkI;
	var tt;
	var r1;
	var oA;
	var Av;
	var tR;
	var tI;
	var kk;
	var kp;
	var p1;
	var p2;
	var p3;
	var p4;
	var pk;
	var d;
	var p;
	var k;
	var i;
	var j;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	Av = reinterpret( A, 0 );
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^H using the upper triangle of A; k decreases from N-1 to 0.
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;
			p = k;

			// ABSAKK = |real(A(k,k))| (diagonal is real for Hermitian).
			pk = oA + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ pk ] );

			// IMAX is the row-index of the largest off-diagonal element in column k.
			if ( k > 0 ) {
				imax = izamax( k, A, strideA1, offsetA + (k * strideA2) );
				p2 = oA + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero: set INFO, use 1x1 pivot, force diagonal real.
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				Av[ pk + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block.
					kp = k;
				} else {
					done = false;

					// Rook pivot search loop.
					while ( !done ) {
						// JMAX is the column-index of the largest off-diagonal element in row IMAX (scan from column IMAX+1 to k).
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
							jmax = imax + 1 + izamax( k - imax, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2) );
							p3 = oA + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}
						if ( imax > 0 ) {
							itemp = izamax( imax, A, strideA1, offsetA + (imax * strideA2) );
							p4 = oA + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						// Use |real(A(imax,imax))| (diagonal is real).
						p4 = oA + (imax * sa1) + (imax * sa2);
						if ( Math.abs( Av[ p4 ] ) >= ALPHA * rowmax ) {
							// Interchange rows and columns K and IMAX, use 1x1 pivot.
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							// Interchange rows and columns K-1 and IMAX, use 2x2 pivot.
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				// First swap: interchange rows and columns K and P if kstep=2 and P != K.
				if ( kstep === 2 && p !== k ) {
					// Swap column entries A(0:p-1, k) <-> A(0:p-1, p).
					if ( p > 0 ) {
						zswap( p, A, strideA1, offsetA + (k * strideA2), A, strideA1, offsetA + (p * strideA2) );
					}
					// Swap-and-conjugate entries between P+1 and K-1.
					for ( j = p + 1; j < k; j++ ) {
						p1 = oA + (j * sa1) + (k * sa2);
						p2 = oA + (p * sa1) + (j * sa2);

						// T = conj(A(j,k))
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];

						// A(j,k) = conj(A(p,j))
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];

						// A(p,j) = t
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Conjugate A(p,k).
					p1 = oA + (p * sa1) + (k * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap diagonal (real parts only).
					p1 = oA + (k * sa1) + (k * sa2);
					p2 = oA + (p * sa1) + (p * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = 0.0;
					Av[ p2 ] = r1;
					Av[ p2 + 1 ] = 0.0;
				}

				// Second swap: interchange rows and columns KK and KP.
				kk = k - kstep + 1;
				if ( kp === kk ) {
					// No swap — force diagonal real.
					p1 = oA + (k * sa1) + (k * sa2);
					Av[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
						Av[ p1 + 1 ] = 0.0;
					}
				} else {
					if ( kp > 0 ) {
						zswap( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}
					for ( j = kp + 1; j < kk; j++ ) {
						p1 = oA + (j * sa1) + (kk * sa2);
						p2 = oA + (kp * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Conjugate A(kp,kk).
					p1 = oA + (kp * sa1) + (kk * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap diagonal.
					p1 = oA + (kk * sa1) + (kk * sa2);
					p2 = oA + (kp * sa1) + (kp * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = 0.0;
					Av[ p2 ] = r1;
					Av[ p2 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						// Force A(k,k) real.
						p1 = oA + (k * sa1) + (k * sa2);
						Av[ p1 + 1 ] = 0.0;

						// Swap A(k-1,k) and A(kp,k).
						p1 = oA + (( k - 1 ) * sa1) + (k * sa2);
						p2 = oA + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				}

				// Update the leading submatrix.
				if ( kstep === 1 ) {
					if ( k > 0 ) {
						p1 = oA + (k * sa1) + (k * sa2);
						if ( Math.abs( Av[ p1 ] ) >= SFMIN ) {
							d11 = 1.0 / Av[ p1 ];
							zher( uplo, k, -d11, A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
							zdscal( k, d11, A, strideA1, offsetA + (k * strideA2) );
						} else {
							d11 = Av[ p1 ];
							for ( i = 0; i < k; i++ ) {
								p2 = oA + (i * sa1) + (k * sa2);
								Av[ p2 ] /= d11;
								Av[ p2 + 1 ] /= d11;
							}
							zher( uplo, k, -d11, A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
						}
					}
				} else if ( k > 1 ) {
					// 2x2 pivot block.
					p1 = oA + (( k - 1 ) * sa1) + (k * sa2);
					d = Math.sqrt( (Av[ p1 ] * Av[ p1 ]) + (Av[ p1 + 1 ] * Av[ p1 + 1 ]) );

					p2 = oA + (k * sa1) + (k * sa2);
					d11 = Av[ p2 ] / d;
					p3 = oA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
					d22 = Av[ p3 ] / d;

					// D12 = A(k-1,k) / d (complex).
					d21R = Av[ p1 ] / d;
					d21I = Av[ p1 + 1 ] / d;
					tt = 1.0 / ( (d11 * d22) - 1.0 );

					for ( j = k - 2; j >= 0; j-- ) {
						// WKM1 = TT * (D11*A(j,k-1) - conj(D12)*A(j,k))
						p1 = oA + (j * sa1) + (( k - 1 ) * sa2);
						p2 = oA + (j * sa1) + (k * sa2);
						tR = (d11 * Av[ p1 ]) - ( (d21R * Av[ p2 ]) + (d21I * Av[ p2 + 1 ]) );
						tI = (d11 * Av[ p1 + 1 ]) - ( (d21R * Av[ p2 + 1 ]) - (d21I * Av[ p2 ]) );
						wkm1R = tt * tR;
						wkm1I = tt * tI;

						// WK = TT * (D22*A(j,k) - D12*A(j,k-1))
						tR = (d22 * Av[ p2 ]) - ( (d21R * Av[ p1 ]) - (d21I * Av[ p1 + 1 ]) );
						tI = (d22 * Av[ p2 + 1 ]) - ( (d21R * Av[ p1 + 1 ]) + (d21I * Av[ p1 ]) );
						wkR = tt * tR;
						wkI = tt * tI;

						for ( i = j; i >= 0; i-- ) {
							// A(i,j) -= (A(i,k)/D)*conj(WK) + (A(i,k-1)/D)*conj(WKM1)
							p3 = oA + (i * sa1) + (j * sa2);
							p4 = oA + (i * sa1) + (k * sa2);
							pk = oA + (i * sa1) + (( k - 1 ) * sa2);

							// (A(i,k)/d) * conj(WK):
							tR = Av[ p4 ] / d;
							tI = Av[ p4 + 1 ] / d;
							Av[ p3 ] -= (tR * wkR) + (tI * wkI);
							Av[ p3 + 1 ] -= (tI * wkR) - (tR * wkI);

							// (A(i,k-1)/d) * conj(WKM1):
							tR = Av[ pk ] / d;
							tI = Av[ pk + 1 ] / d;
							Av[ p3 ] -= (tR * wkm1R) + (tI * wkm1I);
							Av[ p3 + 1 ] -= (tI * wkm1R) - (tR * wkm1I);
						}

						// A(j,k) = WK / d
						p2 = oA + (j * sa1) + (k * sa2);
						Av[ p2 ] = wkR / d;
						Av[ p2 + 1 ] = wkI / d;

						// A(j,k-1) = WKM1 / d
						p1 = oA + (j * sa1) + (( k - 1 ) * sa2);
						Av[ p1 ] = wkm1R / d;
						Av[ p1 + 1 ] = wkm1I / d;

						// Force A(j,j) real.
						p3 = oA + (j * sa1) + (j * sa2);
						Av[ p3 + 1 ] = 0.0;
					}
				}
			}

			// Store pivot info.
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^H using the lower triangle of A; k increases from 0 to N-1.
		k = 0;
		while ( k < N ) {
			kstep = 1;
			p = k;

			pk = oA + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ pk ] );

			if ( k < N - 1 ) {
				imax = k + 1 + izamax( N - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
				p2 = oA + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				Av[ pk + 1 ] = 0.0;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
							jmax = k + izamax( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2) );
							p3 = oA + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}
						if ( imax < N - 1 ) {
							itemp = imax + 1 + izamax( N - imax - 1, A, strideA1, offsetA + (( imax + 1 ) * strideA1) + (imax * strideA2) );
							p4 = oA + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						p4 = oA + (imax * sa1) + (imax * sa2);
						if ( Math.abs( Av[ p4 ] ) >= ALPHA * rowmax ) {
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				// First swap.
				if ( kstep === 2 && p !== k ) {
					if ( p < N - 1 ) {
						zswap( N - p - 1, A, strideA1, offsetA + (( p + 1 ) * strideA1) + (k * strideA2), A, strideA1, offsetA + (( p + 1 ) * strideA1) + (p * strideA2) );
					}
					for ( j = k + 1; j < p; j++ ) {
						p1 = oA + (j * sa1) + (k * sa2);
						p2 = oA + (p * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					p1 = oA + (p * sa1) + (k * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];
					p1 = oA + (k * sa1) + (k * sa2);
					p2 = oA + (p * sa1) + (p * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = 0.0;
					Av[ p2 ] = r1;
					Av[ p2 + 1 ] = 0.0;
				}

				// Second swap.
				kk = k + kstep - 1;
				if ( kp === kk ) {
					p1 = oA + (k * sa1) + (k * sa2);
					Av[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
						Av[ p1 + 1 ] = 0.0;
					}
				} else {
					if ( kp < N - 1 ) {
						zswap( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2) );
					}
					for ( j = kk + 1; j < kp; j++ ) {
						p1 = oA + (j * sa1) + (kk * sa2);
						p2 = oA + (kp * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					p1 = oA + (kp * sa1) + (kk * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];
					p1 = oA + (kk * sa1) + (kk * sa2);
					p2 = oA + (kp * sa1) + (kp * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = 0.0;
					Av[ p2 ] = r1;
					Av[ p2 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oA + (k * sa1) + (k * sa2);
						Av[ p1 + 1 ] = 0.0;
						p1 = oA + (( k + 1 ) * sa1) + (k * sa2);
						p2 = oA + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
				}

				// Update the trailing submatrix.
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						p1 = oA + (k * sa1) + (k * sa2);
						if ( Math.abs( Av[ p1 ] ) >= SFMIN ) {
							d11 = 1.0 / Av[ p1 ];
							zher( uplo, N - k - 1, -d11, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
							zdscal( N - k - 1, d11, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
						} else {
							d11 = Av[ p1 ];
							for ( i = k + 1; i < N; i++ ) {
								p2 = oA + (i * sa1) + (k * sa2);
								Av[ p2 ] /= d11;
								Av[ p2 + 1 ] /= d11;
							}
							zher( uplo, N - k - 1, -d11, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
						}
					}
				} else if ( k < N - 2 ) {
					p1 = oA + (( k + 1 ) * sa1) + (k * sa2);
					d = Math.sqrt( (Av[ p1 ] * Av[ p1 ]) + (Av[ p1 + 1 ] * Av[ p1 + 1 ]) );

					p2 = oA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
					d11 = Av[ p2 ] / d;
					p3 = oA + (k * sa1) + (k * sa2);
					d22 = Av[ p3 ] / d;
					d21R = Av[ p1 ] / d;
					d21I = Av[ p1 + 1 ] / d;
					tt = 1.0 / ( (d11 * d22) - 1.0 );

					for ( j = k + 2; j < N; j++ ) {
						// WK = TT * (D11*A(j,k) - D21*A(j,k+1))
						p1 = oA + (j * sa1) + (k * sa2);
						p2 = oA + (j * sa1) + (( k + 1 ) * sa2);
						tR = (d11 * Av[ p1 ]) - ( (d21R * Av[ p2 ]) - (d21I * Av[ p2 + 1 ]) );
						tI = (d11 * Av[ p1 + 1 ]) - ( (d21R * Av[ p2 + 1 ]) + (d21I * Av[ p2 ]) );
						wkR = tt * tR;
						wkI = tt * tI;

						// WKP1 = TT * (D22*A(j,k+1) - conj(D21)*A(j,k))
						tR = (d22 * Av[ p2 ]) - ( (d21R * Av[ p1 ]) + (d21I * Av[ p1 + 1 ]) );
						tI = (d22 * Av[ p2 + 1 ]) - ( (d21R * Av[ p1 + 1 ]) - (d21I * Av[ p1 ]) );
						wkp1R = tt * tR;
						wkp1I = tt * tI;

						for ( i = j; i < N; i++ ) {
							p3 = oA + (i * sa1) + (j * sa2);
							p4 = oA + (i * sa1) + (k * sa2);
							pk = oA + (i * sa1) + (( k + 1 ) * sa2);
							tR = Av[ p4 ] / d;
							tI = Av[ p4 + 1 ] / d;
							Av[ p3 ] -= (tR * wkR) + (tI * wkI);
							Av[ p3 + 1 ] -= (tI * wkR) - (tR * wkI);
							tR = Av[ pk ] / d;
							tI = Av[ pk + 1 ] / d;
							Av[ p3 ] -= (tR * wkp1R) + (tI * wkp1I);
							Av[ p3 + 1 ] -= (tI * wkp1R) - (tR * wkp1I);
						}

						p1 = oA + (j * sa1) + (k * sa2);
						Av[ p1 ] = wkR / d;
						Av[ p1 + 1 ] = wkI / d;
						p2 = oA + (j * sa1) + (( k + 1 ) * sa2);
						Av[ p2 ] = wkp1R / d;
						Av[ p2 + 1 ] = wkp1I / d;
						p3 = oA + (j * sa1) + (j * sa2);
						Av[ p3 + 1 ] = 0.0;
					}
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ] = ~kp;
			}

			k += kstep;
		}
	}

	return info;
}


// EXPORTS //

export default zhetf2Rook;
