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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsytf2Rook from '../../zsytf2_rook/lib/base.js';
import zlasyfRook from '../../zlasyf_rook/lib/base.js';


// VARIABLES //

var NB = 32; // Block size (hardcoded; Fortran uses ILAENV)


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix `A` using the bounded Bunch-Kaufman ("rook") diagonal pivoting method (blocked algorithm).
*
* `A = U*D*U^T  or  A = L*D*L^T`
*
* where `U` (or `L`) is a product of permutation and unit upper (lower) triangular matrices, and `D` is symmetric (NOT Hermitian) and block diagonal with 1-by-1 and 2-by-2 diagonal blocks.
*
* ## Notes
*
* -   `A` is treated as a **complex symmetric** matrix (`A = A^T`). No conjugation is applied to mirrored entries; diagonal entries may be fully complex.
* -   Pivot indices follow the stdlib bitwise-NOT convention: 1x1 pivots use non-negative 0-based indices; for a 2x2 pivot block, BOTH entries are negative and each encodes its own swap target via bitwise NOT (i.e., `~IPIV[k]` gives the 0-based index of the row/column swapped with `k`).
* -   Because rook pivoting performs an extra row/column search at each step, the two entries of a 2x2 block can encode different swap targets (unlike standard Bunch-Kaufman, where both entries of a block reference the same off-diagonal index).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output complex symmetric matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length `N`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} `info` - 0 if successful, k>0 (1-based) if `D(k,k)` is exactly zero
*/
function zsytrfRook( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var ldwork;
	var result;
	var iinfo;
	var info;
	var sa1;
	var sa2;
	var nb;
	var kb;
	var W;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Determine block size:
	nb = NB;
	if ( nb > 1 && nb < N ) {
		ldwork = N;
	} else {
		nb = N; // Use unblocked code for everything
		ldwork = N;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U*D*U^T using the upper triangle. K is the number of remaining rows/columns; processes from right to left.
		k = N;
		while ( k >= 1 ) {
			if ( k > nb ) {
				// Use blocked code for this panel:
				W = new Complex128Array( ldwork * nb );
				result = zlasyfRook( 'upper', k, nb, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV, W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use unblocked code for the remaining columns:
				iinfo = zsytf2Rook( 'upper', k, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV );
				kb = k;
			}

			// Set info if a zero pivot was encountered:
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo;
			}

			k -= kb;
		}
	} else {
		// Factorize A as L*D*L^T using the lower triangle. K is the leading column index; processes from left to right.
		k = 0;
		while ( k < N ) {
			if ( k <= N - nb - 1 ) {
				// Use blocked code:
				W = new Complex128Array( ldwork * nb );
				result = zlasyfRook( 'lower', N - k, nb, A, sa1, sa2, offsetA + (k * sa1) + (k * sa2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV), W, 1, ldwork, 0 );
				kb = result.kb;
				iinfo = result.info;
			} else {
				// Use unblocked code:
				iinfo = zsytf2Rook( 'lower', N - k, A, sa1, sa2, offsetA + (k * sa1) + (k * sa2), IPIV, strideIPIV, offsetIPIV + (k * strideIPIV) );
				kb = N - k;
			}

			// Set info:
			if ( info === 0 && iinfo > 0 ) {
				info = iinfo + k;
			}

			// Adjust IPIV for the lower case: indices stored by the panel kernel are 0-based relative to the submatrix and need an offset of `k` to become absolute. For 2x2 pivots (negative encodings), we re-wrap so that `~IPIV[j]` shifts by `k` while preserving the negative-encoding convention.
			for ( j = k; j < k + kb; j++ ) {
				if ( IPIV[ offsetIPIV + (j * strideIPIV) ] >= 0 ) {
					IPIV[ offsetIPIV + (j * strideIPIV) ] += k;
				} else {
					IPIV[ offsetIPIV + (j * strideIPIV) ] = ~( ( ~IPIV[ offsetIPIV + (j * strideIPIV) ] ) + k );
				}
			}

			k += kb;
		}
	}

	return info;
}


// EXPORTS //

export default zsytrfRook;
