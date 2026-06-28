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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetf2rook from './../../zhetf2_rook/lib/base.js';
import zlahefrook from './../../zlahef_rook/lib/base.js';


// VARIABLES //

var NB = 32; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes the factorization of a complex Hermitian matrix `A` using the bounded Bunch-Kaufman ("rook") diagonal pivoting method (blocked algorithm).
*
* ```text
* A = U*D*(U^H)  or  A = L*D*(L^H)
* ```
*
* where `U` (or `L`) is a product of permutation and unit upper (lower) triangular matrices, and `D` is Hermitian and block diagonal with `1x1` and `2x2` diagonal blocks.
*
* ## Notes
*
* -   This is the HERMITIAN factorization (not symmetric). Diagonal entries of `D` are real and the conjugate transpose `A^H` is used.
* -   Pivot indices follow the stdlib bitwise-NOT convention: `1x1` pivots use non-negative 0-based indices; for a `2x2` pivot block, BOTH entries are negative and each encodes its own swap target via bitwise NOT (i.e., `~IPIV[k]` gives the 0-based index of the row/column swapped with `k`).
* -   Because rook pivoting performs an extra row/column search at each step, the two entries of a `2x2` block can encode different swap targets (unlike standard Bunch-Kaufman, where both entries of a block reference the same off-diagonal index).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output Hermitian matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - complex-element offset for `A`
* @param {Int32Array} IPIV - pivot index output array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} `info` - `0` if successful; `k>0` (1-based) if `D(k,k)` is exactly zero
*/
function zhetrfRook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var ldwork;
	var result;
	var iinfo;
	var ipidx;
	var info;
	var nb;
	var kb;
	var W;
	var k;
	var j;

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
		// Factorize A as U*D*U^H using the upper triangle of A.
		// K is the main loop index (1-based for clarity, matching Fortran), decreasing from N to 1 in steps of KB.
		k = N;
		while ( k >= 1 ) {
			if ( k > nb ) {
				// Use blocked code to factor columns k-kb+1:k of A:
				result = zlahefrook( 'upper', k, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use the unblocked kernel for the remaining leading submatrix:
				iinfo = zhetf2rook( 'upper', k, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV );
				kb = k;
			}

			// Set INFO on first failure encountered.
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo;
			}

			// Note: zhetrf_rook (unlike zhetrf_rk) does NOT apply post-factorization permutations to the trailing submatrix — zlahef_rook performs all required swaps internally during the panel factorization.

			k -= kb;
		}
	} else {
		// Factorize A as L*D*L^H using the lower triangle of A.
		// K is the main loop index (1-based for clarity, matching Fortran), starting at 1 and increasing by KB.
		k = 1;
		while ( k <= N ) {
			if ( k <= N - nb ) {
				// Use blocked code on submatrix starting at (k,k):
				result = zlahefrook( 'lower', N - k + 1, nb, A, strideA1, strideA2, offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ), IPIV, strideIPIV, offsetIPIV + ( ( k - 1 ) * strideIPIV ), W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use the unblocked kernel for the trailing submatrix:
				iinfo = zhetf2rook( 'lower', N - k + 1, A, strideA1, strideA2, offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ), IPIV, strideIPIV, offsetIPIV + ( ( k - 1 ) * strideIPIV ) );
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
			for ( j = k; j <= k + kb - 1; j += 1 ) {
				ipidx = offsetIPIV + ( ( j - 1 ) * strideIPIV );
				if ( IPIV[ ipidx ] >= 0 ) {
					IPIV[ ipidx ] += k - 1;
				} else {
					IPIV[ ipidx ] = ~( ( ~IPIV[ ipidx ] ) + ( k - 1 ) );
				}
			}

			k += kb;
		}
	}

	return info;
}


// EXPORTS //

export default zhetrfRook;
