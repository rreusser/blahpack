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
* Applies a complex unitary matrix `Q` (or its conjugate-transpose `Q^H`) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* The four supported (side, trans) combinations are:
*
* ```text
*                            SIDE = 'left'   SIDE = 'right'
* TRANS = 'no-transpose':            Q*C            C*Q
* TRANS = 'conjugate-transpose':   Q^H*C          C*Q^H
* ```
*
* Layout of the stacked matrix:
*
* ```text
* SIDE = 'left':  C = [ A ]  with A K-by-N, B M-by-N, V M-by-K
*                     [ B ]
* SIDE = 'right': C = [ A B ] with A M-by-K, B M-by-N, V N-by-K
* ```
*
* The pentagonal V is composed of a `(M-L)`-by-`K` (left) or `(N-L)`-by-`K` (right) rectangular block stacked on top of an `L`-by-`K` upper trapezoidal block (the first `L` rows of a `K`-by-`K` upper triangular matrix). When `L = 0`, V reduces to a rectangular block; when `L = K`, V reduces to a triangular block. The block-application kernel is `ztprfb`, called with `direct='forward'`, `storev='columnwise'`. WORK is provided by the caller as a 1D buffer (in complex elements) with `strideWork` between consecutive elements; internally it is treated as an `nb`-by-`N` (left) or `M`-by-`nb` (right) workspace matrix.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of B (and rows of C when `side='left'`, rows of A and B when `side='right'`)
* @param {NonNegativeInteger} N - number of columns of B (and of A when `side='left'`)
* @param {NonNegativeInteger} K - number of elementary reflectors (`K >= L`)
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {PositiveInteger} nb - block size used to construct T (must equal the value used in `ztpqrt`; `1 <= nb <= K` when `K > 0`)
* @param {Complex128Array} V - pentagonal reflector matrix produced by `ztpqrt`
* @param {integer} strideV1 - stride of the first dimension of V (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - block triangular factor produced by `ztpqrt`, stored as an `nb`-by-`K` matrix
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
* @param {Complex128Array} WORK - workspace buffer (logically `nb`-by-`N` for `side='left'` or `M`-by-`nb` for `side='right'`, in complex elements; caller-allocated, must hold at least `nb*N` (left) or `M*nb` (right) complex elements)
* @param {integer} strideWork - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @returns {integer} status code (0 = success)
*/
function ztpmqrt( side, trans, M, N, K, l, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	var ldwork;
	var left;
	var tran;
	var sw1;
	var sw2;
	var ow;
	var kf;
	var ib;
	var mb;
	var lb;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	tran = ( trans === 'conjugate-transpose' );

	// Workspace size matches the Fortran convention: N*NB complex elements for SIDE='L' (logical layout NB-by-N) and M*NB for SIDE='R' (logical layout M-by-NB). We treat WORK as ldwork-by-ncwork laid out with the user's stride; ztprfb needs separate first/second-dim strides. The buffer is contiguous along the leading dimension (stride1 = strideWork) and jumps `ldwork * strideWork` between columns.
	if ( left ) {
		ldwork = nb;
	} else {
		ldwork = ( M > 1 ) ? M : 1;
	}
	sw1 = strideWork;
	sw2 = ldwork * strideWork;
	ow = offsetWork;

	if ( left && tran ) {
		// SIDE='L', TRANS='C': apply Q^H*C, forward block iteration.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;

			// Effective row count for this block: MB = MIN( M-L+I+IB-1, M ); 0-based: mb = MIN( M-l+i+ib, M ).
			mb = M - l + i + ib;
			if ( mb > M ) {
				mb = M;
			}

			// LB is the trapezoidal-row count contributing within this block.
			// 0-based: lb = mb - M + l - i (only when i < l).
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = mb - M + l - i;
			}

			// ztprfb('L','C','F','C', mb, N, ib, lb, V(:,i:), T(:,i:), A(i:,:), B, WORK(:,1:ib))
			ztprfb( 'left', 'conjugate-transpose', 'forward', 'columnwise', mb, N, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( !left && trans === 'no-transpose' ) {
		// SIDE='R', TRANS='N': apply C*Q, forward block iteration.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;

			mb = N - l + i + ib;
			if ( mb > N ) {
				mb = N;
			}
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = mb - N + l - i;
			}

			// ztprfb('R','N','F','C', M, mb, ib, lb, V(:,i:), T(:,i:), A(:,i:), B, WORK(:,1:ib))
			ztprfb( 'right', 'no-transpose', 'forward', 'columnwise', M, mb, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA2 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( left && trans === 'no-transpose' ) {
		// SIDE='L', TRANS='N': apply Q*C, backward block iteration.
		// In Fortran: KF = ((K-1)/NB)*NB + 1 (1-based start of last block).
		// In 0-based: kf = floor((K-1)/nb)*nb is the index of the last block start.
		kf = ( ( ( K - 1 ) / nb ) | 0 ) * nb;
		for ( i = kf; i >= 0; i -= nb ) {
			ib = ( nb < K - i ) ? nb : K - i;

			mb = M - l + i + ib;
			if ( mb > M ) {
				mb = M;
			}
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = mb - M + l - i;
			}

			ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', mb, N, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// SIDE='R', TRANS='C': apply C*Q^H, backward block iteration.
		kf = ( ( ( K - 1 ) / nb ) | 0 ) * nb;
		for ( i = kf; i >= 0; i -= nb ) {
			ib = ( nb < K - i ) ? nb : K - i;

			mb = N - l + i + ib;
			if ( mb > N ) {
				mb = N;
			}
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = mb - N + l - i;
			}

			ztprfb( 'right', 'conjugate-transpose', 'forward', 'columnwise', M, mb, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA2 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default ztpmqrt;
