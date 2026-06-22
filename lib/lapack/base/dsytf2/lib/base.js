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

import idamax from '../../../../blas/base/idamax/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dsyr from '../../../../blas/base/dsyr/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;


// MAIN //

/**
* Computes the factorization of a real symmetric matrix A using the.
* Bunch-Kaufman diagonal pivoting method:
*
* `A = U*D*U^T  or  A = L*D*L^T`
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is symmetric and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* IPIV stores 0-based pivot indices. If `IPIV[k]` >= 0, then a 1x1 pivot
* was used and rows/columns k and `IPIV[k]` were interchanged.
* If `IPIV[k]` < 0 (for a 2x2 pivot), then `IPIV[k]` = `IPIV[k±1]` = -(p+1)
* where p is the 0-based row/column that was interchanged.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero
*/
function dsytf2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
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
	var wk;
	var r1;
	var kk;
	var kp;
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
		// Factorize A as U * D * U^T using the upper triangle of A
		// K is the main loop index, decreasing from N-1 to 0 (0-based)
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;

			// Determine rows and columns to be interchanged and whether

			// A 1-by-1 or 2-by-2 pivot block will be used
			absakk = Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] );

			// IMAX is the row-index of the largest off-diagonal element in

			// Column K, and COLMAX is its absolute value
			if ( k > 0 ) {
				imax = idamax( k, A, sa1, offsetA + (k * sa2) );
				colmax = Math.abs( A[ offsetA + (imax * sa1) + (k * sa2) ] );
			} else {
				colmax = 0.0;
			}

			if ( ( Math.max( absakk, colmax ) === 0.0 ) || absakk !== absakk ) {
				// Column is zero or contains a NaN: set INFO and use 1x1 pivot
				if ( info === 0 ) {
					info = k + 1; // 1-based info
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					// JMAX is the column-index of the largest off-diagonal
					// Element in row IMAX, and ROWMAX is its absolute value
					// Look in row IMAX from column IMAX+1 to K-1
					jmax = imax + 1 + idamax( k - imax, A, sa2, offsetA + (imax * sa1) + (( imax + 1 ) * sa2) );
					rowmax = Math.abs( A[ offsetA + (imax * sa1) + (jmax * sa2) ] );
					if ( imax > 0 ) {
						jmax = idamax( imax, A, sa1, offsetA + (imax * sa2) );
						rowmax = Math.max( rowmax, Math.abs( A[ offsetA + (jmax * sa1) + (imax * sa2) ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						// No interchange, use 1x1 pivot block
						kp = k;
					} else if ( Math.abs( A[ offsetA + (imax * sa1) + (imax * sa2) ] ) >= ALPHA * rowmax ) {
						// Interchange rows and columns K and IMAX, use 1x1 pivot
						kp = imax;
					} else {
						// Interchange rows and columns K-1 and IMAX, use 2x2 pivot
						kp = imax;
						kstep = 2;
					}
				}

				kk = k - kstep + 1;
				if ( kp !== kk ) {
					// Interchange rows and columns KP and KK in the leading
					// Submatrix A(0:k, 0:k)
					if ( kp > 0 ) {
						dswap( kp, A, sa1, offsetA + (kk * sa2), A, sa1, offsetA + (kp * sa2) );
					}
					dswap( kk - kp - 1, A, sa1, offsetA + (( kp + 1 ) * sa1) + (kk * sa2), A, sa2, offsetA + (kp * sa1) + (( kp + 1 ) * sa2) );
					t = A[ offsetA + (kk * sa1) + (kk * sa2) ];
					A[ offsetA + (kk * sa1) + (kk * sa2) ] = A[ offsetA + (kp * sa1) + (kp * sa2) ];
					A[ offsetA + (kp * sa1) + (kp * sa2) ] = t;
					if ( kstep === 2 ) {
						t = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
						A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ] = A[ offsetA + (kp * sa1) + (k * sa2) ];
						A[ offsetA + (kp * sa1) + (k * sa2) ] = t;
					}
				}

				// Update the leading submatrix
				if ( kstep === 1 ) {
					// 1x1 pivot block D(k): column k now holds
					// W(k) = U(k)*D(k), where U(k) is the k-th column of U
					// Perform a rank-1 update of A(0:k-1, 0:k-1):
					// A := A - U(k)*D(k)*U(k)^T = A - W(k)*(1/D(k))*W(k)^T
					r1 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
					dsyr( uplo, k, -r1, A, sa1, offsetA + (k * sa2), A, sa1, sa2, offsetA );

					// Store U(k) in column k
					dscal( k, r1, A, sa1, offsetA + (k * sa2) );
				} else if ( k > 1 ) {
					// 2x2 pivot block D(k): columns k and k-1 now hold
					// ( W(k-1) W(k) ) = ( U(k-1) U(k) )*D(k)
					d12 = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
					d22 = A[ offsetA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) ] / d12;
					d11 = A[ offsetA + (k * sa1) + (k * sa2) ] / d12;
					t = 1.0 / ( (d11 * d22) - 1.0 );
					d12 = t / d12;

					for ( j = k - 2; j >= 0; j-- ) {
						wkm1 = d12 * ( (d11 * A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ]) - A[ offsetA + (j * sa1) + (k * sa2) ] );
						wk = d12 * ( (d22 * A[ offsetA + (j * sa1) + (k * sa2) ]) - A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] );
						for ( i = j; i >= 0; i-- ) {
							A[ offsetA + (i * sa1) + (j * sa2) ] = A[ offsetA + (i * sa1) + (j * sa2) ] - (A[ offsetA + (i * sa1) + (k * sa2) ] * wk) - (A[ offsetA + (i * sa1) + (( k - 1 ) * sa2) ] * wkm1);
						}
						A[ offsetA + (j * sa1) + (k * sa2) ] = wk;
						A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] = wkm1;
					}
				}
			}

			// Store details of the interchanges in IPIV
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~kp; // -(kp+1), encodes 0-based
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle of A
		// K is the main loop index, increasing from 0 to N-1 (0-based)
		k = 0;
		while ( k < N ) {
			kstep = 1;

			// Determine rows and columns to be interchanged
			absakk = Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] );

			if ( k < N - 1 ) {
				imax = k + 1 + idamax( N - k - 1, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2) );
				colmax = Math.abs( A[ offsetA + (imax * sa1) + (k * sa2) ] );
			} else {
				colmax = 0.0;
			}

			if ( ( Math.max( absakk, colmax ) === 0.0 ) || absakk !== absakk ) {
				if ( info === 0 ) {
					info = k + 1; // 1-based info
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Look in row IMAX from column K to IMAX-1
					jmax = k + idamax( imax - k, A, sa2, offsetA + (imax * sa1) + (k * sa2) );
					rowmax = Math.abs( A[ offsetA + (imax * sa1) + (jmax * sa2) ] );
					if ( imax < N - 1 ) {
						jmax = imax + 1 + idamax( N - imax - 1, A, sa1, offsetA + (( imax + 1 ) * sa1) + (imax * sa2) );
						rowmax = Math.max( rowmax, Math.abs( A[ offsetA + (jmax * sa1) + (imax * sa2) ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else if ( Math.abs( A[ offsetA + (imax * sa1) + (imax * sa2) ] ) >= ALPHA * rowmax ) {
						kp = imax;
					} else {
						kp = imax;
						kstep = 2;
					}
				}

				kk = k + kstep - 1;
				if ( kp !== kk ) {
					// Interchange rows and columns KP and KK
					if ( kp < N - 1 ) {
						dswap( N - kp - 1, A, sa1, offsetA + (( kp + 1 ) * sa1) + (kk * sa2), A, sa1, offsetA + (( kp + 1 ) * sa1) + (kp * sa2) );
					}
					dswap( kp - kk - 1, A, sa1, offsetA + (( kk + 1 ) * sa1) + (kk * sa2), A, sa2, offsetA + (kp * sa1) + (( kk + 1 ) * sa2) );
					t = A[ offsetA + (kk * sa1) + (kk * sa2) ];
					A[ offsetA + (kk * sa1) + (kk * sa2) ] = A[ offsetA + (kp * sa1) + (kp * sa2) ];
					A[ offsetA + (kp * sa1) + (kp * sa2) ] = t;
					if ( kstep === 2 ) {
						t = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
						A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ] = A[ offsetA + (kp * sa1) + (k * sa2) ];
						A[ offsetA + (kp * sa1) + (k * sa2) ] = t;
					}
				}

				// Update the trailing submatrix
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						d11 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
						dsyr( uplo, N - k - 1, -d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), A, sa1, sa2, offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) );
						dscal( N - k - 1, d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2) );
					}
				} else if ( k < N - 2 ) {
					// 2x2 pivot block
					d21 = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
					d11 = A[ offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) ] / d21;
					d22 = A[ offsetA + (k * sa1) + (k * sa2) ] / d21;
					t = 1.0 / ( (d11 * d22) - 1.0 );
					d21 = t / d21;

					for ( j = k + 2; j < N; j++ ) {
						wk = d21 * ( (d11 * A[ offsetA + (j * sa1) + (k * sa2) ]) - A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] );
						wkp1 = d21 * ( (d22 * A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ]) - A[ offsetA + (j * sa1) + (k * sa2) ] );
						for ( i = j; i < N; i++ ) {
							A[ offsetA + (i * sa1) + (j * sa2) ] = A[ offsetA + (i * sa1) + (j * sa2) ] - (A[ offsetA + (i * sa1) + (k * sa2) ] * wk) - (A[ offsetA + (i * sa1) + (( k + 1 ) * sa2) ] * wkp1);
						}
						A[ offsetA + (j * sa1) + (k * sa2) ] = wk;
						A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] = wkp1;
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


// EXPORTS //

export default dsytf2;
