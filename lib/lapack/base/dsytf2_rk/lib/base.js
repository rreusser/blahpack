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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, max-lines */

// MODULES //

import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dsyr from './../../../../blas/base/dsyr/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;


// MAIN //

/**
* Computes the factorization of a real symmetric matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method:.
*
* ```text
* A = P*U*D*(U^T)*(P^T)  or  A = P*L*D*(L^T)*(P^T)
* ```
*
* where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation matrix, and `D` is symmetric and block diagonal with 1x1 and 2x2 blocks.
*
* This is the `_rk` kernel variant: the diagonal of `D` is stored on the diagonal of `A` while the off-diagonal entries of `D` are returned separately in `e`. The array `e` is zero on entries corresponding to 1x1 pivot blocks.
*
* `IPIV` stores 0-based pivot indices. If `IPIV[k] >= 0`, a 1x1 pivot was used and rows/columns `k` and `IPIV[k]` were interchanged. If `IPIV[k] < 0`, a 2x2 pivot block was used; the swap target row is `~IPIV[k]` (bitwise NOT). For a 2x2 block at `(k,k-1)` in the upper case (or `(k,k+1)` in the lower case), both entries of `IPIV` encode the same 0-based target.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float64Array} e - output vector containing the superdiagonal (upper) or subdiagonal (lower) entries of `D`
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - index offset for `e`
* @param {Int32Array} IPIV - output pivot index array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} info - `0` if successful; `k>0` if `D(k,k)` is exactly zero (1-based)
*/
function dsytf2rk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var itemp;
	var kstep;
	var dtemp;
	var done;
	var info;
	var imax;
	var jmax;
	var wkm1;
	var wkp1;
	var sa1;
	var sa2;
	var d11;
	var d12;
	var d21;
	var d22;
	var ii;
	var wk;
	var kk;
	var kp;
	var p;
	var t;
	var k;
	var i;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^T using the upper triangle of A.
		// Initialize the leading entry of E.
		e[ offsetE ] = 0.0;

		// K is the main loop index, decreasing from N-1 to 0 (0-based).
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;
			p = k;

			// Determine rows and columns to be interchanged and whether a 1x1 or 2x2 pivot block will be used.
			absakk = Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] );

			// IMAX is the row-index of the largest off-diagonal element in column K, and COLMAX is its absolute value.
			if ( k > 0 ) {
				imax = idamax( k, A, sa1, offsetA + (k * sa2) );
				colmax = Math.abs( A[ offsetA + (imax * sa1) + (k * sa2) ] );
			} else {
				colmax = 0.0;
				imax = 0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero: set INFO and use 1x1 pivot.
				if ( info === 0 ) {
					info = k + 1; // 1-based
				}
				kp = k;
				if ( k > 0 ) {
					e[ offsetE + (k * strideE) ] = 0.0;
				}
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block.
					kp = k;
				} else {
					done = false;

					// BEGIN pivot search loop (rook)
					while ( !done ) {
						// JMAX is the column-index of the largest off-diagonal element in row IMAX, and ROWMAX is its absolute value.
						if ( imax === k ) {
							rowmax = 0.0;
							jmax = imax;
						} else {
							// Look in row IMAX from column IMAX+1 to K.
							jmax = imax + 1 + idamax( k - imax, A, sa2, offsetA + (imax * sa1) + (( imax + 1 ) * sa2) );
							rowmax = Math.abs( A[ offsetA + (imax * sa1) + (jmax * sa2) ] );
						}

						if ( imax > 0 ) {
							itemp = idamax( imax, A, sa1, offsetA + (imax * sa2) );
							dtemp = Math.abs( A[ offsetA + (itemp * sa1) + (imax * sa2) ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						// Case (2): |A(IMAX,IMAX)| >= alpha * rowmax -> use 1x1 with row IMAX.
						if ( Math.abs( A[ offsetA + (imax * sa1) + (imax * sa2) ] ) >= ALPHA * rowmax ) {
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							// Case (3): use 2x2 block.
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							// Case (4): cycle.
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				// Swap TWO rows and TWO columns.
				// First swap: P and K for 2x2 case.
				if ( kstep === 2 && p !== k ) {
					// Interchange rows and columns K and P in the leading submatrix A(0:k,0:k).
					if ( p > 0 ) {
						dswap( p, A, sa1, offsetA + (k * sa2), A, sa1, offsetA + (p * sa2) );
					}
					if ( p < k - 1 ) {
						// Row swap portion: columns P+1..K-1, row K <-> row P.
						dswap( k - p - 1, A, sa1, offsetA + (( p + 1 ) * sa1) + (k * sa2), A, sa2, offsetA + (p * sa1) + (( p + 1 ) * sa2) );
					}
					t = A[ offsetA + (k * sa1) + (k * sa2) ];
					A[ offsetA + (k * sa1) + (k * sa2) ] = A[ offsetA + (p * sa1) + (p * sa2) ];
					A[ offsetA + (p * sa1) + (p * sa2) ] = t;

					// Interchange trailing rows K and P across columns K+1..N-1.
					if ( k < N - 1 ) {
						dswap( N - k - 1, A, sa2, offsetA + (k * sa1) + (( k + 1 ) * sa2), A, sa2, offsetA + (p * sa1) + (( k + 1 ) * sa2) );
					}
				}

				// Second swap: KK and KP.
				kk = k - kstep + 1;
				if ( kp !== kk ) {
					if ( kp > 0 ) {
						dswap( kp, A, sa1, offsetA + (kk * sa2), A, sa1, offsetA + (kp * sa2) );
					}
					if ( kk > 0 && kp < kk - 1 ) {
						dswap( kk - kp - 1, A, sa1, offsetA + (( kp + 1 ) * sa1) + (kk * sa2), A, sa2, offsetA + (kp * sa1) + (( kp + 1 ) * sa2) );
					}
					t = A[ offsetA + (kk * sa1) + (kk * sa2) ];
					A[ offsetA + (kk * sa1) + (kk * sa2) ] = A[ offsetA + (kp * sa1) + (kp * sa2) ];
					A[ offsetA + (kp * sa1) + (kp * sa2) ] = t;
					if ( kstep === 2 ) {
						t = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
						A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ] = A[ offsetA + (kp * sa1) + (k * sa2) ];
						A[ offsetA + (kp * sa1) + (k * sa2) ] = t;
					}

					// Interchange trailing rows KK and KP across columns K+1..N-1.
					if ( k < N - 1 ) {
						dswap( N - k - 1, A, sa2, offsetA + (kk * sa1) + (( k + 1 ) * sa2), A, sa2, offsetA + (kp * sa1) + (( k + 1 ) * sa2) );
					}
				}

				// Update the leading submatrix.
				if ( kstep === 1 ) {
					// 1x1 pivot block D(k).
					if ( k > 0 ) {
						if ( Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] ) >= SFMIN ) {
							d11 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
							dsyr( uplo, k, -d11, A, sa1, offsetA + (k * sa2), A, sa1, sa2, offsetA );
							dscal( k, d11, A, sa1, offsetA + (k * sa2) );
						} else {
							// Near-underflow rescaling path: avoid overflow from 1/D11.
							d11 = A[ offsetA + (k * sa1) + (k * sa2) ];
							for ( ii = 0; ii < k; ii++ ) {
								A[ offsetA + (ii * sa1) + (k * sa2) ] /= d11;
							}
							dsyr( uplo, k, -d11, A, sa1, offsetA + (k * sa2), A, sa1, sa2, offsetA );
						}
						e[ offsetE + (k * strideE) ] = 0.0;
					}
				} else {
					// 2x2 pivot block D(k-1..k,k-1..k).
					if ( k > 1 ) {
						d12 = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
						d22 = A[ offsetA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) ] / d12;
						d11 = A[ offsetA + (k * sa1) + (k * sa2) ] / d12;
						t = 1.0 / ( ( d11 * d22 ) - 1.0 );

						for ( j = k - 2; j >= 0; j-- ) {
							wkm1 = t * ( ( d11 * A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] ) - A[ offsetA + (j * sa1) + (k * sa2) ] );
							wk = t * ( ( d22 * A[ offsetA + (j * sa1) + (k * sa2) ] ) - A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] );
							for ( i = j; i >= 0; i-- ) {
								A[ offsetA + (i * sa1) + (j * sa2) ] = A[ offsetA + (i * sa1) + (j * sa2) ] - ( ( A[ offsetA + (i * sa1) + (k * sa2) ] / d12 ) * wk ) - ( ( A[ offsetA + (i * sa1) + (( k - 1 ) * sa2) ] / d12 ) * wkm1 );
							}
							A[ offsetA + (j * sa1) + (k * sa2) ] = wk / d12;
							A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] = wkm1 / d12;
						}
					}

					// Copy the superdiagonal element of D to E and zero out the corresponding entry of A.
					e[ offsetE + (k * strideE) ] = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
					e[ offsetE + (( k - 1 ) * strideE) ] = 0.0;
					A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ] = 0.0;
				}
			}

			// Store details of the interchanges in IPIV.
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p; // 2x2: ~(p) encodes -(p+1)
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle of A.
		// Initialize the trailing entry of E.
		e[ offsetE + (( N - 1 ) * strideE) ] = 0.0;

		// K is the main loop index, increasing from 0 to N-1 (0-based).
		k = 0;
		while ( k < N ) {
			kstep = 1;
			p = k;

			absakk = Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] );

			if ( k < N - 1 ) {
				imax = k + 1 + idamax( N - k - 1, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2) );
				colmax = Math.abs( A[ offsetA + (imax * sa1) + (k * sa2) ] );
			} else {
				colmax = 0.0;
				imax = k;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				if ( k < N - 1 ) {
					e[ offsetE + (k * strideE) ] = 0.0;
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
							// Look in row IMAX from column K to IMAX-1.
							jmax = k + idamax( imax - k, A, sa2, offsetA + (imax * sa1) + (k * sa2) );
							rowmax = Math.abs( A[ offsetA + (imax * sa1) + (jmax * sa2) ] );
						}

						if ( imax < N - 1 ) {
							itemp = imax + 1 + idamax( N - imax - 1, A, sa1, offsetA + (( imax + 1 ) * sa1) + (imax * sa2) );
							dtemp = Math.abs( A[ offsetA + (itemp * sa1) + (imax * sa2) ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						if ( Math.abs( A[ offsetA + (imax * sa1) + (imax * sa2) ] ) >= ALPHA * rowmax ) {
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

				// First swap for 2x2: columns/rows K and P.
				if ( kstep === 2 && p !== k ) {
					if ( p < N - 1 ) {
						dswap( N - p - 1, A, sa1, offsetA + (( p + 1 ) * sa1) + (k * sa2), A, sa1, offsetA + (( p + 1 ) * sa1) + (p * sa2) );
					}
					if ( p > k + 1 ) {
						dswap( p - k - 1, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), A, sa2, offsetA + (p * sa1) + (( k + 1 ) * sa2) );
					}
					t = A[ offsetA + (k * sa1) + (k * sa2) ];
					A[ offsetA + (k * sa1) + (k * sa2) ] = A[ offsetA + (p * sa1) + (p * sa2) ];
					A[ offsetA + (p * sa1) + (p * sa2) ] = t;

					// Interchange leading rows K and P across columns 0..K-1.
					if ( k > 0 ) {
						dswap( k, A, sa2, offsetA + (k * sa1), A, sa2, offsetA + (p * sa1) );
					}
				}

				// Second swap: KK and KP.
				kk = k + kstep - 1;
				if ( kp !== kk ) {
					if ( kp < N - 1 ) {
						dswap( N - kp - 1, A, sa1, offsetA + (( kp + 1 ) * sa1) + (kk * sa2), A, sa1, offsetA + (( kp + 1 ) * sa1) + (kp * sa2) );
					}
					if ( kk < N - 1 && kp > kk + 1 ) {
						dswap( kp - kk - 1, A, sa1, offsetA + (( kk + 1 ) * sa1) + (kk * sa2), A, sa2, offsetA + (kp * sa1) + (( kk + 1 ) * sa2) );
					}
					t = A[ offsetA + (kk * sa1) + (kk * sa2) ];
					A[ offsetA + (kk * sa1) + (kk * sa2) ] = A[ offsetA + (kp * sa1) + (kp * sa2) ];
					A[ offsetA + (kp * sa1) + (kp * sa2) ] = t;
					if ( kstep === 2 ) {
						t = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
						A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ] = A[ offsetA + (kp * sa1) + (k * sa2) ];
						A[ offsetA + (kp * sa1) + (k * sa2) ] = t;
					}

					// Interchange leading rows KK and KP across columns 0..K-1.
					if ( k > 0 ) {
						dswap( k, A, sa2, offsetA + (kk * sa1), A, sa2, offsetA + (kp * sa1) );
					}
				}

				// Update the trailing submatrix.
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						if ( Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] ) >= SFMIN ) {
							d11 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
							dsyr( uplo, N - k - 1, -d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), A, sa1, sa2, offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) );
							dscal( N - k - 1, d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2) );
						} else {
							// Near-underflow rescaling path.
							d11 = A[ offsetA + (k * sa1) + (k * sa2) ];
							for ( ii = k + 1; ii < N; ii++ ) {
								A[ offsetA + (ii * sa1) + (k * sa2) ] /= d11;
							}
							dsyr( uplo, N - k - 1, -d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), A, sa1, sa2, offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) );
						}
						e[ offsetE + (k * strideE) ] = 0.0;
					}
				} else {
					// 2x2 pivot block.
					if ( k < N - 2 ) {
						d21 = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
						d11 = A[ offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) ] / d21;
						d22 = A[ offsetA + (k * sa1) + (k * sa2) ] / d21;
						t = 1.0 / ( ( d11 * d22 ) - 1.0 );

						for ( j = k + 2; j < N; j++ ) {
							wk = t * ( ( d11 * A[ offsetA + (j * sa1) + (k * sa2) ] ) - A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] );
							wkp1 = t * ( ( d22 * A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] ) - A[ offsetA + (j * sa1) + (k * sa2) ] );
							for ( i = j; i < N; i++ ) {
								A[ offsetA + (i * sa1) + (j * sa2) ] = A[ offsetA + (i * sa1) + (j * sa2) ] - ( ( A[ offsetA + (i * sa1) + (k * sa2) ] / d21 ) * wk ) - ( ( A[ offsetA + (i * sa1) + (( k + 1 ) * sa2) ] / d21 ) * wkp1 );
							}
							A[ offsetA + (j * sa1) + (k * sa2) ] = wk / d21;
							A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] = wkp1 / d21;
						}
					}

					// Copy the subdiagonal element of D into E and zero out the corresponding entry of A.
					e[ offsetE + (k * strideE) ] = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
					e[ offsetE + (( k + 1 ) * strideE) ] = 0.0;
					A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ] = 0.0;
				}
			}

			// Store details of the interchanges in IPIV.
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

export default dsytf2rk;
