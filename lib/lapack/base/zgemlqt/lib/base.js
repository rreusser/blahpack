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

import zlarfb from '../../zlarfb/lib/base.js';


// MAIN //

/**
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a complex unitary matrix defined as the product of K elementary reflectors stored in the compact-WY representation produced by `zgelqt`.
*
* The four supported (side, trans) combinations are:
*
* ```text
*                          SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':         Q*C            C*Q
* TRANS = 'conjugate-transpose':  Q^H*C          C*Q^H
* ```
*
* The reflector blocks are applied in forward order when `(side='left',trans='no-transpose')` or `(side='right',trans='conjugate-transpose')`, and in backward order otherwise. Because the LQ reflectors are stored row-wise (V is in the rows of the matrix returned by `zgelqt`), `zlarfb` is invoked with `storev='rowwise'` and the opposite-sense `trans` (relative to the user request) for each block. `WORK` is provided by the caller as a 1D buffer with `strideWORK` between consecutive complex elements; internally it is treated as an `ldwork`-by-`mb` matrix where `ldwork = max(1,N)` (left) or `max(1,M)` (right). The caller is responsible for providing a sufficiently-sized `WORK` buffer.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {PositiveInteger} mb - block size used to build T (must equal the value used in `zgelqt`)
* @param {Complex128Array} V - reflector vectors from `zgelqt` (the strict upper trapezoidal portion of the factored matrix; rows hold reflectors with implicit unit diagonal)
* @param {integer} strideV1 - stride of the first dimension of V (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - block triangular factors from `zgelqt`, stored as mb-by-K
* @param {integer} strideT1 - stride of the first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace buffer (logically `ldwork`-by-`mb` with leading dimension `ldwork = max(1,N)` for `side='left'` or `max(1,M)` for `side='right'`)
* @param {integer} strideWORK - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zgemlqt( side, trans, M, N, K, mb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var ldwork;
	var left;
	var tran;
	var sw1;
	var sw2;
	var ow;
	var kf;
	var ib;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	tran = ( trans === 'conjugate-transpose' );

	if ( left ) {
		ldwork = ( N > 1 ) ? N : 1;
	} else {
		ldwork = ( M > 1 ) ? M : 1;
	}

	// Treat WORK as an ldwork-by-mb matrix laid out with the user's stride; zlarfb needs separate first/second-dim strides. The buffer is contiguous along the leading dimension (stride1 = strideWORK) and jumps `ldwork * strideWORK` between columns.
	sw1 = strideWORK;
	sw2 = ldwork * strideWORK;
	ow = offsetWORK;

	if ( left && !tran ) {
		// Apply C := Q*C. Forward block iteration.
		// `zlarfb` is called with trans='conjugate-transpose' because the LQ reflectors form Q = H(K)*...*H(1); applying them in forward block order (block 0 first) corresponds to the `H^H` per-block transformation under rowwise storage.
		for ( i = 0; i < K; i += mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			zlarfb( 'left', 'conjugate-transpose', 'forward', 'rowwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// Apply C := C*Q^H. Forward block iteration.
		for ( i = 0; i < K; i += mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			zlarfb( 'right', 'no-transpose', 'forward', 'rowwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	} else if ( left && tran ) {
		// Apply C := Q^H*C. Backward block iteration starting at the last block.
		// kf = floor((K-1)/mb)*mb is the index of the last block start.
		kf = ( ( ( K - 1 ) / mb ) | 0 ) * mb;
		for ( i = kf; i >= 0; i -= mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			zlarfb( 'left', 'no-transpose', 'forward', 'rowwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else {
		// !left && !tran: apply C := C*Q. Backward block iteration.
		kf = ( ( ( K - 1 ) / mb ) | 0 ) * mb;
		for ( i = kf; i >= 0; i -= mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			zlarfb( 'right', 'conjugate-transpose', 'forward', 'rowwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default zgemlqt;
