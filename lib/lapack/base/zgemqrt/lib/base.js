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

import zlarfb from '../../zlarfb/lib/base.js';


// MAIN //

/**
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a complex unitary matrix defined as the product of K elementary reflectors stored in the compact WY representation produced by ZGEQRT.
*
* The four supported (side, trans) combinations are:
*
* ```text
*                                 SIDE = 'left'   SIDE = 'right'
* TRANS = 'no-transpose':              Q*C            C*Q
* TRANS = 'conjugate-transpose':     Q^H*C          C*Q^H
* ```
*
* The reflector blocks are applied in forward order when `(side='left',trans='conjugate-transpose')` or `(side='right',trans='no-transpose')`, and in backward order otherwise. WORK is provided by the caller as a 1D buffer with `strideWork` complex elements between consecutive entries; internally it is treated as an `ldwork`-by-`nb` matrix where `ldwork = max(1,N)` (left) or `max(1,M)` (right). If the caller's WORK buffer is too small, an internal buffer is allocated.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {PositiveInteger} nb - block size used to build T (must equal the value used in `zgeqrt`)
* @param {Complex128Array} V - reflector vectors from `zgeqrt` (the strict lower trapezoidal portion of the factored matrix, with implicit unit diagonal)
* @param {integer} strideV1 - stride of the first dimension of V (complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
* @param {Complex128Array} T - block triangular factors from `zgeqrt`, stored as nb-by-K
* @param {integer} strideT1 - stride of the first dimension of T (complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Complex128Array} WORK - workspace buffer (logically `ldwork`-by-`nb` with leading dimension `ldwork = max(1,N)` for `side='left'` or `max(1,M)` for `side='right'`)
* @param {integer} strideWork - element stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zgemqrt( side, trans, M, N, K, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
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

	// Treat WORK as an ldwork-by-nb matrix laid out with the user's stride; zlarfb needs separate first/second-dim strides. The buffer is contiguous along the leading dimension (stride1 = strideWork) and jumps `ldwork * strideWork` between columns.
	sw1 = strideWork;
	sw2 = ldwork * strideWork;
	ow = offsetWork;

	if ( left && tran ) {
		// Apply blocks H(0), H(nb), H(2*nb), ... to C from the left as Q^H. Iterate forward through reflector blocks.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			zlarfb( 'left', 'conjugate-transpose', 'forward', 'columnwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else if ( !left && trans === 'no-transpose' ) {
		// Apply C := C*Q. Forward block iteration.
		for ( i = 0; i < K; i += nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			zlarfb( 'right', 'no-transpose', 'forward', 'columnwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	} else if ( left && trans === 'no-transpose' ) {
		// Apply C := Q*C. Backward block iteration starting at the last block. kf = floor((K-1)/nb)*nb is the index of the last block start.
		kf = ( ( ( K - 1 ) / nb ) | 0 ) * nb;
		for ( i = kf; i >= 0; i -= nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			zlarfb( 'left', 'no-transpose', 'forward', 'columnwise', M - i, N, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, sw1, sw2, ow );
		}
	} else if ( !left && tran ) {
		// Apply C := C*Q^H. Backward block iteration.
		kf = ( ( ( K - 1 ) / nb ) | 0 ) * nb;
		for ( i = kf; i >= 0; i -= nb ) {
			ib = ( nb < K - i ) ? nb : K - i;
			zlarfb( 'right', 'conjugate-transpose', 'forward', 'columnwise', M, N - i, ib, V, strideV1, strideV2, offsetV + ( i * strideV1 ) + ( i * strideV2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, sw1, sw2, ow );
		}
	}

	return 0;
}


// EXPORTS //

export default zgemqrt;
