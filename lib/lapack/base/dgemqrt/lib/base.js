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
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a real orthogonal matrix defined as the product of K elementary reflectors stored in the compact WY representation produced by DGEQRT.
*
* The four supported (side, trans) combinations are:
*
* ```text
*               SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':   Q*C            C*Q
* TRANS = 'transpose':    Q^T*C          C*Q^T
* ```
*
* The reflector blocks are applied in forward order when `(side='left',trans='transpose')` or `(side='right',trans='no-transpose')`, and in backward order otherwise. WORK is provided by the caller as a 1D buffer with `strideWORK` between consecutive elements; internally it is treated as an `ldwork`-by-`nb` matrix where `ldwork = max(1,N)` (left) or `max(1,M)` (right). The caller is responsible for sizing WORK appropriately.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {PositiveInteger} nb - block size used to build T (must equal the value used in `dgeqrt`)
* @param {Float64Array} V - reflector vectors from `dgeqrt` (the strict lower trapezoidal portion of the factored matrix, with implicit unit diagonal)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - block triangular factors from `dgeqrt`, stored as nb-by-K
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace buffer (logically `ldwork`-by-`nb` with leading dimension `ldwork = max(1,N)` for `side='left'` or `max(1,M)` for `side='right'`)
* @param {integer} strideWORK - element stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dgemqrt( side, trans, M, N, K, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
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

	// Treat WORK as an ldwork-by-nb matrix laid out with the user's stride; dlarfb needs separate first/second-dim strides. The buffer is contiguous along the leading dimension (stride1 = strideWORK) and jumps `ldwork * strideWORK` between columns.
	sw1 = strideWORK;
	sw2 = ldwork * strideWORK;
	ow = offsetWORK;

	if ( left && tran ) {
		// Apply blocks H(0), H(nb), H(2*nb), ... to C from the left as Q^T.
		// Iterate forward through reflector blocks.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			dlarfb( 'left', 'transpose', 'forward', 'columnwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else if ( !left && trans === 'no-transpose' ) {
		// Apply C := C*Q. Forward block iteration.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			dlarfb( 'right', 'no-transpose', 'forward', 'columnwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	} else if ( left && trans === 'no-transpose' ) {
		// Apply C := Q*C. Backward block iteration starting at the last block.
		// kf = floor((K-1)/nb)*nb is the index of the last block start.
		kf = ( ( ( K - 1 ) / nb ) | 0 ) * nb;
		for ( i = kf; i >= 0; i -= nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			dlarfb( 'left', 'no-transpose', 'forward', 'columnwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// Apply C := C*Q^T. Backward block iteration.
		kf = ( ( ( K - 1 ) / nb ) | 0 ) * nb;
		for ( i = kf; i >= 0; i -= nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			dlarfb( 'right', 'transpose', 'forward', 'columnwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default dgemqrt;
