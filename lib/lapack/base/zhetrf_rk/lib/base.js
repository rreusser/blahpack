/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import zswap from './../../../../blas/base/zswap/lib/base.js';
import zhetf2rk from './../../zhetf2_rk/lib/base.js';
import zlahefrk from './../../zlahef_rk/lib/base.js';


// VARIABLES //

const NB = 32; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes the factorization of a complex Hermitian matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm).
*
* ```text
* A = P*U*D*(U^H)*(P^T)  or  A = P*L*D*(L^H)*(P^T)
* ```
*
* where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation matrix, and `D` is Hermitian and block diagonal with `1x1` and `2x2` blocks.
*
* This is the `_rk` driver: the diagonal of `D` (real-valued for Hermitian) is stored on the diagonal of `A` while the off-diagonal entries of `D` are returned separately in `e`. The array `e` is zero on entries corresponding to `1x1` pivot blocks.
*
* `IPIV` stores 0-based pivot indices. If `IPIV[k] >= 0`, a `1x1` pivot was used and rows/columns `k` and `IPIV[k]` were interchanged. If `IPIV[k] < 0`, a `2x2` pivot block was used; the swap-target row is `~IPIV[k]` (bitwise NOT). For a `2x2` block both entries of `IPIV` encode the same 0-based target.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output Hermitian matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - complex-element offset for `A`
* @param {Complex128Array} e - output vector containing the super- (upper) or sub-diagonal (lower) entries of `D`
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - complex-element offset for `e`
* @param {Int32Array} IPIV - output pivot index array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Complex128Array} WORK - caller-owned workspace; base.js never allocates. Minimum length from `offsetWork` is `N*NB` (with `NB = 32`) when `N > NB` (blocked path); unused otherwise.
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - index offset for `WORK`
* @returns {integer} info - `0` if successful; `k>0` if `D(k,k)` is exactly zero (1-based)
*/
function zhetrfrk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	let ldwork, result, iinfo, ipidx, info, nb, ip, kb, k, i;

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Determine block size (hardcoded NB=32; if the matrix is too small, fall back to unblocked).
	nb = NB;
	if ( nb > 1 && nb < N ) {
		ldwork = N;
	} else {
		nb = N; // Use the unblocked code path for everything
		ldwork = ( N > 0 ) ? N : 1;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U*D*U^H using the upper triangle of A.
		// K is the main loop index (1-based for clarity, matching Fortran), decreasing from N to 1 in steps of KB.
		k = N;
		while ( k >= 1 ) {
			if ( k > nb ) {
				// Use blocked code to factor columns k-kb+1:k of A
				result = zlahefrk( 'upper', k, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, ldwork * strideWork, offsetWork );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use the unblocked kernel for the remaining leading submatrix
				iinfo = zhetf2rk( 'upper', k, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV );
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
		// Factorize A as L*D*L^H using the lower triangle of A.
		// K is the main loop index (1-based for clarity, matching Fortran), starting at 1 and increasing by KB.
		k = 1;
		while ( k <= N ) {
			if ( k <= N - nb ) {
				// Use blocked code on submatrix starting at (k,k)
				result = zlahefrk( 'lower', N - k + 1, nb, A, strideA1, strideA2, offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ), e, strideE, offsetE + ( ( k - 1 ) * strideE ), IPIV, strideIPIV, offsetIPIV + ( ( k - 1 ) * strideIPIV ), WORK, strideWork, ldwork * strideWork, offsetWork );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use the unblocked kernel for the trailing submatrix
				iinfo = zhetf2rk( 'lower', N - k + 1, A, strideA1, strideA2, offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ), e, strideE, offsetE + ( ( k - 1 ) * strideE ), IPIV, strideIPIV, offsetIPIV + ( ( k - 1 ) * strideIPIV ) );
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

export default zhetrfrk;
