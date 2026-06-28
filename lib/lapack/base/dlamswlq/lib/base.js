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

import dgemlqt from './../../dgemlqt/lib/base.js';
import dtpmlqt from './../../dtpmlqt/lib/base.js';


// MAIN //

/**
* Overwrites a real `M`-by-`N` matrix `C` with `op(Q)*C` or `C*op(Q)`, where `Q` is a real orthogonal matrix produced by a blocked Short-Wide LQ (SWLQ) factorization (`dlaswlq`).
*
* The four supported (side, trans) combinations are:
*
* ```text
*                          SIDE = 'left'    SIDE = 'right'
* TRANS = 'no-transpose':       Q*C             C*Q
* TRANS = 'transpose':         Q^T*C           C*Q^T
* ```
*
* The SWLQ factorization stores `Q` as a sequence of column blocks: the first `K`-by-`nb` block is in compact-WY form (as produced by `dgelqt`), while subsequent blocks are pentagonal `K`-by-(`nb-K`) blocks (as produced by `dtplqt`). Reflectors in `A` are stacked horizontally; the corresponding `mb`-by-`K` triangular block factors are stacked horizontally in `T` (`mb` rows, `numblk * K` columns).
*
* Block-iteration direction depends on (side, trans): forward for `(left, no-transpose)` and `(right, transpose)`; backward for `(left, transpose)` and `(right, no-transpose)`. The block-application kernels are `dgemlqt` for the leading column block and `dtpmlqt` (with `l = 0`) for subsequent blocks.
*
* When `nb <= K` or `nb >= max(M, N, K)`, the routine defers to a single `dgemlqt` call.
*
* @private
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C (and the order of Q when `side='left'`)
* @param {NonNegativeInteger} N - number of columns of C (and the order of Q when `side='right'`)
* @param {NonNegativeInteger} K - number of elementary reflectors (must satisfy `K <= M` when `side='left'`, `K <= N` when `side='right'`)
* @param {PositiveInteger} mb - inner block size of the compact-WY representation (`1 <= mb <= K`)
* @param {PositiveInteger} nb - column block size used in the SWLQ factorization (must be the same value passed to `dlaswlq`)
* @param {Float64Array} A - reflector vectors from `dlaswlq` stored block-by-column
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - block triangular factors from `dlaswlq` (stored as `mb`-by-`numblk*K`)
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace (must hold at least `N*mb` doubles when `side='left'`, `M*mb` doubles when `side='right'`)
* @param {integer} strideWork - element stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} status code (0 = success)
*/
function dlamswlq( side, trans, M, N, K, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
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

	// Defer to dgemlqt when the column block size produces no non-trivial SWLQ partition.
	mxN = ( M > N ) ? M : N;
	if ( mxN < K ) {
		mxN = K;
	}
	if ( nb <= K || nb >= mxN ) {
		return dgemlqt( side, trans, M, N, K, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	}

	if ( left && tran ) {
		// SIDE='L', TRANS='T': apply Q^T*C, iterate from the last block back to the first.
		kk = ( M - K ) % ( nb - K );
		ctr = ( ( M - K ) / ( nb - K ) ) | 0;
		if ( kk > 0 ) {
			// Multiply Q^T to the trailing partial block of C (rows [M-kk, M)).
			ii = M - kk;
			dtpmlqt( 'left', 'transpose', kk, N, K, 0, mb, A, strideA1, strideA2, offsetA + ( ii * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC1 ), WORK, strideWork, offsetWork );
		} else {
			ii = M;
		}

		// Iterate over interior column blocks of A (corresponding to row blocks of C). Fortran: DO I = II-(NB-K), NB+1, -(NB-K) (1-based, inclusive end NB+1). In 0-based: i = ii-(nb-K), ii-2(nb-K), ..., down to i >= nb.
		for ( i = ii - ( nb - K ); i >= nb; i -= ( nb - K ) ) {
			ctr -= 1;
			dtpmlqt( 'left', 'transpose', nb - K, N, K, 0, mb, A, strideA1, strideA2, offsetA + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, strideWork, offsetWork );
		}

		// Multiply Q^T to the first column block of A (acts on the first nb rows of C).
		dgemlqt( 'left', 'transpose', nb, N, K, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else if ( left && trans === 'no-transpose' ) {
		// SIDE='L', TRANS='N': apply Q*C, iterate forward from the first block.
		kk = ( M - K ) % ( nb - K );
		ii = M - kk;
		ctr = 1;

		// Multiply Q to the first column block of A (acts on the first nb rows of C).
		dgemlqt( 'left', 'no-transpose', nb, N, K, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );

		// Iterate over interior column blocks of A. Fortran: DO I = NB+1, II-NB+K, NB-K (1-based, inclusive end). In 0-based: i = nb, nb+(nb-K), ..., up to i <= ii-(nb-K).
		for ( i = nb; i <= ii - ( nb - K ); i += ( nb - K ) ) {
			dtpmlqt( 'left', 'no-transpose', nb - K, N, K, 0, mb, A, strideA1, strideA2, offsetA + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC1 ), WORK, strideWork, offsetWork );
			ctr += 1;
		}

		// Multiply Q to the trailing partial block (if any).
		if ( ii < M ) {
			dtpmlqt( 'left', 'no-transpose', kk, N, K, 0, mb, A, strideA1, strideA2, offsetA + ( ii * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC1 ), WORK, strideWork, offsetWork );
		}
	} else if ( !left && trans === 'no-transpose' ) {
		// SIDE='R', TRANS='N': apply C*Q, iterate from the last block back to the first.
		kk = ( N - K ) % ( nb - K );
		ctr = ( ( N - K ) / ( nb - K ) ) | 0;
		if ( kk > 0 ) {
			ii = N - kk;
			dtpmlqt( 'right', 'no-transpose', M, kk, K, 0, mb, A, strideA1, strideA2, offsetA + ( ii * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC2 ), WORK, strideWork, offsetWork );
		} else {
			ii = N;
		}

		// Iterate over interior column blocks of A. Fortran: DO I = II-(NB-K), NB+1, -(NB-K).
		for ( i = ii - ( nb - K ); i >= nb; i -= ( nb - K ) ) {
			ctr -= 1;
			dtpmlqt( 'right', 'no-transpose', M, nb - K, K, 0, mb, A, strideA1, strideA2, offsetA + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, strideWork, offsetWork );
		}

		// Multiply Q to the first block (cols 0..nb).
		dgemlqt( 'right', 'no-transpose', M, nb, K, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	} else if ( !left && tran ) {
		// SIDE='R', TRANS='T': apply C*Q^T, iterate forward from the first block.
		kk = ( N - K ) % ( nb - K );
		ctr = 1;
		ii = N - kk;

		// Multiply Q^T to the first block (cols 0..nb).
		dgemlqt( 'right', 'transpose', M, nb, K, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );

		// Iterate over interior column blocks. Fortran: DO I = NB+1, II-NB+K, NB-K.
		for ( i = nb; i <= ii - ( nb - K ); i += ( nb - K ) ) {
			dtpmlqt( 'right', 'transpose', M, nb - K, K, 0, mb, A, strideA1, strideA2, offsetA + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( i * strideC2 ), WORK, strideWork, offsetWork );
			ctr += 1;
		}

		// Multiply Q^T to the trailing partial block (if any).
		if ( ii < N ) {
			dtpmlqt( 'right', 'transpose', M, kk, K, 0, mb, A, strideA1, strideA2, offsetA + ( ii * strideA2 ), T, strideT1, strideT2, offsetT + ( ctr * K * strideT2 ), C, strideC1, strideC2, offsetC, C, strideC1, strideC2, offsetC + ( ii * strideC2 ), WORK, strideWork, offsetWork );
		}
	}

	return 0;
}


// EXPORTS //

export default dlamswlq;
