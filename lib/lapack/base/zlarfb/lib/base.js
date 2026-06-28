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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Apply a complex block reflector H or its conjugate-transpose H^H to a.
* complex M-by-N matrix C, from either the left or the right.
*
* `H = I - V*T*V^H  (for STOREV='C')`
*
* Supports both STOREV='C' (columnwise) and STOREV='R' (rowwise).
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - rows of C
* @param {NonNegativeInteger} N - columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - first dim stride of V (complex elements)
* @param {integer} strideV2 - second dim stride of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - triangular factor
* @param {integer} strideT1 - first dim stride of T (complex elements)
* @param {integer} strideT2 - second dim stride of T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} C - matrix, modified in-place
* @param {integer} strideC1 - first dim stride of C (complex elements)
* @param {integer} strideC2 - second dim stride of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork1 - first dim stride of WORK (complex elements)
* @param {integer} strideWork2 - second dim stride of WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
*/
function zlarfb( side, trans, direct, storev, M, N, K, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork1, strideWork2, offsetWork ) {
	var transt;
	var sw1;
	var sw2;
	var sc1;
	var sc2;
	var Cv;
	var Wv;
	var oW;
	var oC;
	var iw;
	var ic;
	var i;
	var j;

	if ( M <= 0 || N <= 0 ) {
		return;
	}

	// Get Float64 views for element access
	Cv = reinterpret( C, 0 );
	Wv = reinterpret( WORK, 0 );

	// Float64 strides/offsets for element access
	sw1 = strideWork1 * 2;
	sw2 = strideWork2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;
	oW = offsetWork * 2;
	oC = offsetC * 2;

	if ( trans === 'no-transpose' ) {
		transt = 'conjugate-transpose';
	} else {
		transt = 'no-transpose';
	}

	if ( storev === 'columnwise' ) {
		if ( direct === 'forward' ) {
			// V = (V1)  first K rows, V1 is unit lower triangular
			//     (V2)
			if ( side === 'left' ) {
				// Form H*C or H^H*C where C = (C1)
				//                              (C2)
				// W := C^H * V = (C1^H*V1 + C2^H*V2)  stored in WORK
				// W := C1^H (copy rows of C1 into columns of WORK, conjugating)
				for ( j = 0; j < K; j++ ) {
					zcopy( N, C, strideC2, offsetC + (j * strideC1), WORK, strideWork1, offsetWork + (j * strideWork2) );
					zlacgv( N, WORK, strideWork1, offsetWork + (j * strideWork2) );
				}
				// W := W * V1
				ztrmm( 'right', 'lower', 'no-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );
				if ( M > K ) {
					// W := W + C2^H * V2
					zgemm( 'conjugate-transpose', 'no-transpose', N, K, M - K, ONE,
						C, strideC1, strideC2, offsetC + (K * strideC1),
						V, strideV1, strideV2, offsetV + (K * strideV1),
						ONE, WORK, strideWork1, strideWork2, offsetWork );
				}
				// W := W * T^H or W * T
				ztrmm( 'right', 'upper', transt, 'non-unit', N, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

				// C := C - V * W^H
				if ( M > K ) {
					// C2 := C2 - V2 * W^H
					zgemm( 'no-transpose', 'conjugate-transpose', M - K, N, K, NEGONE,
						V, strideV1, strideV2, offsetV + (K * strideV1),
						WORK, strideWork1, strideWork2, offsetWork,
						ONE, C, strideC1, strideC2, offsetC + (K * strideC1) );
				}
				// W := W * V1^H
				ztrmm( 'right', 'lower', 'conjugate-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );

				// C1 := C1 - W^H
				for ( j = 0; j < K; j++ ) {
					for ( i = 0; i < N; i++ ) {
						ic = oC + (j * sc1) + (i * sc2);
						iw = oW + (i * sw1) + (j * sw2);

						// C(j,i) -= conj(W(i,j))
						Cv[ ic ] -= Wv[ iw ];
						Cv[ ic + 1 ] -= ( -Wv[ iw + 1 ] );
					}
				}
			} else if ( side === 'right' ) {
				// Form C*H or C*H^H where C = (C1 C2)
				// W := C * V = (C1*V1 + C2*V2)
				// W := C1
				for ( j = 0; j < K; j++ ) {
					zcopy( M, C, strideC1, offsetC + (j * strideC2), WORK, strideWork1, offsetWork + (j * strideWork2) );
				}
				// W := W * V1
				ztrmm( 'right', 'lower', 'no-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );
				if ( N > K ) {
					// W := W + C2 * V2
					zgemm( 'no-transpose', 'no-transpose', M, K, N - K, ONE,
						C, strideC1, strideC2, offsetC + (K * strideC2),
						V, strideV1, strideV2, offsetV + (K * strideV1),
						ONE, WORK, strideWork1, strideWork2, offsetWork );
				}
				// W := W * T or W * T^H
				ztrmm( 'right', 'upper', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

				// C := C - W * V^H
				if ( N > K ) {
					// C2 := C2 - W * V2^H
					zgemm( 'no-transpose', 'conjugate-transpose', M, N - K, K, NEGONE,
						WORK, strideWork1, strideWork2, offsetWork,
						V, strideV1, strideV2, offsetV + (K * strideV1),
						ONE, C, strideC1, strideC2, offsetC + (K * strideC2) );
				}
				// W := W * V1^H
				ztrmm( 'right', 'lower', 'conjugate-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );

				// C1 := C1 - W
				for ( j = 0; j < K; j++ ) {
					for ( i = 0; i < M; i++ ) {
						ic = oC + (i * sc1) + (j * sc2);
						iw = oW + (i * sw1) + (j * sw2);
						Cv[ ic ] -= Wv[ iw ];
						Cv[ ic + 1 ] -= Wv[ iw + 1 ];
					}
				}
			}
		// Backward: V = (V1)
		//               (V2)  last K rows, V2 is unit upper triangular
		} else if ( side === 'left' ) {
			// Form H*C or H^H*C where C = (C1)
			//                              (C2)
			// W := C^H * V = (C1^H*V1 + C2^H*V2)
			// W := C2^H
			for ( j = 0; j < K; j++ ) {
				zcopy( N, C, strideC2, offsetC + (( M - K + j ) * strideC1), WORK, strideWork1, offsetWork + (j * strideWork2) );
				zlacgv( N, WORK, strideWork1, offsetWork + (j * strideWork2) );
			}
			// W := W * V2
			ztrmm( 'right', 'upper', 'no-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV + (( M - K ) * strideV1), WORK, strideWork1, strideWork2, offsetWork );
			if ( M > K ) {
				// W := W + C1^H * V1
				zgemm( 'conjugate-transpose', 'no-transpose', N, K, M - K, ONE,
					C, strideC1, strideC2, offsetC,
					V, strideV1, strideV2, offsetV,
					ONE, WORK, strideWork1, strideWork2, offsetWork );
			}
			// W := W * T^H or W * T
			ztrmm( 'right', 'lower', transt, 'non-unit', N, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

			// C := C - V * W^H
			if ( M > K ) {
				// C1 := C1 - V1 * W^H
				zgemm( 'no-transpose', 'conjugate-transpose', M - K, N, K, NEGONE,
					V, strideV1, strideV2, offsetV,
					WORK, strideWork1, strideWork2, offsetWork,
					ONE, C, strideC1, strideC2, offsetC );
			}
			// W := W * V2^H
			ztrmm( 'right', 'upper', 'conjugate-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV + (( M - K ) * strideV1), WORK, strideWork1, strideWork2, offsetWork );

			// C2 := C2 - W^H
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < N; i++ ) {
					ic = oC + (( M - K + j ) * sc1) + (i * sc2);
					iw = oW + (i * sw1) + (j * sw2);
					Cv[ ic ] -= Wv[ iw ];
					Cv[ ic + 1 ] -= ( -Wv[ iw + 1 ] );
				}
			}
		} else if ( side === 'right' ) {
			// Form C*H or C*H^H where C = (C1 C2)
			// W := C * V = (C1*V1 + C2*V2)
			// W := C2
			for ( j = 0; j < K; j++ ) {
				zcopy( M, C, strideC1, offsetC + (( N - K + j ) * strideC2), WORK, strideWork1, offsetWork + (j * strideWork2) );
			}
			// W := W * V2
			ztrmm( 'right', 'upper', 'no-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV + (( N - K ) * strideV1), WORK, strideWork1, strideWork2, offsetWork );
			if ( N > K ) {
				// W := W + C1 * V1
				zgemm( 'no-transpose', 'no-transpose', M, K, N - K, ONE,
					C, strideC1, strideC2, offsetC,
					V, strideV1, strideV2, offsetV,
					ONE, WORK, strideWork1, strideWork2, offsetWork );
			}
			// W := W * T or W * T^H
			ztrmm( 'right', 'lower', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

			// C := C - W * V^H
			if ( N > K ) {
				// C1 := C1 - W * V1^H
				zgemm( 'no-transpose', 'conjugate-transpose', M, N - K, K, NEGONE,
					WORK, strideWork1, strideWork2, offsetWork,
					V, strideV1, strideV2, offsetV,
					ONE, C, strideC1, strideC2, offsetC );
			}
			// W := W * V2^H
			ztrmm( 'right', 'upper', 'conjugate-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV + (( N - K ) * strideV1), WORK, strideWork1, strideWork2, offsetWork );

			// C2 := C2 - W
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < M; i++ ) {
					ic = oC + (i * sc1) + (( N - K + j ) * sc2);
					iw = oW + (i * sw1) + (j * sw2);
					Cv[ ic ] -= Wv[ iw ];
					Cv[ ic + 1 ] -= Wv[ iw + 1 ];
				}
			}
		}
	// STOREV = 'R': reflectors stored rowwise
	// H = I - V^H * T * V (for STOREV='R')
	} else if ( direct === 'forward' ) {
		// V = (V1 V2)  first K columns, V1 is unit upper triangular
		if ( side === 'left' ) {
			// Form H*C or H^H*C where C = (C1)
			//                              (C2)
			// W := C^H * V^H = (C1^H*V1^H + C2^H*V2^H)
			// W := C1^H
			for ( j = 0; j < K; j++ ) {
				zcopy( N, C, strideC2, offsetC + (j * strideC1), WORK, strideWork1, offsetWork + (j * strideWork2) );
				zlacgv( N, WORK, strideWork1, offsetWork + (j * strideWork2) );
			}
			// W := W * V1^H (V1 is stored in rows of V: upper triangular)
			ztrmm( 'right', 'upper', 'conjugate-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );
			if ( M > K ) {
				// W := W + C2^H * V2^H
				zgemm( 'conjugate-transpose', 'conjugate-transpose', N, K, M - K, ONE,
					C, strideC1, strideC2, offsetC + (K * strideC1),
					V, strideV1, strideV2, offsetV + (K * strideV2),
					ONE, WORK, strideWork1, strideWork2, offsetWork );
			}
			// W := W * T^H or W * T
			ztrmm( 'right', 'upper', transt, 'non-unit', N, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

			// C := C - V^H * W^H
			if ( M > K ) {
				// C2 := C2 - V2^H * W^H
				zgemm( 'conjugate-transpose', 'conjugate-transpose', M - K, N, K, NEGONE,
					V, strideV1, strideV2, offsetV + (K * strideV2),
					WORK, strideWork1, strideWork2, offsetWork,
					ONE, C, strideC1, strideC2, offsetC + (K * strideC1) );
			}
			// W := W * V1 (undo triangular part)
			ztrmm( 'right', 'upper', 'no-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );

			// C1 := C1 - W^H
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < N; i++ ) {
					ic = oC + (j * sc1) + (i * sc2);
					iw = oW + (i * sw1) + (j * sw2);
					Cv[ ic ] -= Wv[ iw ];
					Cv[ ic + 1 ] -= ( -Wv[ iw + 1 ] );
				}
			}
		} else if ( side === 'right' ) {
			// Form C*H or C*H^H where C = (C1 C2)
			// W := C * V^H = (C1*V1^H + C2*V2^H)
			// W := C1
			for ( j = 0; j < K; j++ ) {
				zcopy( M, C, strideC1, offsetC + (j * strideC2), WORK, strideWork1, offsetWork + (j * strideWork2) );
			}
			// W := W * V1^H
			ztrmm( 'right', 'upper', 'conjugate-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );
			if ( N > K ) {
				// W := W + C2 * V2^H
				zgemm( 'no-transpose', 'conjugate-transpose', M, K, N - K, ONE,
					C, strideC1, strideC2, offsetC + (K * strideC2),
					V, strideV1, strideV2, offsetV + (K * strideV2),
					ONE, WORK, strideWork1, strideWork2, offsetWork );
			}
			// W := W * T or W * T^H
			ztrmm( 'right', 'upper', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

			// C := C - W * V
			if ( N > K ) {
				// C2 := C2 - W * V2
				zgemm( 'no-transpose', 'no-transpose', M, N - K, K, NEGONE,
					WORK, strideWork1, strideWork2, offsetWork,
					V, strideV1, strideV2, offsetV + (K * strideV2),
					ONE, C, strideC1, strideC2, offsetC + (K * strideC2) );
			}
			// W := W * V1
			ztrmm( 'right', 'upper', 'no-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV, WORK, strideWork1, strideWork2, offsetWork );

			// C1 := C1 - W
			for ( j = 0; j < K; j++ ) {
				for ( i = 0; i < M; i++ ) {
					ic = oC + (i * sc1) + (j * sc2);
					iw = oW + (i * sw1) + (j * sw2);
					Cv[ ic ] -= Wv[ iw ];
					Cv[ ic + 1 ] -= Wv[ iw + 1 ];
				}
			}
		}
	// Backward: V = (V1 V2), last K columns, V2 is unit lower triangular
	} else if ( side === 'left' ) {
		// Form H*C or H^H*C where C = (C1)
		//                              (C2)
		// W := C^H * V^H
		// W := C2^H
		for ( j = 0; j < K; j++ ) {
			zcopy( N, C, strideC2, offsetC + (( M - K + j ) * strideC1), WORK, strideWork1, offsetWork + (j * strideWork2) );
			zlacgv( N, WORK, strideWork1, offsetWork + (j * strideWork2) );
		}
		// W := W * V2^H
		ztrmm( 'right', 'lower', 'conjugate-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV + (( M - K ) * strideV2), WORK, strideWork1, strideWork2, offsetWork );
		if ( M > K ) {
			// W := W + C1^H * V1^H
			zgemm( 'conjugate-transpose', 'conjugate-transpose', N, K, M - K, ONE,
				C, strideC1, strideC2, offsetC,
				V, strideV1, strideV2, offsetV,
				ONE, WORK, strideWork1, strideWork2, offsetWork );
		}
		// W := W * T^H or W * T
		ztrmm( 'right', 'lower', transt, 'non-unit', N, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		// C := C - V^H * W^H
		if ( M > K ) {
			// C1 := C1 - V1^H * W^H
			zgemm( 'conjugate-transpose', 'conjugate-transpose', M - K, N, K, NEGONE,
				V, strideV1, strideV2, offsetV,
				WORK, strideWork1, strideWork2, offsetWork,
				ONE, C, strideC1, strideC2, offsetC );
		}
		// W := W * V2
		ztrmm( 'right', 'lower', 'no-transpose', 'unit', N, K, ONE, V, strideV1, strideV2, offsetV + (( M - K ) * strideV2), WORK, strideWork1, strideWork2, offsetWork );

		// C2 := C2 - W^H
		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < N; i++ ) {
				ic = oC + (( M - K + j ) * sc1) + (i * sc2);
				iw = oW + (i * sw1) + (j * sw2);
				Cv[ ic ] -= Wv[ iw ];
				Cv[ ic + 1 ] -= ( -Wv[ iw + 1 ] );
			}
		}
	} else if ( side === 'right' ) {
		// Form C*H or C*H^H where C = (C1 C2)
		// W := C * V^H
		// W := C2
		for ( j = 0; j < K; j++ ) {
			zcopy( M, C, strideC1, offsetC + (( N - K + j ) * strideC2), WORK, strideWork1, offsetWork + (j * strideWork2) );
		}
		// W := W * V2^H
		ztrmm( 'right', 'lower', 'conjugate-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV + (( N - K ) * strideV2), WORK, strideWork1, strideWork2, offsetWork );
		if ( N > K ) {
			// W := W + C1 * V1^H
			zgemm( 'no-transpose', 'conjugate-transpose', M, K, N - K, ONE,
				C, strideC1, strideC2, offsetC,
				V, strideV1, strideV2, offsetV,
				ONE, WORK, strideWork1, strideWork2, offsetWork );
		}
		// W := W * T or W * T^H
		ztrmm( 'right', 'lower', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );

		// C := C - W * V
		if ( N > K ) {
			// C1 := C1 - W * V1
			zgemm( 'no-transpose', 'no-transpose', M, N - K, K, NEGONE,
				WORK, strideWork1, strideWork2, offsetWork,
				V, strideV1, strideV2, offsetV,
				ONE, C, strideC1, strideC2, offsetC );
		}
		// W := W * V2
		ztrmm( 'right', 'lower', 'no-transpose', 'unit', M, K, ONE, V, strideV1, strideV2, offsetV + (( N - K ) * strideV2), WORK, strideWork1, strideWork2, offsetWork );

		// C2 := C2 - W
		for ( j = 0; j < K; j++ ) {
			for ( i = 0; i < M; i++ ) {
				ic = oC + (i * sc1) + (( N - K + j ) * sc2);
				iw = oW + (i * sw1) + (j * sw2);
				Cv[ ic ] -= Wv[ iw ];
				Cv[ ic + 1 ] -= Wv[ iw + 1 ];
			}
		}
	}
}


// EXPORTS //

export default zlarfb;
