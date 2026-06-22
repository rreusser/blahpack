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

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dtrmv from '../../../../blas/base/dtrmv/lib/base.js';


// MAIN //

/**
* Forms the triangular factor T of a real block reflector H of order N.
* which is defined as a product of K elementary reflectors.
*
* If DIRECT = 'F', H = H(1) H(2) ... H(k) and T is upper triangular.
* If DIRECT = 'B', H = H(k) ... H(2) H(1) and T is lower triangular.
*
* @private
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} V - matrix of reflector vectors
* @param {integer} strideV1 - stride of first dim of V
* @param {integer} strideV2 - stride of second dim of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} TAU - array of scalar factors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} T - output triangular matrix
* @param {integer} strideT1 - stride of first dim of T
* @param {integer} strideT2 - stride of second dim of T
* @param {NonNegativeInteger} offsetT - starting index for T
*/
function dlarft( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	var prevlastv;
	var lastv;
	var jj;
	var i;
	var j;

	if ( N === 0 ) {
		return;
	}

	if ( direct === 'forward' ) {
		prevlastv = N;
		for ( i = 0; i < K; i++ ) {
			prevlastv = Math.max( prevlastv, i );
			if ( TAU[ offsetTAU + (i * strideTAU) ] === 0.0 ) {
				// H(i) = I
				for ( j = 0; j <= i; j++ ) {
					T[ offsetT + (j * strideT1) + (i * strideT2) ] = 0.0;
				}
			} else {
				if ( storev === 'columnwise' ) {
					// Skip trailing zeros in V(:,i)
					lastv = N;
					for ( jj = N - 1; jj > i; jj-- ) {
						if ( V[ offsetV + (jj * strideV1) + (i * strideV2) ] !== 0.0 ) {
							break;
						}
						lastv = jj;
					}

					// T(0:i-1, i) = -tau(i) * V(i, 0:i-1)
					for ( j = 0; j < i; j++ ) {
						T[ offsetT + (j * strideT1) + (i * strideT2) ] = -(TAU[ offsetTAU + (i * strideTAU) ] * V[ offsetV + (i * strideV1) + (j * strideV2) ]);
					}
					jj = Math.min( lastv, prevlastv );

					// T(0:i-1, i) += -tau(i) * V(i+1:jj-1, 0:i-1)**T * V(i+1:jj-1, i)
					if ( jj - i - 1 > 0 ) {
						dgemv( 'transpose', jj - i - 1, i, -TAU[ offsetTAU + (i * strideTAU) ], V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV1), V, strideV1, offsetV + (( i + 1 ) * strideV1) + (i * strideV2), 1.0, T, strideT1, offsetT + (i * strideT2) );
					}
				} else {
					// Row-wise storage
					lastv = N;
					for ( jj = N - 1; jj > i; jj-- ) {
						if ( V[ offsetV + (i * strideV1) + (jj * strideV2) ] !== 0.0 ) {
							break;
						}
						lastv = jj;
					}

					// T(0:i-1, i) = -tau(i) * V(0:i-1, i)
					for ( j = 0; j < i; j++ ) {
						T[ offsetT + (j * strideT1) + (i * strideT2) ] = -(TAU[ offsetTAU + (i * strideTAU) ] * V[ offsetV + (j * strideV1) + (i * strideV2) ]);
					}
					jj = Math.min( lastv, prevlastv );

					// T(0:i-1, i) += -tau(i) * V(0:i-1, i+1:jj-1) * V(i, i+1:jj-1)**T
					if ( jj - i - 1 > 0 ) {
						dgemv( 'no-transpose', i, jj - i - 1, -TAU[ offsetTAU + (i * strideTAU) ], V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV2), V, strideV2, offsetV + (i * strideV1) + (( i + 1 ) * strideV2), 1.0, T, strideT1, offsetT + (i * strideT2) );
					}
				}

				// T(0:i-1, i) := T(0:i-1, 0:i-1) * T(0:i-1, i)
				if ( i > 0 ) {
					dtrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, offsetT + (i * strideT2) );
				}
				T[ offsetT + (i * strideT1) + (i * strideT2) ] = TAU[ offsetTAU + (i * strideTAU) ];

				if ( i > 0 ) {
					prevlastv = Math.max( prevlastv, lastv );
				} else {
					prevlastv = lastv;
				}
			}
		}
	} else {
		// Backward: T is lower triangular
		prevlastv = 0;
		for ( i = K - 1; i >= 0; i-- ) {
			if ( TAU[ offsetTAU + (i * strideTAU) ] === 0.0 ) {
				for ( j = i; j < K; j++ ) {
					T[ offsetT + (j * strideT1) + (i * strideT2) ] = 0.0;
				}
			} else {
				if ( i < K - 1 ) {
					if ( storev === 'columnwise' ) {
						// Skip leading zeros in V(:,i)
						lastv = 0;
						for ( jj = 0; jj < i; jj++ ) {
							if ( V[ offsetV + (jj * strideV1) + (i * strideV2) ] !== 0.0 ) {
								break;
							}
							lastv = jj + 1;
						}

						for ( j = i + 1; j < K; j++ ) {
							T[ offsetT + (j * strideT1) + (i * strideT2) ] = -(TAU[ offsetTAU + (i * strideTAU) ] * V[ offsetV + (( N - K + i ) * strideV1) + (j * strideV2) ]);
						}
						jj = Math.max( lastv, prevlastv );

						if ( N - K + i - jj > 0 ) {
							dgemv( 'transpose', N - K + i - jj, K - i - 1, -TAU[ offsetTAU + (i * strideTAU) ], V, strideV1, strideV2, offsetV + (jj * strideV1) + (( i + 1 ) * strideV2), V, strideV1, offsetV + (jj * strideV1) + (i * strideV2), 1.0, T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2) );
						}
					} else {
						// Row-wise storage
						lastv = 0;
						for ( jj = 0; jj < i; jj++ ) {
							if ( V[ offsetV + (i * strideV1) + (jj * strideV2) ] !== 0.0 ) {
								break;
							}
							lastv = jj + 1;
						}

						for ( j = i + 1; j < K; j++ ) {
							T[ offsetT + (j * strideT1) + (i * strideT2) ] = -(TAU[ offsetTAU + (i * strideTAU) ] * V[ offsetV + (j * strideV1) + (( N - K + i ) * strideV2) ]);
						}
						jj = Math.max( lastv, prevlastv );

						if ( N - K + i - jj > 0 ) {
							dgemv( 'no-transpose', K - i - 1, N - K + i - jj, -TAU[ offsetTAU + (i * strideTAU) ], V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV1) + (jj * strideV2), V, strideV2, offsetV + (i * strideV1) + (jj * strideV2), 1.0, T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2) );
						}
					}

					dtrmv( 'lower', 'no-transpose', 'non-unit', K - i - 1, T, strideT1, strideT2, offsetT + (( i + 1 ) * strideT1) + (( i + 1 ) * strideT2), T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2) );
					if ( i > 0 ) {
						prevlastv = Math.min( prevlastv, lastv );
					} else {
						prevlastv = lastv;
					}
				}
				T[ offsetT + (i * strideT1) + (i * strideT2) ] = TAU[ offsetTAU + (i * strideTAU) ];
			}
		}
	}
}


// EXPORTS //

export default dlarft;
