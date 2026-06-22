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

import dgelqt from './../../dgelqt/lib/base.js';
import dtplqt from './../../dtplqt/lib/base.js';


// MAIN //

/**
* Computes a blocked Tall-Skinny LQ (TSLQ) factorization of a real `M`-by-`N` matrix `A` (with `M <= N`).
*
* ## Notes
*
* -   The factorization computes `A = (L 0) * Q`, where `Q` is `N`-by-`N` orthogonal and `L` is `M`-by-`M` lower triangular.
* -   On exit, the elements on and below the diagonal of `A` contain the lower triangular factor `L`; the elements above the diagonal represent `Q` as a sequence of Householder reflectors stored block-by-row.
* -   The first `M`-by-`nb` column block is factored via `dgelqt`; subsequent column blocks are combined with the running `L` via `dtplqt`.
* -   `T` is treated as `mb`-by-`(M * Number_of_row_blocks)`, where `Number_of_row_blocks = ceil((N-M) / (nb-M))`. When `nb <= M` or `nb >= N` (or `M >= N`), the routine simply calls `dgelqt` and `T` is `mb`-by-`M`.
* -   `WORK` must have length at least `mb * M`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M <= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb - inner block size for the panel kernels (`mb >= 1` and `mb <= M` when `M > 0`)
* @param {NonNegativeInteger} nb - column block size (`nb >= 0`)
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output matrix of upper triangular block reflector factors
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array of length at least `mb*M`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dlaswlq( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK ) {
	var ctr;
	var kk;
	var ii;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// If the column block size does not produce a non-trivial TSLQ partition (M >= N, nb <= M, or nb >= N), defer to a single dgelqt.
	if ( M >= N || nb <= M || nb >= N ) {
		return dgelqt( M, N, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, offsetWORK );
	}

	// Compute partition: KK = MOD(N-M, NB-M) is the column count of the trailing block (0 if it divides evenly), and II is the 1-based starting column of the trailing block.
	kk = ( N - M ) % ( nb - M );

	// In Fortran, II = N - KK + 1 (1-based). Converting to 0-based: ii = N - kk.
	ii = N - kk;

	// Factor the first M-by-nb column block A(0:M-1, 0:nb-1) into L, V, and T(:, 0:M-1).
	dgelqt( M, nb, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, offsetWORK );

	// Iterate over interior column blocks. Fortran: DO I = NB+1, II-NB+M, NB-M (1-based, inclusive end).

	// In 0-based: i goes nb, nb+(nb-M), ..., up to (but not including) ii (when KK > 0) or up to ii-(nb-M) inclusive (when KK == 0).

	// The Fortran loop end is II-NB+M; in 0-based this is ii - (nb - M). Since the step is (nb - M), the last iteration starts at i such that i <= ii - (nb - M).
	ctr = 1;
	for ( i = nb; i <= ii - ( nb - M ); i += nb - M ) {
		// Combine the running L (in A(0:M-1, 0:M-1)) with the next nb-M columns A(0:M-1, i:i+nb-M-1) via the triangular-pentagonal LQ.
		// Dtplqt with l=0: B is purely rectangular M x (nb-M) columns to the right of A's triangular block.
		dtplqt( M, nb - M, 0, mb, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * M * strideT2 ), WORK, strideWORK, offsetWORK );
		ctr += 1;
	}

	// Factor the trailing block A(0:M-1, ii:N-1) of KK columns, if any.
	if ( ii < N ) {
		dtplqt( M, kk, 0, mb, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( ii * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * M * strideT2 ), WORK, strideWORK, offsetWORK );
	}
	return 0;
}


// EXPORTS //

export default dlaswlq;
