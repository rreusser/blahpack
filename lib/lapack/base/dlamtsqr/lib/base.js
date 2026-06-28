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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dgemqrt from './../../dgemqrt/lib/base.js';
import dtpmqrt from './../../dtpmqrt/lib/base.js';


// MAIN //

/**
* Overwrites a real `M`-by-`N` matrix `C` with `op(Q)*C` or `C*op(Q)`, where `Q` is a real orthogonal matrix produced by a blocked Tall-Skinny QR (TSQR) factorization (`dlatsqr`).
*
* The four supported (side, trans) combinations are:
*
* ```text
*                   SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':   Q*C            C*Q
* TRANS = 'transpose':    Q^T*C          C*Q^T
* ```
*
* The TSQR factorization stores `Q` as a sequence of row blocks: the first `mb`-by-`K` block is in compact-WY form (as produced by `dgeqrt`), while subsequent blocks are pentagonal (`mb-K`)-by-`K` blocks (as produced by `dtpqrt`). Reflectors in `A` are stacked vertically; the corresponding `nb`-by-`K` triangular block factors are stacked horizontally in `T` (`nb` rows, `numblk * K` columns).
*
* Block-iteration direction depends on (side, trans): forward for `(left, transpose)` and `(right, no-transpose)`; backward for `(left, no-transpose)` and `(right, transpose)`. The block-application kernels are `dgemqrt` for the leading row block and `dtpmqrt` (with `l = 0`) for subsequent blocks.
*
* When `mb <= K` or `mb >= max(M, N, K)`, the routine defers to a single `dgemqrt` call.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C (and the order of Q when `side='left'`)
* @param {NonNegativeInteger} N - number of columns of C (and the order of Q when `side='right'`)
* @param {NonNegativeInteger} K - number of elementary reflectors (must satisfy `K <= M` when `side='left'`, `K <= N` when `side='right'`)
* @param {PositiveInteger} mb - row block size used in the TSQR factorization (must be the same value passed to `dlatsqr`)
* @param {PositiveInteger} nb - column block size of the compact-WY representation (`1 <= nb <= K`)
* @param {Float64Array} A - reflector vectors from `dlatsqr` stored block-by-row
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - block triangular factors from `dlatsqr` (stored as `nb`-by-`numblk*K`)
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace (must hold at least `N*nb` doubles when `side='left'`, `mb*nb` doubles when `side='right'`)
* @param {integer} strideWork - element stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dlamtsqr( side, trans, M, N, K, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var left;
	var tran;
	var mxN;
	var ctr;
	var ii;
	var kk;
	var i;

	// Quick return if possible.
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	tran = ( trans === 'transpose' );

	// Defer to dgemqrt when the row block size produces no non-trivial TSQR partition.
	mxN = ( M > N ) ? M : N;
	if ( mxN < K ) {
		mxN = K;
	}
	if ( mb <= K || mb >= mxN ) {
		return dgemqrt( side, trans, M, N, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	}

	if ( left && trans === 'no-transpose' ) {
		// SIDE='L', TRANS='N': apply Q*C, iterate from the last block back to the first.
		kk = ( M - K ) % ( mb - K );
		ctr = ( ( M - K ) / ( mb - K ) ) | 0;
		if ( kk > 0 ) {
			// Multiply Q to the trailing partial block of C (rows [M-kk, M)).
			ii = M - kk;
			dtpmqrt( 'left', 'no-transpose', kk, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC1 ), WORK, strideWork, offsetWork );
		} else {
			ii = M;
		}

		// Iterate over interior row blocks. Fortran loop: DO I = II-(MB-K), MB+1, -(MB-K) (1-based, inclusive end MB+1). In 0-based: i = ii-(mb-K), ii-2(mb-K), ..., down to i >= mb.
		for ( i = ii - ( mb - K ); i >= mb; i -= ( mb - K ) ) {
			ctr -= 1;
			dtpmqrt( 'left', 'no-transpose', mb - K, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, strideWork, offsetWork );
		}

		// Multiply Q to the first row block (rows 0..mb).
		dgemqrt( 'left', 'no-transpose', mb, N, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else if ( left && tran ) {
		// SIDE='L', TRANS='T': apply Q^T*C, iterate forward from the first block.
		kk = ( M - K ) % ( mb - K );
		ii = M - kk;
		ctr = 1;

		// Multiply Q^T to the first row block (rows 0..mb).
		dgemqrt( 'left', 'transpose', mb, N, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );

		// Iterate over interior row blocks. Fortran loop: DO I = MB+1, II-MB+K, MB-K (1-based, inclusive end). In 0-based: i = mb, mb+(mb-K), ..., up to i <= ii-(mb-K).
		for ( i = mb; i <= ii - ( mb - K ); i += ( mb - K ) ) {
			dtpmqrt( 'left', 'transpose', mb - K, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, strideWork, offsetWork );
			ctr += 1;
		}

		// Multiply Q^T to the trailing partial block (if any).
		if ( ii < M ) {
			dtpmqrt( 'left', 'transpose', kk, N, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC1 ), WORK, strideWork, offsetWork );
		}
	} else if ( !left && tran ) {
		// SIDE='R', TRANS='T': apply C*Q^T, iterate from the last block back to the first.
		kk = ( N - K ) % ( mb - K );
		ctr = ( ( N - K ) / ( mb - K ) ) | 0;
		if ( kk > 0 ) {
			ii = N - kk;
			dtpmqrt( 'right', 'transpose', M, kk, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC2 ), WORK, strideWork, offsetWork );
		} else {
			ii = N;
		}

		// Iterate over interior column blocks (right side: blocks of A rows correspond to Q column groups). Fortran: DO I = II-(MB-K), MB+1, -(MB-K).
		for ( i = ii - ( mb - K ); i >= mb; i -= ( mb - K ) ) {
			ctr -= 1;
			dtpmqrt( 'right', 'transpose', M, mb - K, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, strideWork, offsetWork );
		}

		// Multiply Q^T to the first block (cols 0..mb).
		dgemqrt( 'right', 'transpose', M, mb, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else if ( !left && trans === 'no-transpose' ) {
		// SIDE='R', TRANS='N': apply C*Q, iterate forward from the first block.
		kk = ( N - K ) % ( mb - K );
		ii = N - kk;
		ctr = 1;

		// Multiply Q to the first block (cols 0..mb).
		dgemqrt( 'right', 'no-transpose', M, mb, K, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );

		// Iterate over interior column blocks. Fortran: DO I = MB+1, II-MB+K, MB-K.
		for ( i = mb; i <= ii - ( mb - K ); i += ( mb - K ) ) {
			dtpmqrt( 'right', 'no-transpose', M, mb - K, K, 0, nb, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, strideWork, offsetWork );
			ctr += 1;
		}

		// Multiply Q to the trailing partial block (if any).
		if ( ii < N ) {
			dtpmqrt( 'right', 'no-transpose', M, kk, K, 0, nb, A, strideA1, strideA2, offsetA + ( ii * strideA1 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC2 ), WORK, strideWork, offsetWork );
		}
	}

	return 0;
}


// EXPORTS //

export default dlamtsqr;
