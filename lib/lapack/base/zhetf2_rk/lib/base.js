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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, max-lines */

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
* Computes the factorization of a complex Hermitian matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method:.
*
* ```text
* A = P*U*D*(U^H)*(P^T)  or  A = P*L*D*(L^H)*(P^T)
* ```
*
* where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation, and `D` is Hermitian and block diagonal with `1x1` and `2x2` blocks.
*
* The diagonal of `D` (real-valued for Hermitian) is stored on the diagonal of `A`; the super-/sub-diagonal entries of `D` are returned in `e`. `IPIV` uses the 0-based encoding with bitwise-NOT for `2x2` blocks: `IPIV[k] = ~p` encodes swap-target row `p`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output Hermitian matrix
* @param {integer} strideA1 - stride of dimension 1 of `A` (in complex elements)
* @param {integer} strideA2 - stride of dimension 2 of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - complex-element offset for `A`
* @param {Complex128Array} e - output super-/sub-diagonal entries of `D`
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - complex-element offset for `e`
* @param {Int32Array} IPIV - pivot index output array
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} info - `0` on success; `k>0` (1-based) if `D(k,k)` is exactly zero
*/
function zhetf2rk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var itemp;
	var kstep;
	var dtemp;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var done;
	var info;
	var imax;
	var jmax;
	var d12R;
	var d12I;
	var d21R;
	var d21I;
	var oa2;
	var oe2;
	var se2;
	var wkR;
	var wkI;
	var d11;
	var d22;
	var sa1;
	var sa2;
	var tt;
	var r1;
	var Av;
	var Ev;
	var tR;
	var tI;
	var ii;
	var kk;
	var kp;
	var p1;
	var p2;
	var p3;
	var p4;
	var d;
	var p;
	var k;
	var i;
	var j;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oa2 = offsetA * 2;
	se2 = strideE * 2;
	oe2 = offsetE * 2;
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^H using the upper triangle of A.
		Ev[ oe2 ] = 0.0;
		Ev[ oe2 + 1 ] = 0.0;

		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;
			p = k;

			// ABSAKK = |real(A(k,k))|.
			p1 = oa2 + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] );

			if ( k > 0 ) {
				imax = izamax( k, A, strideA1, offsetA + (k * strideA2) );
				p2 = oa2 + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
				imax = 0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;

				// Force A(k,k) real.
				Av[ p1 + 1 ] = 0.0;
				if ( k > 0 ) {
					Ev[ oe2 + (k * se2) ] = 0.0;
					Ev[ oe2 + (k * se2) + 1 ] = 0.0;
				}
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
							jmax = imax;
						} else {
							// Look in row IMAX from column IMAX+1 to K.
							jmax = imax + 1 + izamax( k - imax, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2) );
							p3 = oa2 + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}

						if ( imax > 0 ) {
							itemp = izamax( imax, A, strideA1, offsetA + (imax * strideA2) );
							p4 = oa2 + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						p4 = oa2 + (imax * sa1) + (imax * sa2);
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

				kk = k - kstep + 1;

				// First swap: K <-> P for 2x2 pivot.
				if ( kstep === 2 && p !== k ) {
					if ( p > 0 ) {
						zswap( p, A, strideA1, offsetA + (k * strideA2), A, strideA1, offsetA + (p * strideA2) );
					}
					// Swap and conjugate columns P+1..K-1 of row K with row P.
					for ( j = p + 1; j < k; j++ ) {
						p1 = oa2 + (j * sa1) + (k * sa2);
						p2 = oa2 + (p * sa1) + (j * sa2);

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
					p1 = oa2 + (p * sa1) + (k * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap real diagonals A(k,k) and A(p,p).
					p1 = oa2 + (k * sa1) + (k * sa2);
					p2 = oa2 + (p * sa1) + (p * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p2 ] = r1;

					// Swap trailing rows K and P across columns K+1..N-1.
					if ( k < N - 1 ) {
						zswap( N - k - 1, A, strideA2, offsetA + (k * strideA1) + (( k + 1 ) * strideA2), A, strideA2, offsetA + (p * strideA1) + (( k + 1 ) * strideA2) );
					}
				}

				// Second swap: KK <-> KP (or diagonal-only path).
				if ( kp === kk ) {
					// No swap: force diagonal to be real.
					p1 = oa2 + (k * sa1) + (k * sa2);
					Av[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oa2 + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
						Av[ p1 + 1 ] = 0.0;
					}
				} else {
					if ( kp > 0 ) {
						zswap( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}
					for ( j = kp + 1; j < kk; j++ ) {
						p1 = oa2 + (j * sa1) + (kk * sa2);
						p2 = oa2 + (kp * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Conjugate A(kp,kk).
					p1 = oa2 + (kp * sa1) + (kk * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap real diagonals.
					p1 = oa2 + (kk * sa1) + (kk * sa2);
					p2 = oa2 + (kp * sa1) + (kp * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p2 ] = r1;
					if ( kstep === 2 ) {
						// Force A(k,k) real.
						p1 = oa2 + (k * sa1) + (k * sa2);
						Av[ p1 + 1 ] = 0.0;

						// Swap A(k-1,k) and A(kp,k).
						p1 = oa2 + (( k - 1 ) * sa1) + (k * sa2);
						p2 = oa2 + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Swap trailing rows KK and KP across columns K+1..N-1.
					if ( k < N - 1 ) {
						zswap( N - k - 1, A, strideA2, offsetA + (kk * strideA1) + (( k + 1 ) * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( k + 1 ) * strideA2) );
					}
				}

				// Update the leading submatrix.
				if ( kstep === 1 ) {
					if ( k > 0 ) {
						p1 = oa2 + (k * sa1) + (k * sa2);
						if ( Math.abs( Av[ p1 ] ) >= SFMIN ) {
							d11 = 1.0 / Av[ p1 ];
							zher( uplo, k, -d11, A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
							zdscal( k, d11, A, strideA1, offsetA + (k * strideA2) );
						} else {
							d11 = Av[ p1 ];
							for ( ii = 0; ii < k; ii++ ) {
								p2 = oa2 + (ii * sa1) + (k * sa2);
								Av[ p2 ] /= d11;
								Av[ p2 + 1 ] /= d11;
							}
							zher( uplo, k, -d11, A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
						}
						Ev[ oe2 + (k * se2) ] = 0.0;
						Ev[ oe2 + (k * se2) + 1 ] = 0.0;
					}
				} else if ( k > 1 ) {
					// 2x2 pivot block D(k-1..k).
					p1 = oa2 + (( k - 1 ) * sa1) + (k * sa2);
					d = Math.sqrt( ( Av[ p1 ] * Av[ p1 ] ) + ( Av[ p1 + 1 ] * Av[ p1 + 1 ] ) );

					// D11 = real(A(k,k)) / D
					p2 = oa2 + (k * sa1) + (k * sa2);
					d11 = Av[ p2 ] / d;

					// D22 = real(A(k-1,k-1)) / D
					p3 = oa2 + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
					d22 = Av[ p3 ] / d;

					// D12 = A(k-1,k) / D (complex)
					d12R = Av[ p1 ] / d;
					d12I = Av[ p1 + 1 ] / d;
					tt = 1.0 / ( ( d11 * d22 ) - 1.0 );

					for ( j = k - 2; j >= 0; j-- ) {
						// WKM1 = tt * (D11 * A(j,k-1) - conj(D12) * A(j,k))
						p1 = oa2 + (j * sa1) + (( k - 1 ) * sa2);
						p2 = oa2 + (j * sa1) + (k * sa2);
						tR = d11 * Av[ p1 ];
						tI = d11 * Av[ p1 + 1 ];

						// conj(D12) = (d12R, -d12I)
						tR -= ( d12R * Av[ p2 ] ) + ( d12I * Av[ p2 + 1 ] );
						tI -= ( d12R * Av[ p2 + 1 ] ) - ( d12I * Av[ p2 ] );
						wkm1R = tt * tR;
						wkm1I = tt * tI;

						// WK = tt * (D22 * A(j,k) - D12 * A(j,k-1))
						tR = d22 * Av[ p2 ];
						tI = d22 * Av[ p2 + 1 ];
						tR -= ( d12R * Av[ p1 ] ) - ( d12I * Av[ p1 + 1 ] );
						tI -= ( d12R * Av[ p1 + 1 ] ) + ( d12I * Av[ p1 ] );
						wkR = tt * tR;
						wkI = tt * tI;

						// For i = j..0:  A(i,j) -= (A(i,k)/D)*conj(WK) + (A(i,k-1)/D)*conj(WKM1)
						for ( i = j; i >= 0; i-- ) {
							p3 = oa2 + (i * sa1) + (j * sa2);
							p4 = oa2 + (i * sa1) + (k * sa2);

							// (A(i,k) * conj(WK)) / D
							Av[ p3 ] -= ( ( Av[ p4 ] * wkR ) + ( Av[ p4 + 1 ] * wkI ) ) / d;
							Av[ p3 + 1 ] -= ( ( Av[ p4 + 1 ] * wkR ) - ( Av[ p4 ] * wkI ) ) / d;
							p4 = oa2 + (i * sa1) + (( k - 1 ) * sa2);
							Av[ p3 ] -= ( ( Av[ p4 ] * wkm1R ) + ( Av[ p4 + 1 ] * wkm1I ) ) / d;
							Av[ p3 + 1 ] -= ( ( Av[ p4 + 1 ] * wkm1R ) - ( Av[ p4 ] * wkm1I ) ) / d;
						}
						// A(j,k) = WK / D
						p2 = oa2 + (j * sa1) + (k * sa2);
						Av[ p2 ] = wkR / d;
						Av[ p2 + 1 ] = wkI / d;

						// A(j,k-1) = WKM1 / D
						p1 = oa2 + (j * sa1) + (( k - 1 ) * sa2);
						Av[ p1 ] = wkm1R / d;
						Av[ p1 + 1 ] = wkm1I / d;

						// Force A(j,j) real.
						p3 = oa2 + (j * sa1) + (j * sa2);
						Av[ p3 + 1 ] = 0.0;
					}
				}

				// Copy the superdiagonal element of D into E (for 2x2 block).
				if ( kstep === 2 ) {
					p1 = oa2 + (( k - 1 ) * sa1) + (k * sa2);
					Ev[ oe2 + (k * se2) ] = Av[ p1 ];
					Ev[ oe2 + (k * se2) + 1 ] = Av[ p1 + 1 ];
					Ev[ oe2 + (( k - 1 ) * se2) ] = 0.0;
					Ev[ oe2 + (( k - 1 ) * se2) + 1 ] = 0.0;
					Av[ p1 ] = 0.0;
					Av[ p1 + 1 ] = 0.0;
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^H using the lower triangle of A.
		Ev[ oe2 + (( N - 1 ) * se2) ] = 0.0;
		Ev[ oe2 + (( N - 1 ) * se2) + 1 ] = 0.0;

		k = 0;
		while ( k < N ) {
			kstep = 1;
			p = k;

			p1 = oa2 + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] );

			if ( k < N - 1 ) {
				imax = k + 1 + izamax( N - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
				p2 = oa2 + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
				imax = k;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				Av[ p1 + 1 ] = 0.0;
				if ( k < N - 1 ) {
					Ev[ oe2 + (k * se2) ] = 0.0;
					Ev[ oe2 + (k * se2) + 1 ] = 0.0;
				}
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
							jmax = imax;
						} else {
							jmax = k + izamax( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2) );
							p3 = oa2 + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}

						if ( imax < N - 1 ) {
							itemp = imax + 1 + izamax( N - imax - 1, A, strideA1, offsetA + (( imax + 1 ) * strideA1) + (imax * strideA2) );
							p4 = oa2 + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						p4 = oa2 + (imax * sa1) + (imax * sa2);
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

				kk = k + kstep - 1;

				// First swap for 2x2: K <-> P.
				if ( kstep === 2 && p !== k ) {
					if ( p < N - 1 ) {
						zswap( N - p - 1, A, strideA1, offsetA + (( p + 1 ) * strideA1) + (k * strideA2), A, strideA1, offsetA + (( p + 1 ) * strideA1) + (p * strideA2) );
					}
					for ( j = k + 1; j < p; j++ ) {
						p1 = oa2 + (j * sa1) + (k * sa2);
						p2 = oa2 + (p * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					// Conjugate A(p,k).
					p1 = oa2 + (p * sa1) + (k * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];

					// Swap real diagonals.
					p1 = oa2 + (k * sa1) + (k * sa2);
					p2 = oa2 + (p * sa1) + (p * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p2 ] = r1;

					// Swap leading rows K and P across columns 0..K-1.
					if ( k > 0 ) {
						zswap( k, A, strideA2, offsetA + (k * strideA1), A, strideA2, offsetA + (p * strideA1) );
					}
				}

				// Second swap: KK <-> KP (or diagonal-only path).
				if ( kp === kk ) {
					p1 = oa2 + (k * sa1) + (k * sa2);
					Av[ p1 + 1 ] = 0.0;
					if ( kstep === 2 ) {
						p1 = oa2 + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
						Av[ p1 + 1 ] = 0.0;
					}
				} else {
					if ( kp < N - 1 ) {
						zswap( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2) );
					}
					for ( j = kk + 1; j < kp; j++ ) {
						p1 = oa2 + (j * sa1) + (kk * sa2);
						p2 = oa2 + (kp * sa1) + (j * sa2);
						tR = Av[ p1 ];
						tI = -Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = -Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					p1 = oa2 + (kp * sa1) + (kk * sa2);
					Av[ p1 + 1 ] = -Av[ p1 + 1 ];
					p1 = oa2 + (kk * sa1) + (kk * sa2);
					p2 = oa2 + (kp * sa1) + (kp * sa2);
					r1 = Av[ p1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p2 ] = r1;
					if ( kstep === 2 ) {
						p1 = oa2 + (k * sa1) + (k * sa2);
						Av[ p1 + 1 ] = 0.0;
						p1 = oa2 + (( k + 1 ) * sa1) + (k * sa2);
						p2 = oa2 + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					if ( k > 0 ) {
						zswap( k, A, strideA2, offsetA + (kk * strideA1), A, strideA2, offsetA + (kp * strideA1) );
					}
				}

				// Update the trailing submatrix.
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						p1 = oa2 + (k * sa1) + (k * sa2);
						if ( Math.abs( Av[ p1 ] ) >= SFMIN ) {
							d11 = 1.0 / Av[ p1 ];
							zher( uplo, N - k - 1, -d11, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
							zdscal( N - k - 1, d11, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
						} else {
							d11 = Av[ p1 ];
							for ( ii = k + 1; ii < N; ii++ ) {
								p2 = oa2 + (ii * sa1) + (k * sa2);
								Av[ p2 ] /= d11;
								Av[ p2 + 1 ] /= d11;
							}
							zher( uplo, N - k - 1, -d11, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
						}
						Ev[ oe2 + (k * se2) ] = 0.0;
						Ev[ oe2 + (k * se2) + 1 ] = 0.0;
					}
				} else if ( k < N - 2 ) {
					// 2x2 pivot block.
					p1 = oa2 + (( k + 1 ) * sa1) + (k * sa2);
					d = Math.sqrt( ( Av[ p1 ] * Av[ p1 ] ) + ( Av[ p1 + 1 ] * Av[ p1 + 1 ] ) );
					p2 = oa2 + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
					d11 = Av[ p2 ] / d;
					p3 = oa2 + (k * sa1) + (k * sa2);
					d22 = Av[ p3 ] / d;
					d21R = Av[ p1 ] / d;
					d21I = Av[ p1 + 1 ] / d;
					tt = 1.0 / ( ( d11 * d22 ) - 1.0 );

					for ( j = k + 2; j < N; j++ ) {
						// WK = tt * (D11 * A(j,k) - D21 * A(j,k+1))
						p1 = oa2 + (j * sa1) + (k * sa2);
						p2 = oa2 + (j * sa1) + (( k + 1 ) * sa2);
						tR = d11 * Av[ p1 ];
						tI = d11 * Av[ p1 + 1 ];

						// - D21 * A(j,k+1); D21 complex
						tR -= ( d21R * Av[ p2 ] ) - ( d21I * Av[ p2 + 1 ] );
						tI -= ( d21R * Av[ p2 + 1 ] ) + ( d21I * Av[ p2 ] );
						wkR = tt * tR;
						wkI = tt * tI;

						// WKP1 = tt * (D22 * A(j,k+1) - conj(D21) * A(j,k))
						tR = d22 * Av[ p2 ];
						tI = d22 * Av[ p2 + 1 ];

						// conj(D21) = (d21R, -d21I)
						tR -= ( d21R * Av[ p1 ] ) + ( d21I * Av[ p1 + 1 ] );
						tI -= ( d21R * Av[ p1 + 1 ] ) - ( d21I * Av[ p1 ] );
						wkp1R = tt * tR;
						wkp1I = tt * tI;

						// For i = j..N-1:  A(i,j) -= (A(i,k)/D)*conj(WK) + (A(i,k+1)/D)*conj(WKP1)
						for ( i = j; i < N; i++ ) {
							p3 = oa2 + (i * sa1) + (j * sa2);
							p4 = oa2 + (i * sa1) + (k * sa2);
							Av[ p3 ] -= ( ( Av[ p4 ] * wkR ) + ( Av[ p4 + 1 ] * wkI ) ) / d;
							Av[ p3 + 1 ] -= ( ( Av[ p4 + 1 ] * wkR ) - ( Av[ p4 ] * wkI ) ) / d;
							p4 = oa2 + (i * sa1) + (( k + 1 ) * sa2);
							Av[ p3 ] -= ( ( Av[ p4 ] * wkp1R ) + ( Av[ p4 + 1 ] * wkp1I ) ) / d;
							Av[ p3 + 1 ] -= ( ( Av[ p4 + 1 ] * wkp1R ) - ( Av[ p4 ] * wkp1I ) ) / d;
						}
						p1 = oa2 + (j * sa1) + (k * sa2);
						Av[ p1 ] = wkR / d;
						Av[ p1 + 1 ] = wkI / d;
						p2 = oa2 + (j * sa1) + (( k + 1 ) * sa2);
						Av[ p2 ] = wkp1R / d;
						Av[ p2 + 1 ] = wkp1I / d;
						p3 = oa2 + (j * sa1) + (j * sa2);
						Av[ p3 + 1 ] = 0.0;
					}
				}

				// Copy the subdiagonal element of D into E.
				if ( kstep === 2 ) {
					p1 = oa2 + (( k + 1 ) * sa1) + (k * sa2);
					Ev[ oe2 + (k * se2) ] = Av[ p1 ];
					Ev[ oe2 + (k * se2) + 1 ] = Av[ p1 + 1 ];
					Ev[ oe2 + (( k + 1 ) * se2) ] = 0.0;
					Ev[ oe2 + (( k + 1 ) * se2) + 1 ] = 0.0;
					Av[ p1 ] = 0.0;
					Av[ p1 + 1 ] = 0.0;
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

export default zhetf2rk;
