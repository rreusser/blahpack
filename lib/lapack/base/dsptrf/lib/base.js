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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import idamax from '../../../../blas/base/idamax/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dspr from '../../../../blas/base/dspr/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;


// FUNCTIONS //

/**
* Returns the 0-based position in packed upper storage for 1-based element (i,j) where i<=j.
*
* Fortran: `AP(i + j*(j-1)/2)`, 1-based
* JS: `i-1 + j*(j-1)/2`, 0-based
*
* @private
* @param {integer} i - 1-based row index
* @param {integer} j - 1-based column index
* @returns {integer} 0-based packed index
*/
function iupp( i, j ) {
	return ( i - 1 ) + ( ( j * ( j - 1 ) / 2 )|0 );
}

/**
* Returns the 0-based position in packed lower storage for 1-based element (i,j) where i>=j.
*
* Fortran: `AP(i + (2*N-j)*(j-1)/2)`, 1-based
* JS: `i-1 + (2*N-j)*(j-1)/2`, 0-based
*
* @private
* @param {integer} i - 1-based row index
* @param {integer} j - 1-based column index
* @param {integer} N - matrix order
* @returns {integer} 0-based packed index
*/
function ilow( i, j, N ) {
	return ( i - 1 ) + ( ( ( (2 * N) - j ) * ( j - 1 ) / 2 )|0 );
}


// MAIN //

/**
* Computes the Bunch-Kaufman factorization of a real symmetric matrix stored.
* in packed format:
*
* `A = U * D * U^T` or `A = L * D * L^T`
*
* where U (or L) is a product of permutation and unit upper (lower)
* triangular matrices, and D is symmetric and block diagonal with
* 1-by-1 and 2-by-2 diagonal blocks.
*
* IPIV stores 0-based pivot indices. If `IPIV[k]` >= 0, then a 1x1 pivot
* was used and rows/columns k and `IPIV[k]` were interchanged.
* If `IPIV[k]` < 0 (for a 2x2 pivot), then `IPIV[k]` = `IPIV[k+/-1]` = ~p
* where p is the 0-based row/column that was interchanged.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Int32Array} IPIV - pivot index output array, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is exactly zero (1-based)
*/
function dsptrf( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var kstep;
	var info;
	var imax;
	var jmax;
	var wkm1;
	var wkp1;
	var knc;
	var kpc;
	var npp;
	var d11;
	var d12;
	var d21;
	var d22;
	var wk;
	var r1;
	var kk;
	var kp;
	var kc;
	var kx;
	var t;
	var k;
	var i;
	var j;

	// All internal variables k, imax, kp, kc, kpc, etc. use Fortran 1-based conventions.

	// kc, knc, kpc are 1-based positions in the packed array.

	// AP is accessed as AP[ offsetAP + (pos-1)*strideAP ] where pos is 1-based.

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^T using the upper triangle of A
		// k decreasing from N to 1 (1-based)
		// kc = start of column k in packed storage (1-based)
		k = N;
		kc = ( ( ( N - 1 ) * N / 2 )|0 ) + 1;

		while ( k >= 1 ) {
			knc = kc;
			kstep = 1;

			// Diagonal element A(k,k): at packed position kc + k - 1 (1-based)
			absakk = Math.abs( AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] );

			// Find largest off-diagonal in column k (rows 1..k-1)
			if ( k > 1 ) {
				// Idamax returns 0-based index; Fortran IMAX is 1-based: add 1
				imax = idamax( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) ) + 1;
				colmax = Math.abs( AP[ offsetAP + ( ( kc + imax - 2 ) * strideAP ) ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				// Column is zero or underflow: set INFO and use 1x1 pivot
				if ( info === 0 ) {
					info = k;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					// No interchange, use 1x1 pivot block
					kp = k;
				} else {
					// Find ROWMAX: largest off-diagonal in row IMAX
					rowmax = 0.0;
					jmax = imax;

					// Scan row imax from column imax+1 to k (upper triangle)
					kx = ( ( imax * ( imax + 1 ) / 2 )|0 ) + imax;
					for ( j = imax + 1; j <= k; j++ ) {
						if ( Math.abs( AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] ) > rowmax ) {
							rowmax = Math.abs( AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] );
							jmax = j;
						}
						kx += j;
					}
					// Start of column imax (1-based)
					kpc = ( ( ( imax - 1 ) * imax / 2 )|0 ) + 1;
					if ( imax > 1 ) {
						// Scan column imax from row 1 to imax-1
						jmax = idamax( imax - 1, AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) ) + 1;
						rowmax = Math.max( rowmax, Math.abs( AP[ offsetAP + ( ( kpc + jmax - 2 ) * strideAP ) ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						// No interchange, use 1x1 pivot block
						kp = k;
					} else if ( Math.abs( AP[ offsetAP + ( ( kpc + imax - 2 ) * strideAP ) ] ) >= ALPHA * rowmax ) {
						// Interchange rows and columns k and imax, use 1x1 pivot
						kp = imax;
					} else {
						// Interchange rows and columns k-1 and imax, use 2x2 pivot
						kp = imax;
						kstep = 2;
					}
				}

				kk = k - kstep + 1;
				if ( kstep === 2 ) {
					knc = knc - k + 1;
				}
				if ( kp !== kk ) {
					// Interchange rows and columns kp and kk
					// Swap kp-1 elements starting at column kk and column kp
					dswap( kp - 1, AP, strideAP, offsetAP + ( ( knc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) );

					// Swap elements in rows kp+1..kk-1 between column kk (rows) and row kp (cols)
					kx = kpc + kp;
					for ( j = kp + 1; j <= kk - 1; j++ ) {
						kx = kx + j - 1;
						t = AP[ offsetAP + ( ( knc + j - 2 ) * strideAP ) ];
						AP[ offsetAP + ( ( knc + j - 2 ) * strideAP ) ] = AP[ offsetAP + ( ( kx - 2 ) * strideAP ) ];
						AP[ offsetAP + ( ( kx - 2 ) * strideAP ) ] = t;
					}
					// Swap diagonal elements kk and kp
					t = AP[ offsetAP + ( ( knc + kk - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( knc + kk - 2 ) * strideAP ) ] = AP[ offsetAP + ( ( kpc + kp - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( kpc + kp - 2 ) * strideAP ) ] = t;

					if ( kstep === 2 ) {
						// Swap off-diagonal element in 2x2 block
						t = AP[ offsetAP + ( ( kc + k - 3 ) * strideAP ) ];
						AP[ offsetAP + ( ( kc + k - 3 ) * strideAP ) ] = AP[ offsetAP + ( ( kc + kp - 2 ) * strideAP ) ];
						AP[ offsetAP + ( ( kc + kp - 2 ) * strideAP ) ] = t;
					}
				}

				// Update the leading submatrix
				if ( kstep === 1 ) {
					// 1x1 pivot block
					r1 = 1.0 / AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ];
					dspr( uplo, k - 1, -r1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP );

					// Store U(k) in column k
					dscal( k - 1, r1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
				} else if ( k > 2 ) {
					// 2x2 pivot block
					d12 = AP[ offsetAP + ( iupp( k - 1, k ) * strideAP ) ];
					d22 = AP[ offsetAP + ( iupp( k - 1, k - 1 ) * strideAP ) ] / d12;
					d11 = AP[ offsetAP + ( iupp( k, k ) * strideAP ) ] / d12;
					t = 1.0 / ( ( d11 * d22 ) - 1.0 );
					d12 = t / d12;

					for ( j = k - 2; j >= 1; j-- ) {
						wkm1 = d12 * ( ( d11 * AP[ offsetAP + ( iupp( j, k - 1 ) * strideAP ) ] ) - AP[ offsetAP + ( iupp( j, k ) * strideAP ) ] );
						wk = d12 * ( ( d22 * AP[ offsetAP + ( iupp( j, k ) * strideAP ) ] ) - AP[ offsetAP + ( iupp( j, k - 1 ) * strideAP ) ] );
						for ( i = j; i >= 1; i-- ) {
							AP[ offsetAP + ( iupp( i, j ) * strideAP ) ] -= ( AP[ offsetAP + ( iupp( i, k ) * strideAP ) ] * wk ) + ( AP[ offsetAP + ( iupp( i, k - 1 ) * strideAP ) ] * wkm1 );
						}
						AP[ offsetAP + ( iupp( j, k ) * strideAP ) ] = wk;
						AP[ offsetAP + ( iupp( j, k - 1 ) * strideAP ) ] = wkm1;
					}
				}
			}

			// Store IPIV (convert 1-based kp to 0-based)
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = kp - 1;
			} else {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = ~( kp - 1 );
				IPIV[ offsetIPIV + ( ( k - 2 ) * strideIPIV ) ] = ~( kp - 1 );
			}

			k -= kstep;
			kc = knc - k;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle of A
		// k increasing from 1 to N (1-based)
		k = 1;
		kc = 1;
		npp = ( ( N * ( N + 1 ) / 2 )|0 );

		while ( k <= N ) {
			knc = kc;
			kstep = 1;

			// Diagonal element A(k,k): at packed position kc (1-based)
			absakk = Math.abs( AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] );

			// Find largest off-diagonal in column k (rows k+1..N)
			if ( k < N ) {
				imax = k + idamax( N - k, AP, strideAP, offsetAP + ( kc * strideAP ) ) + 1;
				colmax = Math.abs( AP[ offsetAP + ( ( kc + imax - k - 1 ) * strideAP ) ] );
			} else {
				colmax = 0.0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k;
				}
				kp = k;
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					// Find ROWMAX in row IMAX
					rowmax = 0.0;
					kx = kc + imax - k;
					for ( j = k; j <= imax - 1; j++ ) {
						if ( Math.abs( AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] ) > rowmax ) {
							rowmax = Math.abs( AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] );
							jmax = j;
						}
						kx = kx + N - j;
					}
					// Start of column imax in lower packed (1-based)
					kpc = npp - ( ( ( N - imax + 1 ) * ( N - imax + 2 ) / 2 )|0 ) + 1;
					if ( imax < N ) {
						jmax = imax + idamax( N - imax, AP, strideAP, offsetAP + ( kpc * strideAP ) ) + 1;
						rowmax = Math.max( rowmax, Math.abs( AP[ offsetAP + ( ( kpc + jmax - imax - 1 ) * strideAP ) ] ) );
					}

					if ( absakk >= ALPHA * colmax * ( colmax / rowmax ) ) {
						kp = k;
					} else if ( Math.abs( AP[ offsetAP + ( ( kpc - 1 ) * strideAP ) ] ) >= ALPHA * rowmax ) {
						kp = imax;
					} else {
						kp = imax;
						kstep = 2;
					}
				}

				kk = k + kstep - 1;
				if ( kstep === 2 ) {
					knc = knc + N - k + 1;
				}
				if ( kp !== kk ) {
					// Swap trailing elements after row kp
					if ( kp < N ) {
						dswap( N - kp, AP, strideAP, offsetAP + ( ( knc + kp - kk ) * strideAP ), AP, strideAP, offsetAP + ( kpc * strideAP ) );
					}
					// Swap elements between rows kk+1..kp-1
					kx = knc + kp - kk;
					for ( j = kk + 1; j <= kp - 1; j++ ) {
						kx = kx + N - j + 1;
						t = AP[ offsetAP + ( ( knc + j - kk - 1 ) * strideAP ) ];
						AP[ offsetAP + ( ( knc + j - kk - 1 ) * strideAP ) ] = AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ];
						AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] = t;
					}
					// Swap diagonals
					t = AP[ offsetAP + ( ( knc - 1 ) * strideAP ) ];
					AP[ offsetAP + ( ( knc - 1 ) * strideAP ) ] = AP[ offsetAP + ( ( kpc - 1 ) * strideAP ) ];
					AP[ offsetAP + ( ( kpc - 1 ) * strideAP ) ] = t;
					if ( kstep === 2 ) {
						t = AP[ offsetAP + ( kc * strideAP ) ];
						AP[ offsetAP + ( kc * strideAP ) ] = AP[ offsetAP + ( ( kc + kp - k - 1 ) * strideAP ) ];
						AP[ offsetAP + ( ( kc + kp - k - 1 ) * strideAP ) ] = t;
					}
				}

				// Update the trailing submatrix
				if ( kstep === 1 ) {
					if ( k < N ) {
						r1 = 1.0 / AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ];
						dspr( uplo, N - k, -r1, AP, strideAP, offsetAP + ( kc * strideAP ), AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ) );

						// Store L(k) in column k
						dscal( N - k, r1, AP, strideAP, offsetAP + ( kc * strideAP ) );
					}
				} else if ( k < N - 1 ) {
					// 2x2 pivot block
					d21 = AP[ offsetAP + ( ilow( k + 1, k, N ) * strideAP ) ];
					d11 = AP[ offsetAP + ( ilow( k + 1, k + 1, N ) * strideAP ) ] / d21;
					d22 = AP[ offsetAP + ( ilow( k, k, N ) * strideAP ) ] / d21;
					t = 1.0 / ( ( d11 * d22 ) - 1.0 );
					d21 = t / d21;

					for ( j = k + 2; j <= N; j++ ) {
						wk = d21 * ( ( d11 * AP[ offsetAP + ( ilow( j, k, N ) * strideAP ) ] ) - AP[ offsetAP + ( ilow( j, k + 1, N ) * strideAP ) ] );
						wkp1 = d21 * ( ( d22 * AP[ offsetAP + ( ilow( j, k + 1, N ) * strideAP ) ] ) - AP[ offsetAP + ( ilow( j, k, N ) * strideAP ) ] );
						for ( i = j; i <= N; i++ ) {
							AP[ offsetAP + ( ilow( i, j, N ) * strideAP ) ] -= ( AP[ offsetAP + ( ilow( i, k, N ) * strideAP ) ] * wk ) + ( AP[ offsetAP + ( ilow( i, k + 1, N ) * strideAP ) ] * wkp1 );
						}
						AP[ offsetAP + ( ilow( j, k, N ) * strideAP ) ] = wk;
						AP[ offsetAP + ( ilow( j, k + 1, N ) * strideAP ) ] = wkp1;
					}
				}
			}

			// Store IPIV (convert 1-based kp to 0-based)
			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = kp - 1;
			} else {
				IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] = ~( kp - 1 );
				IPIV[ offsetIPIV + ( k * strideIPIV ) ] = ~( kp - 1 );
			}

			k += kstep;
			kc = knc + N - k + 2;
		}
	}

	return info;
}


// EXPORTS //

export default dsptrf;
