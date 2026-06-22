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

import dlarfb from '../../dlarfb/lib/base.js';


// MAIN //

/**
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a real orthogonal matrix defined as the product of K elementary reflectors stored in the compact WY representation produced by DGELQT.
*
* The four supported (side, trans) combinations are:
*
* ```text
*               SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':   Q*C            C*Q
* TRANS = 'transpose':    Q^T*C          C*Q^T
* ```
*
* The reflector blocks are applied in forward order when `(side='left',trans='no-transpose')` or `(side='right',trans='transpose')`, and in backward order otherwise. Because the reflectors are stored row-wise (V is in the rows of the matrix returned by `dgelqt`), `dlarfb` is invoked with `storev='rowwise'` and an opposite-sense `trans` (relative to the user request) for each block.
*
* WORK is provided by the caller as a 1D buffer with `strideWORK` between consecutive elements; internally it is treated as an `ldwork`-by-`mb` matrix laid out along the leading dimension, where `ldwork = max(1,N)` for `side='left'` or `ldwork = max(1,M)` for `side='right'`. The buffer must have capacity for at least `ldwork * mb` elements (i.e., `offsetWORK + ((ldwork*mb - 1) * |strideWORK|) + 1` accessible slots). The caller is responsible for sizing WORK; this base routine does not allocate.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {PositiveInteger} mb - block size used to build T (must equal the value used in `dgelqt`)
* @param {Float64Array} V - reflector vectors from `dgelqt` (the strict upper trapezoidal portion of the factored matrix; rows hold reflectors with implicit unit diagonal)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - block triangular factors from `dgelqt`, stored as mb-by-K
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace buffer of size at least `ldwork * mb`, where `ldwork = max(1,N)` for `side='left'` or `ldwork = max(1,M)` for `side='right'` (logically an `ldwork`-by-`mb` matrix stored along the leading dimension)
* @param {integer} strideWORK - element stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dgemlqt( side, trans, M, N, K, mb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
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
	tran = ( trans === 'transpose' );

	if ( left ) {
		ldwork = ( N > 1 ) ? N : 1;
	} else {
		ldwork = ( M > 1 ) ? M : 1;
	}

	// Treat WORK as an ldwork-by-mb matrix laid out with the user's stride; dlarfb needs separate first/second-dim strides. The buffer is contiguous along the leading dimension (stride1 = strideWORK) and jumps `ldwork * strideWORK` between columns.
	sw1 = strideWORK;
	sw2 = ldwork * strideWORK;
	ow = offsetWORK;

	if ( left && !tran ) {
		// Apply C := Q*C. Forward block iteration.
		// Dlarfb is called with trans='transpose' because the LQ reflectors form Q = H(K)*...*H(1); applying them in forward block order (block 0 first) corresponds to applying Q^T per-block transformation under rowwise storage.
		for ( i = 0; i < K; i += mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			dlarfb( 'left', 'transpose', 'forward', 'rowwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// Apply C := C*Q^T. Forward block iteration.
		for ( i = 0; i < K; i += mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			dlarfb( 'right', 'no-transpose', 'forward', 'rowwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	} else if ( left && tran ) {
		// Apply C := Q^T*C. Backward block iteration starting at the last block.
		// kf = floor((K-1)/mb)*mb is the index of the last block start.
		kf = ( ( ( K - 1 ) / mb ) | 0 ) * mb;
		for ( i = kf; i >= 0; i -= mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			dlarfb( 'left', 'no-transpose', 'forward', 'rowwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else {
		// !left && !tran: apply C := C*Q. Backward block iteration.
		kf = ( ( ( K - 1 ) / mb ) | 0 ) * mb;
		for ( i = kf; i >= 0; i -= mb ) {
			ib = ( mb < K - i ) ? mb : K - i;
			dlarfb( 'right', 'transpose', 'forward', 'rowwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default dgemlqt;
