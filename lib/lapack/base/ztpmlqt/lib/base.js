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

import ztprfb from '../../ztprfb/lib/base.js';


// MAIN //

/**
* Applies a complex unitary matrix `Q` (or its conjugate transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztplqt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* The four supported (side, trans) combinations are:
*
* ```text
*                                  SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':                Q*C              C*Q
* TRANS = 'conjugate-transpose':       Q^H*C            C*Q^H
* ```
*
* Layout of the stacked matrix:
*
* ```text
* SIDE = 'left':  C = [ A ]  with A K-by-N, B M-by-N, V K-by-M
*                     [ B ]
* SIDE = 'right': C = [ A B ] with A M-by-K, B M-by-N, V K-by-N
* ```
*
* The pentagonal V is stored row-wise: each row contains an elementary reflector. V is composed of a `K`-by-`(M-L)` (left) or `K`-by-`(N-L)` (right) rectangular block `V1` followed by a `K`-by-`L` lower-trapezoidal block `V2` (the first `L` rows of a `K`-by-`K` upper-triangular matrix). When `L = 0`, V reduces to a rectangular block; when `L = K`, V reduces to a triangular block. The block-application kernel is `ztprfb`, called with `direct='forward'`, `storev='rowwise'`. WORK is provided by the caller as a 1D buffer with `strideWork` between consecutive complex elements; internally it is treated as an `mb`-by-`N` (left) or `M`-by-`mb` (right) workspace matrix.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of B (and of C when `side='left'`; rows of A and B when `side='right'`)
* @param {NonNegativeInteger} N - number of columns of B (and of A when `side='left'`)
* @param {NonNegativeInteger} K - number of elementary reflectors (`K >= L`)
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {PositiveInteger} mb - block size used to construct T (must equal the value used in `ztplqt`; `1 <= mb <= K` when `K > 0`)
* @param {Complex128Array} V - pentagonal reflector matrix produced by `ztplqt`
* @param {integer} strideV1 - stride of the first dimension of V (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - block triangular factor produced by `ztplqt`, stored as an `mb`-by-`K` matrix
* @param {integer} strideT1 - stride of the first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} A - upper (left) or left (right) block of C, modified in-place
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - lower (left) or right (right) block of C, modified in-place
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} WORK - workspace buffer (logically `mb`-by-`N` for `side='left'` or `M`-by-`mb` for `side='right'`)
* @param {integer} strideWork - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @returns {integer} status code (0 = success)
*/
function ztpmlqt( side, trans, M, N, K, l, mb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	var ldwork;
	var left;
	var tran;
	var sw1;
	var sw2;
	var ow;
	var kf;
	var ib;
	var nb;
	var lb;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	tran = ( trans === 'conjugate-transpose' );

	// Workspace size matches the Fortran convention: N*MB complex elements for SIDE='L' (logical layout MB-by-N, leading dim = IB at most MB) and M*MB for SIDE='R' (logical layout M-by-MB). ztprfb takes separate first/second-dim strides for WORK, so view the user's 1D buffer as a contiguous matrix laid out along its leading dimension.
	if ( left ) {
		ldwork = mb;
	} else {
		ldwork = ( M > 1 ) ? M : 1;
	}
	sw1 = strideWork;
	sw2 = ldwork * strideWork;
	ow = offsetWork;

	if ( left && !tran ) {
		// SIDE='L', TRANS='N': apply Q*C, forward block iteration.
		// Fortran: CALL ZTPRFB('L','C','F','R', NB, N, IB, LB, V(I,1), LDV, T(1,I), LDT, A(I,1), LDA, B, LDB, WORK, IB)
		for ( i = 0; i < K; i += mb ) {
			ib = ( mb < K - i ) ? mb : K - i;

			// Effective row count for this block: NB = MIN( M-L+I+IB-1, M ); 0-based: nb = MIN( M-l+i+ib, M ).
			nb = M - l + i + ib;
			if ( nb > M ) {
				nb = M;
			}

			// Fortran sets LB = 0 in both branches for the (L,N) and (L,C) cases — V's left half stays purely rectangular when applied from the left.
			lb = 0;

			ztprfb( 'left', 'conjugate-transpose', 'forward', 'rowwise', nb, N, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV1 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// SIDE='R', TRANS='C': apply C*Q^H, forward block iteration.
		// Fortran: CALL ZTPRFB('R','N','F','R', M, NB, IB, LB, V(I,1), LDV, T(1,I), LDT, A(1,I), LDA, B, LDB, WORK, M)
		for ( i = 0; i < K; i += mb ) {
			ib = ( mb < K - i ) ? mb : K - i;

			nb = N - l + i + ib;
			if ( nb > N ) {
				nb = N;
			}

			// LB is the trapezoidal-column count contributing within this block. 0-based: LB = NB - N + l - i (only when i < l).
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = nb - N + l - i;
			}

			ztprfb( 'right', 'no-transpose', 'forward', 'rowwise', M, nb, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV1 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA2 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( left && tran ) {
		// SIDE='L', TRANS='C': apply Q^H*C, backward block iteration.
		// Fortran: KF = ((K-1)/MB)*MB + 1 -> 0-based kf = floor((K-1)/mb)*mb.
		kf = ( ( ( K - 1 ) / mb ) | 0 ) * mb;
		for ( i = kf; i >= 0; i -= mb ) {
			ib = ( mb < K - i ) ? mb : K - i;

			nb = M - l + i + ib;
			if ( nb > M ) {
				nb = M;
			}

			lb = 0;

			ztprfb( 'left', 'no-transpose', 'forward', 'rowwise', nb, N, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV1 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( !left && !tran ) {
		// SIDE='R', TRANS='N': apply C*Q, backward block iteration.
		kf = ( ( ( K - 1 ) / mb ) | 0 ) * mb;
		for ( i = kf; i >= 0; i -= mb ) {
			ib = ( mb < K - i ) ? mb : K - i;

			nb = N - l + i + ib;
			if ( nb > N ) {
				nb = N;
			}
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = nb - N + l - i;
			}

			ztprfb( 'right', 'conjugate-transpose', 'forward', 'rowwise', M, nb, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV1 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA2 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default ztpmlqt;
