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

/* eslint-disable max-len, max-params, max-statements, camelcase, no-mixed-operators */

// MODULES //

import dlaset from './../../dlaset/lib/base.js';
import dlarfb_gett from './../../dlarfb_gett/lib/base.js';


// MAIN //

/**
* Generates an `M`-by-`N` real matrix `Q` with orthonormal columns from the row-blocked compact-WY output of `dlatsqr`.
*
* ## Notes
*
* -   The input `A` and `T` come from `dlatsqr`. The lower trapezoidal part of `A` (below the diagonal) holds the Householder vectors `V` of the row-blocked TSQR, and `T` is the column-major sequence of upper triangular `nb`-by-`nb` block reflectors `T_k` for the `NICB * NIRB` panels (where `NIRB = max(1, ceil((M-N)/(MB-N)))` and `NICB = ceil(N/NB)`).
* -   On exit, `A` is overwritten by the `M`-by-`N` matrix `Q` whose columns are orthonormal (`A = first_N_columns_of(Q(1)*Q(2)*...*Q(k))`).
* -   The algorithm uses an auxiliary block-reflector applier (`dlarfb_gett`). Column blocks of `H` are applied right-to-left, sweeping row blocks bottom-up (hence `_row` in the routine name) — the reverse of the order in which `dlatsqr` produced its output.
* -   `MB` and `NB` are the row and column block sizes that `dlatsqr` used. We require `MB > N` (Fortran constraint, not a `MB >= N` fall-through). `WORK` must have length at least `nblocal * max(nblocal, N - nblocal)`, where `nblocal = min(NB, N)`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A` (`0 <= N <= M`)
* @param {PositiveInteger} mb - row block size used by `dlatsqr` (`mb > N`)
* @param {PositiveInteger} nb - column block size used by `dlatsqr` (`nb >= 1`)
* @param {Float64Array} A - input/output matrix; on entry the strict lower trapezoidal part holds `V` from `dlatsqr`, on exit the columns of `A` are orthonormal
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - block reflectors from `dlatsqr` (read-only)
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace of length at least `nblocal * max(nblocal, N - nblocal)`
* @param {integer} strideWork - stride length for `WORK` (must be `1`; `WORK` is treated as a 2D `nblocal`-by-* matrix with leading dimension `nblocal`)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dorgtsqr_row( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var nblocal;
	var kbLast;
	var ibBot;
	var jbT;
	var imb;
	var mb1;
	var mb2;
	var knb;
	var ib;
	var kb;

	// Quick return if possible. (`mb > N` is the only legal Fortran configuration; we do not implement a `mb <= N` fall-through here because the input was produced by `dlatsqr` under the same constraint.)
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	nblocal = ( nb < N ) ? nb : N;

	// (0) Set the upper triangular part of `A` to zero with unit diagonal — this seeds the orthonormal-Q construction and clears the unused above-diagonal storage.
	dlaset( 'upper', M, N, 0.0, 1.0, A, strideA1, strideA2, offsetA );

	// `kbLast` is the 1-based column index (in `T` and the V columns of `A`) of the last column-block reflector to be applied (i.e. the trailing partial block, if any).
	kbLast = ( ( ( ( N - 1 ) / nblocal ) | 0 ) * nblocal ) + 1;

	// (1) Bottom-up loop over row blocks of `A`, except the top row block. If `mb >= M` there is only one row block and this loop is skipped.
	if ( mb < M ) {
		// `mb2` is the row stride between consecutive row blocks; `ibBot` is the 1-based row index of the bottom row block; `jbT` is the column index in `T` for the corresponding block reflector sequence.
		mb2 = mb - N;
		ibBot = ( ( ( ( M - mb - 1 ) / mb2 ) | 0 ) * mb2 ) + mb + 1;

		// `numAllRowBlocks = itmp + 2` and `jbT = numAllRowBlocks * N + 1`. Folded into one expression: `(((M - mb - 1) / mb2)|0 + 2) * N + 1`.
		jbT = ( ( ( ( ( M - mb - 1 ) / mb2 ) | 0 ) + 2 ) * N ) + 1;

		// Bottom-up sweep over row blocks below the top row block (Fortran: DO IB = IB_BOTTOM, MB+1, -MB2)
		for ( ib = ibBot; ib >= mb + 1; ib -= mb2 ) {
			// Block height of the current row block (the bottom block may be partial).
			imb = ( M + 1 - ib < mb2 ) ? ( M + 1 - ib ) : mb2;

			// Advance the T-column index for the current row block's reflector sequence.
			jbT -= N;

			// Right-to-left sweep over column blocks (Fortran: DO KB = KB_LAST, 1, -NBLOCAL)
			for ( kb = kbLast; kb >= 1; kb -= nblocal ) {
				// Width of the current column block (the trailing block may be partial).
				knb = ( nblocal < N - kb + 1 ) ? nblocal : N - kb + 1;

				// Apply the block reflector `H_k` from the left to the trapezoidal-pentagonal block whose triangular part is `A(kb:kb+knb-1, kb:N)` and whose rectangular part is `A(ib:ib+imb-1, kb:N)`.

				// `'identity'`: V1 (the top of the column block) is the identity here because we are reconstructing Q, so dlarfb_gett does not read the V1 storage.

				// 1-based -> 0-based: T(1, jbT+kb-1) -> offsetT + 0*strideT1 + (jbT+kb-2)*strideT2; A(kb, kb) -> offsetA + (kb-1)*strideA1 + (kb-1)*strideA2; A(ib, kb) -> offsetA + (ib-1)*strideA1 + (kb-1)*strideA2.
				dlarfb_gett( 'identity', imb, N - kb + 1, knb, T, strideT1, strideT2, offsetT + ( jbT + kb - 2 ) * strideT2, A, strideA1, strideA2, offsetA + ( kb - 1 ) * strideA1 + ( kb - 1 ) * strideA2, A, strideA1, strideA2, offsetA + ( ib - 1 ) * strideA1 + ( kb - 1 ) * strideA2, WORK, 1, knb, offsetWork);
			}
		}
	}

	// (2) Top row block of `A`. If `mb >= M` we have only one row block of size `M` and we work on the entire matrix.
	mb1 = ( mb < M ) ? mb : M;

	// Right-to-left sweep over column blocks in the top row block.
	for ( kb = kbLast; kb >= 1; kb -= nblocal ) {
		knb = ( nblocal < N - kb + 1 ) ? nblocal : N - kb + 1;

		if ( mb1 - kb - knb + 1 === 0 ) {
			// The current column block exactly fills the remaining height of the top row block, so the rectangular block `B` is empty. Pass a dummy buffer with `M = 0`.
			dlarfb_gett( 'not-identity', 0, N - kb + 1, knb, T, strideT1, strideT2, offsetT + ( kb - 1 ) * strideT2, A, strideA1, strideA2, offsetA + ( kb - 1 ) * strideA1 + ( kb - 1 ) * strideA2, A, strideA1, strideA2, offsetA, WORK, 1, knb, offsetWork);
		} else {
			dlarfb_gett( 'not-identity', mb1 - kb - knb + 1, N - kb + 1, knb, T, strideT1, strideT2, offsetT + ( kb - 1 ) * strideT2, A, strideA1, strideA2, offsetA + ( kb - 1 ) * strideA1 + ( kb - 1 ) * strideA2, A, strideA1, strideA2, offsetA + ( kb + knb - 1 ) * strideA1 + ( kb - 1 ) * strideA2, WORK, 1, knb, offsetWork);
		}
	}
	return 0;
}


// EXPORTS //

export default dorgtsqr_row;
