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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';
import zsytf2rk from './../../zsytf2_rk/lib/base.js';
import zlasyfrk from './../../zlasyf_rk/lib/base.js';


// VARIABLES //

var NB = 32; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm):.
*
* ```text
* A = P*U*D*(U^T)*(P^T)  or  A = P*L*D*(L^T)*(P^T)
* ```
*
* where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation matrix, and `D` is complex symmetric and block diagonal with 1x1 and 2x2 blocks.
*
* This is the `_rk` driver: the diagonal of `D` is stored on the diagonal of `A` while the off-diagonal entries of `D` are returned separately in `e`. The array `e` is zero on entries corresponding to 1x1 pivot blocks.
*
* `IPIV` stores 0-based pivot indices. If `IPIV[k] >= 0`, a 1x1 pivot was used and rows/columns `k` and `IPIV[k]` were interchanged. If `IPIV[k] < 0`, a 2x2 pivot block was used; the swap target row is `~IPIV[k]` (bitwise NOT). For a 2x2 block both entries of `IPIV` encode the same 0-based target.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output complex symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
* @param {Complex128Array} e - output vector containing the superdiagonal (upper) or subdiagonal (lower) entries of `D`
* @param {integer} strideE - stride for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - index offset for `e` (in complex elements)
* @param {Int32Array} IPIV - output pivot index array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} info - `0` if successful; `k>0` if `D(k,k)` is exactly zero (1-based)
*/
function zsytrfrk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var ldwork;
	var result;
	var iinfo;
	var ipidx;
	var info;
	var nb;
	var ip;
	var kb;
	var W;
	var k;
	var i;

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Determine block size (hardcoded NB=32; if the matrix is too small, fall back to unblocked).
	nb = NB;
	if ( nb > 1 && nb < N ) {
		ldwork = N;
		W = new Complex128Array( ldwork * nb );
	} else {
		nb = N; // Use the unblocked code path for everything
		ldwork = ( N > 0 ) ? N : 1;
		W = new Complex128Array( 1 );
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U*D*U^T using the upper triangle of A.
		// K is the main loop index (1-based for clarity, matching Fortran), decreasing from N to 1 in steps of KB.
		k = N;
		while ( k >= 1 ) {
			if ( k > nb ) {
				// Use blocked code to factor columns k-kb+1:k of A
				result = zlasyfrk( 'upper', k, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use the unblocked kernel for the remaining leading submatrix
				iinfo = zsytf2rk( 'upper', k, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV );
				kb = k;
			}

			// Set INFO on first failure encountered.
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo;
			}

			// Apply permutations to the trailing submatrix A(:,k+1:N) for the just-factored panel of width KB.
			// Iterate i = k down to k-kb+1 (1-based) → i_idx = k-1 down to k-kb (0-based).
			if ( k < N ) {
				for ( i = k; i >= ( k - kb + 1 ); i -= 1 ) {
					ipidx = i - 1; // 0-based row index in IPIV / A
					ip = IPIV[ offsetIPIV + ( ipidx * strideIPIV ) ];
					if ( ip < 0 ) {
						// 2x2 pivot: swap target row encoded as bitwise NOT
						ip = ~ip;
					}
					if ( ip !== ipidx ) {
						// Swap row i with row ip in columns k+1..N (0-based: k..N-1, length N-k)
						zswap( N - k, A, strideA2, offsetA + ( ipidx * strideA1 ) + ( k * strideA2 ), A, strideA2, offsetA + ( ip * strideA1 ) + ( k * strideA2 ) );
					}
				}
			}

			k -= kb;
		}
	} else {
		// Factorize A as L*D*L^T using the lower triangle of A.
		// K is the main loop index (1-based for clarity, matching Fortran), starting at 1 and increasing by KB.
		k = 1;
		while ( k <= N ) {
			if ( k <= N - nb ) {
				// Use blocked code on submatrix starting at (k,k)
				result = zlasyfrk( 'lower', N - k + 1, nb, A, strideA1, strideA2, offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ), e, strideE, offsetE + ( ( k - 1 ) * strideE ), IPIV, strideIPIV, offsetIPIV + ( ( k - 1 ) * strideIPIV ), W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use the unblocked kernel for the trailing submatrix
				iinfo = zsytf2rk( 'lower', N - k + 1, A, strideA1, strideA2, offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ), e, strideE, offsetE + ( ( k - 1 ) * strideE ), IPIV, strideIPIV, offsetIPIV + ( ( k - 1 ) * strideIPIV ) );
				kb = N - k + 1;
			}

			// Set INFO on first failure encountered (offset by k-1 since panel is local).
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo + k - 1;
			}

			// Adjust pivot indices in the just-factored panel to refer to the global matrix.
			// Panel-local IPIV is 0-based relative to the submatrix. We need to add (k-1) to each.
			// Positive entries (1x1 pivots) become panel_local + (k-1).
			// Negative entries (2x2 pivots) follow the bitwise-NOT convention: ~p_local → ~(p_local + k - 1).
			for ( i = k; i <= k + kb - 1; i += 1 ) {
				ipidx = offsetIPIV + ( ( i - 1 ) * strideIPIV );
				if ( IPIV[ ipidx ] >= 0 ) {
					IPIV[ ipidx ] += k - 1;
				} else {
					IPIV[ ipidx ] = ~( ( ~IPIV[ ipidx ] ) + ( k - 1 ) );
				}
			}

			// Apply permutations to the leading submatrix A(:,1:k-1) for the just-factored panel.
			if ( k > 1 ) {
				for ( i = k; i <= k + kb - 1; i += 1 ) {
					ipidx = i - 1; // 0-based row index for the i-th IPIV slot
					ip = IPIV[ offsetIPIV + ( ipidx * strideIPIV ) ];
					if ( ip < 0 ) {
						ip = ~ip;
					}
					if ( ip !== ipidx ) {
						// Swap row i with row ip in columns 1..k-1 (0-based: 0..k-2, length k-1)
						zswap( k - 1, A, strideA2, offsetA + ( ipidx * strideA1 ), A, strideA2, offsetA + ( ip * strideA1 ) );
					}
				}
			}

			k += kb;
		}
	}

	return info;
}


// EXPORTS //

export default zsytrfrk;
