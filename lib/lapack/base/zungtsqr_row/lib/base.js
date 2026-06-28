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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaset from './../../../../lapack/base/zlaset/lib/base.js';
import zlarfb_gett from './../../../../lapack/base/zlarfb_gett/lib/base.js';


// VARIABLES //

var ZERO = new Complex128( 0.0, 0.0 );
var ONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from the output of `zlatsqr`.
*
* ## Notes
*
* -   On entry, the elements below the diagonal of `A` represent the unit lower-trapezoidal blocked matrix `V` computed by `zlatsqr`; on exit, `A` contains the `M`-by-`N` matrix with orthonormal columns `Q`.
* -   `T` contains the upper-triangular block reflector factors stored in compact form as produced by `zlatsqr`.
* -   `WORK` is treated as a 2D buffer of shape `nblocal`-by-max(`nblocal`, `N - nblocal`), where `nblocal = min(nb, N)`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A` (`M >= 0`)
* @param {NonNegativeInteger} N - number of columns of `A` (`M >= N >= 0`)
* @param {PositiveInteger} mb - row block size used by `zlatsqr` (`mb > N`)
* @param {PositiveInteger} nb - column block size used by `zlatsqr` (`nb >= 1`)
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - block reflector factors produced by `zlatsqr`
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function zungtsqr_row( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var num_all_row_blocks;
	var m_plus_one;
	var ib_bottom;
	var sworkRow;
	var sworkCol;
	var nblocal;
	var kb_last;
	var jb_t;
	var itmp;
	var imb;
	var knb;
	var mb1;
	var mb2;
	var ib;
	var kb;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	nblocal = ( nb < N ) ? nb : N;

	// Set the upper-triangular part of A to zero and its diagonal elements to one.
	zlaset( 'upper', M, N, ZERO, ONE, A, strideA1, strideA2, offsetA );

	// `kb_last` is the (1-based) column index of the last column block reflector in T and V.
	kb_last = ( ( ( ( N - 1 ) / nblocal ) | 0 ) * nblocal ) + 1;

	// WORK is treated as a 2D `nblocal`-by-(...) buffer with leading dimension `nblocal` (column-major within the 1D buffer using `strideWork` as the element step).
	sworkRow = strideWork;
	sworkCol = nblocal * strideWork;

	// (1) Bottom-up loop over row blocks of A, except the top row block. If MB >= M, the loop is skipped.
	if ( mb < M ) {
		// `mb2` is the row blocking size for the row blocks before the first top row block in A.
		mb2 = mb - N;
		m_plus_one = M + 1;

		// `itmp + 1` counts the row blocks beyond the first top block; `itmp + 2` is the total number of row blocks.
		itmp = ( ( M - mb - 1 ) / mb2 ) | 0;
		ib_bottom = ( itmp * mb2 ) + mb + 1;
		num_all_row_blocks = itmp + 2;

		// Initialize `jb_t` to one past the column index of the trailing column block in T (we decrement by N at the top of each iteration).
		jb_t = ( num_all_row_blocks * N ) + 1;

		// Process row blocks from bottom to top, skipping the top row block.
		for ( ib = ib_bottom; ib >= mb + 1; ib -= mb2 ) {
			// Determine the block size IMB for the current row block.
			imb = ( ( m_plus_one - ib ) < mb2 ) ? ( m_plus_one - ib ) : mb2;

			// Move to the column block in T corresponding to this row block.
			jb_t -= N;

			// Apply column blocks of H in this row block from right to left.
			for ( kb = kb_last; kb >= 1; kb -= nblocal ) {
				// Size of the current column block in T and V.
				knb = ( nblocal < ( N - kb + 1 ) ) ? nblocal : ( N - kb + 1 );

				// zlarfb_gett('I', IMB, N-KB+1, KNB, T(1, JB_T+KB-1), LDT, A(KB, KB), LDA, A(IB, KB), LDA, WORK, KNB).
				zlarfb_gett( 'identity', imb, ( N - kb + 1 ), knb, T, strideT1, strideT2, offsetT + ( ( jb_t + kb - 2 ) * strideT2 ), A, strideA1, strideA2, offsetA + ( ( kb - 1 ) * strideA1 ) + ( ( kb - 1 ) * strideA2 ), A, strideA1, strideA2, offsetA + ( ( ib - 1 ) * strideA1 ) + ( ( kb - 1 ) * strideA2 ), WORK, sworkRow, sworkCol, offsetWork);
			}
		}
	}

	// (2) Top row block of A. If MB >= M, this is the only row block and spans the entire matrix.
	mb1 = ( mb < M ) ? mb : M;

	// Apply column blocks of H in the top row block from right to left.
	for ( kb = kb_last; kb >= 1; kb -= nblocal ) {
		// Size of the current column block in T and V.
		knb = ( nblocal < ( N - kb + 1 ) ) ? nblocal : ( N - kb + 1 );

		if ( ( mb1 - kb - knb + 1 ) === 0 ) {
			// Empty B in zlarfb_gett: pass M = 0 with a dummy offset (B reads/writes are guarded by `M > 0`/`M >= 0` inside zlarfb_gett).
			zlarfb_gett( 'not-identity', 0, ( N - kb + 1 ), knb, T, strideT1, strideT2, offsetT + ( ( kb - 1 ) * strideT2 ), A, strideA1, strideA2, offsetA + ( ( kb - 1 ) * strideA1 ) + ( ( kb - 1 ) * strideA2 ), A, strideA1, strideA2, offsetA, WORK, sworkRow, sworkCol, offsetWork);
		} else {
			zlarfb_gett( 'not-identity', ( mb1 - kb - knb + 1 ), ( N - kb + 1 ), knb, T, strideT1, strideT2, offsetT + ( ( kb - 1 ) * strideT2 ), A, strideA1, strideA2, offsetA + ( ( kb - 1 ) * strideA1 ) + ( ( kb - 1 ) * strideA2 ), A, strideA1, strideA2, offsetA + ( ( kb + knb - 1 ) * strideA1 ) + ( ( kb - 1 ) * strideA2 ), WORK, sworkRow, sworkCol, offsetWork);
		}
	}
	return 0;
}


// EXPORTS //

export default zungtsqr_row;
