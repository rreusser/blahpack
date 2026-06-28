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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import zgemqrt from './../../zgemqrt/lib/base.js';
import ztpmqrt from './../../ztpmqrt/lib/base.js';


// MAIN //

/**
* Overwrites a complex M-by-N matrix `C` with `op(Q)*C` or `C*op(Q)`, where `Q` is the complex unitary matrix from a Tall-Skinny QR factorization (the output of `zlatsqr`).
*
* The four supported `(side, trans)` combinations are:
*
* ```text
*                                     SIDE = 'left'   SIDE = 'right'
* TRANS = 'no-transpose':                  Q*C            C*Q
* TRANS = 'conjugate-transpose':         Q^H*C          C*Q^H
* ```
*
* `Q` is represented as a product of unitary matrices `Q = Q(1)*Q(2)*...*Q(p)`, where `Q(1)` is built by `zgeqrt` (compact-WY block reflector for the first `mb`-row block) and `Q(i)` for `i > 1` are pentagonal compact-WY block reflectors built by `ztpqrt`. `A` stores the reflector vectors (lower trapezoidal of each panel) and `T` stores the block triangular factors as a sequence of `nb`-by-`K` blocks laid out left-to-right.
*
* Block-iteration direction depends on `(side, trans)`:
*
* -   forward for `(left, conjugate-transpose)` and `(right, no-transpose)`
* -   backward for `(left, no-transpose)` and `(right, conjugate-transpose)`
*
* When `mb <= K` or `mb >= max(M, N, K)`, the routine defers to `zgemqrt` on the entire panel (no pentagonal blocks). `WORK` is provided by the caller as a 1D buffer; if undersized, the underlying `zgemqrt`/`ztpmqrt` allocate their own.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C (and of Q when `side='left'`)
* @param {NonNegativeInteger} N - number of columns of C (and of Q when `side='right'`)
* @param {NonNegativeInteger} K - number of elementary reflectors (`M >= K >= 0` when `side='left'`; `N >= K >= 0` when `side='right'`)
* @param {PositiveInteger} mb - row block size used by `zlatsqr` (`mb > K`)
* @param {PositiveInteger} nb - inner block size used by the compact-WY representation (`1 <= nb <= K` when `K > 0`)
* @param {Complex128Array} A - reflector vectors from `zlatsqr`
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} T - block triangular factors from `zlatsqr`, stored as `nb`-by-`(numblk*K)`
* @param {integer} strideT1 - stride of the first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace buffer
* @param {integer} strideWork - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {integer} lwork - declared length of WORK (informational; underlying kernels allocate internally if WORK is undersized)
* @returns {integer} status code (0 = success)
*/
function zlamtsqr( side, trans, M, N, K, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line no-unused-vars
	var left;
	var tran;
	var qmax;
	var ctr;
	var kk;
	var ii;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	tran = ( trans === 'conjugate-transpose' );

	// Determine MAX(M,N,K) for the "short panel" branch test.
	qmax = M;
	if ( N > qmax ) {
		qmax = N;
	}
	if ( K > qmax ) {
		// Unreachable when inputs satisfy K <= M (side='left') or K <= N (side='right'); preserved for parity with the Fortran MAX(M,N,K).
		qmax = K;
	}

	// If the panel is short enough, defer to zgemqrt on the entire factor (no pentagonal blocks). Mirrors the Fortran branch (MB <= K .OR. MB >= MAX(M,N,K)).
	if ( mb <= K || mb >= qmax ) {
		return zgemqrt( side, trans, M, N, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	}

	if ( left && !tran ) {
		// SIDE='L', TRANS='N': apply Q*C, backward block iteration.
		// Fortran: KK = MOD(M-K, MB-K); CTR = (M-K)/(MB-K); II = M-KK+1 (1-based).
		kk = ( M - K ) % ( mb - K );
		ctr = ( ( M - K ) / ( mb - K ) ) | 0;
		if ( kk > 0 ) {
			ii = M - kk; // 0-based row index of the trailing block.
			ztpmqrt( 'left', 'no-transpose', kk, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC1 ), WORK, strideWork, offsetWork );
		} else {
			ii = M;
		}

		// Loop: I = II-(MB-K) down to MB+1 (1-based), step -(MB-K). 0-based: i from ii-(mb-K) down to mb (inclusive), step -(mb-K).
		for ( i = ii - ( mb - K ); i >= mb; i -= ( mb - K ) ) {
			ctr -= 1;
			ztpmqrt( 'left', 'no-transpose', mb - K, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, strideWork, offsetWork );
		}

		// Apply Q to the first block of C (rows 0..mb-1).
		zgemqrt( 'left', 'no-transpose', mb, N, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else if ( left && tran ) {
		// SIDE='L', TRANS='C': apply Q^H*C, forward block iteration.
		kk = ( M - K ) % ( mb - K );
		ii = M - kk; // 0-based row index of the trailing block (or M if kk=0).
		ctr = 1;

		// First block: C(0:mb, :) := Q(1)^H * C(0:mb, :).
		zgemqrt( 'left', 'conjugate-transpose', mb, N, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );

		// Middle blocks: I = MB+1 to II-MB+K (1-based), step MB-K. 0-based: i from mb to ii-(mb-K) inclusive, step (mb-K).
		for ( i = mb; i <= ii - ( mb - K ); i += ( mb - K ) ) {
			ztpmqrt( 'left', 'conjugate-transpose', mb - K, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, strideWork, offsetWork );
			ctr += 1;
		}

		// Trailing partial block, if any.
		if ( ii < M ) {
			ztpmqrt( 'left', 'conjugate-transpose', kk, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC1 ), WORK, strideWork, offsetWork );
		}
	} else if ( !left && tran ) {
		// SIDE='R', TRANS='C': apply C*Q^H, backward block iteration.
		kk = ( N - K ) % ( mb - K );
		ctr = ( ( N - K ) / ( mb - K ) ) | 0;
		if ( kk > 0 ) {
			ii = N - kk; // 0-based column index of the trailing block.
			ztpmqrt( 'right', 'conjugate-transpose', M, kk, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC2 ), WORK, strideWork, offsetWork );
		} else {
			ii = N;
		}

		for ( i = ii - ( mb - K ); i >= mb; i -= ( mb - K ) ) {
			ctr -= 1;
			ztpmqrt( 'right', 'conjugate-transpose', M, mb - K, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, strideWork, offsetWork );
		}

		// Apply Q^H to the first block of C (cols 0..mb-1).
		zgemqrt( 'right', 'conjugate-transpose', M, mb, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else {
		// SIDE='R', TRANS='N': apply C*Q, forward block iteration.
		kk = ( N - K ) % ( mb - K );
		ii = N - kk; // 0-based column index of the trailing block (or N if kk=0).
		ctr = 1;

		// First block: C(:, 0:mb) := C(:, 0:mb) * Q(1).
		zgemqrt( 'right', 'no-transpose', M, mb, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );

		// Middle blocks: I = MB+1 to II-MB+K (1-based), step MB-K. 0-based: i from mb to ii-(mb-K) inclusive, step (mb-K).
		for ( i = mb; i <= ii - ( mb - K ); i += ( mb - K ) ) {
			ztpmqrt( 'right', 'no-transpose', M, mb - K, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, strideWork, offsetWork );
			ctr += 1;
		}

		// Trailing partial block, if any.
		if ( ii < N ) {
			ztpmqrt( 'right', 'no-transpose', M, kk, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC2 ), WORK, strideWork, offsetWork );
		}
	}

	return 0;
}


// EXPORTS //

export default zlamtsqr;
