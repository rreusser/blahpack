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

import dtprfb from '../../dtprfb/lib/base.js';


// MAIN //

/**
* Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* The four supported (side, trans) combinations are:
*
* ```text
*                   SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':   Q*C            C*Q
* TRANS = 'transpose':    Q^T*C          C*Q^T
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
* The pentagonal V is composed of a `(M-L)`-by-`K` (left) or `(N-L)`-by-`K` (right) rectangular block stacked on top of an `L`-by-`K` upper trapezoidal block (the first `L` rows of a `K`-by-`K` upper triangular matrix). When `L = 0`, V reduces to a rectangular block; when `L = K`, V reduces to a triangular block. The block-application kernel is `dtprfb`, called with `direct='forward'`, `storev='columnwise'`. WORK is provided by the caller as a 1D buffer with `strideWork` between consecutive elements; internally it is treated as an `nb`-by-`N` (left) or `M`-by-`nb` (right) workspace matrix. The caller is responsible for sizing WORK appropriately (`nb*N` doubles for `side='left'` or `M*nb` for `side='right'`).
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of B (and rows of C when `side='left'`, rows of A and B when `side='right'`)
* @param {NonNegativeInteger} N - number of columns of B (and of A when `side='left'`)
* @param {NonNegativeInteger} K - number of elementary reflectors (`K >= L`)
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {PositiveInteger} nb - block size used to construct T (must equal the value used in `dtpqrt`; `1 <= nb <= K` when `K > 0`)
* @param {Float64Array} V - pentagonal reflector matrix produced by `dtpqrt`
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - block triangular factor produced by `dtpqrt`, stored as an `nb`-by-`K` matrix
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} A - upper (left) or left (right) block of C, modified in-place
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - lower (left) or right (right) block of C, modified in-place
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} WORK - workspace buffer (caller-allocated, logically `nb`-by-`N` for `side='left'` or `M`-by-`nb` for `side='right'`)
* @param {integer} strideWork - element stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dtpmqrt( side, trans, M, N, K, l, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
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
	tran = ( trans === 'transpose' );

	// Treat WORK as ldwork-by-ncwork laid out with the user's stride; dtprfb needs separate first/second-dim strides. The buffer is contiguous along the leading dimension (stride1 = strideWork) and jumps `ldwork * strideWork` between columns. Total size required: `nb*N` doubles for SIDE='L' (logical layout NB-by-N) or `M*nb` for SIDE='R' (logical layout M-by-NB).
	if ( left ) {
		ldwork = nb;
	} else {
		ldwork = ( M > 1 ) ? M : 1;
	}
	sw1 = strideWork;
	sw2 = ldwork * strideWork;
	ow = offsetWork;

	if ( left && tran ) {
		// SIDE='L', TRANS='T': apply Q^T*C, forward block iteration.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;

			// Effective row count for this block: MB = MIN( M-L+I+IB-1, M ); 0-based: MB = MIN( M-l+i+ib, M ).
			mb = M - l + i + ib;
			if ( mb > M ) {
				mb = M;
			}

			// LB is the trapezoidal-row count contributing within this block.
			// 0-based: LB = MB - M + l - i (only when i < l).
			if ( i >= l ) {
				lb = 0;
			} else {
				lb = mb - M + l - i;
			}

			// dtprfb('L','T','F','C', mb, N, ib, lb, V(:,i:), T(:,i:), A(i:,:), B, WORK(:,1:ib))
			dtprfb( 'left', 'transpose', 'forward', 'columnwise', mb, N, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
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

			// dtprfb('R','N','F','C', M, mb, ib, lb, V(:,i:), T(:,i:), A(:,i:), B, WORK(:,1:ib))
			dtprfb( 'right', 'no-transpose', 'forward', 'columnwise', M, mb, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA2 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
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

			dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', mb, N, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// SIDE='R', TRANS='T': apply C*Q^T, backward block iteration.
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

			dtprfb( 'right', 'transpose', 'forward', 'columnwise', M, mb, ib, lb, V, strideV1, strideV2, offsetV + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA2 ), B, strideB1, strideB2, offsetB, WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default dtpmqrt;
