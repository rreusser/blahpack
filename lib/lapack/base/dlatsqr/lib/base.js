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

import dgeqrt from './../../dgeqrt/lib/base.js';
import dtpqrt from './../../dtpqrt/lib/base.js';


// MAIN //

/**
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a real `M`-by-`N` matrix `A` (with `M >= N`).
*
* ## Notes
*
* -   The factorization computes `A = Q * (R; 0)`, where `Q` is `M`-by-`M` orthogonal and `R` is `N`-by-`N` upper triangular.
* -   On exit, the elements on and above the diagonal of `A` contain the upper triangular factor `R`; the elements below the diagonal represent `Q` as a sequence of Householder reflectors stored block-by-row.
* -   The first `mb`-by-`N` row block is factored via `dgeqrt`; subsequent row blocks are combined with the running `R` via `dtpqrt`.
* -   `T` is treated as `nb`-by-`(N * Number_of_row_blocks)`, where `Number_of_row_blocks = ceil((M-N) / (mb-N))`. When `mb <= N` or `mb >= M`, the routine simply calls `dgeqrt` and `T` is `nb`-by-`N`.
* -   `WORK` must have length at least `nb * N`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb - row block size (`mb >= 1`)
* @param {PositiveInteger} nb - column block size (`1 <= nb <= N` when `N > 0`)
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output matrix of upper triangular block reflector factors
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array of length at least `nb*N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dlatsqr( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var ctr;
	var kk;
	var ii;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// If the row block size does not produce a non-trivial TSQR partition (mb <= N or mb >= M), defer to a single dgeqrt.
	if ( mb <= N || mb >= M ) {
		return dgeqrt( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );
	}

	// Compute partition: KK = MOD(M-N, MB-N) is the row count of the trailing block (0 if it divides evenly), and II is the 1-based starting row of the trailing block.
	kk = ( M - N ) % ( mb - N );

	// In Fortran, II = M - KK + 1 (1-based). Converting to 0-based: ii = M - kk.
	ii = M - kk;

	// Factor the first mb-by-N row block A(0:mb-1, 0:N-1) into R, V, and T(:, 0:N-1).
	dgeqrt( mb, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );

	// Iterate over interior row blocks. Fortran: DO I = MB+1, II-MB+N, MB-N (1-based, inclusive end).

	// In 0-based: i goes MB, MB+(MB-N), ..., up to (but not including) ii (when KK > 0) or up to ii-(MB-N) inclusive (when KK == 0).

	// The Fortran loop end is II-MB+N; in 0-based this is ii - (MB - N). Since the step is (MB - N), the last iteration starts at i such that i <= ii - (MB - N).
	ctr = 1;
	for ( i = mb; i <= ii - ( mb - N ); i += mb - N ) {
		// Combine the running R (in A(0:N-1, 0:N-1)) with the next mb-N rows A(i:i+mb-N-1, 0:N-1) via the triangular-pentagonal QR.
		// Dtpqrt with l=0: B is purely rectangular (mb-N) x N rows beneath A's triangular block.
		dtpqrt( mb - N, N, 0, nb, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * N * strideT2 ), WORK, strideWork, offsetWork );
		ctr += 1;
	}

	// Factor the trailing block A(ii:M-1, 0:N-1) of KK rows, if any.
	if ( ii < M ) {
		dtpqrt( kk, N, 0, nb, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * N * strideT2 ), WORK, strideWork, offsetWork );
	}
	return 0;
}


// EXPORTS //

export default dlatsqr;
