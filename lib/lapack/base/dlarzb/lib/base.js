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

import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';


// MAIN //

/**
* Applies a real block reflector H or its transpose H**T to a real M-by-N matrix C, from either the left or the right.
*
* The block reflector comes from an RZ factorization (see `dtzrzf`). Only
* `DIRECT = 'backward'` and `STOREV = 'rowwise'` are supported.
*
* @private
* @param {string} side - `'left'` applies H from the left; `'right'` applies H from the right
* @param {string} trans - `'no-transpose'` applies H; `'transpose'` applies H**T
* @param {string} direct - direction (`'backward'`)
* @param {string} storev - storage layout of V (`'rowwise'`)
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - order of the triangular factor T (number of elementary reflectors)
* @param {NonNegativeInteger} l - number of columns of V containing the meaningful part (0 <= l <= M when side='left', 0 <= l <= N when side='right')
* @param {Float64Array} V - matrix of Householder vectors (K-by-L rowwise)
* @param {integer} strideV1 - stride of first dimension of V
* @param {integer} strideV2 - stride of second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - triangular factor of the block reflector (K-by-K, lower triangular)
* @param {integer} strideT1 - stride of first dimension of T
* @param {integer} strideT2 - stride of second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} C - M-by-N matrix, overwritten on exit by H*C, H**T*C, C*H, or C*H**T
* @param {integer} strideC1 - stride of first dimension of C
* @param {integer} strideC2 - stride of second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace (LDWORK-by-K); LDWORK >= N when side='left', LDWORK >= M when side='right'
* @param {integer} strideWORK1 - stride of first dimension of WORK
* @param {integer} strideWORK2 - stride of second dimension of WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
*/
function dlarzb( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	var transt;
	var i;
	var j;

	if ( M <= 0 || N <= 0 ) {
		return;
	}

	// Only DIRECT='backward' and STOREV='rowwise' are supported (matches Fortran).
	if ( direct !== 'backward' || storev !== 'rowwise' ) {
		return;
	}

	if ( trans === 'no-transpose' ) {
		transt = 'transpose';
	} else {
		transt = 'no-transpose';
	}

	if ( side === 'left' ) {
		// Form H*C or H**T*C.
		// W( 1:N, 1:K ) = C( 1:K, 1:N )**T  via column-by-column copies.
		// Fortran: DCOPY( N, C(J,1), LDC, WORK(1,J), 1 )  — copies row J of C to column J of W.
		for ( j = 0; j < K; j++ ) {
			dcopy( N, C, strideC2, offsetC + ( j * strideC1 ), WORK, strideWORK1, offsetWORK + ( j * strideWORK2 ) );
		}

		// W := W + C( M-L+1:M, 1:N )**T * V**T
		if ( l > 0 ) {
			dgemm( 'transpose', 'transpose', N, K, l, 1.0, C, strideC1, strideC2, offsetC + ( ( M - l ) * strideC1 ), V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		}

		// W := W * T**T  or  W * T  (T is lower triangular, so use the backward T we built).
		dtrmm( 'right', 'lower', transt, 'non-unit', N, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		// C( 1:K, 1:N ) := C( 1:K, 1:N ) - W**T
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < K; i++ ) {
				C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] -= WORK[ offsetWORK + ( j * strideWORK1 ) + ( i * strideWORK2 ) ];
			}
		}

		// C( M-L+1:M, 1:N ) := C( M-L+1:M, 1:N ) - V**T * W**T
		if ( l > 0 ) {
			dgemm( 'transpose', 'transpose', l, N, K, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, C, strideC1, strideC2, offsetC + ( ( M - l ) * strideC1 ) );
		}
	} else if ( side === 'right' ) {
		// Form C*H or C*H**T.
		// W( 1:M, 1:K ) = C( 1:M, 1:K )
		for ( j = 0; j < K; j++ ) {
			dcopy( M, C, strideC1, offsetC + ( j * strideC2 ), WORK, strideWORK1, offsetWORK + ( j * strideWORK2 ) );
		}

		// W := W + C( 1:M, N-L+1:N ) * V**T
		if ( l > 0 ) {
			dgemm( 'no-transpose', 'transpose', M, K, l, 1.0, C, strideC1, strideC2, offsetC + ( ( N - l ) * strideC2 ), V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		}

		// W := W * T  or  W * T**T
		dtrmm( 'right', 'lower', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		// C( 1:M, 1:K ) := C( 1:M, 1:K ) - W
		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] -= WORK[ offsetWORK + ( i * strideWORK1 ) + ( j * strideWORK2 ) ];
			}
		}

		// C( 1:M, N-L+1:N ) := C( 1:M, N-L+1:N ) - W * V
		if ( l > 0 ) {
			dgemm( 'no-transpose', 'no-transpose', M, l, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, C, strideC1, strideC2, offsetC + ( ( N - l ) * strideC2 ) );
		}
	}
}


// EXPORTS //

export default dlarzb;
