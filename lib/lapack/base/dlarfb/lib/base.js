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
* Applies a real block reflector H or its transpose H**T to a.
* real M-by-N matrix C, from either the left or the right.
*
* `H = I - V*T*V**T  (for STOREV='C')`
* `H = I - V**T*T*V  (for STOREV='R')`
*
* Supports both STOREV='C' (columnwise) and STOREV='R' (rowwise).
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - rows of C
* @param {NonNegativeInteger} N - columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} V - matrix of reflector vectors
* @param {integer} strideV1 - first dim stride of V
* @param {integer} strideV2 - second dim stride of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - triangular factor
* @param {integer} strideT1 - first dim stride of T
* @param {integer} strideT2 - second dim stride of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} C - matrix, modified in-place
* @param {integer} strideC1 - first dim stride of C
* @param {integer} strideC2 - second dim stride of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK1 - first dim stride of WORK
* @param {integer} strideWORK2 - second dim stride of WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
*/
function dlarfb( side, trans, direct, storev, M, N, K, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	var transt;
	var i;
	var j;

	if ( M <= 0 || N <= 0 ) {
		return;
	}

	if ( trans === 'no-transpose' ) {
		transt = 'transpose';
	} else {
		transt = 'no-transpose';
	}

	if ( storev === 'columnwise' ) {
		if ( direct === 'forward' ) {
			// V = (V1)  first K rows, V1 is unit lower triangular
			//     (V2)
			if ( side === 'left' ) {
				// Form H*C or H**T*C where C = (C1)
				//                               (C2)
				// W := C1**T
				for ( j = 0; j < K; j++ ) {
					dcopy( N, C, strideC2, offsetC + (j * strideC1), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
				}
				// W := W * V1
				dtrmm( 'right', 'lower', 'no-transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );
				if ( M > K ) {
					// W := W + C2**T * V2
					dgemm( 'transpose', 'no-transpose', N, K, M - K, 1.0, C, strideC1, strideC2, offsetC + (K * strideC1), V, strideV1, strideV2, offsetV + (K * strideV1), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
				}
				// W := W * T**T or W * T
				dtrmm( 'right', 'upper', transt, 'non-unit', N, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

				// C := C - V * W**T
				if ( M > K ) {
					dgemm( 'no-transpose', 'transpose', M - K, N, K, -1.0, V, strideV1, strideV2, offsetV + (K * strideV1), WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, C, strideC1, strideC2, offsetC + (K * strideC1) );
				}
				// W := W * V1**T
				dtrmm( 'right', 'lower', 'transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );

				// C1 := C1 - W**T
				for ( j = 0; j < K; j++ ) {
					for ( i = 0; i < N; i++ ) {
						C[ offsetC + (j * strideC1) + (i * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
					}
				}
			} else if ( side === 'right' ) {
				// Form C*H or C*H**T where C = (C1 C2)
				// W := C1
				for ( j = 0; j < K; j++ ) {
					dcopy( M, C, strideC1, offsetC + (j * strideC2), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
				}
				// W := W * V1
				dtrmm( 'right', 'lower', 'no-transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );
				if ( N > K ) {
					// W := W + C2 * V2
					dgemm( 'no-transpose', 'no-transpose', M, K, N - K, 1.0, C, strideC1, strideC2, offsetC + (K * strideC2), V, strideV1, strideV2, offsetV + (K * strideV1), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
				}
				// W := W * T or W * T**T
				dtrmm( 'right', 'upper', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

				// C := C - W * V**T
				if ( N > K ) {
					dgemm( 'no-transpose', 'transpose', M, N - K, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV + (K * strideV1), 1.0, C, strideC1, strideC2, offsetC + (K * strideC2) );
				}
				// W := W * V1**T
				dtrmm( 'right', 'lower', 'transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );

				// C1 := C1 - W
				for ( j = 0; j < K; j++ ) {
					for ( i = 0; i < M; i++ ) {
						C[ offsetC + (i * strideC1) + (j * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
					}
				}
			}
		// Backward: V = (V1)
		//               (V2)  last K rows, V2 is unit upper triangular
		} else if ( side === 'left' ) {
			// W := C2**T
			for ( j = 0; j < K; j++ ) {
				dcopy( N, C, strideC2, offsetC + (( M - K + j ) * strideC1), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
			}
			// W := W * V2
			dtrmm( 'right', 'upper', 'no-transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV + (( M - K ) * strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );
			if ( M > K ) {
				dgemm( 'transpose', 'no-transpose', N, K, M - K, 1.0, C, strideC1, strideC2, offsetC, V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
			}
			// W := W * T**T or W * T
			dtrmm( 'right', 'lower', transt, 'non-unit', N, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );
			if ( M > K ) {
				dgemm( 'no-transpose', 'transpose', M - K, N, K, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, C, strideC1, strideC2, offsetC );
			}
			dtrmm( 'right', 'upper', 'transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV + (( M - K ) * strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < N; i++ ) {
					C[ offsetC + (( M - K + j ) * strideC1) + (i * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
				}
			}
		} else if ( side === 'right' ) {
			// W := C2
			for ( j = 0; j < K; j++ ) {
				dcopy( M, C, strideC1, offsetC + (( N - K + j ) * strideC2), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
			}
			dtrmm( 'right', 'upper', 'no-transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV + (( N - K ) * strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );
			if ( N > K ) {
				dgemm( 'no-transpose', 'no-transpose', M, K, N - K, 1.0, C, strideC1, strideC2, offsetC, V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
			}
			dtrmm( 'right', 'lower', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );
			if ( N > K ) {
				dgemm( 'no-transpose', 'transpose', M, N - K, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, C, strideC1, strideC2, offsetC );
			}
			dtrmm( 'right', 'upper', 'transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV + (( N - K ) * strideV1), WORK, strideWORK1, strideWORK2, offsetWORK );
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < M; i++ ) {
					C[ offsetC + (i * strideC1) + (( N - K + j ) * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
				}
			}
		}
	// STOREV = 'R': reflectors stored rowwise
	// H = I - V**T * T * V (for STOREV='R')
	} else if ( direct === 'forward' ) {
		// V = (V1 V2)  first K columns, V1 is unit upper triangular
		if ( side === 'left' ) {
			// Form H*C or H**T*C where C = (C1)
			//                               (C2)
			// W := C**T * V**T = (C1**T*V1**T + C2**T*V2**T)
			// W := C1**T
			for ( j = 0; j < K; j++ ) {
				dcopy( N, C, strideC2, offsetC + (j * strideC1), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
			}
			// W := W * V1**T (V1 is stored in rows of V: upper triangular)
			dtrmm( 'right', 'upper', 'transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );
			if ( M > K ) {
				// W := W + C2**T * V2**T
				dgemm( 'transpose', 'transpose', N, K, M - K, 1.0, C, strideC1, strideC2, offsetC + (K * strideC1), V, strideV1, strideV2, offsetV + (K * strideV2), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
			}
			// W := W * T**T or W * T
			dtrmm( 'right', 'upper', transt, 'non-unit', N, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

			// C := C - V**T * W**T
			if ( M > K ) {
				// C2 := C2 - V2**T * W**T
				dgemm( 'transpose', 'transpose', M - K, N, K, -1.0, V, strideV1, strideV2, offsetV + (K * strideV2), WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, C, strideC1, strideC2, offsetC + (K * strideC1) );
			}
			// W := W * V1
			dtrmm( 'right', 'upper', 'no-transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );

			// C1 := C1 - W**T
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < N; i++ ) {
					C[ offsetC + (j * strideC1) + (i * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
				}
			}
		} else if ( side === 'right' ) {
			// Form C*H or C*H**T where C = (C1 C2)
			// W := C * V**T = (C1*V1**T + C2*V2**T)
			// W := C1
			for ( j = 0; j < K; j++ ) {
				dcopy( M, C, strideC1, offsetC + (j * strideC2), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
			}
			// W := W * V1**T
			dtrmm( 'right', 'upper', 'transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );
			if ( N > K ) {
				// W := W + C2 * V2**T
				dgemm( 'no-transpose', 'transpose', M, K, N - K, 1.0, C, strideC1, strideC2, offsetC + (K * strideC2), V, strideV1, strideV2, offsetV + (K * strideV2), 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
			}
			// W := W * T or W * T**T
			dtrmm( 'right', 'upper', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

			// C := C - W * V
			if ( N > K ) {
				// C2 := C2 - W * V2
				dgemm( 'no-transpose', 'no-transpose', M, N - K, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV + (K * strideV2), 1.0, C, strideC1, strideC2, offsetC + (K * strideC2) );
			}
			// W := W * V1
			dtrmm( 'right', 'upper', 'no-transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK );

			// C1 := C1 - W
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < M; i++ ) {
					C[ offsetC + (i * strideC1) + (j * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
				}
			}
		}
	// Backward: V = (V1 V2), last K columns, V2 is unit lower triangular
	} else if ( side === 'left' ) {
		// Form H*C or H**T*C where C = (C1)
		//                               (C2)
		// W := C**T * V**T
		// W := C2**T
		for ( j = 0; j < K; j++ ) {
			dcopy( N, C, strideC2, offsetC + (( M - K + j ) * strideC1), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
		}
		// W := W * V2**T
		dtrmm( 'right', 'lower', 'transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV + (( M - K ) * strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );
		if ( M > K ) {
			// W := W + C1**T * V1**T
			dgemm( 'transpose', 'transpose', N, K, M - K, 1.0, C, strideC1, strideC2, offsetC, V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		}
		// W := W * T**T or W * T
		dtrmm( 'right', 'lower', transt, 'non-unit', N, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		// C := C - V**T * W**T
		if ( M > K ) {
			// C1 := C1 - V1**T * W**T
			dgemm( 'transpose', 'transpose', M - K, N, K, -1.0, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, 1.0, C, strideC1, strideC2, offsetC );
		}
		// W := W * V2
		dtrmm( 'right', 'lower', 'no-transpose', 'unit', N, K, 1.0, V, strideV1, strideV2, offsetV + (( M - K ) * strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );

		// C2 := C2 - W**T
		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < N; i++ ) {
				C[ offsetC + (( M - K + j ) * strideC1) + (i * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
			}
		}
	} else if ( side === 'right' ) {
		// Form C*H or C*H**T where C = (C1 C2)
		// W := C * V**T
		// W := C2
		for ( j = 0; j < K; j++ ) {
			dcopy( M, C, strideC1, offsetC + (( N - K + j ) * strideC2), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
		}
		// W := W * V2**T
		dtrmm( 'right', 'lower', 'transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV + (( N - K ) * strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );
		if ( N > K ) {
			// W := W + C1 * V1**T
			dgemm( 'no-transpose', 'transpose', M, K, N - K, 1.0, C, strideC1, strideC2, offsetC, V, strideV1, strideV2, offsetV, 1.0, WORK, strideWORK1, strideWORK2, offsetWORK );
		}
		// W := W * T or W * T**T
		dtrmm( 'right', 'lower', trans, 'non-unit', M, K, 1.0, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		// C := C - W * V
		if ( N > K ) {
			// C1 := C1 - W * V1
			dgemm( 'no-transpose', 'no-transpose', M, N - K, K, -1.0, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, 1.0, C, strideC1, strideC2, offsetC );
		}
		// W := W * V2
		dtrmm( 'right', 'lower', 'no-transpose', 'unit', M, K, 1.0, V, strideV1, strideV2, offsetV + (( N - K ) * strideV2), WORK, strideWORK1, strideWORK2, offsetWORK );

		// C2 := C2 - W
		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				C[ offsetC + (i * strideC1) + (( N - K + j ) * strideC2) ] -= WORK[ offsetWORK + (i * strideWORK1) + (j * strideWORK2) ];
			}
		}
	}
}


// EXPORTS //

export default dlarfb;
