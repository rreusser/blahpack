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
* Factorizes a real symmetric indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* ## Notes
*
* -   Computes `A = U*D*U^T` or `A = L*D*L^T`, where U (or L) is a product of permutation and unit upper (lower) triangular matrices, and D is symmetric and block diagonal with 1-by-1 and 2-by-2 diagonal blocks.
* -   IPIV stores 0-based pivot indices in the rook format. If `IPIV[k]` is non-negative, a 1x1 pivot was used and rows/columns k and `IPIV[k]` were interchanged. If `IPIV[k]` is negative, BOTH entries of the 2x2 block are negative and each encodes its own swap target via bitwise NOT: `~IPIV[k]` gives the 0-based index of the row/column swapped with k.
*
* @private
* @param {string} uplo - specifies whether to reference the upper or lower triangular part of `A`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - output pivot index array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} `info` - 0 if successful, k (1-based) if `D(k,k)` is exactly zero.
*/
function dsytf2Rook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var dtemp;
	var itemp;
	var info;
	var done;
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
		// Factorize A as U * D * U^T using the upper triangle; k decreases from N-1 to 0.
		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;
			p = k;

			absakk = Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] );

			// IMAX is the row-index of the largest off-diagonal element in column k.
			if ( k > 0 ) {
				imax = idamax( k, A, sa1, offsetA + (k * sa2) );
				colmax = Math.abs( A[ offsetA + (imax * sa1) + (k * sa2) ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero: set INFO and use 1x1 pivot.
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange; use 1x1 pivot block.
					kp = k;
				} else {
					done = false;

					// Rook pivot search loop.
					while ( !done ) {
						// JMAX is the column-index of the largest off-diagonal element in row IMAX.
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
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

						if ( Math.abs( A[ offsetA + (imax * sa1) + (imax * sa2) ] ) >= ALPHA * rowmax ) {
							// Interchange rows and columns K and IMAX; use 1x1 pivot block.
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							// Interchange rows and columns K-1 and IMAX; use 2x2 pivot block.
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							// Pivot not found; update and repeat.
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				// First swap: interchange rows and columns K and P if kstep=2 and P != K.
				if ( kstep === 2 && p !== k ) {
					if ( p > 0 ) {
						dswap( p, A, sa1, offsetA + (k * sa2), A, sa1, offsetA + (p * sa2) );
					}
					if ( p < k - 1 ) {
						dswap( k - p - 1, A, sa1, offsetA + (( p + 1 ) * sa1) + (k * sa2), A, sa2, offsetA + (p * sa1) + (( p + 1 ) * sa2) );
					}
					t = A[ offsetA + (k * sa1) + (k * sa2) ];
					A[ offsetA + (k * sa1) + (k * sa2) ] = A[ offsetA + (p * sa1) + (p * sa2) ];
					A[ offsetA + (p * sa1) + (p * sa2) ] = t;
				}

				// Second swap: interchange rows and columns KK and KP.
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
				}

				// Update the leading submatrix.
				if ( kstep === 1 ) {
					// 1x1 pivot block: rank-1 update of A(0:k-1,0:k-1).
					if ( k > 0 ) {
						if ( Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] ) >= SFMIN ) {
							d11 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
							dsyr( uplo, k, -d11, A, sa1, offsetA + (k * sa2), A, sa1, sa2, offsetA );

							// Store U(k) in column k.
							dscal( k, d11, A, sa1, offsetA + (k * sa2) );
						} else {
							// Near-underflow path: divide column by d11, then rank-1 update with -d11.
							d11 = A[ offsetA + (k * sa1) + (k * sa2) ];
							for ( i = 0; i < k; i++ ) {
								A[ offsetA + (i * sa1) + (k * sa2) ] /= d11;
							}
							dsyr( uplo, k, -d11, A, sa1, offsetA + (k * sa2), A, sa1, sa2, offsetA );
						}
					}
				} else if ( k > 1 ) {
					// 2x2 pivot block: rank-2 update of A(0:k-2,0:k-2).
					d12 = A[ offsetA + (( k - 1 ) * sa1) + (k * sa2) ];
					d22 = A[ offsetA + (( k - 1 ) * sa1) + (( k - 1 ) * sa2) ] / d12;
					d11 = A[ offsetA + (k * sa1) + (k * sa2) ] / d12;
					t = 1.0 / ( (d11 * d22) - 1.0 );

					for ( j = k - 2; j >= 0; j-- ) {
						wkm1 = t * ( (d11 * A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ]) - A[ offsetA + (j * sa1) + (k * sa2) ] );
						wk = t * ( (d22 * A[ offsetA + (j * sa1) + (k * sa2) ]) - A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] );
						for ( i = j; i >= 0; i-- ) {
							A[ offsetA + (i * sa1) + (j * sa2) ] = A[ offsetA + (i * sa1) + (j * sa2) ] - ( (A[ offsetA + (i * sa1) + (k * sa2) ] / d12) * wk ) - ( (A[ offsetA + (i * sa1) + (( k - 1 ) * sa2) ] / d12) * wkm1 );
						}
						A[ offsetA + (j * sa1) + (k * sa2) ] = wk / d12;
						A[ offsetA + (j * sa1) + (( k - 1 ) * sa2) ] = wkm1 / d12;
					}
				}
			}

			// Store details of the interchanges in IPIV.
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle; k increases from 0 to N-1.
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
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
			} else {
				// Equivalent to: absakk >= ALPHA * colmax (NaN-safe).
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
						} else {
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

				// First swap.
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
				}

				// Second swap.
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
				}

				// Update the trailing submatrix.
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						if ( Math.abs( A[ offsetA + (k * sa1) + (k * sa2) ] ) >= SFMIN ) {
							d11 = 1.0 / A[ offsetA + (k * sa1) + (k * sa2) ];
							dsyr( uplo, N - k - 1, -d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), A, sa1, sa2, offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) );
							dscal( N - k - 1, d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2) );
						} else {
							d11 = A[ offsetA + (k * sa1) + (k * sa2) ];
							for ( i = k + 1; i < N; i++ ) {
								A[ offsetA + (i * sa1) + (k * sa2) ] /= d11;
							}
							dsyr( uplo, N - k - 1, -d11, A, sa1, offsetA + (( k + 1 ) * sa1) + (k * sa2), A, sa1, sa2, offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) );
						}
					}
				} else if ( k < N - 2 ) {
					d21 = A[ offsetA + (( k + 1 ) * sa1) + (k * sa2) ];
					d11 = A[ offsetA + (( k + 1 ) * sa1) + (( k + 1 ) * sa2) ] / d21;
					d22 = A[ offsetA + (k * sa1) + (k * sa2) ] / d21;
					t = 1.0 / ( (d11 * d22) - 1.0 );

					for ( j = k + 2; j < N; j++ ) {
						wk = t * ( (d11 * A[ offsetA + (j * sa1) + (k * sa2) ]) - A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] );
						wkp1 = t * ( (d22 * A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ]) - A[ offsetA + (j * sa1) + (k * sa2) ] );
						for ( i = j; i < N; i++ ) {
							A[ offsetA + (i * sa1) + (j * sa2) ] = A[ offsetA + (i * sa1) + (j * sa2) ] - ( (A[ offsetA + (i * sa1) + (k * sa2) ] / d21) * wk ) - ( (A[ offsetA + (i * sa1) + (( k + 1 ) * sa2) ] / d21) * wkp1 );
						}
						A[ offsetA + (j * sa1) + (k * sa2) ] = wk / d21;
						A[ offsetA + (j * sa1) + (( k + 1 ) * sa2) ] = wkp1 / d21;
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

export default dsytf2Rook;
